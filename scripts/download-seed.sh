#!/usr/bin/env bash
# 从 CDN 下载 seed 分片到 seed/skills/（部署前调用）。
#
#   bash scripts/download-seed.sh
#   SEED_FORCE_DOWNLOAD=1 bash scripts/download-seed.sh   # 强制重新下载
#
# 环境变量：
#   SEED_CDN_BASE  默认 https://cdn2.taituai.com/skills
#                  分片直接位于 $SEED_CDN_BASE/skills.ndjson.gz.part-{aa,ab,ac,ad}
#                  若 CDN 根路径有 manifest.json，会自动读取分片列表；否则使用默认四片。
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT"
SEED_DIR="seed/skills"
CDN_BASE="${SEED_CDN_BASE:-https://cdn2.taituai.com/skills}"
MANIFEST_URL="${CDN_BASE%/}/manifest.json"
FORCE="${SEED_FORCE_DOWNLOAD:-0}"
# 默认四个分片名（CDN 无 manifest 时使用）
DEFAULT_PARTS="skills.ndjson.gz.part-aa
skills.ndjson.gz.part-ab
skills.ndjson.gz.part-ac
skills.ndjson.gz.part-ad"

log(){ echo "==> $*"; }; die(){ echo "!! $*" >&2; exit 1; }

command -v curl >/dev/null 2>&1 || die "缺 curl"

mkdir -p "$SEED_DIR"

# 本地已有且非强制 → 跳过
if [ "$FORCE" != "1" ] && ls "$SEED_DIR"/skills.ndjson.gz.part-* >/dev/null 2>&1; then
  log "本地已有 seed 分片，跳过下载（强制：SEED_FORCE_DOWNLOAD=1）"
  exit 0
fi

# 尝试拉取 manifest；失败时用默认分片列表（新 CDN 无 manifest）
PART_FILES=""
TMP_MANIFEST="$(mktemp)"
if curl -fsSL --max-time 10 "$MANIFEST_URL" -o "$TMP_MANIFEST" 2>/dev/null; then
  PART_FILES="$(node -e "
    try {
      const m = require('${TMP_MANIFEST}');
      if (!m.parts || !m.parts.length) process.exit(2);
      console.log(m.parts.map(p => p.file).join('\n'));
    } catch(e) { process.exit(2); }
  " 2>/dev/null)" || PART_FILES=""
  [ -n "$PART_FILES" ] && log "manifest 已读取：$(echo "$PART_FILES" | wc -l | tr -d ' ') 个分片"
fi
rm -f "$TMP_MANIFEST"

if [ -z "$PART_FILES" ]; then
  log "无 manifest（或解析失败），使用默认分片列表（aa ab ac ad）"
  PART_FILES="$DEFAULT_PARTS"
fi

log "清除旧分片，从 $CDN_BASE 下载…"
rm -f "$SEED_DIR"/skills.ndjson.gz.part-*

while IFS= read -r part; do
  [ -n "$part" ] || continue
  url="${CDN_BASE%/}/${part}"
  dest="$SEED_DIR/$part"
  log "  $part"
  curl -fsSL --retry 3 --retry-delay 2 -C - "$url" -o "$dest" || die "下载失败: $url"
done <<< "$PART_FILES"

log "seed 下载完成 → $SEED_DIR（$(ls "$SEED_DIR" | wc -l | tr -d ' ') 个文件）"
