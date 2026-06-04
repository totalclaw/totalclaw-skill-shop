#!/usr/bin/env bash
set -euo pipefail

# Skill 市场一键部署（仿 totalclaw-web/scripts/deploy-pm2.sh，精简版）。
# 前置：Node >=18, MongoDB 可达（docker compose up -d 或外部库）。

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> 安装前台依赖"
npm ci || npm install

if [ "${SKIP_API:-0}" != "1" ]; then
  echo "==> 安装并构建 API"
  (cd api && (npm ci || npm install) && npm run build)
fi

if [ "${SKIP_MONGO:-0}" != "1" ]; then
  echo "==> 启动 MongoDB (docker compose)"
  docker compose up -d || echo "!! docker 不可用，请确保外部 MongoDB 可达（MONGODB_URI）"
fi

echo "==> 首次全量同步（本地源）"
npm run sync:local || echo "!! 同步失败，可稍后手动 npm run sync"

echo "==> 启动 PM2 进程"
npx pm2 startOrReload ecosystem.config.cjs --update-env

echo "==> 完成。前台 :3090，API :3091（/api/docs 为 Swagger）"
echo "   Nginx 建议：/ -> 3090, /api 和 /admin -> 3091"
