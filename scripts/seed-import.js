'use strict';
// 从 stdin 读 NDJSON（mongoexport 扩展 JSON），用 mongodb 驱动导入 skills 集合。
// 无需 mongoimport / docker —— node + mongodb 驱动服务器上现成。
// 目标库取 MONGODB_URI（优先 env，其次 api/.env，最后 27117/totalclaw）。
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
  const uri = mongoUri();
  console.log('==> 导入目标:', uri.replace(/\/\/[^/@]*@/, '//***@'));
  const client = new MongoClient(uri);
  await client.connect();
  const col = client.db().collection('skills');
  // 只清空 skills（等价 --drop），不动同库其它集合（如 web 的 users）
  await col.deleteMany({});
  const rl = readline.createInterface({ input: process.stdin, crlfDelay: Infinity });
  let batch = [], total = 0, bad = 0;
  const flush = async () => {
    if (!batch.length) return;
    try { await col.insertMany(batch, { ordered: false }); } catch (e) { /* 重复键等忽略 */ }
    total += batch.length; batch = [];
    process.stdout.write(`\r==> 已导入 ${total}`);
  };
  for await (const line of rl) {
    if (!line.trim()) continue;
    try { batch.push(EJSON.parse(line)); } catch { bad++; continue; }
    if (batch.length >= 1000) await flush();
  }
  await flush();
  const count = await col.countDocuments({});
  console.log(`\n==> 完成：导入 ${total} 条（解析失败 ${bad}），集合现有 ${count} 条`);
  await client.close();
})().catch((e) => { console.error('!! 导入失败:', e.message); process.exit(1); });
