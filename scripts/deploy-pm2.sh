#!/usr/bin/env bash
# Skill 市场一键部署（仿 totalclaw-web/scripts/deploy-pm2.sh）。
# 默认与 totalclaw-web 共享同一个 mongodb 库：totalclaw，并以独立子域部署（如 skills.taituai.com）。
#
# 用法（域名已内置 skills.taituai.com，直接一条命令）：
#   npm run deploy                # 部署 PM2 + 生成 skills.taituai.com 的 80+443 vhost
#   SKIP_NGINX=1 npm run deploy   # 只部署 PM2，不动 nginx
#   SKIP_API=1   npm run deploy   # 只起前台 SSR
#   SKIP_SYNC=1  npm run deploy   # 跳过首次同步
#
# 关键 env：
#   API_PORT=3091  WEB_PORT=3090
#   NGINX_SERVER_NAME  站点域名（默认已内置 skills.taituai.com；换域名才需覆盖）
#   PUBLIC_ORIGIN      对外访问根（默认 https://<NGINX_SERVER_NAME>）—— 决定页面里下载/安装命令显示的地址
#   SSL_CERT / SSL_KEY 证书路径（默认宝塔 /www/server/panel/vhost/cert/<域名>/{fullchain,privkey}.pem）
#   SHARED_MONGO_URI   与 web 共享的 mongo（默认 mongodb://127.0.0.1:27117/totalclaw?directConnection=true）
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

API_PORT="${API_PORT:-3091}"
WEB_PORT="${WEB_PORT:-3090}"
SHARED_MONGO_URI="${SHARED_MONGO_URI:-mongodb://127.0.0.1:27117/totalclaw?directConnection=true}"

log() { echo "==> $*"; }
warn() { echo "!! $*" >&2; }

# ---------- 0) 解析域名 + 对外 origin（PM2 与 nginx 共用） ----------
# 站点域名已内置；如需别的域名：NGINX_SERVER_NAME=xxx npm run deploy
SERVER_NAME="${NGINX_SERVER_NAME:-skills.taituai.com}"
# 证书解析（按优先级取第一处同时存在 .pem + .key 的）：
#   ① 显式 SSL_CERT/SSL_KEY  ② /etc/nginx/cert/<域名>.{pem,key}（服务器上传位置）
#   ③ 项目内 certs/<域名>.{pem,key}  ④ 宝塔 /www/server/panel/vhost/cert/<域名>/{fullchain,privkey}.pem
if [ -z "${SSL_CERT:-}" ] || [ -z "${SSL_KEY:-}" ]; then
  for d in "/etc/nginx/cert" "$ROOT/certs" "/www/server/panel/vhost/cert/${SERVER_NAME}"; do
    if [ "$d" = "/www/server/panel/vhost/cert/${SERVER_NAME}" ]; then
      cpem="$d/fullchain.pem"; ckey="$d/privkey.pem"
    else
      cpem="$d/${SERVER_NAME}.pem"; ckey="$d/${SERVER_NAME}.key"
    fi
    if [ -f "$cpem" ] && [ -f "$ckey" ]; then
      [ -z "${SSL_CERT:-}" ] && SSL_CERT="$cpem"
      [ -z "${SSL_KEY:-}" ] && SSL_KEY="$ckey"
      break
    fi
  done
fi
SSL_CERT="${SSL_CERT:-/etc/nginx/cert/${SERVER_NAME}.pem}"
SSL_KEY="${SSL_KEY:-/etc/nginx/cert/${SERVER_NAME}.key}"
HAS_CERT=0; [ -f "$SSL_CERT" ] && [ -f "$SSL_KEY" ] && HAS_CERT=1
# PUBLIC_ORIGIN：有证书且是真实域名 → https；否则按情况降级
if [ -n "${PUBLIC_ORIGIN:-}" ]; then
  :  # 用户显式指定，尊重
elif [ "$SERVER_NAME" = "_" ]; then
  PUBLIC_ORIGIN="http://localhost:${WEB_PORT}"
elif [ "$HAS_CERT" = "1" ]; then
  PUBLIC_ORIGIN="https://${SERVER_NAME}"
else
  PUBLIC_ORIGIN="http://${SERVER_NAME}"
fi
log "站点 server_name=${SERVER_NAME}  对外 PUBLIC_ORIGIN=${PUBLIC_ORIGIN}  证书=$([ "$HAS_CERT" = 1 ] && echo 有 || echo 无)"

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
  if ! grep -q '^MONGODB_URI=' "$env" || grep -qE '^MONGODB_URI=mongodb://127\.0\.0\.1:27018/' "$env"; then
    if grep -q '^MONGODB_URI=' "$env"; then
      perl -i -pe "s#^MONGODB_URI=.*#MONGODB_URI=${SHARED_MONGO_URI}#" "$env"
    else
      printf '\nMONGODB_URI=%s\n' "$SHARED_MONGO_URI" >> "$env"
    fi
    log "MONGODB_URI 指向共享库：$SHARED_MONGO_URI"
  fi
  gen() { node -e 'console.log(require("crypto").randomBytes(24).toString("hex"))'; }
  if grep -q 'change-me' "$env"; then
    perl -i -pe "s#change-me-skill-market-jwt#$(gen)#; s#change-me-internal-token#$(gen)#" "$env"
    log "已为 JWT_SECRET / SKILL_PAY_INTERNAL_TOKEN 生成随机值"
  fi
}
ensure_api_env

# ---------- 3) MongoDB（共享时无需本地起） ----------
if [ "${SKIP_MONGO:-0}" != "1" ] && grep -qE '127\.0\.0\.1:27018/' api/.env 2>/dev/null; then
  log "启动本地 MongoDB (docker compose)"
  docker compose up -d 2>/dev/null || warn "docker 不可用：请确保 MONGODB_URI 指向的库可达"
fi

# ---------- 4) 首次同步（可跳过） ----------
if [ "${SKIP_SYNC:-0}" != "1" ]; then
  log "首次全量同步（本地源，失败不阻断）"
  npm run sync:local || warn "同步失败，可稍后手动 npm run sync"
fi

# ---------- 5) PM2（把 PUBLIC_ORIGIN 透传给前台，页面命令才显示真实域名） ----------
log "启动 / 重载 PM2（skill-shop-web :$WEB_PORT，skill-shop-api :$API_PORT）"
API_PORT="$API_PORT" WEB_PORT="$WEB_PORT" PUBLIC_ORIGIN="$PUBLIC_ORIGIN" \
  npx pm2 startOrReload ecosystem.config.cjs --update-env
npx pm2 save 2>/dev/null || true

# ---------- 6) Nginx：独立子域 vhost（可 SKIP_NGINX=1 跳过） ----------
configure_nginx() {
  command -v nginx >/dev/null 2>&1 || { warn "未装 nginx，跳过（手动反代：/api→$API_PORT，/→$WEB_PORT）"; return 0; }

  local NGINX_DIR; NGINX_DIR="$(nginx -V 2>&1 | grep -oE 'conf-path=[^ ]+' | head -1 | cut -d= -f2 | xargs dirname 2>/dev/null)"
  [ -z "$NGINX_DIR" ] && NGINX_DIR="/etc/nginx"
  local SITES=""; for d in /www/server/panel/vhost/nginx "$NGINX_DIR/conf.d" "$NGINX_DIR/sites-enabled"; do
    [ -d "$d" ] && { SITES="$d"; break; }
  done
  [ -z "$SITES" ] && { mkdir -p "$NGINX_DIR/conf.d"; SITES="$NGINX_DIR/conf.d"; }

  # 反代 location（/api→API、/→前台）
  local INC_ABS="$SITES/skill-shop-locations.inc"
  sed -e "s#__API_PORT__#$API_PORT#g" -e "s#__PORT__#$WEB_PORT#g" \
    scripts/nginx-skillshop-locations.inc.template > "$INC_ABS"

  local CONF="$SITES/skill-shop.conf"
  if [ "$HAS_CERT" = "1" ]; then
    # 完整 80→443 + 443 SSL 子域 vhost
    sed -e "s#__SERVER_NAME__#$SERVER_NAME#g" \
        -e "s#__SSL_CERT__#$SSL_CERT#g" -e "s#__SSL_KEY__#$SSL_KEY#g" \
        -e "s#__LOCATIONS_INCLUDE_ABS__#$INC_ABS#g" \
      scripts/nginx-skillshop-vhost.conf.template > "$CONF"
    log "已写入 80+443 子域 vhost：$CONF（server_name=$SERVER_NAME，证书 $SSL_CERT）"
  else
    # 无证书：先只起 80（HTTP），并提示去签证书
    sed -e "s#__SERVER_NAME__#$SERVER_NAME#g" -e "s#__SERVER_NAME_EXTRA__##g" \
        -e "s#__LOCATIONS_INCLUDE_ABS__#$INC_ABS#g" \
      scripts/nginx-skillshop-http-server.conf.template > "$CONF"
    warn "未找到证书（$SSL_CERT）→ 暂只生成 80(HTTP) vhost。"
    warn "  请先在宝塔给 $SERVER_NAME 申请证书（或设 SSL_CERT/SSL_KEY），再重跑本脚本启用 443。"
    warn "  注意：SSO 的 .taituai.com cookie 需要 Secure(HTTPS)，没证书前跨子域登录不会生效。"
  fi

  if nginx -t 2>/dev/null; then
    nginx -s reload 2>/dev/null || systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || true
    log "nginx 配置已生效"
  else
    warn "nginx -t 校验失败，请手动检查 $CONF"
  fi
}
[ "${SKIP_NGINX:-0}" = "1" ] && log "跳过 nginx 配置" || configure_nginx

echo
log "完成 ✅  前台 :$WEB_PORT  API :$API_PORT（Swagger /api/docs）"
log "    对外 $PUBLIC_ORIGIN  共享库 totalclaw"
