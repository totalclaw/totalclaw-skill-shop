#!/usr/bin/env bash
# 把仓库内 seed/skills 的技能种子（124k：角色+技能）导入生产共享库（MONGODB_URI，默认 27117/totalclaw）。
# 用 node + mongodb 驱动导入 —— 无需 mongoimport / docker（mongo 镜像从 4.4 起也不带 mongoimport）。
#   bash scripts/import-seed.sh
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT"
SEED_GLOB="seed/skills/skills.ndjson.gz.part-*"
log(){ echo "==> $*"; }; die(){ echo "!! $*" >&2; exit 1; }

ls $SEED_GLOB >/dev/null 2>&1 || die "没找到种子分片 $SEED_GLOB（确认已 git pull 到完整仓库）"
command -v node >/dev/null 2>&1 || die "缺 node"

log "合并分片 + 解压 + node 导入（mongodb 驱动，无需 mongoimport/docker）"
cat $SEED_GLOB | gunzip | node scripts/seed-import.js || die "导入失败"

( command -v pm2 >/dev/null 2>&1 && pm2 restart skill-shop-api >/dev/null 2>&1 ) || npx pm2 restart skill-shop-api >/dev/null 2>&1 || true
sleep 2
log "校验 API：$(curl -s "http://127.0.0.1:${API_PORT:-3091}/api/skills?pageSize=1" | grep -oE '"total":[0-9]+' | head -1)（应为大数）"
echo "==> 完成 ✅"
