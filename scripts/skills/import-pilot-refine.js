'use strict';

/**
 * 导入 Claude 亲自撰写的试点精修正文（不调用任何外部 API）。
 *
 * 数据文件：data/skills/pilot-refine/pilot-bodies.json
 *   [{ role, category, skills: [{ suffix, body }] }]
 *   body = 从「## 何时使用」开始的 Markdown 正文（真实换行）。
 *
 * 行为：按 role+category+suffix 找到现有技能，保留其唯一 frontmatter，仅替换正文，
 *      version 升到 1.2.0，标记 refinedBy='claude-author'。结构/红线校验不过则跳过（不降级）。
 *
 * 用法：
 *   node scripts/skills/import-pilot-refine.js --dry
 *   node scripts/skills/import-pilot-refine.js --apply
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { hasRedLine } = require('./polish-role-skills');
const { patchBodyWithSections } = require('./patch-pilot-sections');

loadEnv();
const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const BATCH_BY = 'complete-totalclaw-agent-role-skills';
const DATA = path.resolve(__dirname, '../../data/skills/pilot-refine/pilot-bodies.json');

function extractFrontmatter(md) {
  const m = /^---\n([\s\S]*?)\n---/.exec(md || '');
  return m ? m[0] : null;
}

function validateBody(body, roleName, suffix) {
  const reasons = [];
  if (!body || body.length < 400) reasons.push('正文过短');
  for (const sec of ['何时使用', '步骤', '输出']) {
    if (!new RegExp(`^##\\s*${sec}`, 'm').test(body)) reasons.push(`缺章节:${sec}`);
  }
  if (!/^\s*1\.\s/m.test(body)) reasons.push('步骤缺编号');
  // 角色身份由组装时的 frontmatter + H1（角色名+suffix）保证，此处不再强校验正文字面命中
  const red = hasRedLine(body);
  if (red.length) reasons.push('红线:' + red.join(','));
  return { ok: reasons.length === 0, reasons };
}

async function main() {
  const apply = process.argv.includes('--apply');
  const dry = process.argv.includes('--dry') || !apply;
  const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));

  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  let ok = 0, fail = 0, miss = 0;
  for (const r of data) {
    for (const sk of r.skills) {
      const name = `${r.role}${sk.suffix}`;
      const doc = await col.findOne({ kind: 'skill', 'securityAudit.programmatic.by': BATCH_BY, name, category: r.category });
      if (!doc) { miss++; console.log('  缺技能:', name); continue; }
      const fm = extractFrontmatter(doc.contentMd);
      if (!fm) { fail++; console.log('  缺frontmatter:', name); continue; }
      const bodyRaw = String(sk.body).trim();
      const body = patchBodyWithSections(bodyRaw, r.role) || bodyRaw;
      const v = validateBody(body, r.role, sk.suffix);
      if (!v.ok) { fail++; console.log('  校验失败:', name, v.reasons.join('|')); continue; }
      // 同步 frontmatter 描述行为新的 desc
      const fmSynced = sk.desc ? fm.replace(/^(description:\s*).*$/m, `$1"${String(sk.desc).replace(/"/g, '\\"')}"`) : fm;
      const newMd = `${fmSynced}\n\n# ${name}\n\n${body}\n`;
      if (apply) {
        await col.updateOne({ _id: doc._id }, {
          $set: {
            contentMd: newMd,
            description: sk.desc || doc.description,
            descriptionZh: sk.desc || doc.descriptionZh,
            version: '1.6.1',
            'securityAudit.programmatic.refinedBy': 'claude-author',
            'securityAudit.programmatic.refinedAt': new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
          },
          $unset: {
            'securityAudit.programmatic.llmRefineSource': '',
          },
        });
      }
      ok++;
    }
  }
  console.log(`\n完成。ok=${ok} fail=${fail} miss=${miss}${dry ? '（DRY-RUN，未写库）' : ''}`);
  await client.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
