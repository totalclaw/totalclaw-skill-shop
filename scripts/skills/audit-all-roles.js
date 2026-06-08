'use strict';

/**
 * 全量角色审计（kind:'role'，默认 27,396 条）。
 *
 * 维度：
 *  - 基础完整性（name/category/description/contentMd）
 *  - 乱码 U+FFFD
 *  - 描述与角色名不符 / 过短 / 异常（世界构建、游戏设定等）
 *  - 人格：职责缺失、职责未锚定岗位名、人格与岗位名不相关
 *  - 重复 name+category
 *  - 配套技能：skillsDone 与 8 条技能是否齐全（complete 批次）
 *
 * 用法：
 *   node scripts/skills/audit-all-roles.js
 *   node scripts/skills/audit-all-roles.js --write
 *   node scripts/skills/audit-all-roles.js --write --json
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { buildProfile, extractResponsibilities, isProfileRelevant, coreToken } = require('./polish-role-skills');
const { fixEncoding, hasCorruption } = require('./lib/proofread-body');
const { descMentionsRole } = require('./lib/role-desc-relevance');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const BATCH_BY = 'complete-totalclaw-agent-role-skills';
const OUT = path.resolve(__dirname, '../../data/skills/all-roles-audit-report.json');
const OUT_ISSUES = path.resolve(__dirname, '../../data/skills/all-roles-audit-issues.jsonl');

const SUFFIXES = [
  '任务澄清与目标拆解', '工作流规划与里程碑排期', '信息收集与证据台账', '方案生成与备选比较',
  '质量检查与风险复核', '自动化提示词与工具调用清单', '交付物撰写与汇报', '复盘沉淀与知识库更新',
];

const WORLDBUILDING = /世界构建|构建.*连贯自洽|时代细节|民族志方法|制图学与空间分析|普罗普到坎贝尔|构建心理上可信的角色和互动|设定丰富|虚构世界|游戏设定|架空/;

const SYSTEM_ROLE = /^(EXECUTIVE-BRIEF|QUICKSTART|nexus-strategy)$/i;

function dutyAnchored(name, responsibilities) {
  if (responsibilities.some((r) => r.includes(name))) return true;
  const tok = coreToken(name);
  if (tok.length >= 2 && responsibilities.some((r) => r.includes(tok))) return true;
  return false;
}

async function loadSkillCounts(col) {
  const map = new Map();
  const cur = col.find(
    { kind: 'skill', 'securityAudit.programmatic.by': BATCH_BY },
    { projection: { name: 1, category: 1, contentMd: 1 } },
  );
  while (await cur.hasNext()) {
    const d = await cur.next();
    const role = /role:\s*"([^"]+)"/.exec(d.contentMd || '')?.[1] || '';
    const cat = d.category || /category:\s*"([^"]+)"/.exec(d.contentMd || '')?.[1] || '';
    if (!role) continue;
    const key = `${role}@${cat}`;
    map.set(key, (map.get(key) || 0) + 1);
  }
  return map;
}

async function main() {
  const write = process.argv.includes('--write');
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  console.log('加载 complete 批次技能计数…');
  const skillCounts = await loadSkillCounts(col);

  const issues = {
    missingName: [],
    missingCategory: [],
    missingDescription: [],
    missingContentMd: [],
    corruptName: [],
    corruptDescription: [],
    corruptContentMd: [],
    descTooShort: [],
    descNotMentionRole: [],
    worldbuildingDesc: [],
    systemRole: [],
    emptyResponsibilities: [],
    dutyNotAnchored: [],
    personaNotRelevant: [],
    duplicateNameCategory: [],
    skillsIncomplete: [],
    skillsMissing: [],
    noSkillsDone: [],
  };

  const stats = {
    总角色数: 0,
    有complete批次技能: 0,
    通过: 0,
    有问题: 0,
  };

  const seen = new Map();
  const issueLines = [];

  console.log('扫描全部角色…');
  const cur = col.find({ kind: 'role' }, {
    projection: {
      name: 1, category: 1, description: 1, descriptionZh: 1, contentMd: 1,
      skillsDone: 1, source: 1, tags: 1,
    },
  });

  while (await cur.hasNext()) {
    const r = await cur.next();
    stats.总角色数++;
    if (stats.总角色数 % 5000 === 0) console.log(`  …${stats.总角色数}`);

    const name = r.name || '';
    const cat = r.category || '';
    const desc = (r.description || r.descriptionZh || '').trim();
    const roleIssues = [];

    if (!name) { issues.missingName.push({ name, category: cat }); roleIssues.push('missing-name'); }
    if (!cat) { issues.missingCategory.push({ name, category: cat }); roleIssues.push('missing-category'); }
    if (!desc) { issues.missingDescription.push({ name, category: cat }); roleIssues.push('missing-description'); }
    if (!r.contentMd) { issues.missingContentMd.push({ name, category: cat }); roleIssues.push('missing-contentMd'); }

    if (hasCorruption(name)) { issues.corruptName.push({ name, category: cat }); roleIssues.push('corrupt-name'); }
    if (hasCorruption(desc)) { issues.corruptDescription.push({ name, category: cat }); roleIssues.push('corrupt-description'); }
    if (hasCorruption(r.contentMd)) { issues.corruptContentMd.push({ name, category: cat }); roleIssues.push('corrupt-contentMd'); }

    if (desc && desc.length < 20) { issues.descTooShort.push({ name, category: cat, desc }); roleIssues.push('desc-too-short'); }
    if (desc && name && !SYSTEM_ROLE.test(name) && !descMentionsRole(name, desc)) {
      issues.descNotMentionRole.push({ name, category: cat, desc: desc.slice(0, 80) });
      roleIssues.push('desc-not-mention-role');
    }
    if (WORLDBUILDING.test(desc)) {
      issues.worldbuildingDesc.push({ name, category: cat, desc: desc.slice(0, 80) });
      roleIssues.push('worldbuilding-desc');
    }
    if (SYSTEM_ROLE.test(name)) {
      issues.systemRole.push({ name, category: cat });
      roleIssues.push('system-role');
    }

    const responsibilities = extractResponsibilities(r);
    if (r.contentMd && !responsibilities.length) {
      issues.emptyResponsibilities.push({ name, category: cat });
      roleIssues.push('empty-responsibilities');
    }
    if (responsibilities.length && !dutyAnchored(name, responsibilities)) {
      issues.dutyNotAnchored.push({ name, category: cat });
      roleIssues.push('duty-not-anchored');
    }

    const profile = buildProfile(r);
    if (r.contentMd && !isProfileRelevant(name, desc, responsibilities.length ? responsibilities : extractResponsibilities(r))) {
      issues.personaNotRelevant.push({ name, category: cat });
      roleIssues.push('persona-not-relevant');
    }

    const dupKey = `${name}@${cat}`;
    if (seen.has(dupKey)) {
      issues.duplicateNameCategory.push({ name, category: cat, firstId: seen.get(dupKey) });
      roleIssues.push('duplicate');
    } else {
      seen.set(dupKey, String(r._id));
    }

    const skillN = skillCounts.get(dupKey);
    if (skillN) {
      stats.有complete批次技能++;
      if (skillN !== 8) {
        issues.skillsIncomplete.push({ name, category: cat, count: skillN });
        roleIssues.push(`skills-incomplete:${skillN}`);
      }
    } else if (r.skillsDone && r.source === 'totalclaw') {
      issues.skillsMissing.push({ name, category: cat });
      roleIssues.push('skills-missing-batch');
    }

    if (!r.skillsDone) {
      issues.noSkillsDone.push({ name, category: cat });
      roleIssues.push('no-skillsDone');
    }

    if (roleIssues.length) {
      stats.有问题++;
      if (write) issueLines.push(JSON.stringify({ name, category: cat, issues: roleIssues, desc: desc.slice(0, 120) }));
    } else {
      stats.通过++;
    }
  }

  const report = {
    生成时间: new Date().toISOString(),
    汇总: {
      ...stats,
      通过率: `${((stats.通过 / stats.总角色数) * 100).toFixed(1)}%`,
    },
    问题统计: {
      缺名称: issues.missingName.length,
      缺品类: issues.missingCategory.length,
      缺描述: issues.missingDescription.length,
      缺contentMd: issues.missingContentMd.length,
      名称乱码: issues.corruptName.length,
      描述乱码: issues.corruptDescription.length,
      contentMd乱码: issues.corruptContentMd.length,
      描述过短: issues.descTooShort.length,
      描述未提及角色名: issues.descNotMentionRole.length,
      世界构建类描述: issues.worldbuildingDesc.length,
      系统内置角色: issues.systemRole.length,
      职责为空: issues.emptyResponsibilities.length,
      职责未锚定岗位名: issues.dutyNotAnchored.length,
      人格与岗位名不相关: issues.personaNotRelevant.length,
      重复name加category: issues.duplicateNameCategory.length,
      complete批次技能非8条: issues.skillsIncomplete.length,
      skillsDone但无批次技能: issues.skillsMissing.length,
      未标记skillsDone: issues.noSkillsDone.length,
    },
    样例: {
      描述未提及角色名: issues.descNotMentionRole.slice(0, 15),
      人格不相关: issues.personaNotRelevant.slice(0, 15),
      职责未锚定: issues.dutyNotAnchored.slice(0, 15),
      技能非8条: issues.skillsIncomplete.slice(0, 15),
    },
  };

  if (write) {
    fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
    if (issueLines.length) fs.writeFileSync(OUT_ISSUES, issueLines.join('\n') + '\n', 'utf8');
    console.log('报告 →', OUT);
    if (issueLines.length) console.log('问题明细 →', OUT_ISSUES, `(${issueLines.length} 条)`);
  }

  console.log('\n=== 全量角色审计 ===');
  console.log(JSON.stringify(report.汇总, null, 2));
  console.log('\n问题统计:');
  console.log(JSON.stringify(report.问题统计, null, 2));

  await client.close();
  process.exit(report.汇总.有问题 > 0 ? 1 : 0);
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { dutyAnchored };
