module.exports = {
  skillId: 'totalclaw:totalclaw~mariusfit-service-watchdog',
  descriptionZh:
    '轻量级自托管服务与端点监控：HTTP/TCP/SSL/DNS 检查，聊天友好的状态摘要与 Cron 集成。',
  bodyZh: `# Service Watchdog

面向自托管基础设施的轻量级服务与端点监控。检查 HTTP 端点、TCP 端口、SSL 证书到期与 DNS 解析 — 并以清晰、适合聊天的格式报告状态。

## 功能

- **HTTP 健康检查** — GET/POST，预期状态码，响应时间跟踪，内容匹配
- **TCP 端口检查** — 验证服务是否在监听（数据库、邮件服务器、游戏服务器等）
- **SSL 证书监控** — 距到期天数、颁发者信息、自动警告阈值
- **DNS 解析** — 验证域名解析正确，检测 DNS 劫持
- **智能摘要** — 所有服务一目了然的状态，含趋势数据
- **告警逻辑** — 可配置阈值、冷却时间与严重级别，防止告警疲劳

## 快速开始

### 1. 创建监视列表

在工作区根目录创建 \`watchdog.json\`：

\`\`\`json
{
  "services": [
    {
      "name": "Home Assistant",
      "type": "http",
      "url": "http://192.168.1.100:8123",
      "expect_status": 200,
      "timeout_ms": 5000
    },
    {
      "name": "Proxmox",
      "type": "https",
      "url": "https://proxmox.local:8006",
      "expect_status": 200,
      "ssl_warn_days": 14,
      "timeout_ms": 5000
    },
    {
      "name": "PostgreSQL",
      "type": "tcp",
      "host": "db.local",
      "port": 5432,
      "timeout_ms": 3000
    },
    {
      "name": "My Domain",
      "type": "dns",
      "domain": "example.com",
      "expect_ip": "93.184.216.34"
    }
  ],
  "defaults": {
    "timeout_ms": 5000,
    "ssl_warn_days": 14,
    "alert_cooldown_min": 30,
    "history_retention_days": 30
  }
}
\`\`\`

### 2. 运行检查

\`\`\`bash
bash skills/service-watchdog/watchdog.sh
\`\`\`

输出示例：
\`\`\`
🟢 Home Assistant       — 200 OK (142ms)
🟢 Proxmox              — 200 OK (89ms) | SSL: 47 days
🟢 PostgreSQL           — port 5432 open (12ms)
🟢 My Domain            — resolves to 93.184.216.34 ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4/4 healthy | avg response: 81ms | checked: 2026-02-24 16:30 UTC
\`\`\`

### 3. 详细报告

\`\`\`bash
bash skills/service-watchdog/watchdog.sh --report
\`\`\`

显示趋势数据：可用率百分比、P95 响应时间、事件历史。

### 4. JSON 输出（用于 cron 集成）

\`\`\`bash
bash skills/service-watchdog/watchdog.sh --json
\`\`\`

### 5. 仅检查 SSL

\`\`\`bash
bash skills/service-watchdog/watchdog.sh --ssl-only
\`\`\`

### 6. 告警摘要（用于消息推送）

\`\`\`bash
bash skills/service-watchdog/watchdog.sh --alerts-only
\`\`\`

仅输出需要关注的服务（宕机、慢响应、SSL 即将到期）。

## Cron 集成

添加到 OpenClaw cron 以实现持续监控：

**每 5 分钟（轻量检查）：**
\`\`\`
Run \`bash skills/service-watchdog/watchdog.sh --json\` and report only if any service is unhealthy.
\`\`\`

**每日 SSL 报告：**
\`\`\`
Run \`bash skills/service-watchdog/watchdog.sh --ssl-only\` and report expiring certificates.
\`\`\`

## 配置参考

### 服务类型

| 类型 | 必填字段 | 可选字段 |
|------|----------------|-----------------|
| \`http\` / \`https\` | \`url\` | \`expect_status\`, \`expect_body\`, \`method\`, \`headers\`, \`timeout_ms\`, \`ssl_warn_days\` |
| \`tcp\` | \`host\`, \`port\` | \`timeout_ms\` |
| \`dns\` | \`domain\` | \`expect_ip\`, \`nameserver\` |

### 全局默认值

| 字段 | 默认值 | 说明 |
|-------|---------|-------------|
| \`timeout_ms\` | 5000 | 请求超时 |
| \`ssl_warn_days\` | 14 | SSL 到期警告阈值 |
| \`alert_cooldown_min\` | 30 | 重复告警最小间隔（分钟） |
| \`history_retention_days\` | 30 | 检查历史保留天数 |
| \`history_file\` | \`watchdog-history.csv\` | 检查历史数据路径 |

## 代理应如何使用

当用户询问服务状态、基础设施健康或「我的服务是否在线」时：

1. 运行 \`bash skills/service-watchdog/watchdog.sh\` 获取快速概览
2. 使用 \`--report\` 获取详细趋势与历史
3. 使用 \`--alerts-only\` 仅查看问题
4. 使用 \`--ssl-only\` 检查证书状态
5. 需要结构化数据做进一步分析时使用 \`--json\`

主动监控时，在 cron 任务中运行检查，仅在出现问题时告警用户。

## 要求

- \`curl\`（HTTP/HTTPS 检查）
- \`openssl\`（SSL 证书检查）
- \`nc\` 或 \`ncat\`（TCP 端口检查）— 不可用时回退到 bash \`/dev/tcp\`
- \`dig\` 或 \`nslookup\`（DNS 检查）— 回退到 \`host\` 命令
- \`jq\`（JSON 配置解析）

大多数 Linux 发行版均自带。无需外部 API 或账户。`,
};
