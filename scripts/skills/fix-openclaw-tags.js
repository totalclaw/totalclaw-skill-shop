'use strict';

/**
 * 从非 openclaw 源的 skill 中移除 openclaw/OpenClaw 标签（不改 source）。
 * source=openclaw 的第三方镜像请用 isolate-third-party-skills.js 下架。
 *
 *   node scripts/skills/fix-openclaw-tags.js --dry
 *   node scripts/skills/fix-openclaw-tags.js --apply
 */

const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';

function stripOpenclawTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.filter((t) => t !== 'openclaw' && t !== 'OpenClaw');
}

async function main() {
  const apply = process.argv.includes('--apply');
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const filter = {
    kind: 'skill',
    source: { $ne: 'openclaw' },
    $or: [{ tags: 'openclaw' }, { tags: 'OpenClaw' }],
  };

  let n = 0;
  let ops = [];
  const cur = col.find(filter, { projection: { skillId: 1, tags: 1 } });

  while (await cur.hasNext()) {
    const doc = await cur.next();
    const tags = stripOpenclawTags(doc.tags);
    if (tags.length === (doc.tags || []).length) continue;
    n++;
    if (apply) {
      ops.push({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              tags,
              lastUpdated: new Date(),
              'securityAudit.programmatic.openclawTagStripped': true,
              'securityAudit.programmatic.openclawTagStrippedAt': new Date().toISOString(),
            },
          },
        },
      });
    }
    if (ops.length >= 200) {
      await col.bulkWrite(ops, { ordered: false });
      ops = [];
    }
  }
  if (ops.length) await col.bulkWrite(ops, { ordered: false });

  console.log(JSON.stringify({ matched: n, applied: apply }, null, 2));
  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
