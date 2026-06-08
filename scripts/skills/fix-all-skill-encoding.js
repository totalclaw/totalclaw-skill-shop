'use strict';

/**
 * 全库 skill 乱码 U+FFFD 批量 fixEncoding。
 *
 *   node scripts/skills/fix-all-skill-encoding.js --dry
 *   node scripts/skills/fix-all-skill-encoding.js --apply
 */

const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { fixEncoding, hasCorruption } = require('./lib/proofread-body');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';

async function main() {
  const apply = process.argv.includes('--apply');
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  let scanned = 0;
  let fixed = 0;
  let ops = [];

  const cur = col.find({ kind: 'skill' }, {
    projection: { skillId: 1, name: 1, description: 1, descriptionZh: 1, contentMd: 1 },
  });

  while (await cur.hasNext()) {
    const doc = await cur.next();
    scanned++;
    if (scanned % 50000 === 0) console.log(`  …${scanned}`);

    const updates = {};
    const name = fixEncoding(doc.name || '');
    const desc = fixEncoding(doc.description || '');
    const descZh = fixEncoding(doc.descriptionZh || doc.description || '');
    const md = doc.contentMd ? fixEncoding(doc.contentMd) : '';

    if (name !== (doc.name || '')) updates.name = name;
    if (desc !== (doc.description || '')) updates.description = desc;
    if (descZh !== (doc.descriptionZh || '')) updates.descriptionZh = descZh;
    if (md && md !== doc.contentMd) updates.contentMd = md;

    if (!Object.keys(updates).length) continue;
    if (hasCorruption(JSON.stringify(updates))) continue;

    fixed++;
    if (apply) {
      ops.push({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              ...updates,
              lastUpdated: new Date(),
              'securityAudit.programmatic.encodingFixAt': new Date().toISOString(),
            },
          },
        },
      });
      if (ops.length >= 300) {
        await col.bulkWrite(ops, { ordered: false });
        ops = [];
      }
    }
  }
  if (ops.length) await col.bulkWrite(ops, { ordered: false });

  console.log(JSON.stringify({ scanned, fixed, applied: apply }, null, 2));
  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
