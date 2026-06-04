'use strict';

/**
 * 多源 skill 同步调度入口。
 *
 *   node scripts/sync/run-sync.js                       # 同步全部源
 *   node scripts/sync/run-sync.js --source=totalclaw    # 指定单源
 *   node scripts/sync/run-sync.js --source=totalclaw,openclaw,hermes
 *
 * 直接用 mongodb driver upsert 到 skills 集合（与 NestJS 共用同库），
 * 并写 sync_runs 记录。失败软化、逐条容错。
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { normalize } = require('./normalize');

// cron（前台进程）等场景 process.env 可能没有 MONGODB_URI：回退读 api/.env。
function loadEnvFallback() {
  if (process.env.MONGODB_URI) return;
  const envFile = path.resolve(__dirname, '../../api/.env');
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
}
loadEnvFallback();

const ADAPTERS = {
  totalclaw: require('./adapter-totalclaw'),
  openclaw: require('./adapter-openclaw'),
  hermes: require('./adapter-hermes'),
  github: require('./adapter-github'),
  tencent: require('./adapter-tencent'),
  clawskills: require('./adapter-clawskills'),
  skilldb: require('./adapter-skilldb'),
};

// --dedup：跳过 slug 已被其它 skillId 收录的项（用于镜像源只补净新增，避免重复灌库）
const DEDUP = process.argv.includes('--dedup');

const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/totalclaw';

function parseArgs() {
  const arg = process.argv.find((a) => a.startsWith('--source='));
  if (!arg) return Object.keys(ADAPTERS);
  return arg.replace('--source=', '').split(',').map((s) => s.trim()).filter(Boolean);
}

async function syncSource(db, sourceName) {
  const adapter = ADAPTERS[sourceName];
  if (!adapter) {
    console.warn(`未知源: ${sourceName}`);
    return;
  }
  const runs = db.collection('sync_runs');
  const skills = db.collection('skills');
  const startedAt = new Date();
  const { insertedId: runId } = await runs.insertOne({
    source: sourceName,
    startedAt,
    status: 'running',
    upserted: 0,
    failed: 0,
    createdAt: startedAt,
  });

  let upserted = 0;
  let failed = 0;
  let skipped = 0;
  try {
    console.log(`\n=== 同步源: ${sourceName} ===`);
    const raws = await adapter.fetch();
    console.log(`[${sourceName}] 原始条目: ${raws.length}${DEDUP ? '（--dedup 去重模式）' : ''}`);

    for (const raw of raws) {
      try {
        const doc = normalize(raw);
        if (!doc) { failed++; continue; }
        // --dedup：同一 slug 已被其它 skillId 收录则跳过（镜像源只补净新增）
        if (DEDUP) {
          const dup = await skills.findOne(
            { slug: doc.slug, skillId: { $ne: doc.skillId } },
            { projection: { _id: 1 } },
          );
          if (dup) { skipped++; continue; }
        }
        // upsert：保留市场字段（pricing/listingType/reviewStatus 等）由聚合源决定，
        // 但不覆盖管理员后期改过的 featured / reviewStatus（用 $setOnInsert 保护）。
        const { featured, reviewStatus, ...rest } = doc;
        await skills.updateOne(
          { skillId: doc.skillId },
          {
            $set: rest,
            $setOnInsert: { featured: featured ?? false, reviewStatus: reviewStatus ?? 'n/a' },
          },
          { upsert: true },
        );
        upserted++;
      } catch (e) {
        failed++;
        if (failed <= 5) console.warn(`[${sourceName}] upsert 失败: ${e.message}`);
      }
    }

    await runs.updateOne(
      { _id: runId },
      { $set: { finishedAt: new Date(), status: 'success', upserted, failed, skipped } },
    );
    console.log(`[${sourceName}] 完成: upserted=${upserted}, failed=${failed}, skipped=${skipped}`);
  } catch (e) {
    await runs.updateOne(
      { _id: runId },
      { $set: { finishedAt: new Date(), status: 'error', upserted, failed, error: e.message } },
    );
    console.error(`[${sourceName}] 同步出错: ${e.message}`);
  }
}

async function ensureIndexes(db) {
  const skills = db.collection('skills');
  await skills.createIndex({ skillId: 1 }, { unique: true });
  await skills.createIndex({ source: 1 });
  await skills.createIndex({ category: 1 });
  await skills.createIndex({ tags: 1 });
  await skills.createIndex({ listingType: 1, category: 1, source: 1 });
  try {
    await skills.createIndex(
      { name: 'text', description: 'text', descriptionZh: 'text' },
      { name: 'skill_text' },
    );
  } catch { /* text index 已存在/冲突，忽略 */ }
}

async function main() {
  const sources = parseArgs();
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db();
  console.log(`已连接 MongoDB: ${MONGODB_URI}`);
  await ensureIndexes(db);

  for (const s of sources) {
    await syncSource(db, s);
  }

  const total = await db.collection('skills').countDocuments();
  console.log(`\n全部完成。skills 集合当前总数: ${total}`);
  await client.close();
}

if (require.main === module) {
  main().catch((e) => {
    console.error('同步失败:', e);
    process.exit(1);
  });
}

module.exports = { main, syncSource };
