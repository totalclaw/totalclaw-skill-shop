'use strict';

/**
 * 技能真实可用性验收（结构校验之外的第二层）。
 *
 * 用法：
 *   node scripts/skills/validate-skill-usability.js
 *   node scripts/skills/validate-skill-usability.js --json
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { classifyP0, extractKeyDuties } = require('./scan-p0-role-skills');
const { DEV_DUTY, isDevRoleTitle, isGenericDuty, dutyIsAnchored } = require('./role-duty-helpers');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const BATCH_BY = 'complete-totalclaw-agent-role-skills';
const GENERIC_STEP = '列出缺失信息，用最多 8 个问题';

async function run() {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const report = {
    时间: new Date().toISOString(),
    通过: true,
    技能总数: 0,
    问题: {},
  };

  const issues = {
    p0Role: 0,
    genericMetaStep: 0,
    skeletonExample: 0,
    devDutyLeak: 0,
    genericDutyFallback: 0,
    dutiesNotAnchored: 0,
    v151: 0,
  };

  const roleP0 = new Set();
  const groups = new Map();

  const cur = col.find(
    { kind: 'skill', 'securityAudit.programmatic.by': BATCH_BY },
    { projection: { skillId: 1, contentMd: 1, version: 1, category: 1 } },
  );

  while (await cur.hasNext()) {
    const d = await cur.next();
    report.技能总数++;
    const md = d.contentMd || '';
    const role = md.match(/role:\s*"([^"]+)"/)?.[1] || '';
    const cat = md.match(/category:\s*"([^"]+)"/)?.[1] || d.category || '';

    if (d.version && String(d.version).startsWith('1.5.')) issues.v151++;

    if (md.includes(GENERIC_STEP)) issues.genericMetaStep++;

    if (/用户提出一个与「/.test(md) && !/例：|例如|样例/.test(md)) {
      issues.skeletonExample++;
    }

    const duties = extractKeyDuties(md);
    if (!isDevRoleTitle(role) && duties.some((x) => DEV_DUTY.test(x))) {
      issues.devDutyLeak++;
    }
    if (!isDevRoleTitle(role) && duties.some((x) => isGenericDuty(x))) {
      issues.genericDutyFallback++;
    }
    if (duties.length && !duties.some((x) => dutyIsAnchored(role, x))) {
      issues.dutiesNotAnchored++;
    }

    const rk = `${role}|||${cat}`;
    if (!groups.has(rk)) groups.set(rk, { role, cat, md });
  }

  for (const g of groups.values()) {
    const roleDoc = await col.findOne(
      { kind: 'role', name: g.role, category: g.cat },
      { projection: { contentMd: 1 } },
    );
    const reasons = classifyP0(g.role, g.cat, extractKeyDuties(g.md), roleDoc);
    if (reasons.length) {
      roleP0.add(g.role);
      issues.p0Role++;
    }
  }

  report.问题 = {
    P0角色组: roleP0.size,
    含通用meta步骤: issues.genericMetaStep,
    含通用meta步骤率: `${((issues.genericMetaStep / report.技能总数) * 100).toFixed(1)}%`,
    示例骨架化: issues.skeletonExample,
    示例骨架化率: `${((issues.skeletonExample / report.技能总数) * 100).toFixed(1)}%`,
    非研发岗研发套话: issues.devDutyLeak,
    非研发岗职责兜底套话: issues.genericDutyFallback,
    职责兜底套话率: `${((issues.genericDutyFallback / report.技能总数) * 100).toFixed(1)}%`,
    职责未锚定角色名: issues.dutiesNotAnchored,
    职责未锚定率: `${((issues.dutiesNotAnchored / report.技能总数) * 100).toFixed(1)}%`,
    v1_5_x技能数: issues.v151,
  };

  if (roleP0.size > 0) report.通过 = false;
  if (issues.genericMetaStep > 0) report.通过 = false;
  if (issues.genericDutyFallback / report.技能总数 > 0.01) report.通过 = false;
  if (issues.dutiesNotAnchored / report.技能总数 > 0.05) report.通过 = false;

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log('=== 技能可用性验收 ===');
    console.log(report.通过 ? '通过: ✅ 是' : '通过: ❌ 否');
    console.log(JSON.stringify(report.问题, null, 2));
  }

  await client.close();
  process.exit(report.通过 ? 0 : 1);
}

run().catch((e) => { console.error(e); process.exit(1); });
