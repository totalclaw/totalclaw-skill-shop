'use strict';
/**
 * 删除投毒 / 已下架技能（清单与指纹见 scripts/toxic-skills.js）。
 *
 * 一、清理 MongoDB（目标库取 MONGODB_URI，否则读 api/.env，默认 27117/totalclaw —— 与 seed-import 一致）
 *   node scripts/purge-toxic-skills.js            # 预演：只列出命中记录 + 安装/授权记录，不删除
 *   node scripts/purge-toxic-skills.js --apply    # 备份到 data/purged/ 后删除；之后重启 skill-shop-api 清缓存
 *
 * 二、过滤 seed 分片（重新生成 CDN 用的 seed，不依赖本地 MongoDB）
 *   node scripts/purge-toxic-skills.js --seed     # seed/skills/*.part-* → 去掉命中记录 → 原地替换 + 更新 manifest
 *
 * 匹配规则：skillId 在黑名单，或文档正文命中恶意载荷特征（覆盖镜像源的不同 skillId）。
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const readline = require('readline');
const { spawnSync } = require('child_process');
const { TOXIC_SKILL_IDS, TOXIC_IOCS, toxicReason } = require('./toxic-skills');

const ROOT = path.join(__dirname, '..');
const APPLY = process.argv.includes('--apply');
const SEED = process.argv.includes('--seed');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');

function mongoUri() {
  if (process.env.MONGODB_URI) return process.env.MONGODB_URI;
  try {
    const env = fs.readFileSync(path.join(ROOT, 'api', '.env'), 'utf8');
    const m = env.match(/^MONGODB_URI=(.+)$/m);
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  } catch { /* ignore */ }
  return 'mongodb://127.0.0.1:27117/totalclaw';
}

// ---------- 一、数据库 ----------
async function purgeDb() {
  const { MongoClient } = require('mongodb');
  const { EJSON } = require('bson');
  const uri = mongoUri();
  console.log('==> 目标库:', uri.replace(/\/\/[^/@]*@/, '//***@'), APPLY ? '(删除)' : '(预演，加 --apply 才删除)');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const skills = db.collection('skills');

  // 1) 显式 skillId
  const byId = await skills.find({ skillId: { $in: TOXIC_SKILL_IDS } }).toArray();
  // 2) 内容指纹（正则扫正文相关字段，覆盖镜像源的其它 skillId）
  const iocOr = [];
  for (const re of TOXIC_IOCS) {
    for (const f of ['contentMd', 'description', 'descriptionZh', 'installCommand']) {
      iocOr.push({ [f]: { $regex: re.source, $options: re.flags.includes('i') ? 'i' : '' } });
    }
  }
  const byIoc = await skills.find({ skillId: { $nin: TOXIC_SKILL_IDS }, $or: iocOr }).toArray();
  // 二次确认指纹（对整条文档 JSON 再判一次）
  const hits = [...byId, ...byIoc.filter((d) => toxicReason({}, JSON.stringify(d)))];

  console.log(`==> 命中 ${hits.length} 条（skillId ${byId.length}，内容指纹额外 ${hits.length - byId.length}）`);
  for (const d of hits) {
    console.log(`  - ${d.skillId}  source=${d.source}  downloads=${(d.stats && d.stats.downloads) || 0}  reason=${toxicReason(d)}`);
  }
  const missing = TOXIC_SKILL_IDS.filter((id) => !byId.some((d) => d.skillId === id));
  if (missing.length) console.log(`==> 清单中库里已不存在（之前已删）：${missing.length} 条`);

  // 受影响用户排查：授权/安装/订单记录
  const ids = hits.map((d) => d.skillId);
  const related = {};
  for (const [col, q] of [
    ['skill_licenses', { itemId: { $in: ids } }],
    ['entitlements', { skillId: { $in: ids } }],
    ['orders', { skillId: { $in: ids } }],
  ]) {
    related[col] = await db.collection(col).find(q).toArray().catch(() => []);
    console.log(`==> ${col}：${related[col].length} 条`);
  }

  if (!APPLY || !hits.length) {
    await client.close();
    if (!APPLY) console.log('\n预演结束。确认无误后加 --apply 执行删除。');
    return;
  }

  const dir = path.join(ROOT, 'data', 'purged');
  fs.mkdirSync(dir, { recursive: true });
  const backup = path.join(dir, `toxic-skills-${stamp}.ndjson`);
  fs.writeFileSync(backup, hits.map((d) => EJSON.stringify(d, { relaxed: false })).join('\n') + '\n');
  const relFile = path.join(dir, `toxic-related-${stamp}.json`);
  fs.writeFileSync(relFile, EJSON.stringify(related, { relaxed: true }, 2));
  console.log(`==> 已备份 → ${path.relative(ROOT, backup)}；授权/安装记录 → ${path.relative(ROOT, relFile)}`);

  const r = await skills.deleteMany({ _id: { $in: hits.map((d) => d._id) } });
  console.log(`==> 已删除 skills：${r.deletedCount} 条`);
  await client.close();
  console.log('==> 完成。请重启 API 清缓存：npx pm2 restart skill-shop-api');
}

// ---------- 二、seed 分片 ----------
async function purgeSeed() {
  const seedDir = path.join(ROOT, 'seed', 'skills');
  const parts = fs.readdirSync(seedDir).filter((f) => f.startsWith('skills.ndjson.gz.part-')).sort();
  if (!parts.length) throw new Error('seed/skills 下没有分片（先 bash scripts/download-seed.sh）');
  const tmpDir = path.join(ROOT, 'seed', `.purge-${stamp}`);
  fs.mkdirSync(tmpDir, { recursive: true });
  const outGz = path.join(tmpDir, 'skills.ndjson.gz');

  // 合并分片 → gunzip → 逐行过滤 → gzip
  const cat = parts.map((f) => path.join(seedDir, f));
  const { PassThrough } = require('stream');
  const input = new PassThrough();
  (async () => {
    for (const f of cat) {
      await new Promise((res, rej) => fs.createReadStream(f).on('error', rej).on('end', res).pipe(input, { end: false }));
    }
    input.end();
  })().catch((e) => input.destroy(e));

  const gunzip = zlib.createGunzip();
  const gzip = zlib.createGzip({ level: 6 });
  const out = fs.createWriteStream(outGz);
  gzip.pipe(out);
  const rl = readline.createInterface({ input: input.pipe(gunzip), crlfDelay: Infinity });

  let kept = 0, removed = 0, keptSkills = 0, keptRoles = 0;
  const removedIds = [];
  for await (const line of rl) {
    if (!line.trim()) continue;
    const m = line.match(/"skillId":"([^"]+)"/);
    const reason = toxicReason({ skillId: m ? m[1] : null }, line);
    if (reason) { removed++; removedIds.push(`${m ? m[1] : '?'}\t${reason}`); continue; }
    kept++;
    if (/"kind":"role"/.test(line)) keptRoles++; else keptSkills++;
    if (!gzip.write(line + '\n')) await new Promise((r) => gzip.once('drain', r));
  }
  gzip.end();
  await new Promise((r) => out.on('finish', r));
  console.log(`==> seed 过滤：保留 ${kept}，移除 ${removed}`);
  removedIds.forEach((s) => console.log('  - ' + s));

  // 按 90MB 切片（与 generate-seed.sh 一致），原地替换
  const sp = spawnSync('split', ['-b', '90m', outGz, path.join(tmpDir, 'skills.ndjson.gz.part-')], { stdio: 'inherit' });
  if (sp.status !== 0) throw new Error('split 失败');
  fs.unlinkSync(outGz);
  for (const f of parts) fs.unlinkSync(path.join(seedDir, f));
  const newParts = fs.readdirSync(tmpDir).filter((f) => f.startsWith('skills.ndjson.gz.part-')).sort();
  for (const f of newParts) fs.renameSync(path.join(tmpDir, f), path.join(seedDir, f));
  fs.rmdirSync(tmpDir);

  const manifestPath = path.join(ROOT, 'seed', 'manifest.json');
  let manifest = {};
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch { /* new */ }
  manifest.generatedAt = new Date().toISOString();
  manifest.counts = { total: kept, skills: keptSkills, roles: keptRoles };
  manifest.purged = { at: manifest.generatedAt, removed, note: 'scripts/purge-toxic-skills.js --seed' };
  manifest.parts = newParts.map((file) => ({ file, bytes: fs.statSync(path.join(seedDir, file)).size }));
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log(`==> 新分片 ${newParts.length} 个 → seed/skills/；manifest 已更新`);
  console.log(JSON.stringify(manifest, null, 2));
}

(SEED ? purgeSeed() : purgeDb()).catch((e) => { console.error('!!', e); process.exit(1); });
