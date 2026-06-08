'use strict';

/**
 * W1 试点 30 组「自动化预检」（辅助人工读稿，不替代人工打分）。
 *
 * 用法：
 *   node scripts/skills/audit-usability-pilot-auto.js
 *   node scripts/skills/audit-usability-pilot-auto.js --write
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { classifyP0, extractKeyDuties } = require('./scan-p0-role-skills');
const { dutyIsAnchored, isGenericDuty, isDevRoleTitle, DEV_DUTY } = require('./role-duty-helpers');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const BATCH_BY = 'complete-totalclaw-agent-role-skills';
const ROOT = path.resolve(__dirname, '../..');
const PILOT = path.join(ROOT, 'data/skills/usability-pilot-samples.json');
const OUT = path.join(ROOT, 'data/skills/usability-pilot-auto-report.json');

const GENERIC_STEP = '列出缺失信息，用最多 8 个问题';
const SUFFIXES = [
  '任务澄清与目标拆解', '工作流规划与里程碑排期', '信息收集与证据台账', '方案生成与备选比较',
  '质量检查与风险复核', '自动化提示词与工具调用清单', '交付物撰写与汇报', '复盘沉淀与知识库更新',
];

function extractSection(md, heading) {
  const m = md.match(new RegExp(`## ${heading}\\n\\n([\\s\\S]*?)(\\n## |$)`));
  return m ? m[1] : '';
}

function scoreA(role, duties, p0) {
  let s = 5;
  const issues = [];
  if (p0.length) { s -= 2; issues.push(`P0:${p0.join(',')}`); }
  if (!duties.length) { s -= 2; issues.push('无岗位关键动作'); }
  else if (!duties.some((d) => dutyIsAnchored(role, d))) { s -= 1; issues.push('职责未锚定'); }
  if (!isDevRoleTitle(role) && duties.some((d) => DEV_DUTY.test(d) || isGenericDuty(d))) {
    s -= 1; issues.push('含研发/兜底套话');
  }
  return { score: Math.max(1, s), issues };
}

function scoreB(skills, role) {
  const bodies = skills.map((s) => s.md.replace(/name: [^\n]+/g, ''));
  const unique = new Set(bodies).size;
  let s = unique >= 6 ? 5 : unique >= 4 ? 4 : unique >= 2 ? 3 : 2;
  const issues = [];
  if (unique <= 3) issues.push(`8技能仅${unique}种正文差异`);
  return { score: Math.max(1, s), issues, uniqueBodies: unique };
}

function scoreC(skills) {
  let total = 0;
  const issues = [];
  for (const sk of skills) {
    let s = 3;
    const steps = sk.md.match(/^\d+\.\s.+$/gm) || [];
    if (steps.length >= 5) s += 1;
    if (steps.length < 3) { s -= 1; issues.push(`${sk.shortName}:步骤不足`); }
    if (sk.md.includes(GENERIC_STEP)) { s -= 2; issues.push(`${sk.shortName}:meta套话`); }
    if (/Jira|禅道|ISO|等保|SLA|Swagger|ERP|CRM|Postman|Figma|Python|SQL/.test(sk.md)) s += 0.5;
    total += Math.min(5, s);
  }
  return { score: Math.round(Math.min(5, Math.max(1, total / skills.length))), issues: [...new Set(issues)] };
}

function scoreD(skills) {
  let total = 0;
  const issues = [];
  for (const sk of skills) {
    let s = 2;
    const ex = extractSection(sk.md, '示例');
    if (/例：|例如|样例/.test(ex)) s += 1;
    if (/\d+|V\d|UAT|P0|%/ .test(ex)) s += 1;
    if (ex.length > 80) s += 1;
    if (/用户提出一个与「/.test(ex) && !/例：/.test(ex)) issues.push(`${sk.shortName}:示例骨架`);
    total += Math.min(5, s);
  }
  return { score: Math.round(Math.min(5, Math.max(1, total / skills.length))), issues: [...new Set(issues)] };
}

function scoreE(skills, role) {
  let s = 4;
  const issues = [];
  const tagsOk = skills.every((sk) => sk.md.includes('totalclaw-agent'));
  if (!tagsOk) { s -= 1; issues.push('缺 totalclaw-agent tag'); }
  if (skills.every((s) => String(s.version || '').startsWith('1.5'))) s += 0.5;
  if (skills.length < 8) issues.push(`仅${skills.length}条skill`);
  return { score: Math.min(5, Math.round(s)), issues };
}

async function main() {
  const write = process.argv.includes('--write');
  const pilot = JSON.parse(fs.readFileSync(PILOT, 'utf8')).样本 || [];

  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const report = { 生成时间: new Date().toISOString(), 角色数: pilot.length, 结果: [], 汇总: {} };

  for (const p of pilot) {
    const roleDoc = await col.findOne({ kind: 'role', name: p.role, category: p.category });
    const skillDocs = [];
    for (const suffix of SUFFIXES) {
      const doc = await col.findOne({
        kind: 'skill',
        'securityAudit.programmatic.by': BATCH_BY,
        category: p.category,
        name: `${p.role}${suffix}`,
      });
      if (doc) skillDocs.push(doc);
    }
    const duties = skillDocs[0] ? extractKeyDuties(skillDocs[0].contentMd || '') : [];
    const p0 = classifyP0(p.role, p.category, duties, roleDoc);
    const skills = skillDocs.map((d) => ({
      shortName: d.name.replace(p.role, '').slice(0, 6) || 'skill',
      version: d.version,
      md: d.contentMd || '',
    }));

    const dims = {
      A: scoreA(p.role, duties, p0),
      B: scoreB(skills, p.role),
      C: scoreC(skills),
      D: scoreD(skills),
      E: scoreE(skills, p.role),
    };
    const avg = Object.values(dims).reduce((s, x) => s + x.score, 0) / 5;

    report.结果.push({
      category: p.category,
      role: p.role,
      优先原因: p.优先原因,
      预检均分: Number(avg.toFixed(2)),
      建议: avg >= 4 ? '快速确认' : avg >= 3 ? '重点读稿' : '优先修复',
      维度: Object.fromEntries(Object.entries(dims).map(([k, v]) => [k, v.score])),
      问题: Object.fromEntries(Object.entries(dims).map(([k, v]) => [k, v.issues])),
      技能数: skills.length,
    });
  }

  report.结果.sort((a, b) => a.预检均分 - b.预检均分);
  const avgs = report.结果.map((r) => r.预检均分);
  report.汇总 = {
    预检均分: Number((avgs.reduce((a, b) => a + b, 0) / avgs.length).toFixed(2)),
    快速确认: report.结果.filter((r) => r.建议 === '快速确认').length,
    重点读稿: report.结果.filter((r) => r.建议 === '重点读稿').length,
    优先修复: report.结果.filter((r) => r.建议 === '优先修复').length,
  };

  console.log('=== W1 试点自动化预检 ===');
  console.log(JSON.stringify(report.汇总, null, 2));
  console.log('\n最低分 5 组:');
  for (const r of report.结果.slice(0, 5)) {
    console.log(`  ${r.预检均分} [${r.category}] ${r.role}`);
  }

  if (write) fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
  await client.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
