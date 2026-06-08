# 数据种子（CDN 分发，不入 Git）

skills 集合的 gzip NDJSON 分片，部署时从 CDN 下载，不随 Git 提交。

**CDN 根路径**：`https://cdn2.taituai.com/totalclaw-skill-shop/seed`

| 文件 | CDN URL |
|---|---|
| manifest | `https://cdn2.taituai.com/totalclaw-skill-shop/seed/manifest.json` |
| 分片 | `https://cdn2.taituai.com/totalclaw-skill-shop/seed/skills/skills.ndjson.gz.part-*` |

当前规模（2026-06-08）：243,532 条（216,135 skill + 27,397 role），4 个分片。

## 本地生成（开发机）

```bash
bash scripts/generate-seed.sh
```

产出 `seed/skills/*.part-*` 与 `seed/manifest.json`（均在 `.gitignore`）。

## 上传到 CDN

将以下文件上传到 CDN 对应路径（保持文件名不变）：

```
seed/manifest.json  →  https://cdn2.taituai.com/totalclaw-skill-shop/seed/manifest.json
seed/skills/*       →  https://cdn2.taituai.com/totalclaw-skill-shop/seed/skills/
```

上传完成后可用 curl 验证：

```bash
curl -fsSL https://cdn2.taituai.com/totalclaw-skill-shop/seed/manifest.json | head
```

## 部署（服务器）

`npm run deploy` 会自动：

1. 从 CDN 下载最新 seed（`SEED_FORCE_DOWNLOAD=1`，默认每次部署拉取）
2. 增量导入 MongoDB（`scripts/import-seed.sh`）

手动步骤：

```bash
bash scripts/download-seed.sh          # 从 CDN 下载
SEED_FULL=1 bash scripts/import-seed.sh  # 全量重建（慎用）
```

环境变量：

| 变量 | 说明 |
|---|---|
| `SEED_CDN_BASE` | CDN 根路径，默认 `https://cdn2.taituai.com/totalclaw-skill-shop/seed` |
| `SEED_FORCE_DOWNLOAD=1` | 强制重新下载（deploy 默认） |
| `SKIP_SEED=1` | 跳过下载与导入 |
| `SEED_FULL=1` | 导入前清空 skills 集合 |
