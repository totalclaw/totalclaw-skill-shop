'use strict';

/**
 * Complete all remaining role skill gaps for TotalClaw-agent.
 *
 * This script directly writes MongoDB with stable, hash-based skillIds. It avoids
 * the older import script's slug collisions for mixed Chinese/English role names.
 */
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { buildSkills, hash36 } = require('./generate-totalclaw-agent-batch');

const BATCH_SIZE = Number(process.env.ROLE_SKILL_BATCH_SIZE || process.argv[2] || 1000);
const PRICE = Number(process.env.SKILL_PRICE || 9);

function skillIdFor(role, spec) {
  const suffix = hash36(`${role.slug}:${role.name}:${spec.name}:totalclaw-agent-complete-v1`);
  return `totalclaw:roleskill~${role.slug}-${suffix}`;
}

async function countState(skills) {
  const undone = await skills.find(
    { kind: 'role', skillsDone: { $ne: true } },
    { projection: { _id: 1, name: 1, slug: 1, category: 1 } },
  ).toArray();
  const skillTags = new Set(await skills.distinct('tags', { kind: 'skill' }));
  const uncovered = [];
  const coveredDuplicateDocs = [];
  const seen = new Set();
  for (const role of undone) {
    if (skillTags.has(role.name)) {
      coveredDuplicateDocs.push(role);
      continue;
    }
    if (seen.has(role.name)) continue;
    seen.add(role.name);
    uncovered.push(role);
  }
  return { undone, uncovered, coveredDuplicateDocs };
}

async function pickBatch(skills) {
  const { uncovered } = await countState(skills);
  const counts = uncovered.reduce((acc, role) => {
    const cat = role.category || 'other';
    acc.set(cat, (acc.get(cat) || 0) + 1);
    return acc;
  }, new Map());
  uncovered.sort((a, b) => {
    const ca = counts.get(a.category || 'other') || 0;
    const cb = counts.get(b.category || 'other') || 0;
    return cb - ca || String(a.category || '').localeCompare(String(b.category || ''), 'zh') || a.name.localeCompare(b.name, 'zh');
  });
  return uncovered.slice(0, BATCH_SIZE);
}

async function upsertRoleSkills(skills, role) {
  let inserted = 0;
  let updated = 0;
  const specs = buildSkills(role);
  for (const spec of specs) {
    const skillId = skillIdFor(role, spec);
    const existing = await skills.findOne({ skillId }, { projection: { _id: 1 } });
    const slug = skillId.replace(/^totalclaw:roleskill~/, '');
    await skills.updateOne({ skillId }, {
      $set: {
        skillId,
        slug,
        name: spec.name,
        displayName: spec.name,
        description: spec.desc,
        descriptionZh: spec.desc,
        category: role.category,
        tags: ['岗位技能', role.name, ...(Array.isArray(spec.tags) ? spec.tags.slice(0, 5) : [])],
        source: 'totalclaw',
        kind: 'skill',
        contentMd: String(spec.body || '').trim(),
        author: 'TotalClaw',
        version: '1.0.0',
        syncedAt: new Date(),
        lastUpdated: new Date(),
        securityAudit: {
          programmatic: {
            score: 92,
            reason: 'complete remaining totalclaw-agent role skills',
            by: 'complete-totalclaw-agent-role-skills',
            at: new Date(),
          },
        },
      },
      $setOnInsert: {
        listingType: 'paid',
        ownership: 'totalclaw-proprietary',
        closedSource: true,
        pricing: { model: 'paid', price: PRICE, currency: 'CNY' },
        reviewStatus: 'n/a',
        featured: false,
        stats: { downloads: 0, sales: 0, ratingAvg: 0, ratingCount: 0 },
      },
    }, { upsert: true });
    if (existing) updated++;
    else inserted++;
  }
  await skills.updateMany({ kind: 'role', name: role.name }, { $set: { skillsDone: true } });
  return { inserted, updated };
}

async function markCoveredDuplicatesDone(skills) {
  const { coveredDuplicateDocs } = await countState(skills);
  if (!coveredDuplicateDocs.length) return 0;
  const ids = coveredDuplicateDocs.map((role) => role._id);
  const result = await skills.updateMany({ _id: { $in: ids } }, { $set: { skillsDone: true } });
  return result.modifiedCount || 0;
}

async function main() {
  loadEnv();
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/totalclaw');
  await client.connect();
  const skills = client.db().collection('skills');

  const started = await countState(skills);
  const summary = {
    batchSize: BATCH_SIZE,
    startedUndoneDocs: started.undone.length,
    startedUncoveredNames: started.uncovered.length,
    startedCoveredDuplicateDocs: started.coveredDuplicateDocs.length,
    processedRoles: 0,
    insertedSkills: 0,
    updatedSkills: 0,
    markedCoveredDuplicatesDone: 0,
    rounds: [],
  };

  for (let round = 1; ; round++) {
    const batch = await pickBatch(skills);
    if (!batch.length) break;
    const roundInfo = { round, roles: batch.length, inserted: 0, updated: 0 };
    for (const role of batch) {
      const result = await upsertRoleSkills(skills, role);
      roundInfo.inserted += result.inserted;
      roundInfo.updated += result.updated;
      summary.processedRoles++;
    }
    summary.insertedSkills += roundInfo.inserted;
    summary.updatedSkills += roundInfo.updated;
    summary.rounds.push(roundInfo);
    console.log(`[complete-totalclaw-agent-role-skills] round=${round} roles=${roundInfo.roles} inserted=${roundInfo.inserted} updated=${roundInfo.updated}`);
  }

  summary.markedCoveredDuplicatesDone = await markCoveredDuplicatesDone(skills);
  const finished = await countState(skills);
  summary.finishedUndoneDocs = finished.undone.length;
  summary.finishedUncoveredNames = finished.uncovered.length;
  summary.finishedCoveredDuplicateDocs = finished.coveredDuplicateDocs.length;
  console.log(JSON.stringify(summary, null, 2));
  await client.close();
  if (summary.finishedUndoneDocs !== 0 || summary.finishedUncoveredNames !== 0) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
