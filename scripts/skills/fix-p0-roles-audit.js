'use strict';

/**
 * 按 P0 顺序修复全量角色审计问题：
 *  1. contentMd / description / name 乱码（U+FFFD）
 *  2. 职责为空（重建锚定人格）
 *  3. 重复 name+category（保留较优文档）
 *  4. 世界构建类描述（兜底重写）
 *
 * 用法：
 *   node scripts/skills/fix-p0-roles-audit.js --dry
 *   node scripts/skills/fix-p0-roles-audit.js --apply
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { fixEncoding, hasCorruption } = require('./lib/proofread-body');
const { extractResponsibilities, buildProfile } = require('./polish-role-skills');
const { buildFixedPersona } = require('./fix-a-tier-role-personas');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const ISSUES_PATH = path.resolve(__dirname, '../../data/skills/all-roles-audit-issues.jsonl');

const WORLDBUILDING = /世界构建|构建心理上可信的角色和互动|设定丰富|虚构世界|游戏设定|架空/;

const WORLDBUILDING_DESC_FIX = {
  '叙事学家@科研与学术': '科研与学术领域叙事学家，专注叙事理论研究、故事结构分析与文学批评，负责叙事学学术成果输出与跨学科研究合作，服务于高校文学系及出版研究机构。',
  '心理学家@科研与学术': '科研与学术领域心理学家，专注人类行为、认知模式与动机机制研究，负责心理测量、实验设计与研究结论输出，服务于高校心理系及科研机构。',
};

const arg = (k) => process.argv.includes(`--${k}`);

function scoreRole(doc) {
  let s = 0;
  const resp = extractResponsibilities(doc);
  s += resp.length * 10;
  if (!hasCorruption(doc.contentMd)) s += 30;
  if (!hasCorruption(doc.description || doc.descriptionZh || '')) s += 10;
  if (doc.lastUpdated) s += new Date(doc.lastUpdated).getTime() / 1e15;
  if (doc.securityAudit?.programmatic?.by) s += 5;
  if (/~[a-z0-9-]+$/.test(doc.skillId || '') && !/role-[a-z0-9]+$/.test(doc.slug || '')) s += 3;
  return s;
}

async function flush(col, ops) {
  if (!ops.length) return 0;
  await col.bulkWrite(ops, { ordered: false });
  const n = ops.length;
  ops.length = 0;
  return n;
}

async function phaseEncoding(col, apply, stats) {
  const cur = col.find({ kind: 'role' }, { projection: { name: 1, category: 1, description: 1, descriptionZh: 1, contentMd: 1 } });
  let ops = [];
  while (await cur.hasNext()) {
    const doc = await cur.next();
    const empty = doc.contentMd && !extractResponsibilities(doc).length;
    const updates = {};
    const name = fixEncoding(doc.name || '');
    const desc = fixEncoding(doc.description || doc.descriptionZh || '');
    const descZh = fixEncoding(doc.descriptionZh || doc.description || '');
    const md = doc.contentMd ? fixEncoding(doc.contentMd) : '';

    if (name !== doc.name) updates.name = name;
    if (desc !== (doc.description || '')) updates.description = desc;
    if (descZh !== (doc.descriptionZh || '')) updates.descriptionZh = descZh;
    if (!empty && md && md !== doc.contentMd) updates.contentMd = md;

    if (!Object.keys(updates).length) continue;
    stats.encoding++;
    if (apply) {
      ops.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: { ...updates, lastUpdated: new Date() } },
        },
      });
      if (ops.length >= 200) stats.encodingApplied += await flush(col, ops);
    }
  }
  if (apply) stats.encodingApplied += await flush(col, ops);
}

async function phaseEmptyResponsibilities(col, apply, stats) {
  const cur = col.find({ kind: 'role' }, { projection: { name: 1, category: 1, description: 1, contentMd: 1, tags: 1 } });
  let ops = [];
  while (await cur.hasNext()) {
    const doc = await cur.next();
    if (!doc.contentMd || extractResponsibilities(doc).length) continue;
    let fixed;
    try {
      fixed = buildFixedPersona(doc.name, doc.category);
    } catch (e) {
      stats.personaFail++;
      continue;
    }
    stats.persona++;
    if (apply) {
      const tags = Array.isArray(doc.tags) ? [...doc.tags] : [];
      for (const t of ['AI角色', doc.category, fixed.cluster]) {
        if (t && !tags.includes(t)) tags.push(t);
      }
      ops.push({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              description: fixed.desc,
              descriptionZh: fixed.desc,
              contentMd: fixed.body,
              emoji: fixed.fm.emoji,
              color: fixed.fm.color,
              tags,
              lastUpdated: new Date(),
              syncedAt: new Date(),
              'securityAudit.programmatic.by': 'p0-persona-fix',
              'securityAudit.programmatic.fixedAt': new Date().toISOString(),
              'securityAudit.programmatic.fixedStrategy': fixed.strategy,
              'securityAudit.programmatic.score': fixed.validate.score,
            },
          },
        },
      });
      if (ops.length >= 100) stats.personaApplied += await flush(col, ops);
    }
  }
  if (apply) stats.personaApplied += await flush(col, ops);
}

async function phaseDuplicates(col, apply, stats) {
  const groups = new Map();
  const cur = col.find({ kind: 'role' }, { projection: { name: 1, category: 1, description: 1, descriptionZh: 1, contentMd: 1, skillId: 1, slug: 1, lastUpdated: 1, securityAudit: 1 } });
  while (await cur.hasNext()) {
    const doc = await cur.next();
    const key = `${doc.name}@${doc.category}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(doc);
  }

  const deleteIds = [];
  for (const [key, docs] of groups) {
    if (docs.length < 2) continue;
    docs.sort((a, b) => scoreRole(b) - scoreRole(a));
    const keep = docs[0];
    for (let i = 1; i < docs.length; i++) {
      deleteIds.push({ id: docs[i]._id, key, keepId: keep._id });
    }
    stats.duplicates++;
  }

  stats.duplicateDeletes = deleteIds.length;
  // 安全护栏：单次去重超过 200 条时拒绝执行，防止误删大量角色。
  const MAX_SAFE_DELETES = 200;
  if (apply && deleteIds.length) {
    if (deleteIds.length > MAX_SAFE_DELETES) {
      throw new Error(
        `去重安全护栏：检测到 ${deleteIds.length} 条待删角色，超过上限 ${MAX_SAFE_DELETES}。` +
        `请人工确认后用 --force-dedup 参数强制执行，或检查角色数据是否正确。`
      );
    }
    await col.deleteMany({ _id: { $in: deleteIds.map((d) => d.id) } });
  }
  stats.duplicateSamples = deleteIds.slice(0, 5).map((d) => `${d.key} 删 ${String(d.id).slice(-6)} 留 ${String(d.keepId).slice(-6)}`);
}

async function phaseWorldbuilding(col, apply, stats) {
  let ops = [];
  const cur = col.find({ kind: 'role' }, { projection: { name: 1, category: 1, description: 1, descriptionZh: 1, contentMd: 1 } });
  while (await cur.hasNext()) {
    const doc = await cur.next();
    const desc = (doc.description || doc.descriptionZh || '').trim();
    const key = `${doc.name}@${doc.category}`;
    let nextDesc = WORLDBUILDING_DESC_FIX[key];
    if (!nextDesc && WORLDBUILDING.test(desc)) {
      nextDesc = `${doc.category}领域${doc.name}，专注${doc.name}岗位的核心职责与专业交付，对质量与结果负责。`;
    }
    if (!nextDesc || nextDesc === desc) continue;
    stats.worldbuilding++;
    if (apply) {
      ops.push({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              description: nextDesc,
              descriptionZh: nextDesc,
              lastUpdated: new Date(),
              'securityAudit.programmatic.by': 'p0-worldbuilding-desc-fix',
              'securityAudit.programmatic.fixedAt': new Date().toISOString(),
            },
          },
        },
      });
      if (ops.length >= 200) stats.worldbuildingApplied += await flush(col, ops);
    }
  }
  if (apply) stats.worldbuildingApplied += await flush(col, ops);
}

async function main() {
  const apply = arg('apply');
  const dry = !apply;
  console.log(dry ? '=== P0 修复 dry-run ===' : '=== P0 修复写库 ===');

  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');
  const stats = {
    encoding: 0, encodingApplied: 0,
    persona: 0, personaApplied: 0, personaFail: 0,
    duplicates: 0, duplicateDeletes: 0, duplicateSamples: [],
    worldbuilding: 0, worldbuildingApplied: 0,
  };

  console.log('\n[1/4] 乱码修复…');
  await phaseEncoding(col, apply, stats);

  console.log('[2/4] 空职责重建人格…');
  await phaseEmptyResponsibilities(col, apply, stats);

  console.log('[3/4] 重复角色去重…');
  await phaseDuplicates(col, apply, stats);

  console.log('[4/4] 世界构建类描述…');
  await phaseWorldbuilding(col, apply, stats);

  console.log('\n结果:', JSON.stringify(stats, null, 2));

  if (apply) {
    console.log('\n重新审计…');
    await client.close();
    const { spawnSync } = require('child_process');
    const r = spawnSync('node', [path.join(__dirname, 'audit-all-roles.js'), '--write'], { stdio: 'inherit' });
    process.exit(r.status || 0);
  } else {
    await client.close();
  }
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { scoreRole, phaseEncoding, phaseEmptyResponsibilities, phaseDuplicates, phaseWorldbuilding };
