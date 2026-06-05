# 数据种子（随仓库提交，部署自动导入）

`seed/skills/skills.ndjson.gz.part-*` = 144.7k 技能（含 27.4k AI 员工角色，其中 24.9k 为 profile-v2 招聘JD画像重建）的 gzip NDJSON，
按 90MB 分片（Gitee 单文件 <100MB）。

- 部署时 `scripts/deploy-pm2.sh` 在「生产 skills 偏少」时自动 `scripts/import-seed.sh` 导入到
  共享库 27117/totalclaw（host mongoimport 或经 mongo 容器，--drop 幂等）。
- 手动导入：`bash scripts/import-seed.sh`
- 跳过自动导入：`SKIP_SEED=1 npm run deploy`
- 更新种子（本地数据变了后重新生成）：
  `mongoexport --port 27018 --db totalclaw --collection skills | gzip | split -b 90m - seed/skills/skills.ndjson.gz.part-`
