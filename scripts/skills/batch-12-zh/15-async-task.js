module.exports = {
  skillId: 'totalclaw:totalclaw~enderfga-async-task',
  descriptionZh:
    '执行长时间运行任务以避免 HTTP 超时。适用于超过 5 秒的命令、大文件分析、多步操作或高延迟外部 API 调用。',
  bodyZh: `# OpenClaw 异步任务

## 描述

在不触发 HTTP 超时的情况下执行长时间运行任务。适用于：
- 运行可能超过 5 秒的命令
- 分析大文件或代码库
- 执行多步操作
- 调用延迟不可预测的外部 API

**重要**：任务可能超时时，**必须**使用本技能以避免 \`empty response from server\` 错误。

触发词："async task"、"long running"、"timeout"、"background task"、"push result"

## 安装

\`\`\`bash
# 克隆并全局链接
git clone https://github.com/Enderfga/openclaw-async-task.git
cd openclaw-async-task
npm link

# 或直接将 async-task.js 复制到 PATH
chmod +x async-task.js
cp async-task.js /usr/local/bin/async-task
\`\`\`

## 命令

\`\`\`bash
async-task start "<description>"  # 启动任务，立即返回
async-task done "<result>"        # 完成任务，将结果推送给用户
async-task fail "<error>"         # 任务失败，推送错误消息
async-task push "<message>"       # 直接推送消息（无需 start）
async-task status                 # 显示当前任务状态
\`\`\`

## 使用流程（必须严格遵循）

1. **启动**：\`async-task start "Scanning files..."\`
2. **执行**：运行实际命令
3. **推送结果**：\`async-task done "Found 42 files"\`

## 示例

用户问："统计本项目所有 TypeScript 文件"

\`\`\`bash
# 第 1 步：立即确认
async-task start "Counting TypeScript files..."

# 第 2 步：执行实际工作
count=$(find . -name "*.ts" | wc -l)

# 第 3 步：推送结果
async-task done "Found $count TypeScript files"
\`\`\`

## 工作原理

1. \`start\` 保存任务状态并立即返回确认
2. 你执行所需命令
3. \`done\`/\`fail\` 通过 OpenClaw/Clawdbot CLI 将结果推送到活动会话

**零配置** — 通过 \`openclaw sessions\` 或 \`clawdbot sessions\` 自动检测活动会话。

## 高级：自定义推送端点

用于自定义 webchat 或通知系统：

\`\`\`bash
export ASYNC_TASK_PUSH_URL="https://your-server.com/api/push"
export ASYNC_TASK_AUTH_TOKEN="your-token"
\`\`\`

端点接收：
\`\`\`json
{
  "sessionId": "session-id",
  "content": "message",
  "role": "assistant"
}
\`\`\`

## 环境变量

| 变量 | 必需 | 描述 |
|----------|----------|-------------|
| \`OPENCLAW_SESSION\` | 否 | 目标会话（自动检测） |
| \`ASYNC_TASK_PUSH_URL\` | 否 | 自定义 HTTP 推送端点 |
| \`ASYNC_TASK_AUTH_TOKEN\` | 否 | 自定义端点认证令牌 |

## 要求

- Node.js 16+
- 已安装 OpenClaw 或 Clawdbot CLI

## 关键规则

- **必须**将 \`start\` 与 \`done\` 或 \`fail\` 配对
- **绝不**启动后不完成
- **绝不**说「稍后推送」然后忘记

## 链接

- [GitHub](https://github.com/Enderfga/openclaw-async-task)
- [OpenClaw](https://openclaw.ai)`,
};
