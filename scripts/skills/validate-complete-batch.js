'use strict';

/**
 * complete-totalclaw-agent-role-skills 批次全量校验。
 *
 * 用法：
 *   node scripts/skills/validate-complete-batch.js
 *   node scripts/skills/validate-complete-batch.js --json > report.json
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const P = require('./polish-role-skills');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const BATCH_BY = 'complete-totalclaw-agent-role-skills';
const REQUIRED = [
  '何时使用', '输入', '步骤', '输出', '边界与约束', '失败模式与规避',
  '质量标准与验收', '安全与合规', '示例', '注意事项',
];

async function run() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const report = {
    时间: new Date().toISOString(),
    批次: BATCH_BY,
    技能总数: 0,
    通过: true,
    问题: {},
    仍不相关角色: [],
    样例: {},
  };

  const issues = {
    literalBackslashN: [],
    noFrontmatter: [],
    shortBody: [],
    missingSection: [],
    noNumberedSteps: [],
    redLine: [],
    dupNames: [],
    safeFallbackSkill: [],
    roleMissing: [],
    roleIrrelevant: [],
    descMismatch: [],
  };
  const names = new Map();
  const irrelevantRoles = new Map();

  const cur = col.find(
    { kind: 'skill', 'securityAudit.programmatic.by': BATCH_BY },
    { projection: { skillId: 1, name: 1, contentMd: 1, description: 1 } },
  );

  while (await cur.hasNext()) {
    const d = await cur.next();
    report.技能总数++;
    const md = d.contentMd || '';

    if (/\\n/.test(md)) issues.literalBackslashN.push(d.skillId);
    if (!md.startsWith('---')) issues.noFrontmatter.push(d.skillId);
    if (md.length < 800) issues.shortBody.push(d.skillId);

    for (const sec of REQUIRED) {
      if (!new RegExp(`^##\\s*${sec}`, 'm').test(md)) {
        issues.missingSection.push({ skillId: d.skillId, name: d.name, sec });
        break;
      }
    }
    if (!/^\s*1\.\s/m.test(md)) issues.noNumberedSteps.push(d.skillId);

    const red = P.hasRedLine(md);
    if (red.length) issues.redLine.push({ skillId: d.skillId, red });

    const fmName = /^name:\s*(.+)$/m.exec(md)?.[1]?.trim();
    if (fmName) {
      if (!names.has(fmName)) names.set(fmName, []);
      names.get(fmName).push(d.skillId);
    }

    if (/不套用无关领域/.test(md)) issues.safeFallbackSkill.push(d.skillId);

    const roleM = /role:\s*"([^"]+)"/.exec(md);
    const catM = /category:\s*"([^"]+)"/.exec(md);
    if (roleM) {
      const role = await col.findOne(
        { kind: 'role', name: roleM[1], category: catM?.[1] },
        { projection: { name: 1, category: 1, description: 1, contentMd: 1 } },
      );
      if (!role) issues.roleMissing.push(d.skillId);
      else {
        const prof = P.buildProfile(role);
        if (!prof.relevant) {
          issues.roleIrrelevant.push(d.skillId);
          irrelevantRoles.set(`${roleM[1]}|||${catM?.[1] || ''}`, { name: roleM[1], category: catM?.[1] });
        }
      }
    }

    const fmDesc = /description:\s*"([^"]*)"/.exec(md)?.[1];
    if (fmDesc && d.description && fmDesc !== d.description) issues.descMismatch.push(d.skillId);
  }

  issues.dupNames = [...names.entries()].filter(([, v]) => v.length > 1).map(([n, ids]) => ({ name: n, count: ids.length }));

  // claude-author 试点（不在 complete 批次 marker 内，单独统计）
  const pilotMissing = [];
  const pilotCur = col.find(
    { kind: 'skill', 'securityAudit.programmatic.refinedBy': 'claude-author' },
    { projection: { skillId: 1, name: 1, contentMd: 1 } },
  );
  while (await pilotCur.hasNext()) {
    const d = await pilotCur.next();
    const md = d.contentMd || '';
    for (const sec of REQUIRED) {
      if (!new RegExp(`^##\\s*${sec}`, 'm').test(md)) {
        pilotMissing.push({ skillId: d.skillId, name: d.name, sec });
        break;
      }
    }
  }

  for (const [k, arr] of Object.entries(issues)) {
    if (Array.isArray(arr) && arr.length) {
      report.问题[k] = arr.length;
      report.通过 = false;
    }
  }
  if (pilotMissing.length) {
    report.问题.pilotMissingSection = pilotMissing.length;
    report.通过 = false;
  }

  report.仍不相关角色 = [...irrelevantRoles.values()];
  report.样例 = {
    missingSection: issues.missingSection.slice(0, 5),
    redLine: issues.redLine.slice(0, 3),
    dupNames: issues.dupNames.slice(0, 3),
    pilotMissing: pilotMissing.slice(0, 5),
  };

  // A 级复扫
  const auditPath = path.resolve(__dirname, '../../data/skills/role-skill-mismatch-audit.json');
  if (fs.existsSync(auditPath)) {
    const audit = JSON.parse(fs.readFileSync(auditPath, 'utf8'));
    report.A级高危错配 = audit.汇总?.A级高危错配 ?? null;
    if (report.A级高危错配 > 0) report.通过 = false;
  }

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log('=== complete 批次全量校验 ===');
    console.log('技能总数:', report.技能总数);
    console.log('通过:', report.通过 ? '✅ 是' : '❌ 否');
    console.log('A级高危错配:', report.A级高危错配);
    console.log('问题:', JSON.stringify(report.问题, null, 2));
    console.log('仍不相关角色:', report.仍不相关角色.length);
    if (report.仍不相关角色.length) {
      report.仍不相关角色.slice(0, 10).forEach((r) => console.log('  -', r.name, '@', r.category));
    }
    if (pilotMissing.length) console.log('试点缺章节:', pilotMissing.length);
  }

  await client.close();
  process.exit(report.通过 ? 0 : 1);
}

run().catch((e) => { console.error(e); process.exit(1); });
