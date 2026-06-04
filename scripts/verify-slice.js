'use strict';

// 临时验证脚本：用 mongodb-memory-server 起一个本地 mongod，跑同步并查询。
// 仅用于无 Docker 环境的端到端验证。

const { MongoMemoryServer } = require('mongodb-memory-server');
const { MongoClient } = require('mongodb');

(async () => {
  const mem = await MongoMemoryServer.create();
  const uri = mem.getUri('skill-market');
  process.env.MONGODB_URI = uri;
  console.log('内存 MongoDB:', uri);

  // 只跑本地源（不依赖网络）
  process.argv = process.argv.slice(0, 2).concat(['--source=totalclaw,openclaw,hermes']);
  const { main } = require('./sync/run-sync');
  await main();

  // 查询验证
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const skills = db.collection('skills');
  const total = await db.collection('skills').countDocuments();
  const bySource = await skills.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]).toArray();
  const sample = await skills.find().limit(3).project({ skillId: 1, name: 1, source: 1, category: 1, listingType: 1, descriptionZh: 1 }).toArray();
  const runs = await db.collection('sync_runs').find().toArray();

  console.log('\n========== 验证结果 ==========');
  console.log('skills 总数:', total);
  console.log('按来源:', JSON.stringify(bySource));
  console.log('sync_runs:', runs.map((r) => `${r.source}:${r.status}(${r.upserted})`).join(', '));
  console.log('样例:');
  sample.forEach((s) => console.log('  -', s.skillId, '|', s.name, '|', s.category, '|', s.listingType));

  await client.close();
  await mem.stop();
  console.log('\n验证完成，内存库已关闭。');
  process.exit(0);
})().catch((e) => { console.error('验证失败:', e); process.exit(1); });
