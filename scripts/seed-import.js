'use strict';
// 从 stdin 读 NDJSON（mongoexport 扩展 JSON），增量导入 skills 集合。
//   默认增量：只插入「生产里还没有的 skillId」，不动已有 → 再次部署只更新增量，不冲掉生产数据。
//   SEED_FULL=1：先清空 skills 全量重建。
// 无需 mongoimport / docker —— node + mongodb 驱动服务器上现成。目标库取 MONGODB_URI。
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { MongoClient } = require('mongodb');
const { EJSON } = require('bson');

function mongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  try {
    const env = fs.readFileSync(path.join(__dirname, '..', 'api', '.env'), 'utf8');
    const m = env.match(/^MONGODB_URI=(.+)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  } catch { /* ignore */ }
  return 'mongodb://127.0.0.1:27117/totalclaw';
}

(async () => {
  const FULL = process.env.SEED_FULL === '1';
  const uri = mongoUri();
  console.log('==> 导入目标:', uri.replace(/\/\/[^/@]*@/, '//***@'), FULL ? '(全量重建)' : '(增量，仅新增)');
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db().collection('skills');

  let existing = new Set();
  if (FULL) {
    await col.deleteMany({});
  } else {
    for await (const d of col.find({}, { projection: { skillId: 1, _id: 0 } })) {
      if (d.skillId) existing.add(d.skillId);
    }
    console.log(`==> 生产已有 ${existing.size} 个 skillId，只插入新增`);
  }

  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  let batch = [], inserted = 0, skipped = 0, bad = 0;
  const flush = async () => {
    if (!batch.length) return;
    try { await col.insertMany(batch, { ordered: false }); } catch { /* 重复键忽略 */ }
    inserted += batch.length; batch = [];
    process.stdout.write(`\r==> 新增 ${inserted}（跳过已有 ${skipped}）`);
  };
  for await (const line of rl) {
    if (!line.trim()) continue;
    let doc; try { doc = EJSON.parse(line); } catch { bad++; continue; }
    if (!FULL && doc.skillId && existing.has(doc.skillId)) { skipped++; continue; }
    batch.push(doc);
    if (batch.length >= 1000) await flush();
  }
  await flush();
  const count = await col.countDocuments({});
  console.log(`\n==> 完成：新增 ${inserted}，跳过已有 ${skipped}，解析失败 ${bad}；集合现有 ${count} 条`);
  await client.close();
})().catch((e) => { console.error('!! 导入失败:', e.message); process.exit(1); });
