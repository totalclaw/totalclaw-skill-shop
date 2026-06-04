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
  # api/dist 已随仓库提交 → 服务器不构建（避免小内存机 nest build OOM/卡死）。只装运行依赖。
  log "安装 API 运行依赖（--omit=dev；dist 已随仓库提交，无需在服务器构建）"
  ( cd api && { npm ci --omit=dev 2>/dev/null || npm install --omit=dev; } )
  if [ -f api/dist/main.js ]; then
    log "使用随仓库提交的 api/dist ✓（跳过构建）"
  else
    warn "api/dist/main.js 缺失 → 回退在服务器构建（需 devDeps，小内存机可能 OOM，建议本地构建后提交 dist）"
    ( cd api && npm install && npm run build ) || { warn "API 构建失败"; exit 1; }
  fi
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
if [ "${SKIP_MONGO:-0}" != "1" ] && grep -qE '^MONGODB_URI=mongodb://127\.0\.0\.1:27018/' api/.env 2>/dev/null; then
  log "启动本地 MongoDB (docker compose)"
  docker compose up -d 2>/dev/null || warn "docker 不可用：请确保 MONGODB_URI 指向的库可达"
fi

# 注：首次同步已移到最后「后台」执行（见步骤 7），避免网络/Mongo 卡死阻塞站点上线。

# ---------- 5) PM2（把 PUBLIC_ORIGIN 透传给前台，页面命令才显示真实域名） ----------
log "启动 / 重载 PM2（skill-shop-web :$WEB_PORT，skill-shop-api :$API_PORT）"
API_PORT="$API_PORT" WEB_PORT="$WEB_PORT" PUBLIC_ORIGIN="$PUBLIC_ORIGIN" \
  npx pm2 startOrReload ecosystem.config.cjs --update-env
npx pm2 save 2>/dev/null || true

# ---------- 6) Nginx：独立子域 vhost（可 SKIP_NGINX=1 跳过） ----------
configure_nginx() {
  command -v nginx >/dev/null 2>&1 || { warn "未装 nginx，跳过（手动反代：/api→$API_PORT，/→$WEB_PORT）"; return 0; }

  # 写 /etc/nginx、nginx -t（要读 600 权限的私钥）、reload 都需要 root；非 root 用 sudo
  local SUDO=""
  if [ "$(id -u)" -ne 0 ]; then
    if command -v sudo >/dev/null 2>&1; then SUDO="sudo"; else
      warn "非 root 且无 sudo：无法写入 /etc/nginx。请用 root 重跑（sudo -E npm run deploy）或手动配 nginx。"; return 0
    fi
  fi

  # 用「正在运行的」主配置（nginx -t 会打印其路径），而非 nginx -V 的编译默认（宝塔下两者不同！）
  local MAINCONF; MAINCONF="$($SUDO nginx -t 2>&1 | grep -oE '/[^ ]+nginx\.conf' | head -1)"
  [ -z "$MAINCONF" ] && MAINCONF="$(nginx -V 2>&1 | grep -oE 'conf-path=[^ ]+' | head -1 | cut -d= -f2)"
  [ -z "$MAINCONF" ] && MAINCONF="/etc/nginx/nginx.conf"
  local NGINX_DIR; NGINX_DIR="$(dirname "$MAINCONF")"
  # 优先：主配置里 include 的、且真实存在的 vhost 目录（宝塔/标准布局都能命中）
  local SITES=""
  SITES="$($SUDO grep -hoE 'include[[:space:]]+/[^;*]+\*\.conf' "$MAINCONF" 2>/dev/null | awk '{print $2}' | sed 's#/\*\.conf$##' | while read -r p; do [ -d "$p" ] && { echo "$p"; break; }; done)"
  if [ -z "$SITES" ]; then
    for d in /www/server/panel/vhost/nginx "$NGINX_DIR/conf.d" "$NGINX_DIR/sites-enabled" /etc/nginx/conf.d; do
      [ -d "$d" ] && { SITES="$d"; break; }
    done
  fi
  [ -z "$SITES" ] && { $SUDO mkdir -p "$NGINX_DIR/conf.d"; SITES="$NGINX_DIR/conf.d"; }
  log "nginx 主配置=$MAINCONF  vhost 目录=$SITES"

  # 反代 location（/api→API、/→前台）。用 sudo tee 写入（重定向 > 由非 root shell 执行会权限失败）
  local INC_ABS="$SITES/skill-shop-locations.inc"
  sed -e "s#__API_PORT__#$API_PORT#g" -e "s#__PORT__#$WEB_PORT#g" \
    scripts/nginx-skillshop-locations.inc.template | $SUDO tee "$INC_ABS" >/dev/null

  local CONF="$SITES/skill-shop.conf"
  if [ "$HAS_CERT" = "1" ]; then
    sed -e "s#__SERVER_NAME__#$SERVER_NAME#g" \
        -e "s#__SSL_CERT__#$SSL_CERT#g" -e "s#__SSL_KEY__#$SSL_KEY#g" \
        -e "s#__LOCATIONS_INCLUDE_ABS__#$INC_ABS#g" \
      scripts/nginx-skillshop-vhost.conf.template | $SUDO tee "$CONF" >/dev/null
    log "已写入 80+443 子域 vhost：$CONF（server_name=$SERVER_NAME，证书 $SSL_CERT）"
  else
    sed -e "s#__SERVER_NAME__#$SERVER_NAME#g" -e "s#__SERVER_NAME_EXTRA__##g" \
        -e "s#__LOCATIONS_INCLUDE_ABS__#$INC_ABS#g" \
      scripts/nginx-skillshop-http-server.conf.template | $SUDO tee "$CONF" >/dev/null
    warn "未找到证书（$SSL_CERT）→ 暂只生成 80(HTTP) vhost。请签证书后重跑启用 443。"
  fi

  # 校验（保留报错输出，便于排查）+ reload
  if $SUDO nginx -t; then
    $SUDO nginx -s reload 2>/dev/null || $SUDO systemctl reload nginx 2>/dev/null || $SUDO service nginx reload 2>/dev/null || true
    log "nginx 配置已生效：$CONF"
    # 确认主配置确实 include 了我们的 server 块（有些自定义 nginx.conf 不 include conf.d）
    if $SUDO nginx -T 2>/dev/null | grep -q "$SERVER_NAME"; then
      log "已确认 server_name=$SERVER_NAME 被 nginx 加载 ✓"
    else
      warn "配置已写入 $CONF，但 nginx 未加载它 —— 主配置可能没 include $SITES。"
      warn "  手动修复：在 nginx.conf 的 http{} 里加一行  include ${SITES}/*.conf;  再 sudo nginx -s reload"
    fi
  else
    warn "nginx -t 校验失败（见上方报错），$CONF 未生效"
  fi
}
[ "${SKIP_NGINX:-0}" = "1" ] && log "跳过 nginx 配置" || configure_nginx

# ---------- 7) 首次同步：站点已上线后，后台跑（绝不阻塞部署） ----------
if [ "${SKIP_SYNC:-0}" != "1" ]; then
  mkdir -p data/logs
  nohup npm run sync:local > data/logs/sync.log 2>&1 &
  log "首次同步已在后台启动（日志 data/logs/sync.log；不阻塞本次部署）"
fi

echo
log "完成 ✅  前台 :$WEB_PORT  API :$API_PORT（Swagger /api/docs）"
log "    对外 $PUBLIC_ORIGIN  共享库 totalclaw"
log "    同步在后台进行：tail -f data/logs/sync.log 查看"
