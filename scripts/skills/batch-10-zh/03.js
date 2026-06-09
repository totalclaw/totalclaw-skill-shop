module.exports = {
  skillId: 'totalclaw:totalclaw~yoder-bawt-webhook-router',
  descriptionZh:
    '通用 Webhook 接收与路由，将任意来源的入站 Webhook 分发至处理器，集成 OpenClaw hooks 与 Tailscale Funnel。',
  bodyZh: `# 面向 OpenClaw 的 Webhook 路由器

通用 Webhook 接收器，将来自任意来源的入站 Webhook 路由至相应处理器。与 OpenClaw hooks 系统及 Tailscale Funnel 无缝集成，提供安全的公开 Webhook 端点。

## 概览

本技能提供完整的 Webhook 路由基础设施：

- **安全端点** 通过 Tailscale Funnel（HTTPS）
- **自动路由** 基于 Webhook 来源
- **内置处理器** 用于 GitHub、ClawHub 及通用来源
- **注册系统** 用于添加新 Webhook 来源
- **审计日志** 记录所有收到的 Webhook
- **智能告警** 针对重要事件

## 工作原理

### 架构

\`\`\`
External Service → Tailscale Funnel → OpenClaw /hooks → router.sh → Handler Script
\`\`\`

1. 外部服务向 Tailscale Funnel URL 发送 Webhook
2. OpenClaw hooks 系统接收 Webhook
3. \`router.sh\` 检查载荷并路由至相应处理器
4. 处理器处理事件并按需触发告警/操作

### 你的 Webhook 端点

\`\`\`
https://gregs-mac-mini.taila31444.ts.net/hooks
\`\`\`

**认证：** 在 \`X-Hook-Token\` 头中使用 OpenClaw hook 令牌：
\`\`\`
X-Hook-Token: 19e78f0288d476ee1197d4b374b6f73394abe121c12cc38a
\`\`\`

## 快速开始

### 1. 验证 Tailscale Funnel 是否运行

\`\`\`bash
openclaw gateway status
# 应显示：Tailscale Funnel: ACTIVE
\`\`\`

若未激活：
\`\`\`bash
openclaw gateway start
\`\`\`

### 2. 本地测试路由器

\`\`\`bash
cd /Users/gregborden/.openclaw/workspace/clawhub-skills/webhook-router
./test.sh
\`\`\`

### 3. 注册新 Webhook 来源

\`\`\`bash
./register.sh github my-repo
# 输出：https://gregs-mac-mini.taila31444.ts.net/hooks?source=github-my-repo
\`\`\`

### 4. 在你的服务中配置

在服务的 Webhook 设置中使用生成的 URL 及 hook 令牌头。

## 可用处理器

### GitHub（\`handlers/github.sh\`）

处理 GitHub Webhook 事件：
- **push** - 代码推送到仓库
- **pull_request** - PR 打开、关闭、合并、同步
- **issues** - Issue 打开、关闭、分配、标记
- **release** - 发布 Release

**告警触发：**
- PR 合并 → 通知
- Issue 分配给你 → 通知
- 新 Release → 通知

**配置：**
\`\`\`bash
# 设置 GitHub 用户名以获取个性化告警
export GITHUB_USERNAME="your-username"
\`\`\`

### 通用（\`handlers/generic.sh\`）

未知 Webhook 来源的回退处理器：
- 记录完整载荷
- 尝试提取事件类型与有意义字段
- 创建告警供人工审查

### ClawHub（\`handlers/clawhub.sh\`）

处理 ClawHub 专属 Webhook（由 \`register.sh\` 自动创建）：
- 新技能发布
- 技能更新
- 用户提及

## 注册系统

### 注册新来源

\`\`\`bash
./register.sh <source-type> <name>
\`\`\`

**示例：**

\`\`\`bash
# GitHub 仓库
./register.sh github my-awesome-app

# Stripe 支付
./register.sh stripe payments

# 自定义服务
./register.sh custom my-service
\`\`\`

将：
1. 生成唯一来源标识符
2. 创建处理器模板（若为新来源类型）
3. 输出要配置的 Webhook URL

### Webhook URL 格式

\`\`\`
https://gregs-mac-mini.taila31444.ts.net/hooks?source=<source-id>
\`\`\`

或使用头：
\`\`\`
X-Webhook-Source: <source-id>
\`\`\`

## 高级配置

### 自定义处理器开发

在 \`handlers/<type>.sh\` 中创建新处理器：

\`\`\`bash
#!/bin/bash
# handlers/myapp.sh

PAYLOAD="$1"
SOURCE="$2"
EVENT_TYPE="$3"

# 使用 jq 提取字段
field=$(echo "$PAYLOAD" | jq -r '.field // "unknown"')

# 写入 vault
vault write "webhooks/$SOURCE/$EVENT_TYPE" \\
  --data "$PAYLOAD" \\
  --tags "webhook,$SOURCE,$EVENT_TYPE"

# 重要事件告警
if [[ "$EVENT_TYPE" == "critical" ]]; then
  alert "🚨 Critical event from $SOURCE" "$field"
fi
\`\`\`

设为可执行：
\`\`\`bash
chmod +x handlers/myapp.sh
\`\`\`

### 环境变量

\`\`\`bash
# GitHub 用户名（个性化告警）
export GITHUB_USERNAME="your-github-username"

# 告警渠道（默认：main）
export WEBHOOK_ALERT_CHANNEL="telegram"

# 日志文件路径（默认：/Users/gregborden/.openclaw/workspace/memory/webhooks.jsonl）
export WEBHOOK_LOG_PATH="/custom/path/webhooks.jsonl"
\`\`\`

### 日志格式

所有 Webhook 记录至 \`/Users/gregborden/.openclaw/workspace/memory/webhooks.jsonl\`：

\`\`\`json
{
  "timestamp": "2026-02-07T20:30:00Z",
  "source": "github-myrepo",
  "event_type": "push",
  "repository": "owner/repo",
  "sender": "username",
  "payload_hash": "sha256:abc123...",
  "processed": true
}
\`\`\`

## 各服务专属设置

### GitHub

1. 进入仓库 → Settings → Webhooks → Add webhook
2. **Payload URL：** \`https://gregs-mac-mini.taila31444.ts.net/hooks?source=github-<repo>\`
3. **Content type：** \`application/json\`
4. **Secret：**（留空，令牌在头中）
5. **Events：** 选择事件或「Let me select individual events」
6. 添加头：\`X-Hook-Token: 19e78f0288d476ee1197d4b374b6f73394abe121c12cc38a\`

### Stripe

1. Dashboard → Developers → Webhooks → Add endpoint
2. **Endpoint URL：** \`https://gregs-mac-mini.taila31444.ts.net/hooks?source=stripe-payments\`
3. 选择要监听的事件
4. 添加头：\`X-Hook-Token: 19e78f0288d476ee1197d4b374b6f73394abe121c12cc38a\`

### ClawHub

使用内置 hooks 集成或注册：
\`\`\`bash
./register.sh clawhub skills
\`\`\`

### 自定义服务

任何支持 Webhook 的服务：
1. 运行 \`./register.sh <type> <name>\`
2. 复制生成的 URL
3. 在服务中配置 \`X-Hook-Token\` 头

## 测试

### 本地测试

\`\`\`bash
./test.sh
\`\`\`

发送模拟 Webhook 测试路由系统。

### 使用 curl 手动测试

\`\`\`bash
# GitHub push 事件
curl -X POST "https://gregs-mac-mini.taila31444.ts.net/hooks?source=github-test" \\
  -H "X-Hook-Token: 19e78f0288d476ee1197d4b374b6f73394abe121c12cc38a" \\
  -H "X-GitHub-Event: push" \\
  -H "Content-Type: application/json" \\
  -d '{
    "ref": "refs/heads/main",
    "repository": {"full_name": "test/repo"},
    "pusher": {"name": "testuser"},
    "commits": [{"message": "Test commit"}]
  }'
\`\`\`

## 故障排除

### 查看最近 Webhook

\`\`\`bash
# 查看最近 10 条 Webhook
tail -10 /Users/gregborden/.openclaw/workspace/memory/webhooks.jsonl | jq .
\`\`\`

### 验证处理器存在

\`\`\`bash
ls -la handlers/
\`\`\`

### 直接测试路由器

\`\`\`bash
echo '{"test": "data"}' | ./router.sh --source test --event push
\`\`\`

### 检查 OpenClaw Hooks 状态

\`\`\`bash
openclaw gateway status
\`\`\`

### 日志

- Webhook 审计日志：\`/Users/gregborden/.openclaw/workspace/memory/webhooks.jsonl\`
- 处理器日志：检查 vault 或通知渠道

## 安全说明

- Hook 令牌用于认证发往 OpenClaw 的请求
- Tailscale Funnel 提供 HTTPS 加密
- Webhook 载荷会记录（哈希），但应考虑脱敏敏感数据
- 每个来源可在其处理器中实施独立验证

## 文件

- \`router.sh\` - 主路由逻辑
- \`register.sh\` - 来源注册
- \`handlers/github.sh\` - GitHub Webhook 处理器
- \`handlers/generic.sh\` - 通用回退处理器
- \`test.sh\` - 测试套件
- \`SKILL.md\` - 本文档

## 许可证

MIT - 详见 ClawHub 仓库。`,
};
