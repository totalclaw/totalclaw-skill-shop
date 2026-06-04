# TotalClaw Skill 市场（totalclaw-skill-shop）

多社区 Skill 聚合 + 收费交易市场。架构沿用 `totalclaw-web`：**Express SSR 前台 + NestJS API/后台 + MongoDB + PM2**。

## 能力
- **免费 skill 聚合**：GitHub / 腾讯 / OpenClaw / Hermes / TotalClaw 多源采集，统一元数据入库。
- **收费 skill 交易**：TotalClaw 自研闭源 skill + 开发者上传定价 skill；支付走 HMAC webhook + 激活码；开发者按比例分账。

## 目录
- `server/` — Express SSR 前台（:3090）：`index.js` / `render.js` / `partials.js` / `market-routes.js`
- `api/` — NestJS API + 后台（:3091，Swagger `/api/docs`）：skills / sources / auth / users / orders / entitlements / activation-codes / internal-pay / developer / admin
- `scripts/sync/` — 多源采集：`normalize.js` / `local-scanner.js` / `adapter-*.js` / `run-sync.js`
- `assets/` — 前台静态资源；`docker-compose.yml` — MongoDB(:27018)；`ecosystem.config.cjs` — PM2

## 快速开始（本地一键，无需 Docker）
```bash
npm run start:local   # 起 MongoDB(:27018) + API(:3091) + 前台(:3090)，日志在 data/logs/
```
> 需先有 mongod：`brew install mongodb-community`，或用 mongodb-memory-server 缓存的二进制（见下）。
> 首次起来后灌数据：`npm run sync`（全源）或 `npm run sync:local`（本地源）。

## 快速开始（手动 / 生产）
```bash
# 1. 起 MongoDB（库 totalclaw，宿主端口 27018）
npm run mongo:up            # 需 Docker；无 Docker 见下方"无 Docker 验证"

# 2. 安装依赖
npm install && (cd api && npm install)

# 3. 配置 API 环境
cp api/.env.example api/.env   # 改 JWT_SECRET / SKILL_PAY_INTERNAL_TOKEN / ADMIN_*

# 4. 首次同步本地源
npm run sync:local             # 采 ../totalclaw-skills ../openclaw/skills ../hermes-agent/skills

# 5. 起服务
npm run api:build && npm run api:start   # API :3091
npm run start                            # 前台 :3090
# 或 npm run pm2:start 一起拉起
```

## 关键接口
- 列表/检索：`GET /api/skills?q=&category=&source=&listingType=&sort=&page=`
- 详情：`GET /api/skills/:skillId`（闭源裁剪正文）
- 免费下载：`GET /api/skills/:skillId/file`（返回 SKILL.md 附件；付费/闭源会 403）
- 已购下载：`GET /api/entitlements/download/:skillId`（需登录鉴权；缺正文按元数据生成占位 SKILL.md）
- 下单：`POST /api/orders` `{skillId}`（需登录）
- 模拟支付（演示用）：`POST /api/orders/:orderId/simulate-pay`（生产默认禁用，需 `ALLOW_SIMULATE_PAY=1`）
- 支付回调：`POST /api/internal/pay-webhook`（HMAC：`X-Internal-Token=HMAC-SHA256(SKILL_PAY_INTERNAL_TOKEN, "${orderId}.${ts}")`，`X-Internal-Ts` 5min 窗口）
- 已购内容：`GET /api/entitlements/content/:skillId`（鉴权放行）
- 激活码：`POST /api/activation-codes/redeem` `{code}` / `POST /api/admin/activation-codes/batch`
- 开发者：`POST /api/developer/skills`（上传，pending）/ `GET /api/developer/earnings`
- 审核：`GET /api/admin/reviews/pending` / `POST /api/admin/reviews/:skillId` `{action}`

## 无 Docker 验证（开发机）
本机无 Docker 时，`mongodb-memory-server` 会下载独立 `mongod` 二进制，可直接启动到 :27018：
```bash
node_modules/.cache/mongodb-memory-server/mongod-* --dbpath /tmp/totalclaw-db --port 27018
```
或一键数据层验证：`node scripts/verify-slice.js`（内存库 + 同步 + 查询）。

## skillId 规则
`${source}:${owner}/${slug}`，其中 `/` 与空白被替换为 `~`/`-` 以保证作为 URL 路径参数安全。

## 长期记忆 / 进度
见 `../ceshi/skill市场/`（README / TODO / architecture / progress）。
