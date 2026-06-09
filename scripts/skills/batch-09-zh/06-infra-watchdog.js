module.exports = {
  skillId: 'totalclaw:totalclaw~mariusfit-infra-watchdog',
  descriptionZh:
    '自托管基础设施监控：HTTP/TCP/Docker/SSL/DNS 检查，本地 SQLite 存储，通过 WhatsApp/Telegram/Discord 告警。',
  bodyZh: `# Infra Watchdog — 基础设施监控与健康告警

面向 OpenClaw 代理的自托管基础设施监控。无需外部 SaaS — 本地监控一切，并通过 WhatsApp、Telegram 或 Discord 告警。

## 功能

- **HTTP/HTTPS 端点监控** — 检查状态码、响应时间、SSL 有效性
- **TCP 端口检查** — 数据库、SSH、自定义服务
- **Docker 容器状态** — 运行中、已停止、不健康
- **系统资源** — CPU、RAM、磁盘使用，可配置阈值
- **SSL 证书到期** — 到期前 30 天告警
- **DNS 解析检查** — 验证域名 → IP 映射
- **Proxmox VM/CT 状态** — 通过本地 API 检查
- **WhatsApp/Telegram/Discord 告警** — 可配置冷却时间

## 快速开始

\`\`\`bash
# 初始化数据目录与配置
infra-watchdog init

# 添加第一个监控
infra-watchdog add-monitor --type http --name "My API" --url https://myapi.example.com

# 添加 TCP 端口检查
infra-watchdog add-monitor --type tcp --name "PostgreSQL" --host localhost --port 5432

# 添加 Docker 容器检查
infra-watchdog add-monitor --type docker --name "My App" --container myapp

# 立即运行所有检查
infra-watchdog check

# 查看当前状态仪表盘
infra-watchdog dashboard

# 安装自动检查 cron（每 5 分钟）
infra-watchdog cron-install
\`\`\`

## 命令

| 命令 | 说明 |
|---------|-------------|
| \`infra-watchdog init\` | 设置数据目录与默认配置 |
| \`infra-watchdog add-monitor\` | 添加新监控（http/tcp/docker/resource/ssl/dns） |
| \`infra-watchdog list\` | 列出所有已配置监控及当前状态 |
| \`infra-watchdog check\` | 立即运行所有检查 |
| \`infra-watchdog check --name <name>\` | 运行指定监控 |
| \`infra-watchdog status\` | 摘要：UP/DOWN/WARN 计数 |
| \`infra-watchdog dashboard\` | 所有监控的 ASCII 仪表盘 |
| \`infra-watchdog cron-install\` | 安装自动检查 cron 任务 |

## 监控类型

### HTTP/HTTPS
\`\`\`bash
infra-watchdog add-monitor \\
  --type http \\
  --name "Main API" \\
  --url https://api.example.com/health \\
  --expected-status 200 \\
  --timeout 5
\`\`\`

### TCP 端口
\`\`\`bash
infra-watchdog add-monitor \\
  --type tcp \\
  --name "Postgres" \\
  --host 192.168.1.10 \\
  --port 5432
\`\`\`

### Docker 容器
\`\`\`bash
infra-watchdog add-monitor \\
  --type docker \\
  --name "Nginx" \\
  --container nginx-proxy
\`\`\`

### 系统资源
\`\`\`bash
infra-watchdog add-monitor \\
  --type resource \\
  --name "Disk /" \\
  --resource disk \\
  --path / \\
  --warn-at 80 \\
  --alert-at 90
\`\`\`

### SSL 证书
\`\`\`bash
infra-watchdog add-monitor \\
  --type ssl \\
  --name "My Domain SSL" \\
  --host example.com \\
  --port 443 \\
  --warn-days 30
\`\`\`

## 配置

编辑 \`~/.openclaw/workspace/infra-watchdog-data/config.json\`：

\`\`\`json
{
  "alert_channel": "whatsapp",
  "alert_cooldown_minutes": 15,
  "check_interval_minutes": 5,
  "ssl_expiry_warning_days": 30
}
\`\`\`

## 告警渠道

| 渠道 | 配置值 |
|---------|-------------|
| WhatsApp | \`"whatsapp"\` |
| Telegram | \`"telegram"\` |
| Discord | \`"discord"\` |
| 无（仅日志） | \`"none"\` |

## 使用场景

### Homelab 监控
跟踪所有自托管服务：Proxmox、Docker 栈、数据库、Jellyfin、Home Assistant 等。任何服务宕机时立即收到 WhatsApp 告警。

### API 可用性监控
若在 RapidAPI 上销售 API 服务，本技能 24/7 监控端点，在客户察觉之前通知你。

### SSL 到期预防
不再让证书过期。到期前 30 天收到 WhatsApp 警告。

### 资源告警
凌晨 3 点磁盘满了？在服务被拖垮之前收到告警。

## 数据存储

所有数据本地存储于 \`~/.openclaw/workspace/infra-watchdog-data/\`。SQLite 数据库，无云同步，无遥测。

## 要求

- Python 3.8+
- Docker（可选，用于容器监控）
- OpenClaw 1.0+

## 源码与问题

- **Source:** https://github.com/mariusfit/infra-watchdog
- **Issues:** https://github.com/mariusfit/infra-watchdog/issues
- **Author:** [@mariusfit](https://github.com/mariusfit)`,
};
