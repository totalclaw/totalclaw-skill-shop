#!/usr/bin/env bash
# Skill 市场一键部署（仿 totalclaw-web/scripts/deploy-pm2.sh）。
# 默认与 totalclaw-web 共享同一个 mongodb 库：totalclaw，并以独立子域部署（如 skills.taituai.com）。
#
# 用法（域名已内置 skills.taituai.com，直接一条命令）：
#   npm run deploy                # 部署 PM2 + 生成 skills.taituai.com 的 80+443 vhost
#   SKIP_NGINX=1 npm run deploy   # 只部署 PM2，不动 nginx
#   SKIP_API=1   npm run deploy   # 只起前台 SSR
#   SKIP_SEED=1  npm run deploy   # 跳过种子下载与导入
#   SEED_FORCE_DOWNLOAD=1        # 部署时强制从 CDN 重新拉 seed（deploy 默认开启）
#
# 关键 env：
#   API_PORT=3091  WEB_PORT=3090
#   NGINX_SERVER_NAME  站点域名（默认已内置 skills.taituai.com；换域名才需覆盖）
#   PUBLIC_ORIGIN      对外访问根（默认 https://<NGINX_SERVER_NAME>）—— 决定页面里下载/安装命令显示的地址
#   SSL_CERT / SSL_KEY 证书路径（默认宝塔 /www/server/panel/vhost/cert/<域名>/{fullchain,privkey}.pem）
#   SHARED_MONGO_URI   与 web 共享的 mongo（默认 mongodb://127.0.0.1:27117/totalclaw?directConnection=true）
#   SEED_CDN_BASE      seed CDN 根路径（默认 https://cdn2.taituai.com/totalclaw-skill-shop/seed）
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
  grep -q 'change-me-internal-token' "$env" && perl -i -pe "s#change-me-internal-token#$(gen)#" "$env"

  # upsert KEY=VAL 到 api/.env
  set_env() { local k="$1" v="$2"
    if grep -qE "^${k}=" "$env"; then perl -i -pe "s#^${k}=.*#${k}=${v}#" "$env"; else printf '%s=%s\n' "$k" "$v" >> "$env"; fi; }

  # 与 web 共用账号/登录态：JWT_SECRET 必须 = web 的（才能验 web 签发的 token）
  local WD="${WEB_DIR:-}"
  if [ -z "$WD" ]; then for d in "$HOME/totalclaw-web" "$ROOT/../totalclaw-web" /www/wwwroot/totalclaw-web; do
    [ -f "$d/server/user-info-api/backend/.env" ] && { WD="$d"; break; }; done; fi
  local WJ=""
  [ -n "$WD" ] && WJ="$(grep -E '^JWT_SECRET=' "$WD/server/user-info-api/backend/.env" 2>/dev/null | head -1 | cut -d= -f2- | sed 's/^["'"'"']//; s/["'"'"']$//')"
  if [ -n "$WJ" ]; then set_env JWT_SECRET "$WJ"; log "JWT_SECRET 已与 web 共用（来自 $WD）"
  else warn "未找到 web 的 JWT_SECRET（可设 WEB_DIR=web项目路径）→ 与 web 的共享登录态会验签失败"; fi

  # cookie 父域（skills.taituai.com → .taituai.com）+ 认证代理目标
  local PARENT; PARENT="$(echo "$SERVER_NAME" | sed -E 's#^[^.]+\.##')"
  set_env COOKIE_DOMAIN ".${PARENT}"
  set_env COOKIE_SECURE "$([ "$HAS_CERT" = 1 ] && echo 1 || echo 0)"
  set_env WEB_AUTH_BASE "${WEB_AUTH_BASE:-http://127.0.0.1:3000/api}"
  log "已配 SSO：COOKIE_DOMAIN=.${PARENT}  WEB_AUTH_BASE=${WEB_AUTH_BASE:-http://127.0.0.1:3000/api}"
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
  # 注意：① 宝塔 vhost 目录(/www/server/panel/vhost/...)是 root 专属，必须 sudo test -d 判断
  #       ② 排除 stream/tcp 段的 include（那里不能放带 server_name 的 http server 块）
  local SITES=""
  SITES="$($SUDO grep -hoE 'include[[:space:]]+/[^;*]+\*\.conf' "$MAINCONF" 2>/dev/null | awk '{print $2}' | sed 's#/\*\.conf$##' | grep -vEi '/(tcp|stream)(/|$)' | while read -r p; do $SUDO test -d "$p" && { echo "$p"; break; }; done)"
  if [ -z "$SITES" ]; then
    for d in /www/server/panel/vhost/nginx "$NGINX_DIR/conf.d" "$NGINX_DIR/sites-enabled" /etc/nginx/conf.d; do
      $SUDO test -d "$d" && { SITES="$d"; break; }
    done
  fi
  [ -z "$SITES" ] && { $SUDO mkdir -p "$NGINX_DIR/conf.d"; SITES="$NGINX_DIR/conf.d"; }
  log "nginx 主配置=$MAINCONF  vhost 目录=$SITES"

  # 清理历史误写位置（stream/tcp 段、/etc/nginx/conf.d）的残留，避免坏配置让 nginx -t 失败
  for stale in /www/server/panel/vhost/nginx/tcp /etc/nginx/conf.d "$NGINX_DIR/conf.d"; do
    [ "$stale" = "$SITES" ] && continue
    $SUDO rm -f "$stale/skill-shop.conf" "$stale/skill-shop-locations.inc" 2>/dev/null || true
  done

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
      warn "nginx 未加载 $CONF（主配置没 include $SITES）→ 自动向 $MAINCONF 的 http{} 注入 include"
      if ! $SUDO grep -qE "include[[:space:]]+${SITES}/\*\.conf" "$MAINCONF" 2>/dev/null; then
        $SUDO cp "$MAINCONF" "${MAINCONF}.bak.skillshop" 2>/dev/null || true
        $SUDO sed -i "0,/^[[:space:]]*http[[:space:]]*{/s##&\n    include ${SITES}/*.conf;#" "$MAINCONF"
      fi
      $SUDO nginx -t && { $SUDO nginx -s reload 2>/dev/null || $SUDO systemctl reload nginx 2>/dev/null || true; }
      if $SUDO nginx -T 2>/dev/null | grep -q "$SERVER_NAME"; then
        log "已注入 include 并生效，server_name=$SERVER_NAME 现已加载 ✓"
      else
        warn "自动注入未生效。请手动在 $MAINCONF 的 http{} 加：include ${SITES}/*.conf;  再 sudo nginx -s reload（备份 ${MAINCONF}.bak.skillshop）"
      fi
    fi
  else
    warn "nginx -t 校验失败（见上方报错），$CONF 未生效"
  fi
}
[ "${SKIP_NGINX:-0}" = "1" ] && log "跳过 nginx 配置" || configure_nginx

# ---------- 7) 数据种子：从 CDN 下载 → 增量导入 MongoDB ----------
# 首次：生产空 → 全导入；再次部署：默认从 CDN 拉最新 seed，仅补新增 skillId。全量重建用 SEED_FULL=1。
if [ "${SKIP_SEED:-0}" != "1" ]; then
  log "从 CDN 下载 seed（${SEED_CDN_BASE:-https://cdn2.taituai.com/totalclaw-skill-shop/seed}）"
  SEED_FORCE_DOWNLOAD="${SEED_FORCE_DOWNLOAD:-1}" bash scripts/download-seed.sh \
    || warn "CDN seed 下载失败，可手动：bash scripts/download-seed.sh"
  if ls seed/skills/skills.ndjson.gz.part-* >/dev/null 2>&1; then
    log "增量导入 seed/skills（仅新增 skill；全量重建用 SEED_FULL=1）"
    bash scripts/import-seed.sh || warn "种子导入失败，可手动：bash scripts/import-seed.sh"
  else
    warn "无 seed 分片可导入（CDN 未就绪或 SKIP_SEED_DOWNLOAD=1 且本地无文件）"
  fi
fi

# ---------- 8) 首次同步：站点已上线后，后台跑（绝不阻塞部署） ----------
if [ "${SKIP_SYNC:-0}" != "1" ]; then
  mkdir -p data/logs
  nohup npm run sync:local > data/logs/sync.log 2>&1 &
  log "首次同步已在后台启动（日志 data/logs/sync.log；不阻塞本次部署）"
fi

echo
log "完成 ✅  前台 :$WEB_PORT  API :$API_PORT（Swagger /api/docs）"
log "    对外 $PUBLIC_ORIGIN  共享库 totalclaw"
log "    同步在后台进行：tail -f data/logs/sync.log 查看"
