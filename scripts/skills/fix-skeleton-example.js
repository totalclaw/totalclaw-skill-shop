'use strict';

/**
 * 修复 agent-skill-upgraded / legacy-roleskill-upgraded 的 skeleton-example 误报：
 * 将「示例」章节骨架改为含「例：」前缀。
 *
 *   node scripts/skills/fix-skeleton-example.js --dry
 *   node scripts/skills/fix-skeleton-example.js --apply
 */

const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const UPGRADED_BY = ['agent-skill-upgraded', 'legacy-roleskill-upgraded'];

const SKELETON_RE = /(- \*\*输入\*\*：)用户提出一个与「([^」]+)」相关的具体任务/g;
const REPLACEMENT = '$1例：用户提出一个与「$2」相关的具体任务';

async function main() {
  const apply = process.argv.includes('--apply');
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const filter = {
    kind: 'skill',
    'securityAudit.programmatic.by': { $in: UPGRADED_BY },
    contentMd: /用户提出一个与「/,
  };

  let matched = 0;
  let fixed = 0;
  let ops = [];

  const cur = col.find(filter, { projection: { skillId: 1, contentMd: 1 } });
  while (await cur.hasNext()) {
    const doc = await cur.next();
    matched++;
    const md = doc.contentMd || '';
    if (!SKELETON_RE.test(md)) continue;
    SKELETON_RE.lastIndex = 0;
    const newMd = md.replace(SKELETON_RE, REPLACEMENT);
    if (newMd === md) continue;
    fixed++;
    if (apply) {
      ops.push({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              contentMd: newMd,
              lastUpdated: new Date(),
              'securityAudit.programmatic.skeletonExampleFix': true,
              'securityAudit.programmatic.skeletonExampleFixAt': new Date().toISOString(),
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

  console.log(JSON.stringify({ matched, fixed, applied: apply }, null, 2));
  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
