'use strict';

/**
 * 第三方镜像 skill 市场下架（保留数据）。
 *
 *   node scripts/skills/isolate-third-party-skills.js --dry
 *   node scripts/skills/isolate-third-party-skills.js --apply
 */

const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const THIRD_PARTY = ['github', 'clawskills', 'skilldb', 'hermes'];
// 注：source=openclaw 的处理由 fix-openclaw-source.js 负责（将误标的自研记录改回 totalclaw）；
// 真正的第三方 openclaw 镜像保持其来源标签可见，不在此处下架。

async function main() {
  const apply = process.argv.includes('--apply');
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const filter = { kind: 'skill', source: { $in: THIRD_PARTY } };
  const total = await col.countDocuments(filter);
  const already = await col.countDocuments({ ...filter, listingType: 'inactive' });

  if (apply) {
    const r = await col.updateMany(filter, {
      $set: {
        listingType: 'inactive',
        reviewStatus: 'deprecated',
        lastUpdated: new Date(),
        'securityAudit.programmatic.isolated': 'third-party-market-off',
        'securityAudit.programmatic.isolatedAt': new Date().toISOString(),
      },
    });
    console.log(JSON.stringify({ total, alreadyInactive: already, modified: r.modifiedCount }, null, 2));
  } else {
    console.log(JSON.stringify({ total, alreadyInactive: already, wouldModify: total - already }, null, 2));
  }

  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
