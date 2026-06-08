'use strict';

/**
 * 扫描 P0 可用性问题角色（职责错配 / 非研发岗混入研发套话）。
 *
 * 用法：
 *   node scripts/skills/scan-p0-role-skills.js
 *   node scripts/skills/scan-p0-role-skills.js --write
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const {
  filterDutiesForRole, mergeRoleDuties, dutiesFromTitle,
  isDevRoleTitle, dutyConflictsRole, DEV_DUTY, isGenericDuty,
} = require('./role-duty-helpers');
const { extractResponsibilities } = require('./polish-role-skills');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const BATCH_BY = 'complete-totalclaw-agent-role-skills';
const OUT = path.resolve(__dirname, '../../data/skills/p0-role-skills-audit.json');

function extractKeyDuties(md) {
  const m = md.match(/## 岗位关键动作\n\n([\s\S]*?)\n\n## 输出/);
  if (!m) return [];
  return m[1].split('\n').filter((l) => l.startsWith('- ')).map((l) => l.slice(2).trim());
}

function classifyP0(roleName, category, duties, roleDoc) {
  const reasons = [];
  for (const d of duties) {
    if (dutyConflictsRole(roleName, d)) reasons.push(`domain-conflict:${d.slice(0, 40)}`);
    if (!isDevRoleTitle(roleName) && DEV_DUTY.test(d)) reasons.push('dev-duty-leak');
  }
  const rawResp = extractResponsibilities(roleDoc || {});
  const filtered = filterDutiesForRole(roleName, category, rawResp);
  const skillHasConflict = duties.some((d) => dutyConflictsRole(roleName, d));
  if (rawResp.length > filtered.length + 1 && (skillHasConflict || duties.length < 3)) {
    reasons.push('cluster-duty-mismatch');
  }
  const merged = mergeRoleDuties(roleName, category, rawResp, dutiesFromTitle(roleName, category));
  const genericCount = merged.filter(isGenericDuty).length;
  if (genericCount >= 3 && merged.length >= 4) reasons.push('too-many-generic-duties');
  return [...new Set(reasons)];
}

async function main() {
  const write = process.argv.includes('--write');
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const groups = new Map();
  const cur = col.find({ kind: 'skill', 'securityAudit.programmatic.by': BATCH_BY }, { projection: { contentMd: 1 } });
  while (await cur.hasNext()) {
    const d = await cur.next();
    const m = /role:\s*"([^"]+)"/.exec(d.contentMd || '');
    const cm = /category:\s*"([^"]+)"/.exec(d.contentMd || '');
    if (!m) continue;
    const k = `${m[1]}|||${cm ? cm[1] : ''}`;
    if (!groups.has(k)) {
      groups.set(k, { name: m[1], category: cm ? cm[1] : '', sampleMd: d.contentMd });
    }
  }

  const p0 = [];
  const byReason = {};

  for (const g of groups.values()) {
    const duties = extractKeyDuties(g.sampleMd);
    const roleDoc = await col.findOne(
      { kind: 'role', name: g.name, category: g.category },
      { projection: { name: 1, category: 1, contentMd: 1 } },
    );
    const reasons = classifyP0(g.name, g.category, duties, roleDoc);
    if (!reasons.length) continue;
    p0.push({ name: g.name, category: g.category, reasons, duties: duties.slice(0, 4) });
    for (const r of reasons) {
      const key = r.split(':')[0];
      byReason[key] = (byReason[key] || 0) + 1;
    }
  }

  const report = {
    生成时间: new Date().toISOString(),
    角色组总数: groups.size,
    P0角色数: p0.length,
    按原因统计: byReason,
    P0角色_按品类: p0.reduce((acc, r) => {
      if (!acc[r.category]) acc[r.category] = { 数量: 0, 角色: [] };
      acc[r.category].数量++;
      acc[r.category].角色.push(r.name);
      return acc;
    }, {}),
    P0角色清单: p0,
  };

  console.log('=== P0 角色扫描 ===');
  console.log(JSON.stringify({ 角色组: groups.size, P0: p0.length, 按原因: byReason }, null, 2));

  if (write) {
    fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
    console.log('已写入:', OUT);
  }

  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { classifyP0, extractKeyDuties };
