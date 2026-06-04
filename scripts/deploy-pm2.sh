#!/usr/bin/env bash
# Skill 市场一键部署（仿 totalclaw-web/scripts/deploy-pm2.sh）。
# 默认与 totalclaw-web 共享同一个 mongodb 库：totalclaw。
#
# 用法：
#   bash scripts/deploy-pm2.sh                 # 部署 PM2 + 自动配置 nginx
#   SKIP_NGINX=1 bash scripts/deploy-pm2.sh    # 只部署 PM2，不动 nginx
#   SKIP_API=1   bash scripts/deploy-pm2.sh    # 只起前台 SSR
#   SKIP_SYNC=1  bash scripts/deploy-pm2.sh    # 跳过首次同步
#
# 关键 env：
#   API_PORT=3091  WEB_PORT=3090
#   SHARED_MONGO_URI   与 web 共享的 mongo（默认 mongodb://127.0.0.1:27117/totalclaw?directConnection=true）
#   NGINX_SERVER_NAME  站点域名/IP（默认自动探测公网 IP，探测不到则用 _）
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

API_PORT="${API_PORT:-3091}"
WEB_PORT="${WEB_PORT:-3090}"
SHARED_MONGO_URI="${SHARED_MONGO_URI:-mongodb://127.0.0.1:27117/totalclaw?directConnection=true}"

log() { echo "==> $*"; }
warn() { echo "!! $*" >&2; }

# ---------- 1) 依赖 + 构建 ----------
log "安装前台依赖"
npm ci 2>/dev/null || npm install

if [ "${SKIP_API:-0}" != "1" ]; then
  log "安装并构建 API"
  ( cd api && { npm ci 2>/dev/null || npm install; } && npm run build )
fi

# ---------- 2) api/.env（与 web 共享 totalclaw；自动补密钥） ----------
ensure_api_env() {
  local env="api/.env"
  if [ ! -f "$env" ]; then
    cp api/.env.example "$env"
    log "已从 .env.example 生成 api/.env"
  fi
  # 生产默认连 web 共享库（仅当当前 URI 还是本地 27018 默认或缺失时才覆盖）
  if ! grep -q '^MONGODB_URI=' "$env" || grep -qE '^MONGODB_URI=mongodb://127\.0\.0\.1:27018/' "$env"; then
    if grep -q '^MONGODB_URI=' "$env"; then
      perl -i -pe "s#^MONGODB_URI=.*#MONGODB_URI=${SHARED_MONGO_URI}#" "$env"
    else
      printf '\nMONGODB_URI=%s\n' "$SHARED_MONGO_URI" >> "$env"
    fi
    log "MONGODB_URI 指向共享库：$SHARED_MONGO_URI"
  fi
  # 自动生成强随机 JWT / 内部 token（仍是 change-me-* 时）
  gen() { node -e 'console.log(require("crypto").randomBytes(24).toString("hex"))'; }
  if grep -q 'change-me' "$env"; then
    perl -i -pe "s#change-me-skill-market-jwt#$(gen)#; s#change-me-internal-token#$(gen)#" "$env"
    log "已为 JWT_SECRET / SKILL_PAY_INTERNAL_TOKEN 生成随机值"
  fi
}
ensure_api_env

# ---------- 3) MongoDB（共享时无需本地起；仅当 URI 仍指向本地 27018 才用 compose 起） ----------
if [ "${SKIP_MONGO:-0}" != "1" ] && grep -qE '127\.0\.0\.1:27018/' api/.env 2>/dev/null; then
  log "启动本地 MongoDB (docker compose)"
  docker compose up -d 2>/dev/null || warn "docker 不可用：请确保 MONGODB_URI 指向的库可达"
fi

# ---------- 4) 首次同步（可跳过） ----------
if [ "${SKIP_SYNC:-0}" != "1" ]; then
  log "首次全量同步（本地源，失败不阻断）"
  npm run sync:local || warn "同步失败，可稍后手动 npm run sync"
fi

# ---------- 5) PM2 ----------
log "启动 / 重载 PM2（skill-shop-web :$WEB_PORT，skill-shop-api :$API_PORT）"
API_PORT="$API_PORT" WEB_PORT="$WEB_PORT" npx pm2 startOrReload ecosystem.config.cjs --update-env
npx pm2 save 2>/dev/null || true

# ---------- 6) Nginx（可 SKIP_NGINX=1 跳过） ----------
configure_nginx() {
  command -v nginx >/dev/null 2>&1 || { warn "未装 nginx，跳过（手动反代：/api→$API_PORT，/→$WEB_PORT）"; return 0; }

  local NGINX_DIR; NGINX_DIR="$(nginx -V 2>&1 | grep -oE 'conf-path=[^ ]+' | head -1 | cut -d= -f2 | xargs dirname 2>/dev/null)"
  [ -z "$NGINX_DIR" ] && NGINX_DIR="/etc/nginx"
  # 站点目录：宝塔优先，其次标准
  local SITES=""; for d in /www/server/panel/vhost/nginx "$NGINX_DIR/conf.d" "$NGINX_DIR/sites-enabled"; do
    [ -d "$d" ] && { SITES="$d"; break; }
  done
  [ -z "$SITES" ] && { mkdir -p "$NGINX_DIR/conf.d"; SITES="$NGINX_DIR/conf.d"; }

  local SERVER_NAME="${NGINX_SERVER_NAME:-}"
  if [ -z "$SERVER_NAME" ]; then
    SERVER_NAME="$(curl -s -m 5 https://api.ipify.org 2>/dev/null || true)"
    [ -z "$SERVER_NAME" ] && SERVER_NAME="_"
  fi

  local INC_ABS="$SITES/skill-shop-locations.inc"
  sed -e "s#__API_PORT__#$API_PORT#g" -e "s#__PORT__#$WEB_PORT#g" \
    scripts/nginx-skillshop-locations.inc.template > "$INC_ABS"
  sed -e "s#__SERVER_NAME__#$SERVER_NAME#g" -e "s#__SERVER_NAME_EXTRA__##g" \
      -e "s#__LOCATIONS_INCLUDE_ABS__#$INC_ABS#g" \
    scripts/nginx-skillshop-http-server.conf.template > "$SITES/skill-shop-http.conf"
  log "已写入 nginx：$SITES/skill-shop-http.conf（server_name=$SERVER_NAME）"

  if nginx -t 2>/dev/null; then
    nginx -s reload 2>/dev/null || systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || true
    log "nginx 配置已生效"
  else
    warn "nginx -t 校验失败，请手动检查 $SITES/skill-shop-http.conf"
  fi
}
[ "${SKIP_NGINX:-0}" = "1" ] && log "跳过 nginx 配置" || configure_nginx

echo
log "完成 ✅  前台 :$WEB_PORT  API :$API_PORT（Swagger /api/docs）  共享库 totalclaw"
