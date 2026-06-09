'use strict';

/**
 * Legacy totalclaw roleskill（无 frontmatter）升级为 complete 风格 YAML + 补齐章节。
 * 若同角色已有 8 条 complete 批次技能，则标记 inactive（deprecated）。
 *
 *   node scripts/skills/upgrade-legacy-totalclaw-skills.js --dry
 *   node scripts/skills/upgrade-legacy-totalclaw-skills.js --apply
 *   node scripts/skills/upgrade-legacy-totalclaw-skills.js --apply --limit 5000
 */

const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { hasCorruption } = require('./lib/proofread-body');
const { wrapWithFrontmatter, extractRoleFromTags } = require('./upgrade-agent-skills');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const COMPLETE_BY = 'complete-totalclaw-agent-role-skills';
const LEGACY_MARKER = 'legacy-roleskill-upgraded';

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i !== -1 && process.argv[i + 1] ? Number(process.argv[i + 1]) : d;
};

// Re-export helpers from upgrade-agent-skills internals
const { SUFFIXES } = require('./lib/proofread-audit');

async function loadComplete8Keys(col) {
  const keys = new Set();
  const cur = col.find({
    kind: 'skill',
    'securityAudit.programmatic.by': COMPLETE_BY,
  }, { projection: { name: 1, category: 1, contentMd: 1 } });
  const groups = new Map();
  while (await cur.hasNext()) {
    const d = await cur.next();
    const role = /role:\s*"([^"]+)"/.exec(d.contentMd || '')?.[1] || '';
    const cat = d.category || '';
    if (!role) continue;
    const key = `${role}@${cat}`;
    if (!groups.has(key)) groups.set(key, new Set());
    for (const suf of SUFFIXES) {
      if (d.name === `${role}${suf}`) groups.get(key).add(suf);
    }
  }
  for (const [key, suf] of groups) {
    if (suf.size >= 8) keys.add(key);
  }
  return keys;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const limit = arg('limit', 0);

  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  console.log('加载 complete-8 角色索引…');
  const completeKeys = await loadComplete8Keys(col);
  console.log(`  complete-8 角色: ${completeKeys.size}`);

  const filter = {
    kind: 'skill',
    source: 'totalclaw',
    tags: '岗位技能',
    skillId: /^totalclaw:roleskill~/,
    contentMd: { $not: /^---/ },
    listingType: { $ne: 'inactive' },
  };

  let upgraded = 0;
  let deprecated = 0;
  let skip = 0;
  let ops = [];

  const cur = col.find(filter, {
    projection: {
      skillId: 1, name: 1, category: 1, contentMd: 1, description: 1, descriptionZh: 1, tags: 1,
    },
  });

  while (await cur.hasNext()) {
    if (limit && upgraded + deprecated >= limit) break;
    const doc = await cur.next();
    const roleName = extractRoleFromTags(doc.tags);
    const category = doc.category || '';
    if (!roleName || !category) { skip++; continue; }

    const key = `${roleName}@${category}`;
    if (completeKeys.has(key)) {
      deprecated++;
      if (apply) {
        ops.push({
          updateOne: {
            filter: { _id: doc._id },
            update: {
              $set: {
                listingType: 'inactive',
                reviewStatus: 'deprecated',
                lastUpdated: new Date(),
                'securityAudit.programmatic.by': 'legacy-roleskill-deprecated',
                'securityAudit.programmatic.deprecatedReason': 'superseded-by-complete-batch',
                'securityAudit.programmatic.deprecatedAt': new Date().toISOString(),
              },
            },
          },
        });
      }
    } else {
      const wrapped = wrapWithFrontmatter(doc, roleName, category);
      if (hasCorruption(wrapped.contentMd)) { skip++; continue; }
      upgraded++;
      if (apply) {
        ops.push({
          updateOne: {
            filter: { _id: doc._id },
            update: {
              $set: {
                ...wrapped,
                source: 'totalclaw',
                version: '1.5.2',
                lastUpdated: new Date(),
                'securityAudit.programmatic.by': LEGACY_MARKER,
                'securityAudit.programmatic.upgradedAt': new Date().toISOString(),
                'securityAudit.programmatic.upgradedFrom': 'legacy-roleskill',
              },
            },
          },
        });
      }
    }

    if (ops.length >= 200) {
      await col.bulkWrite(ops, { ordered: false });
      ops = [];
      if ((upgraded + deprecated) % 5000 === 0) console.log(`  …upgraded ${upgraded} deprecated ${deprecated}`);
    }
  }
  if (ops.length) await col.bulkWrite(ops, { ordered: false });

  console.log(JSON.stringify({ upgraded, deprecated, skip, applied: apply }, null, 2));
  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
