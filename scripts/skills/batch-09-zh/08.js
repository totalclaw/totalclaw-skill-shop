module.exports = {
  skillId: 'totalclaw:totalclaw~mariusfit-smart-cron',
  descriptionZh:
    '面向 OpenClaw 的自然语言 Cron 调度器，用日常语言安排任务，无需手写 cron 语法。',
  bodyZh: `# Smart Cron — 面向 OpenClaw 的自然语言 Cron 调度器

用日常英语安排任意 OpenClaw 任务。无需 cron 语法，只需说明做什么、何时做。

## 功能

- **自然语言调度** — "every weekday at 9am"、"every 30 minutes"、"first Monday of month"
- **完整 cron 任务生命周期** — 添加、列出、删除、暂停、恢复
- **时区感知** — 在任意时区调度（UTC、Europe/Bucharest 等）
- **失败告警** — 任务失败时通过 WhatsApp/Telegram 告警
- **下次运行预览** — 显示每个任务的下次运行时间
- **运行日志** — 持久化每次执行的历史
- **零外部依赖** — 使用系统 cron + OpenClaw 编排

## 快速开始

\`\`\`bash
# 添加每日摘要任务
smart-cron add "every weekday at 9am" --task "summarize my emails"

# 添加间隔任务
smart-cron add "every 30 minutes" --task "check server health"

# 每月任务
smart-cron add "first Monday of month at 10am" --task "generate monthly report"

# 列出所有已调度任务
smart-cron list

# 显示下次运行时间
smart-cron next

# 查看任务日志
smart-cron logs

# 暂停任务（不删除）
smart-cron pause <job-id>

# 恢复已暂停任务
smart-cron resume <job-id>

# 删除任务
smart-cron remove <job-id>
\`\`\`

## 命令

| 命令 | 说明 |
|---------|-------------|
| \`smart-cron add <schedule> --task <task>\` | 调度新任务 |
| \`smart-cron list\` | 列出所有任务及状态 |
| \`smart-cron remove <id>\` | 删除任务 |
| \`smart-cron next\` | 显示所有任务的下次运行时间 |
| \`smart-cron run <id>\` | 立即运行任务 |
| \`smart-cron logs [id]\` | 查看执行日志 |
| \`smart-cron pause <id>\` | 暂停任务 |
| \`smart-cron resume <id>\` | 恢复已暂停任务 |

## 支持的调度表达式

### 间隔
- \`every 5 minutes\` → \`*/5 * * * *\`
- \`every hour\` → \`0 * * * *\`
- \`every 2 hours\` → \`0 */2 * * *\`
- \`every 30 minutes\` → \`*/30 * * * *\`

### 每日
- \`every day at 9am\` → \`0 9 * * *\`
- \`every weekday at 9am\` → \`0 9 * * 1-5\`
- \`every weekend at noon\` → \`0 12 * * 6,0\`
- \`daily at midnight\` → \`0 0 * * *\`

### 每周
- \`every Monday at 8am\` → \`0 8 * * 1\`
- \`every Friday at 5pm\` → \`0 17 * * 5\`

### 每月
- \`first Monday of month\` → 计算并重新调度
- \`1st of month at 9am\` → \`0 9 1 * *\`
- \`last day of month\` → 动态计算

### 自定义 cron（透传）
- \`0 */6 * * *\` → 高级用户原样运行

## 时区支持

\`\`\`bash
# 在本地时区调度
smart-cron add "every weekday at 9am" \\
  --task "daily standup reminder" \\
  --timezone Europe/Bucharest

# 列表同时显示 UTC 与本地时区时间
\`\`\`

## 失败告警

当调度任务失败时，Smart Cron 通过已配置渠道发送告警：

\`\`\`
⚠️ Smart Cron: "daily standup reminder" FAILED
Time: 09:00 EET (07:00 UTC)
Error: Task timed out after 300s
Last success: yesterday at 09:00
Logs: smart-cron logs job-123
\`\`\`

## 数据存储

所有任务配置与日志本地存储于 \`~/.openclaw/workspace/smart-cron-data/\`。SQLite，无遥测。

## 配置

编辑 \`~/.openclaw/workspace/smart-cron-data/config.json\`：

\`\`\`json
{
  "default_timezone": "Europe/Bucharest",
  "alert_channel": "whatsapp",
  "alert_on_failure": true,
  "log_retention_days": 30
}
\`\`\`

## 使用场景

### 晨间简报
\`\`\`bash
smart-cron add "every weekday at 8am" --task "summarize overnight emails and news"
\`\`\`

### 可用性监控
\`\`\`bash
smart-cron add "every 5 minutes" --task "check all APIs and alert if any is down"
\`\`\`

### 周报
\`\`\`bash
smart-cron add "every Friday at 5pm" --task "generate weekly work summary and log to MEMORY.md"
\`\`\`

### 每月清理
\`\`\`bash
smart-cron add "1st of month at 2am" --task "clean old logs and archive memory files older than 90 days"
\`\`\`

## 要求

- OpenClaw 1.0+
- Python 3.8+（用于调度解析）
- cron 守护进程（Linux/macOS 标准组件）

## 源码与问题

- **源码：** https://github.com/mariusfit/smart-cron
- **问题：** https://github.com/mariusfit/smart-cron/issues
- **作者：** [@mariusfit](https://github.com/mariusfit)`,
};
