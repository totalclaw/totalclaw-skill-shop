# GTM 跟踪系统技能

Expanso/Prometheus 的 Go-To-Market 跟踪系统。

## 位置
`/home/daaronch/.openclaw/workspace/gtm-system/`

## CLI 工具
`python3 /home/daaronch/.openclaw/workspace/gtm-system/scripts/gtm.py [command]`

## 快捷命令

### 日常运营
```bash
# 获取今日行动与优先级
python3 scripts/gtm.py actions

# 生成 Telegram 摘要
python3 scripts/gtm.py digest

# 查看销售管道
python3 scripts/gtm.py pipeline

# 列出未处理信号
python3 scripts/gtm.py signals
```

### 联系人管理
```bash
# 添加联系人
python3 scripts/gtm.py add-contact "Name" "email@co.com" --company "Company" --role "CTO"

# 列出联系人
python3 scripts/gtm.py contacts
```

### 商机管理
```bash
# 创建商机
python3 scripts/gtm.py add-opp "Company Name" --contact 1 --description "Interested in Bacalhau" --priority 3

# 移动阶段（awareness → interest → evaluation → negotiation → closed_won/closed_lost）
python3 scripts/gtm.py move-stage 1 evaluation

# 记录互动
python3 scripts/gtm.py log "Had demo call, very interested" --opp 1
```

### 提醒
```bash
# 设置提醒
python3 scripts/gtm.py remind "Send pricing proposal" --opp 1 --date 2024-02-15

# 完成提醒
python3 scripts/gtm.py complete 1
```

### 爬取
```bash
# 运行全部爬虫（HN、Reddit、GitHub）
python3 scripts/gtm.py crawl

# 运行指定爬虫
python3 scripts/gtm.py crawl --sources hn,github

# 标记信号已处理
python3 scripts/gtm.py process-signal 1
```

### 关键词
```bash
# 添加跟踪关键词
python3 scripts/gtm.py add-keyword "new-keyword" --category domain --weight 1.5
```

## 管道阶段
1. `awareness` — 他们知道我们存在
2. `interest` — 表现出兴趣，已有初步接触
3. `evaluation` — 积极评估，演示、试用
4. `negotiation` — 讨论条款/定价
5. `closed_won` — 成交
6. `closed_lost` — 丢单

## 数据库位置
`/home/daaronch/.openclaw/workspace/gtm-system/data/gtm.db`（SQLite）

## 自然语言查询
当用户询问 GTM/管道/商机时，使用 CLI 获取数据并总结：
- 「我的管道里有什么？」→ 运行 `pipeline`
- 「今天有需要跟进的吗？」→ 运行 `actions`
- 「添加联系人…」→ 使用 `add-contact`
- 「检查新商机」→ 运行 `crawl` 再 `signals`
