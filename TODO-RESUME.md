# 续跑 TODO：角色库 + 闭源技能库（任务因「DeepSeek 欠费」中止）

> 中止时间：2026-06-04 17:40:34

## 中止时进度
- 角色：13281 / ~28,274（穷尽岗位池）
- 我生成的闭源技能：102941（目标：给每个角色都配套，40,000 仅为底线）
- 未配技能的角色：45（这些角色还需生成配套技能）

## 中止原因
DeepSeek 账户欠费（Insufficient Balance）。v4 看门狗检测到余额错误激增，已自动停掉整个生成舰队，未空转。

## 恢复步骤
1. 给 DeepSeek 账户充值（key 在 `api/.env` 的 `DEEPSEEK_API_KEY`），或换有余额的 key。
2. 确认 mongod 在跑：`lsof -iTCP:27018 -sTCP:LISTEN`；没有则
   `nohup /Users/mac02/homebrew/bin/mongod --dbpath data/mongo --port 27018 --bind_ip 127.0.0.1 >> data/logs/mongo.log 2>&1 &`
3. 重启舰队 + 看门狗：
   ```
   bash scripts/fleet.sh start
   nohup bash scripts/fleet-watchdog.sh > data/logs/watchdog.log 2>&1 &
   ```
4. 断点续跑：已生成的角色/技能按 skillId 自动跳过；未配技能的角色会被技能侧重新领取。

## 验证（已改为程序化，无需 DeepSeek）
- 生成时已用程序化校验（结构/篇幅/口吻/异常文本）；存量可随时复检：`node scripts/validate-existing.js`
- 上次复检：角色 99.95% / 技能 100% 通过，已清理 7 条脏数据。

## 完成判据（看门狗自动收尾）
- 角色池穷尽（角色数连续 3 次轮询不增长）→ 停角色循环。
- 池穷尽 且 未配技能角色数==0 → 停技能循环。
- 两者都停 → 停舰队。
- 进度：`bash scripts/status.sh`
