#!/usr/bin/env bash
# 本地一键启动（无 Docker）：MongoDB(:27018) + NestJS API(:3091) + Express 前台(:3090)
# 用法: npm run start:local   （或 bash scripts/start-local.sh）
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MONGO_PORT=27018
API_PORT=3091
WEB_PORT=3090
DBPATH="$ROOT/data/mongo"
LOGDIR="$ROOT/data/logs"
mkdir -p "$DBPATH" "$LOGDIR"

# 选 mongod：优先系统（brew）安装的，否则用 mongodb-memory-server 缓存的二进制
MONGOD_BIN="$(command -v mongod || true)"
if [ -z "$MONGOD_BIN" ]; then
  MONGOD_BIN="$(ls "$ROOT"/node_modules/.cache/mongodb-memory-server/mongod-* 2>/dev/null | head -1 || true)"
fi
if [ -z "$MONGOD_BIN" ]; then
  echo "❌ 找不到 mongod（系统未安装，缓存也没有）。先 brew install mongodb-community 或安装依赖。" >&2
  exit 1
fi

port_busy() { lsof -nP -iTCP:"$1" -sTCP:LISTEN >/dev/null 2>&1; }

# 1) MongoDB
if port_busy "$MONGO_PORT"; then
  echo "✓ MongoDB 已在 :$MONGO_PORT 运行"
else
  echo "▶ 启动 MongoDB ($MONGOD_BIN) → :$MONGO_PORT"
  nohup "$MONGOD_BIN" --dbpath "$DBPATH" --port "$MONGO_PORT" --bind_ip 127.0.0.1 \
    >"$LOGDIR/mongo.log" 2>&1 &
  for i in $(seq 1 30); do port_busy "$MONGO_PORT" && break; sleep 0.5; done
  port_busy "$MONGO_PORT" && echo "✓ MongoDB 已就绪" || { echo "❌ MongoDB 启动失败，看 $LOGDIR/mongo.log"; exit 1; }
fi

# 2) api/.env
if [ ! -f api/.env ]; then
  cp api/.env.example api/.env
  echo "✓ 已生成 api/.env（默认密钥为 change-me-*，上线前请修改）"
fi

# 3) API 构建产物
if [ ! -f api/dist/main.js ]; then
  echo "▶ 构建 API ..."
  (cd api && npm run build)
fi

# 4) NestJS API
if port_busy "$API_PORT"; then
  echo "✓ API 已在 :$API_PORT 运行"
else
  echo "▶ 启动 API → :$API_PORT"
  nohup npm run api:start >"$LOGDIR/api.log" 2>&1 &
  for i in $(seq 1 40); do port_busy "$API_PORT" && break; sleep 0.5; done
  port_busy "$API_PORT" && echo "✓ API 已就绪" || { echo "❌ API 启动失败，看 $LOGDIR/api.log"; exit 1; }
fi

# 5) Express 前台
if port_busy "$WEB_PORT"; then
  echo "✓ 前台已在 :$WEB_PORT 运行"
else
  echo "▶ 启动前台 → :$WEB_PORT"
  nohup npm run start >"$LOGDIR/web.log" 2>&1 &
  for i in $(seq 1 20); do port_busy "$WEB_PORT" && break; sleep 0.5; done
  port_busy "$WEB_PORT" && echo "✓ 前台已就绪" || { echo "❌ 前台启动失败，看 $LOGDIR/web.log"; exit 1; }
fi

echo ""
echo "🎉 全部就绪："
echo "   前台    http://localhost:$WEB_PORT"
echo "   API 文档 http://localhost:$API_PORT/api/docs"
echo "   日志    $LOGDIR/{mongo,api,web}.log"
