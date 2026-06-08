'use strict';

/**
 * 回滚指定批次的「假校对」（仅打 claude-author 标记、未做真实校验的 batch 002+）。
 * 对清单内角色重新 blueprint-aware polish 恢复 v1.5.2，并清除 claude-author 标记。
 *
 * 用法：
 *   node scripts/skills/revert-proofread-batch.js --batch 002,003,004 --dry
 *   node scripts/skills/revert-proofread-batch.js --batch 002,003,004 --apply
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { buildSkillsForRole } = require('./polish-role-skills');
const { dutiesFromTitle } = require('./role-duty-helpers');
const { SUFFIXES } = require('./lib/proofread-audit');

loadEnv();

const BATCH_BY = 'complete-totalclaw-agent-role-skills';
const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1];
  return d;
};

function loadManifestRoles(batchIds) {
  const roles = [];
  for (const id of batchIds) {
    const p = path.resolve(__dirname, `../../data/skills/proofread-batches/batch-${id}/manifest.json`);
    if (!fs.existsSync(p)) { console.warn('缺 manifest:', p); continue; }
    const m = JSON.parse(fs.readFileSync(p, 'utf8'));
    for (const r of m.角色 || []) roles.push({ name: r.name, category: r.category, batch: id });
  }
  return roles;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const dry = !apply;
  const batchArg = arg('batch', '002,003,004');
  const batchIds = batchArg.split(',').map((s) => s.trim()).filter(Boolean);
  const roles = loadManifestRoles(batchIds);
  console.log(`回滚批次 ${batchIds.join(',')}，角色 ${roles.length} 个`);

  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  let ok = 0;
  let missRole = 0;
  let missSkill = 0;
  const bulk = [];

  for (let i = 0; i < roles.length; i++) {
    const { name, category } = roles[i];
    if ((i + 1) % 200 === 0) console.log(`  [${i + 1}/${roles.length}] ${name}@${category}`);

    const roleDoc = await col.findOne({ kind: 'role', name, category })
      || await col.findOne({ kind: 'role', name });
    if (!roleDoc) { missRole++; continue; }

    const existing = [];
    for (const suffix of SUFFIXES) {
      const doc = await col.findOne({
        kind: 'skill',
        'securityAudit.programmatic.by': BATCH_BY,
        category,
        name: `${name}${suffix}`,
      });
      if (doc) existing.push(doc);
      else missSkill++;
    }
    if (existing.length === 0) continue;

    const titleDuties = dutiesFromTitle(name, category);
    const { updates } = buildSkillsForRole(roleDoc, existing, {
      blueprintAware: true,
      usabilityV2: true,
      titleDuties,
    });

    for (const u of updates) {
      ok++;
      if (apply) {
        bulk.push({
          updateOne: {
            filter: { _id: u._id },
            update: {
              $set: {
                contentMd: u.contentMd,
                description: u.description,
                descriptionZh: u.description,
                version: '1.5.2',
                'securityAudit.programmatic.polishedBy': 'polish-role-skills-blueprint',
                'securityAudit.programmatic.polishedAt': new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
              },
              $unset: {
                'securityAudit.programmatic.refinedBy': '',
                'securityAudit.programmatic.refinedAt': '',
                'securityAudit.programmatic.proofreadBatch': '',
                'securityAudit.programmatic.proofreadValidated': '',
              },
            },
          },
        });
        if (bulk.length >= 500) {
          await col.bulkWrite(bulk, { ordered: false });
          bulk.length = 0;
        }
      }
    }
  }

  if (apply && bulk.length) await col.bulkWrite(bulk, { ordered: false });

  console.log(`\n完成。恢复技能 ${ok} 条，缺角色 ${missRole}，缺技能条目 ${missSkill}${dry ? '（DRY-RUN）' : '（已写库）'}`);
  await client.close();
}

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
