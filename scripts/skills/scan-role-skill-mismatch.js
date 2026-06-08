'use strict';

/**
 * 扫描 complete 批次角色↔人格匹配，输出 A/B/精准 分级审计 JSON。
 *
 * 口径：
 *   A 级 = 共用人格(≥5) 且角色名与人格无 2-gram 语义重叠
 *   B 级 = 共用人格(≥5) 但有重叠（同域泛化）
 *   精准 = 其余（独有人格或共用人格<5）
 *
 * 用法：
 *   node scripts/skills/scan-role-skill-mismatch.js
 *   node scripts/skills/scan-role-skill-mismatch.js --write
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { buildProfile, isProfileRelevant, extractResponsibilities, coreToken } = require('./polish-role-skills');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const BATCH_BY = 'complete-totalclaw-agent-role-skills';
const OUT = path.resolve(__dirname, '../../data/skills/role-skill-mismatch-audit.json');

function personaFingerprint(contentMd) {
  const resp = extractResponsibilities({ contentMd });
  if (!resp.length) return 'empty';
  return resp.map((r) => r.replace(/\s+/g, ' ').trim()).sort().join('|');
}

function hasTitleInDuties(name, responsibilities) {
  const tok = coreToken(name);
  if (tok.length >= 2 && responsibilities.some((r) => r.includes(tok) || r.includes(name))) return true;
  return false;
}

async function loadCompleteBatchRoles(col) {
  const cur = col.find({ kind: 'skill', 'securityAudit.programmatic.by': BATCH_BY }, { projection: { contentMd: 1 } });
  const groups = new Map();
  while (await cur.hasNext()) {
    const d = await cur.next();
    const m = /role:\s*"([^"]+)"/.exec(d.contentMd || '');
    const cm = /category:\s*"([^"]+)"/.exec(d.contentMd || '');
    if (!m) continue;
    const k = `${m[1]}|||${cm ? cm[1] : ''}`;
    if (!groups.has(k)) groups.set(k, { name: m[1], category: cm ? cm[1] : '' });
  }
  const roles = [];
  for (const r of groups.values()) {
    const role = await col.findOne(
      { kind: 'role', name: r.name, category: r.category },
      { projection: { name: 1, category: 1, description: 1, contentMd: 1, securityAudit: 1 } },
    );
    if (role) roles.push(role);
  }
  return roles;
}

async function main() {
  const write = process.argv.includes('--write');
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const roles = await loadCompleteBatchRoles(col);
  const fpGroups = new Map();
  for (const role of roles) {
    const fp = personaFingerprint(role.contentMd);
    if (!fpGroups.has(fp)) fpGroups.set(fp, []);
    fpGroups.get(fp).push(role);
  }

  const aTier = [];
  const bTier = [];
  const precise = [];
  const aByCat = {};
  const bByCat = {};
  let noTitleDuty = 0;

  for (const role of roles) {
    const prof = buildProfile(role);
    const fp = personaFingerprint(role.contentMd);
    const shared = fpGroups.get(fp)?.length || 1;
    const titleAnchored = hasTitleInDuties(role.name, prof.responsibilities);
    if (!titleAnchored) noTitleDuty++;

    const entry = { name: role.name, category: role.category };
    if (shared >= 5 && !prof.relevant) {
      aTier.push(entry);
      if (!aByCat[role.category]) aByCat[role.category] = { 数量: 0, 角色: [] };
      aByCat[role.category].数量++;
      aByCat[role.category].角色.push(role.name);
    } else if (shared >= 5) {
      bTier.push(entry);
      if (!bByCat[role.category]) bByCat[role.category] = { 数量: 0, 角色: [] };
      bByCat[role.category].数量++;
      bByCat[role.category].角色.push(role.name);
    } else {
      precise.push(entry);
    }
  }

  const report = {
    生成时间: new Date().toISOString(),
    汇总: {
      总角色: roles.length,
      A级: aTier.length,
      B级: bTier.length,
      精准或独有: precise.length,
      职责未锚定岗位名: noTitleDuty,
    },
    口径: 'A=共用人格(≥5)且无2-gram重叠; B=共用人格(≥5)有重叠; 精准=其余',
    A级高危错配_按品类: aByCat,
    B级同域泛化_按品类: bByCat,
  };

  console.log('=== 角色↔人格匹配扫描 ===');
  console.log(JSON.stringify(report.汇总, null, 2));
  if (aTier.length) console.log('⚠️  A 级仍有余:', aTier.slice(0, 5));

  if (write) {
    fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
    console.log('已写入:', OUT);
  }

  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { loadCompleteBatchRoles, personaFingerprint, hasTitleInDuties };
