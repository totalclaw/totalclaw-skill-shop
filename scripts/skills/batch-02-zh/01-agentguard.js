module.exports = {
  skillId: 'totalclaw:totalclaw~manas-io-ai-agentguard',
  descriptionZh:
    '全面的智能体安全监控技能，持续监视智能体操作，检测可疑行为、记录通信日志并生成可执行的安全报告，支持文件访问、API 调用与异常检测。',
  bodyZh: `# AgentGuard - 安全监控技能

**版本：** 1.0.0  
**作者：** Manas AI  
**类别：** 安全与监控

## 概述

AgentGuard 是一套全面的安全监控技能，用于监视智能体操作，检测可疑行为、记录通信并提供可执行的安全报告。

---

## 能力

### 1. 文件访问监控
追踪所有文件读写操作并进行模式分析。

**触发：** 持续后台监控  
**命令：** \`agentguard monitor files [--watch-dir <path>]\`

**检测内容：**
- 异常文件访问模式（批量读取、敏感目录）
- 访问凭证文件（.env、.secrets、keys）
- 对系统目录的意外写入
- 文件外泄尝试（大量读取后伴随网络调用）

### 2. API 调用检测
监控出站 API 调用中的可疑活动。

**命令：** \`agentguard monitor api\`

**检测内容：**
- 调用未知/不可信端点
- 异常 API 调用频率（速率异常）
- 请求载荷中的敏感数据
- 认证令牌泄露
- 调用已知恶意域名

### 3. 通信日志
记录所有外部通信以供审计。

**命令：** \`agentguard log comms [--output <path>]\`

**日志包含：**
- HTTP/HTTPS 请求（已脱敏）
- WebSocket 连接
- 邮件发送
- 消息平台输出（Telegram、Discord 等）
- 时间戳、目标地址、载荷哈希

### 4. 异常检测
轻量级 ML 模式分析，识别行为异常。

**命令：** \`agentguard detect anomalies [--sensitivity <low|medium|high>]\`

**检测方法：**
- 基线偏离（学习正常模式）
- 时段异常
- 序列分析（异常操作链）
- 流量峰值
- 新目标检测

### 5. 安全报告
生成全面的每日安全报告。

**命令：** \`agentguard report [--period <daily|weekly|monthly>]\`

**报告包含：**
- 活动摘要
- 按严重程度分类的告警
- 访问最多的资源
- 通信目标
- 异常时间线
- 建议措施

---

## 配置

### 配置文件：\`config/agentguard.yaml\`

\`\`\`yaml
monitoring:
  enabled: true
  file_watch_dirs:
    - ~/clawd
    - ~/.clawdbot
  exclude_patterns:
    - "*.log"
    - "node_modules/**"
    - ".git/**"

alerts:
  sensitivity: medium  # low, medium, high
  channels:
    - telegram
  alert_on:
    - credential_access
    - bulk_file_read
    - unknown_api_endpoint
    - data_exfiltration
  cooldown_minutes: 15

api_monitoring:
  trusted_domains:
    - api.anthropic.com
    - api.openai.com
    - api.telegram.org
    - api.elevenlabs.io
  block_on_suspicious: false  # true = prevent call, false = alert only

logging:
  retention_days: 30
  log_dir: ~/.agentguard/logs
  hash_sensitive_data: true

reporting:
  auto_daily_report: true
  report_time: "09:00"
  report_channel: telegram
\`\`\`

---

## 使用示例

### 启动完整监控
\`\`\`
agentguard start
\`\`\`
使用默认配置启用所有监控功能。

### 查看当前安全状态
\`\`\`
agentguard status
\`\`\`
返回当前威胁等级、活跃监控器与近期告警。

### 调查特定活动
\`\`\`
agentguard investigate --timerange "last 2 hours" --type file_access
\`\`\`

### 立即生成报告
\`\`\`
agentguard report --now
\`\`\`

### 查看告警历史
\`\`\`
agentguard alerts --last 24h --severity high
\`\`\`

### 将域名加入白名单
\`\`\`
agentguard trust add api.newservice.com --reason "Required for X integration"
\`\`\`

---

## 告警严重程度

| 级别 | 颜色 | 含义 | 示例 |
|-------|-------|---------|---------|
| INFO | 🔵 | 正常记录的活动 | 工作区内文件读取 |
| LOW | 🟢 | 轻微偏离 | API 调用略增 |
| MEDIUM | 🟡 | 显著异常 | 访问 .env 文件 |
| HIGH | 🟠 | 潜在威胁 | 批量访问凭证 |
| CRITICAL | 🔴 | 需立即处理 | 数据外泄模式 |

---

## 集成点

### 与 Clawdbot
- 接收文件/API 操作钩子
- 通过已配置渠道发送告警
- 与心跳集成进行周期性检查

### 与其他技能
- 与其他安全技能共享威胁数据
- 可阻止操作（若已配置）
- 为合规技能提供审计日志

---

## 数据存储

\`\`\`
~/.agentguard/
├── logs/
│   ├── file_access/
│   ├── api_calls/
│   └── communications/
├── baselines/
│   └── behavior_model.json
├── alerts/
│   └── YYYY-MM-DD.json
└── reports/
    └── YYYY-MM-DD_report.md
\`\`\`

---

## 隐私与安全

- **无外部数据传输** — 所有处理均在本地完成
- **敏感数据哈希** — 凭证从不以明文记录
- **可配置保留期** — 自动删除旧日志
- **加密存储** — 日志可选 AES 加密

---

## 故障排除

### 误报率高
→ 延长基线学习期或降低敏感度

### 缺少文件事件
→ 检查 \`file_watch_dirs\` 是否覆盖目标目录

### 报告未生成
→ 验证 \`report_time\` 格式与时区设置

---

## 执行脚本

| 脚本 | 用途 |
|--------|---------|
| \`execution/monitor.py\` | 核心监控守护进程 |
| \`execution/detector.py\` | 异常检测引擎 |
| \`execution/logger.py\` | 结构化日志处理器 |
| \`execution/alerter.py\` | 告警分发系统 |
| \`execution/reporter.py\` | 报告生成 |

---

## 作者说明

AgentGuard 遵循纵深防御原则设计，假设智能体可能被入侵或操纵，并提供对其操作的可视化能力。

为获得最高安全性，建议在独立进程中运行 AgentGuard，并限制写入权限，防止被入侵的智能体关闭监控。`,
};
