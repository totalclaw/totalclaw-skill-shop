#!/usr/bin/env bash
# 从 CDN 下载 seed 分片到 seed/skills/（部署前调用）。
#
#   bash scripts/download-seed.sh
#   SEED_FORCE_DOWNLOAD=1 bash scripts/download-seed.sh   # 强制重新下载
#
# 环境变量：
#   SEED_CDN_BASE  默认 https://cdn2.taituai.com/totalclaw-skill-shop/seed
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT"
SEED_DIR="seed/skills"
CDN_BASE="${SEED_CDN_BASE:-https://cdn2.taituai.com/totalclaw-skill-shop/seed}"
MANIFEST_URL="${CDN_BASE%/}/manifest.json"
FORCE="${SEED_FORCE_DOWNLOAD:-0}"

log(){ echo "==> $*"; }; die(){ echo "!! $*" >&2; exit 1; }

command -v curl >/dev/null 2>&1 || die "缺 curl"

mkdir -p "$SEED_DIR"

# 本地已有且非强制 → 跳过
if [ "$FORCE" != "1" ] && ls "$SEED_DIR"/skills.ndjson.gz.part-* >/dev/null 2>&1; then
  log "本地已有 seed 分片，跳过下载（强制：SEED_FORCE_DOWNLOAD=1）"
  exit 0
fi

TMP_MANIFEST="$(mktemp)"
log "拉取 manifest: $MANIFEST_URL"
curl -fsSL "$MANIFEST_URL" -o "$TMP_MANIFEST" || die "无法下载 manifest（确认 CDN 已上传 seed/manifest.json）"

PART_FILES="$(node -e "
const m = require('${TMP_MANIFEST}');
if (!m.parts || !m.parts.length) process.exit(2);
console.log(m.parts.map(p => p.file).join('\n'));
")" || die "manifest 无 parts 列表"

log "manifest 含 $(echo "$PART_FILES" | wc -l | tr -d ' ') 个分片，开始下载…"
rm -f "$SEED_DIR"/skills.ndjson.gz.part-*

while IFS= read -r part; do
  [ -n "$part" ] || continue
  url="${CDN_BASE%/}/skills/${part}"
  dest="$SEED_DIR/$part"
  log "  $part"
  curl -fsSL --retry 3 --retry-delay 2 -C - "$url" -o "$dest" || die "下载失败: $url"
done <<< "$PART_FILES"

cp "$TMP_MANIFEST" seed/manifest.json
rm -f "$TMP_MANIFEST"

log "seed 下载完成 → $SEED_DIR（$(ls "$SEED_DIR" | wc -l | tr -d ' ') 个文件）"
