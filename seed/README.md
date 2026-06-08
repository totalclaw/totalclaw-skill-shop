# 数据种子（不入 Git，本地生成）

`seed/skills/skills.ndjson.gz.part-*` 为 skills 集合的 gzip NDJSON 分片（按 90MB 切分，单文件 <100MB）。

**当前规模（2026-06-08）**：243,532 条（216,135 skill + 27,397 role），4 个分片（约 312MB 压缩）。

> 分片文件体积过大，已加入 `.gitignore`，**不随仓库提交**。部署服务器需在本机或 CI 生成后 scp 到服务器，或在服务器上从 MongoDB 导出。

## 本地生成

```bash
rm -f seed/skills/skills.ndjson.gz.part-*
mongoexport --port 27018 --db totalclaw --collection skills --quiet \
  | gzip | split -b 90m - seed/skills/skills.ndjson.gz.part-
```

## 导入

- 部署时 `scripts/deploy-pm2.sh` 在「生产 skills 偏少」且分片存在时自动 `scripts/import-seed.sh` 导入。
- 手动导入：`bash scripts/import-seed.sh`
- 全量重建：`SEED_FULL=1 bash scripts/import-seed.sh`
- 跳过自动导入：`SKIP_SEED=1 npm run deploy`

## 部署服务器获取种子

1. 在开发机生成后上传：
   ```bash
   rsync -avz seed/skills/ user@server:/path/to/totalclaw-skill-shop/seed/skills/
   ```
2. 或在服务器上从已有 MongoDB 实例导出（同上 mongoexport 命令，改端口/库名）。
