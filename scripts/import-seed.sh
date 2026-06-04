#!/usr/bin/env bash
# 把仓库内 seed/skills 的技能种子（124k：角色+技能）导入生产共享库 27117/totalclaw。
# host 有 mongoimport 则直连；否则用 token-web 的 mongo 容器导入。--drop 保证可重复执行。
#   bash scripts/import-seed.sh
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT"
PORT="${MONGO_PORT:-27117}"; DB="${MONGO_DB:-totalclaw}"; COLL="skills"
SEED_GLOB="seed/skills/skills.ndjson.gz.part-*"

log(){ echo "==> $*"; }; die(){ echo "!! $*" >&2; exit 1; }
ls $SEED_GLOB >/dev/null 2>&1 || die "没找到种子分片 $SEED_GLOB（确认已 git pull 到完整仓库）"

TMP="$(mktemp)"; trap 'rm -f "$TMP"' EXIT
log "合并种子分片 + 解压 → NDJSON"
cat $SEED_GLOB | gunzip > "$TMP" || die "解压失败"
log "种子文档数：$(wc -l < "$TMP" | tr -d ' ')"

if command -v mongoimport >/dev/null 2>&1; then
  log "host mongoimport → 127.0.0.1:$PORT/$DB.$COLL（--drop 重建集合）"
  mongoimport --host 127.0.0.1 --port "$PORT" --db "$DB" --collection "$COLL" --drop --file "$TMP" || die "mongoimport 失败"
else
  CN="$(docker ps --format '{{.Names}}' 2>/dev/null | grep -iE 'mongo' | head -1)"
  [ -n "$CN" ] || die "host 无 mongoimport，也没找到 mongo 容器。请装：sudo apt-get install -y mongodb-database-tools"
  log "host 无 mongoimport → 用 mongo 容器 $CN 导入"
  docker cp "$TMP" "$CN:/tmp/seed-skills.ndjson" || die "docker cp 失败"
  docker exec "$CN" mongoimport --db "$DB" --collection "$COLL" --drop --file /tmp/seed-skills.ndjson || die "容器内 mongoimport 失败"
  docker exec "$CN" rm -f /tmp/seed-skills.ndjson 2>/dev/null || true
fi

( command -v pm2 >/dev/null 2>&1 && pm2 restart skill-shop-api >/dev/null 2>&1 ) || npx pm2 restart skill-shop-api >/dev/null 2>&1 || true
sleep 2
log "校验 API：$(curl -s "http://127.0.0.1:${API_PORT:-3091}/api/skills?pageSize=1" | grep -oE '"total":[0-9]+' | head -1)（应为大数）"
echo "==> 完成 ✅"
