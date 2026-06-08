'use strict';

/**
 * 46,400 技能「真实可用性」启发式扫描（非人工，但可复核）。
 * 用于支撑 docs/deep-skill-usability-audit-todo.md 阶段 1.1。
 *
 * 用法：
 *   node scripts/skills/audit-skill-usability-heuristic.js
 *   node scripts/skills/audit-skill-usability-heuristic.js --write
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const { isDevRoleTitle, isGenericDuty, DEV_DUTY, dutyIsAnchored } = require('./role-duty-helpers');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const BATCH_BY = 'complete-totalclaw-agent-role-skills';
const OUT = path.resolve(__dirname, '../../data/skills/usability-heuristic-report.json');

const GENERIC_META_STEP = '列出缺失信息，用最多 8 个问题';

function extractSection(md, heading) {
  const m = md.match(new RegExp(`## ${heading}\\n\\n([\\s\\S]*?)(\\n## |$)`));
  return m ? m[1] : '';
}

function extractKeyDuties(md) {
  const m = md.match(/## 岗位关键动作\n\n([\s\S]*?)\n\n## 输出/);
  if (!m) return [];
  return m[1].split('\n').filter((l) => l.startsWith('- ')).map((l) => l.slice(2).trim());
}

function analyze(md, roleName, category) {
  const issues = [];
  const stepsBlock = extractSection(md, '步骤');
  if (stepsBlock.includes(GENERIC_META_STEP)) issues.push('generic-meta-step');

  const duties = extractKeyDuties(md);
  if (duties.some((d) => isGenericDuty(d) && !isDevRoleTitle(roleName))) {
    issues.push('generic-duty-fallback');
  }
  if (!isDevRoleTitle(roleName) && duties.some((d) => DEV_DUTY.test(d))) {
    issues.push('dev-duty-on-non-dev');
  }

  if (/用户提出一个与「/.test(md) && !/例如|样例|如：|比如|例：/.test(md)) {
    issues.push('example-skeleton-only');
  }

  if (duties.length && roleName && !duties.some((d) => dutyIsAnchored(roleName, d))) {
    issues.push('duties-not-title-anchored');
  }

  return { issues, dutyCount: duties.length, len: md.length };
}

async function main() {
  const write = process.argv.includes('--write');
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const stats = {
    生成时间: new Date().toISOString(),
    批次: BATCH_BY,
    技能总数: 0,
    genericMetaStep: 0,
    genericDutyFallback: 0,
    devDutyOnNonDev: 0,
    exampleSkeleton: 0,
    dutiesNotAnchored: 0,
    问题样例: {},
  };

  const groups = new Map();
  const cur = col.find(
    { kind: 'skill', 'securityAudit.programmatic.by': BATCH_BY },
    { projection: { skillId: 1, name: 1, category: 1, contentMd: 1 } },
  );

  while (await cur.hasNext()) {
    const d = await cur.next();
    stats.技能总数++;
    const md = d.contentMd || '';
    const role = md.match(/role:\s*"([^"]+)"/)?.[1] || '';
    const cat = md.match(/category:\s*"([^"]+)"/)?.[1] || d.category || '';
    const a = analyze(md, role, cat);

    for (const iss of a.issues) {
      const key = iss === 'generic-meta-step' ? 'genericMetaStep'
        : iss === 'generic-duty-fallback' ? 'genericDutyFallback'
          : iss === 'dev-duty-on-non-dev' ? 'devDutyOnNonDev'
            : iss === 'example-skeleton-only' ? 'exampleSkeleton'
              : iss === 'duties-not-title-anchored' ? 'dutiesNotAnchored' : iss;
      stats[key] = (stats[key] || 0) + 1;

      if (!stats.问题样例[iss]) stats.问题样例[iss] = [];
      if (stats.问题样例[iss].length < 5) {
        stats.问题样例[iss].push({ skillId: d.skillId, name: d.name, role, category: cat });
      }
    }

    const gk = `${role}|||${cat}`;
    if (!groups.has(gk)) groups.set(gk, []);
    groups.get(gk).push(md.replace(/name: [^\n]+/g, '').slice(0, 400));
  }

  let lowVarietyRoles = 0;
  for (const bodies of groups.values()) {
    if (bodies.length < 8) continue;
    if (new Set(bodies).size <= 3) lowVarietyRoles++;
  }
  stats.同角色8技能低差异组 = lowVarietyRoles;
  stats.角色组数 = groups.size;

  stats.汇总 = {
    结构可用: 'validate-complete-batch 已通过',
    业务可用: stats.genericMetaStep === 0 && stats.genericDutyFallback < stats.技能总数 * 0.1
      ? '✅ 自动指标通过（待人工抽样）'
      : stats.genericMetaStep === 0
        ? '⚠️ meta 步骤已清零，职责兜底套话仍偏高'
        : '❌ 仍有通用 meta 步骤',
    genericMetaStep率: `${((stats.genericMetaStep / stats.技能总数) * 100).toFixed(1)}%`,
    genericDutyFallback率: `${((stats.genericDutyFallback / stats.技能总数) * 100).toFixed(1)}%`,
    exampleSkeleton率: `${((stats.exampleSkeleton / stats.技能总数) * 100).toFixed(1)}%`,
  };

  console.log('=== 技能可用性启发式扫描 ===');
  console.log(JSON.stringify(stats.汇总, null, 2));
  console.log('明细:', {
    genericMetaStep: stats.genericMetaStep,
    genericDutyFallback: stats.genericDutyFallback,
    devDutyOnNonDev: stats.devDutyOnNonDev,
    exampleSkeleton: stats.exampleSkeleton,
    dutiesNotAnchored: stats.dutiesNotAnchored,
    同角色8技能低差异组: stats.同角色8技能低差异组,
  });

  if (write) {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(stats, null, 2), 'utf8');
    console.log('已写入:', OUT);
  }

  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
