'use strict';

/**
 * TotalClaw free skill 中文化：
 *  1. 缺 descriptionZh 但 description 含中文 → 复制到 descriptionZh
 *  2. 正文无中文 → 在正文前插入「## 概述（中文）」+ description，保留原文于「## 原文」
 *  3. 可选 --translate-body --allow-deepseek：LLM 全文翻译（默认不用；优先用 export + agent 批次翻译）
 *
 *   node scripts/skills/fix-free-skill-zh.js --dry
 *   node scripts/skills/fix-free-skill-zh.js --apply
 *   node scripts/skills/fix-free-skill-zh.js --apply --translate-body --allow-deepseek --limit 100
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { fixEncoding, hasCorruption } = require('./lib/proofread-body');
const { hasCJK } = require('./audit-free-skill-zh');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const LOG = path.resolve(__dirname, '../../data/skills/free-skill-zh-fix-log.json');

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

function numArg(k, d) {
  const v = arg(k, '');
  return v ? Number(v) : d;
}

function bodyHasCJK(md) {
  const body = /^---\n[\s\S]*?\n---\n/.test(md || '') ? (md || '').replace(/^---\n[\s\S]*?\n---\n/, '') : md;
  return hasCJK(body.slice(0, 6000));
}

function wrapChineseOverview(doc) {
  const desc = fixEncoding(doc.descriptionZh || doc.description || doc.name || '');
  let body = String(doc.contentMd || '').trim();
  const fmMatch = /^---\n([\s\S]*?)\n---\n/.exec(body);
  const fm = fmMatch ? fmMatch[0] : '';
  const rest = fmMatch ? body.slice(fm.length).trim() : body;

  if (/^##\s*概述（中文）/m.test(rest)) return null;

  const overview = [
    '## 概述（中文）',
    '',
    desc || `本技能「${doc.name}」用于 TotalClaw 免费技能库。`,
    '',
    '## 原文',
    '',
    rest,
  ].join('\n');

  return {
    contentMd: fm ? `${fm}\n${overview}\n` : `${overview}\n`,
    descriptionZh: doc.descriptionZh || (hasCJK(desc) ? desc : doc.descriptionZh),
  };
}

async function translateBody(chat, doc) {
  const body = String(doc.contentMd || '').slice(0, 12000);
  const msgs = [
    {
      role: 'system',
      content: '你是技术文档翻译。将 SKILL.md 正文翻译为简体中文，保留 Markdown 结构、代码块、URL 与专有名词。只输出翻译后的 Markdown，不要 frontmatter，不要解释。',
    },
    {
      role: 'user',
      content: `技能名：${doc.name}\n\n请翻译：\n\n${body}`,
    },
  ];
  const { chat: deepseekChat } = require('../roles/lib/deepseek');
  const fn = chat || deepseekChat;
  const out = await fn(msgs, { temperature: 0.3, maxTokens: 8192 });
  return fixEncoding(String(out || '').trim());
}

async function main() {
  const apply = process.argv.includes('--apply');
  const translateBody = process.argv.includes('--translate-body');
  const limit = numArg('limit', 0);

  if (translateBody && !process.argv.includes('--allow-deepseek')) {
    console.error('正文 LLM 翻译需 --allow-deepseek');
    process.exit(1);
  }

  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const filter = {
    kind: 'skill',
    source: 'totalclaw',
    $or: [{ listingType: 'free' }, { 'pricing.model': 'free' }],
    listingType: { $ne: 'inactive' },
  };

  const stats = { descZhCopied: 0, overviewWrapped: 0, translated: 0, skip: 0 };
  let ops = [];
  let processed = 0;

  const cur = col.find(filter, {
    projection: {
      skillId: 1, name: 1, description: 1, descriptionZh: 1, contentMd: 1, category: 1,
    },
  });

  while (await cur.hasNext()) {
    if (limit && processed >= limit) break;
    const doc = await cur.next();
    processed++;

    const desc = fixEncoding(doc.description || '');
    const descZh = fixEncoding(doc.descriptionZh || '');
    const updates = {};
    let action = null;

    if (!doc.descriptionZh && hasCJK(desc)) {
      updates.descriptionZh = desc;
      stats.descZhCopied++;
      action = 'descZhCopied';
    }

    const md = doc.contentMd || '';
    if (!bodyHasCJK(md)) {
      if (translateBody && processed <= (limit || Infinity)) {
        try {
          const translated = await translateBody(null, doc);
          if (translated && hasCJK(translated) && !hasCorruption(translated)) {
            const fmMatch = /^---\n[\s\S]*?\n---\n/.exec(md);
            updates.contentMd = fmMatch ? `${fmMatch[0]}\n${translated}\n` : `${translated}\n`;
            stats.translated++;
            action = 'translated';
          }
        } catch (e) {
          stats.skip++;
        }
      } else if (!translateBody) {
        const wrapped = wrapChineseOverview({ ...doc, descriptionZh: updates.descriptionZh || descZh });
        if (wrapped) {
          Object.assign(updates, wrapped);
          if (!updates.descriptionZh && hasCJK(desc)) updates.descriptionZh = desc;
          stats.overviewWrapped++;
          action = 'overviewWrapped';
        }
      }
    }

    if (Object.keys(updates).length && apply) {
      ops.push({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              ...updates,
              lastUpdated: new Date(),
              'securityAudit.programmatic.zhFix': action,
              'securityAudit.programmatic.zhFixAt': new Date().toISOString(),
            },
          },
        },
      });
    }

    if (ops.length >= 100) {
      await col.bulkWrite(ops, { ordered: false });
      ops = [];
    }
    if (processed % 2000 === 0) console.log(`  …${processed}`, stats);
  }
  if (ops.length) await col.bulkWrite(ops, { ordered: false });

  stats.processed = processed;
  stats.applied = apply;
  stats.生成时间 = new Date().toISOString();
  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.writeFileSync(LOG, JSON.stringify(stats, null, 2));
  console.log(JSON.stringify(stats, null, 2));
  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
