'use strict';

/**
 * 全库 skill 校验（216k+）。
 *
 * 分层：
 *  - P0：缺正文/乱码/过短/红线/错误 source
 *  - 结构：缺关键章节、步骤未编号
 *  - 可用性：角色未锚定、通用 meta、骨架示例
 *
 * 用法：
 *   node scripts/skills/validate-all-skills.js
 *   node scripts/skills/validate-all-skills.js --write
 *   node scripts/skills/validate-all-skills.js --write --issues-only
 *   node scripts/skills/validate-all-skills.js --sample 5000
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { hasCorruption, extractRoleFromMd, extractBody } = require('./lib/proofread-body');
const { hasRedLine, isProfileRelevant, coreToken } = require('./polish-role-skills');
const { dutyIsAnchored, isDevRoleTitle, DEV_DUTY, isGenericDuty } = require('./role-duty-helpers');
const { classifyP0, extractKeyDuties } = require('./scan-p0-role-skills');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const OUT = path.resolve(__dirname, '../../data/skills/all-skills-validation-report.json');
const OUT_ISSUES = path.resolve(__dirname, '../../data/skills/all-skills-validation-issues.jsonl');

const BASIC_SECTIONS = ['何时使用', '步骤', '输出'];
const FULL_SECTIONS = [
  '何时使用', '适用角色与场景', '输入', '步骤', '输出',
  '边界与约束', '失败模式与规避', '质量标准与验收', '安全与合规', '示例', '注意事项',
];
const GENERIC_STEP = '列出缺失信息，用最多 8 个问题';

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

function auditSkill(doc) {
  const issues = [];
  const md = doc.contentMd || '';
  const body = extractBody(md) || md;
  const role = extractRoleFromMd(md) || (doc.tags || []).find((t) => t && !['岗位技能', 'totalclaw-agent', doc.category].includes(t) && t.length >= 2 && t.length <= 40) || '';
  const by = doc.securityAudit?.programmatic?.by || null;

  if (!md.trim()) issues.push('missing-contentMd');
  if (hasCorruption(doc.name) || hasCorruption(md) || hasCorruption(doc.description)) issues.push('corrupt');
  if (md.length > 0 && md.length < 200) issues.push('too-short');
  if (!md.startsWith('---') && md.length > 0) issues.push('no-frontmatter');
  if (/\\n/.test(md)) issues.push('literal-backslash-n');
  if (doc.source === 'openclaw' || (doc.tags || []).includes('openclaw')) issues.push('wrong-source-openclaw');
  if (!doc.skillId) issues.push('missing-skillId');
  if (!doc.name) issues.push('missing-name');

  for (const sec of BASIC_SECTIONS) {
    if (md.length > 0 && !new RegExp(`^##\\s*${sec}`, 'm').test(md)) {
      issues.push(`missing-section:${sec}`);
      break;
    }
  }

  if (by === 'complete-totalclaw-agent-role-skills') {
    for (const sec of FULL_SECTIONS) {
      if (!new RegExp(`^##\\s*${sec}`, 'm').test(md)) {
        issues.push(`missing-full-section:${sec}`);
        break;
      }
    }
    if (md.length > 0 && !/^\s*1\.\s/m.test(body)) issues.push('steps-not-numbered');
  }

  const red = hasRedLine(body);
  if (red.length) issues.push(`redline:${red.join('|')}`);

  if (body.includes(GENERIC_STEP)) issues.push('generic-meta-step');
  const exSec = body.match(/## 示例[\s\S]*?(?=\n## |$)/)?.[0] || '';
  if (/用户提出一个与「/.test(exSec) && !/例：|例如|样例/.test(exSec)) issues.push('skeleton-example');

  if (role) {
    const tok = coreToken(role);
    if (!body.includes(role) && !(tok.length >= 2 && body.includes(tok))) issues.push('role-not-in-body');
    const duties = extractKeyDuties(md);
    if (!isDevRoleTitle(role) && duties.some((x) => DEV_DUTY.test(x))) issues.push('dev-duty-leak');
    if (!isDevRoleTitle(role) && duties.some((x) => isGenericDuty(x))) issues.push('generic-duty');
    if (duties.length && !duties.some((x) => dutyIsAnchored(role, x))) issues.push('duty-not-anchored');
    const p0 = classifyP0(role, doc.category || '', duties, null);
    if (p0.length) issues.push(`p0:${p0.join('|')}`);
  }

  if (doc.description && role && !isProfileRelevant(role, doc.description, [])) {
    issues.push('desc-not-relevant-to-role');
  }

  return { issues, role, by };
}

async function main() {
  const write = process.argv.includes('--write');
  const issuesOnly = process.argv.includes('--issues-only');
  const sampleN = Number(arg('sample', 0));

  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const stats = {
    总技能数: 0,
    通过: 0,
    有问题: 0,
    问题统计: {},
    按来源: {},
    样例: {},
  };
  const issueLines = [];
  let sampled = 0;

  console.log('扫描全库 skill…');
  const cur = col.find({ kind: 'skill' }, {
    projection: {
      skillId: 1, name: 1, category: 1, contentMd: 1, description: 1,
      source: 1, tags: 1, version: 1, 'securityAudit.programmatic.by': 1,
    },
  });

  while (await cur.hasNext()) {
    const doc = await cur.next();
    if (sampleN && stats.总技能数 >= sampleN) break;
    stats.总技能数++;
    if (stats.总技能数 % 50000 === 0) console.log(`  …${stats.总技能数}`);

    const { issues, role, by } = auditSkill(doc);
    const src = by || doc.source || 'unknown';
    if (!stats.按来源[src]) stats.按来源[src] = { 总数: 0, 有问题: 0 };
    stats.按来源[src].总数++;

    if (issues.length) {
      stats.有问题++;
      stats.按来源[src].有问题++;
      for (const i of issues) {
        const key = i.split(':')[0];
        stats.问题统计[key] = (stats.问题统计[key] || 0) + 1;
      }
      if (write && (!issuesOnly || issues.some((i) => !i.startsWith('missing-full-section')))) {
        issueLines.push(JSON.stringify({
          skillId: doc.skillId,
          name: doc.name,
          category: doc.category,
          role,
          by: src,
          issues,
        }));
      }
      for (const i of issues) {
        if (!stats.样例[i.split(':')[0]]) stats.样例[i.split(':')[0]] = [];
        if (stats.样例[i.split(':')[0]].length < 5) {
          stats.样例[i.split(':')[0]].push({ skillId: doc.skillId, name: doc.name, issue: i });
        }
      }
    } else {
      stats.通过++;
    }
  }

  stats.通过率 = `${((stats.通过 / stats.总技能数) * 100).toFixed(2)}%`;
  stats.生成时间 = new Date().toISOString();

  if (write) {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(stats, null, 2), 'utf8');
    if (issueLines.length) fs.writeFileSync(OUT_ISSUES, issueLines.join('\n') + '\n', 'utf8');
    console.log('报告 →', OUT);
    if (issueLines.length) console.log('问题明细 →', OUT_ISSUES, `(${issueLines.length} 条)`);
  }

  console.log('\n=== 全库 Skill 校验 ===');
  console.log(JSON.stringify({ 总技能数: stats.总技能数, 通过: stats.通过, 有问题: stats.有问题, 通过率: stats.通过率 }, null, 2));
  console.log('\n问题统计:', JSON.stringify(stats.问题统计, null, 2));
  console.log('\n按来源:', JSON.stringify(stats.按来源, null, 2));

  await client.close();
  process.exit(stats.有问题 > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { auditSkill };
