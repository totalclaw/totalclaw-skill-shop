'use strict';

/**
 * 扫描角色 skill 覆盖与方向匹配。
 *
 * 找出：
 *  - 无任何 skill 的角色
 *  - skill 数量不足 8 且无 complete 批次
 *  - skill 与岗位方向不匹配（描述/正文与角色名语义无关）
 *
 * 用法：
 *   node scripts/skills/scan-role-skill-coverage.js --write
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { extractRoleFromMd } = require('./lib/proofread-body');
const { isProfileRelevant, coreToken, buildProfile } = require('./polish-role-skills');
const { SUFFIXES } = require('./lib/proofread-audit');
const { descMentionsRole } = require('./lib/role-desc-relevance');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const OUT = path.resolve(__dirname, '../../data/skills/role-skill-coverage-report.json');
const OUT_GAP = path.resolve(__dirname, '../../data/skills/role-skill-coverage-gaps.jsonl');
const COMPLETE_BY = 'complete-totalclaw-agent-role-skills';

function skillAlignsToRole(roleName, roleCategory, roleDesc, skill) {
  const md = skill.contentMd || '';
  const body = md.replace(/^---[\s\S]*?---\n\n/, '');
  const desc = `${skill.description || ''} ${skill.descriptionZh || ''}`.trim();
  const fmRole = extractRoleFromMd(md);
  if (fmRole && fmRole !== roleName) return false;
  if (descMentionsRole(roleName, desc)) return true;
  if (isProfileRelevant(roleName, `${desc} ${body.slice(0, 800)}`, [])) return true;
  const tok = coreToken(roleName);
  if (tok.length >= 2 && (body.includes(roleName) || body.includes(tok))) return true;
  if ((skill.tags || []).includes(roleName)) return true;
  return false;
}

async function main() {
  const write = process.argv.includes('--write');
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  console.log('索引 skill…');
  const roleSkills = new Map();
  const cur = col.find({ kind: 'skill' }, {
    projection: {
      skillId: 1, name: 1, category: 1, contentMd: 1, description: 1, descriptionZh: 1,
      tags: 1, 'securityAudit.programmatic.by': 1,
    },
  });

  while (await cur.hasNext()) {
    const s = await cur.next();
    const fmRole = extractRoleFromMd(s.contentMd);
    const fmCat = /category:\s*"([^"]+)"/.exec(s.contentMd || '')?.[1] || s.category || '';
    const candidates = new Set();
    if (fmRole && fmCat) candidates.add(`${fmRole}@${fmCat}`);
    for (const t of s.tags || []) {
      if (t && t !== '岗位技能' && t !== 'totalclaw-agent' && t.length >= 2 && t.length <= 40) {
        candidates.add(`${t}@${s.category || fmCat || ''}`);
      }
    }
    for (const key of candidates) {
      if (!roleSkills.has(key)) roleSkills.set(key, []);
      roleSkills.get(key).push(s);
    }
  }

  console.log('扫描角色…');
  const gaps = [];
  const stats = {
    总角色数: 0,
    无skill: 0,
    skill不足8: 0,
    方向不匹配: 0,
    complete批次齐全: 0,
    通过: 0,
  };

  const roleCur = col.find({ kind: 'role' }, {
    projection: { name: 1, category: 1, description: 1, descriptionZh: 1, contentMd: 1, skillsDone: 1, slug: 1 },
  });

  while (await roleCur.hasNext()) {
    const role = await roleCur.next();
    stats.总角色数++;
    const key = `${role.name}@${role.category}`;
    const skills = roleSkills.get(key) || [];
    const desc = (role.description || role.descriptionZh || '').trim();

    const completeSkills = skills.filter((s) => s.securityAudit?.programmatic?.by === COMPLETE_BY);
    const suffixSet = new Set();
    for (const s of completeSkills) {
      for (const suf of SUFFIXES) {
        if (s.name === `${role.name}${suf}`) suffixSet.add(suf);
      }
    }
    const hasComplete8 = suffixSet.size === 8;

    const aligned = skills.filter((s) => skillAlignsToRole(role.name, role.category, desc, s));
    const alignedRatio = skills.length ? aligned.length / skills.length : 0;

    let status = 'ok';
    const issues = [];

    if (skills.length === 0) {
      status = 'no-skills';
      issues.push('no-skills');
      stats.无skill++;
    } else if (!hasComplete8 && skills.length < 8) {
      status = 'insufficient-skills';
      issues.push(`skill-count:${skills.length}`);
      stats.skill不足8++;
    } else if (hasComplete8) {
      stats.complete批次齐全++;
    }

    if (skills.length > 0 && aligned.length === 0) {
      status = status === 'ok' ? 'misaligned' : status;
      issues.push('direction-mismatch');
      stats.方向不匹配++;
    } else if (skills.length > 0 && alignedRatio < 0.5 && !hasComplete8) {
      issues.push('low-alignment');
      if (status === 'ok') { status = 'misaligned'; stats.方向不匹配++; }
    }

    if (issues.length === 0) stats.通过++;
    else if (write) {
      gaps.push({
        name: role.name,
        category: role.category,
        slug: role.slug,
        status,
        issues,
        skillCount: skills.length,
        completeCount: completeSkills.length,
        alignedCount: aligned.length,
        hasComplete8,
        desc: desc.slice(0, 120),
      });
    }
  }

  const report = {
    生成时间: new Date().toISOString(),
    汇总: stats,
    通过率: `${((stats.通过 / stats.总角色数) * 100).toFixed(2)}%`,
    需补全估算: stats.无skill + stats.skill不足8 + stats.方向不匹配,
  };

  if (write) {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
    if (gaps.length) fs.writeFileSync(OUT_GAP, gaps.map((g) => JSON.stringify(g)).join('\n') + '\n', 'utf8');
    console.log('报告 →', OUT);
    console.log('缺口明细 →', OUT_GAP, `(${gaps.length} 条)`);
  }

  console.log('\n=== 角色 Skill 覆盖 ===');
  console.log(JSON.stringify(report, null, 2));

  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { skillAlignsToRole };
