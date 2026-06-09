module.exports = {
  skillId: 'totalclaw:totalclaw~enderfga-async-task',
  descriptionZh:
    '执行可能超过 HTTP 超时的长时任务。通过 start/done/fail 流程异步推送结果，避免「empty response from server」错误。',
  bodyZh: `# 异步任务

## 描述

执行可能超过 HTTP 超时的长时任务。适用于：
- 运行可能超过 5 秒的命令
- 分析大文件或代码库
- 执行多步操作
- 调用延迟不可预测的外部 API

**重要**：任务可能超时时，**必须**使用本技能，避免 \`empty response from server\` 错误。

触发词："async task"、"long running"、"timeout"、"background task"、"push result"

## 安装

\`\`\`bash
# 克隆并全局链接
git clone https://github.com/Enderfga/openclaw-async-task.git
cd openclaw-async-task
npm link

# 或复制 async-task.js 到 PATH
chmod +x async-task.js
cp async-task.js /usr/local/bin/async-task
\`\`\`

## 命令

\`\`\`bash
async-task start "<description>"  # 启动任务，立即返回
async-task done "<result>"        # 完成任务，推送结果给用户
async-task fail "<error>"         # 任务失败，推送错误信息
async-task push "<message>"       # 直接推送消息（无需 start）
async-task status                 # 显示当前任务状态
\`\`\`

## 使用流程（必须严格遵循）

1. **启动**: \`async-task start "正在扫描文件..."\`
2. **执行**: 运行实际命令
3. **推送结果**: \`async-task done "找到 42 个文件"\`

## 示例

用户问：「统计项目中所有 TypeScript 文件」

\`\`\`bash
# 步骤 1：立即确认
async-task start "正在统计 TypeScript 文件..."

# 步骤 2：实际工作
count=$(find . -name "*.ts" | wc -l)

# 步骤 3：推送结果
async-task done "找到 $count 个 TypeScript 文件"
\`\`\`

## 工作原理

1. \`start\` 保存任务状态并立即返回确认
2. 你执行所需命令
3. \`done\`/\`fail\` 通过 CLI 将结果推送到活跃会话

**零配置** - 通过 \`openclaw sessions\` 或 \`clawdbot sessions\` 自动检测活跃会话。

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

| 变量 | 必需 | 说明 |
|----------|----------|-------------|
| \`OPENCLAW_SESSION\` | 否 | 目标会话（自动检测） |
| \`ASYNC_TASK_PUSH_URL\` | 否 | 自定义 HTTP 推送端点 |
| \`ASYNC_TASK_AUTH_TOKEN\` | 否 | 自定义端点认证令牌 |

## 要求

- Node.js 16+
- 已安装 OpenClaw 或 Clawdbot CLI

## 关键规则

- **必须** 将 \`start\` 与 \`done\` 或 \`fail\` 配对
- **切勿** 启动而不完成
- **切勿** 说「稍后推送」然后忘记

## 链接

- [GitHub](https://github.com/Enderfga/openclaw-async-task)
- [OpenClaw](https://openclaw.ai)`,
};
