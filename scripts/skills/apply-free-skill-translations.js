'use strict';

/**
 * 应用 agent 翻译结果到 MongoDB。
 *
 * 输入 JSONL 每行：
 * { "skillId": "...", "descriptionZh": "...", "bodyZh": "..." }
 *
 *   node scripts/skills/apply-free-skill-translations.js data/skills/translate-batches/batch-01-output.jsonl
 *   node scripts/skills/apply-free-skill-translations.js --glob 'data/skills/translate-batches/batch-*-output.jsonl'
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { fixEncoding, hasCorruption } = require('./lib/proofread-body');
const { hasCJK } = require('./audit-free-skill-zh');
const { extractEnglishBody } = require('./export-free-skill-translate-batch');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';

function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

function buildContentMd(doc, descriptionZh, bodyZh) {
  const md = doc.contentMd || '';
  const fmMatch = /^---\n[\s\S]*?\n---\n/.exec(md);
  const fm = fmMatch ? fmMatch[0] : '';
  const body = [
    '## 概述（中文）',
    '',
    descriptionZh.trim(),
    '',
    '## 技能正文',
    '',
    bodyZh.trim(),
  ].join('\n');
  return fm ? `${fm}\n${body}\n` : `${body}\n`;
}

async function main() {
  const apply = !process.argv.includes('--dry');
  const globFlag = process.argv.indexOf('--glob');
  let files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
  if (globFlag !== -1 && process.argv[globFlag + 1]) {
    const pat = process.argv[globFlag + 1];
    const dir = path.dirname(pat);
    const base = path.basename(pat).replace(/\*/g, '.*');
    const re = new RegExp(`^${base}$`);
    files = fs.readdirSync(dir).filter((f) => re.test(f)).map((f) => path.join(dir, f));
  }

  if (!files.length) {
    console.error('用法: apply-free-skill-translations.js [--dry] file.jsonl | --glob pattern');
    process.exit(1);
  }

  const rows = files.flatMap(readJsonl);
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  let applied = 0;
  let skip = 0;
  const ops = [];

  for (const row of rows) {
    if (!row.skillId || !row.descriptionZh || !row.bodyZh) { skip++; continue; }
    if (!hasCJK(row.descriptionZh) || !hasCJK(row.bodyZh)) { skip++; continue; }
    if (hasCorruption(row.descriptionZh) || hasCorruption(row.bodyZh)) { skip++; continue; }

    const doc = await col.findOne({ skillId: row.skillId }, { projection: { contentMd: 1 } });
    if (!doc) { skip++; continue; }

    const contentMd = buildContentMd(doc, fixEncoding(row.descriptionZh), fixEncoding(row.bodyZh));
    ops.push({
      updateOne: {
        filter: { skillId: row.skillId },
        update: {
          $set: {
            descriptionZh: fixEncoding(row.descriptionZh),
            description: fixEncoding(row.descriptionZh),
            contentMd,
            lastUpdated: new Date(),
            'securityAudit.programmatic.zhFix': 'agent-translated',
            'securityAudit.programmatic.zhFixAt': new Date().toISOString(),
            'securityAudit.programmatic.zhTranslatedBy': 'cursor-agent',
          },
        },
      },
    });
    applied++;
  }

  if (apply && ops.length) await col.bulkWrite(ops, { ordered: false });
  console.log(JSON.stringify({ files: files.length, rows: rows.length, applied, skip, dry: !apply }, null, 2));
  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { buildContentMd };
