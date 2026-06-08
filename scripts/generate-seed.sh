#!/usr/bin/env bash
# 从本地 MongoDB 导出 skills 集合并生成分片 + manifest（上传 CDN 用）。
#
#   bash scripts/generate-seed.sh
#   MONGO_PORT=27018 bash scripts/generate-seed.sh
#
# 产出：
#   seed/skills/skills.ndjson.gz.part-*
#   seed/manifest.json
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT"
SEED_DIR="seed/skills"
MANIFEST="seed/manifest.json"
MONGO_PORT="${MONGO_PORT:-27018}"
MONGO_DB="${MONGO_DB:-totalclaw}"
MONGO_COLLECTION="${MONGO_COLLECTION:-skills}"
CDN_BASE="${SEED_CDN_BASE:-https://cdn2.taituai.com/totalclaw-skill-shop/seed}"

log(){ echo "==> $*"; }; die(){ echo "!! $*" >&2; exit 1; }

command -v mongoexport >/dev/null 2>&1 || die "缺 mongoexport"
command -v node >/dev/null 2>&1 || die "缺 node"

mkdir -p "$SEED_DIR"
log "清空旧分片…"
rm -f "$SEED_DIR"/skills.ndjson.gz.part-*

log "mongoexport --port $MONGO_PORT --db $MONGO_DB --collection $MONGO_COLLECTION"
mongoexport --port "$MONGO_PORT" --db "$MONGO_DB" --collection "$MONGO_COLLECTION" --quiet \
  | gzip | split -b 90m - "$SEED_DIR/skills.ndjson.gz.part-" \
  || die "导出失败"

PARTS=( "$SEED_DIR"/skills.ndjson.gz.part-* )
[ -e "${PARTS[0]}" ] || die "未生成分片"

log "统计文档数并写入 manifest…"
MONGO_PORT="$MONGO_PORT" MONGO_DB="$MONGO_DB" MONGO_COLLECTION="$MONGO_COLLECTION" \
SEED_DIR="$SEED_DIR" MANIFEST="$MANIFEST" CDN_BASE="$CDN_BASE" \
node -e "
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
(async () => {
  const port = process.env.MONGO_PORT;
  const db = process.env.MONGO_DB;
  const col = process.env.MONGO_COLLECTION;
  const seedDir = process.env.SEED_DIR;
  const c = new MongoClient('mongodb://127.0.0.1:' + port + '/' + db);
  await c.connect();
  const s = c.db().collection(col);
  const counts = {
    total: await s.countDocuments({}),
    skills: await s.countDocuments({ kind: 'skill' }),
    roles: await s.countDocuments({ kind: 'role' }),
  };
  await c.close();
  const files = fs.readdirSync(seedDir).filter(f => f.startsWith('skills.ndjson.gz.part-')).sort();
  const manifest = {
    generatedAt: new Date().toISOString(),
    mongo: { port: Number(port), db, collection: col },
    counts,
    cdnBase: process.env.CDN_BASE,
    parts: files.map((file) => {
      const st = fs.statSync(path.join(seedDir, file));
      return { file, bytes: st.size };
    }),
  };
  fs.writeFileSync(process.env.MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
  console.log('counts:', JSON.stringify(counts));
  console.log('parts:', files.length);
})().catch(e => { console.error(e); process.exit(1); });
" || die "manifest 生成失败"

log "完成。分片 ${#PARTS[@]} 个 → $SEED_DIR"
log "manifest → $MANIFEST"
log "上传到 CDN："
log "  $CDN_BASE/manifest.json"
log "  $CDN_BASE/skills/skills.ndjson.gz.part-*"
