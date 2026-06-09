#!/usr/bin/env bash
# 把仓库内 seed/skills 的技能种子导入生产共享库（MONGODB_URI，默认 27117/totalclaw）。
# 用 node + mongodb 驱动导入 —— 无需 mongoimport / docker。
#   bash scripts/import-seed.sh              # 增量（仅新增）
#   SEED_FULL=1 bash scripts/import-seed.sh  # 全量重建
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT"
SEED_GLOB="seed/skills/skills.ndjson.gz.part-*"
SEED_FULL="${SEED_FULL:-0}"
log(){ echo "==> $*"; }; die(){ echo "!! $*" >&2; exit 1; }

ls $SEED_GLOB >/dev/null 2>&1 || die "没找到种子分片 $SEED_GLOB（先运行 bash scripts/download-seed.sh 从 CDN 下载）"
command -v node >/dev/null 2>&1 || die "缺 node"

log "合并分片 + 解压 + node 导入（$([ "$SEED_FULL" = "1" ] && echo "全量重建" || echo "增量，仅新增")）"
export SEED_FULL
cat $SEED_GLOB | gunzip | node scripts/seed-import.js || die "导入失败"

( command -v pm2 >/dev/null 2>&1 && pm2 restart skill-shop-api >/dev/null 2>&1 ) || npx pm2 restart skill-shop-api >/dev/null 2>&1 || true
sleep 2
log "校验 API：$(curl -s "http://127.0.0.1:${API_PORT:-3091}/api/skills?pageSize=1" | grep -oE '"total":[0-9]+' | head -1)（应为大数）"
echo "==> 完成 ✅"
