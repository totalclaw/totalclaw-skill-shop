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

  // 历史 raw 导入可能缺 kind 字段；列表查询用精确 kind:'skill' + {kind,syncedAt,_id} 索引，
  // 缺 kind 会漏数据且走不上索引。导入后补全，幂等。
  const fixed = await col.updateMany({ kind: null }, { $set: { kind: 'skill' } });
  if (fixed.modifiedCount) console.log(`\n==> kind 补全：${fixed.modifiedCount} 个无 kind 文档 → 'skill'`);

  // 确保查询索引（驱动 insert 不会自动建索引；14 万文档无索引会全表扫描 → 超时）。幂等。
  const idx = [
    { key: { skillId: 1 }, name: 'skillId_1', unique: true },
    { key: { kind: 1, syncedAt: -1, _id: -1 }, name: 'kind_1_syncedAt_-1__id_-1' },
    { key: { kind: 1, syncedAt: -1 }, name: 'kind_syncedAt' },
    { key: { kind: 1, category: 1 }, name: 'kind_category' },
    { key: { kind: 1, source: 1 }, name: 'kind_source' },
    { key: { kind: 1, listingType: 1 }, name: 'kind_listingType' },
    { key: { kind: 1, 'stats.downloads': -1 }, name: 'kind_downloads' },
    { key: { reviewStatus: 1 }, name: 'reviewStatus_1' },
    { key: { tags: 1 }, name: 'tags_1' },
  ];
  process.stdout.write('\n==> 确保索引…');
  for (const i of idx) {
    try { await col.createIndex(i.key, { name: i.name, unique: !!i.unique }); process.stdout.write(' ' + i.name); }
    catch (e) { process.stdout.write(`\n  !! 索引 ${i.name}: ${e.message}`); }
  }

  const count = await col.countDocuments({});
  console.log(`\n==> 完成：新增 ${inserted}，跳过已有 ${skipped}，解析失败 ${bad}；集合现有 ${count} 条`);
  await client.close();
})().catch((e) => { console.error('!! 导入失败:', e.message); process.exit(1); });
