module.exports = {
  skillId: 'totalclaw:totalclaw~agentossoftware-agentos',
  descriptionZh:
    '面向 Clawdbot 的完整 AgentOS 集成 SDK，含心跳同步、记忆持久化、网格消息与 Brain Dashboard 访问。',
  bodyZh: `# 面向 Clawdbot 的 AgentOS SDK

**版本：** 1.4.4

面向 Clawdbot 的完整 AgentOS 集成。一次安装，即可完整访问所有功能。

---

## ⚠️ 硬性规则：心跳期间同步仪表盘

**任何使用此 SDK 的智能体在每次心跳时都必须同步到 AgentOS 仪表盘。**

这是不可妥协的。你的人类用户通过 https://brain.agentos.software 上的 Brain Dashboard 监控你的活动。如果你不同步，他们就无法看到你在做什么。

### 必需的心跳操作

每次心跳时运行（推荐）：
\`\`\`bash
~/clawd/bin/agentos-golden-sync.sh
\`\`\`

回退方案（仅内存）：
\`\`\`bash
~/clawd/bin/agentos-sync.sh
\`\`\`

或者，如果使用 aos CLI：
\`\`\`bash
aos sync
\`\`\`

### 哪些内容会被同步
**Golden Sync（推荐）** 会同时更新两部分：
- **内存**（CONTEXT.md、每日笔记、项目分区、学习记录、心跳状态）
- **Projects 标签页**（Activity + Tasks + Ideas + Changelog + Challenges），通过同步各项目的 markdown 文件完成

---

## ⚠️ 硬性规则：对话状态持久化

**CONTEXT.md 必须始终将当前对话状态作为第一节内容。**

### 必需的 CONTEXT.md 格式

\`\`\`markdown
## 🔴 ACTIVE CONVERSATION
- **Topic:** [Project + specific feature/topic being discussed]
- **Last human message:** [What they asked/said]
- **Your last response:** [What you answered]
- **Unanswered questions:** [Anything pending]
- **Expected next topic:** [What they'll likely ask next]
\`\`\`

### 何时更新
1. 在每条人类消息之后
2. 在每次心跳同步之前
3. 在压缩前刷新时（优先级 #1）
4. 在完成任何任务之后

---

## ⚠️ 硬性规则：会话开始 — 上下文注入

**在每次会话开始时（包括压缩之后），你都必须恢复上下文。**

### 协议（强制）

1. **运行上下文注入：**
   \`\`\`bash
   ~/clawd/bin/aos-inject-context
   \`\`\`

2. **阅读输出** — 包含最后工作内存、今日笔记、昨日笔记

3. **绝不要问"我们刚才在讨论什么？"**

4. **若注入失败**，回退读取 \`CONTEXT.md\` 与 \`memory/daily/YYYY-MM-DD.md\`

---

## ⚠️ 硬性规则：压缩前备份

**当你收到来自 Clawdbot 的内存刷新指令时，立即备份你的状态。**

### 协议（强制执行）

1. **更新 CONTEXT.md**（含 🔴 ACTIVE CONVERSATION）
2. **立即运行同步：** \`~/clawd/bin/agentos-sync.sh\`
3. **回复：** \`NO_REPLY\`

---

## ⚠️ 硬性规则：绝不询问所指内容

压缩或重启后，**绝不**问人类"你指的是什么？"。先运行 \`~/clawd/bin/aos-inject-context\`，再正常响应。

---

## 功能

- ✅ **网格消息** — 智能体间通信
- ✅ **记忆同步** — 自动同步记忆至 AgentOS 云
- ✅ **语义搜索** — 自然语言查询记忆
- ✅ **WebSocket 支持** — 实时消息通知
- ✅ **仪表盘访问** — 在 brain.agentos.software 查看智能体大脑
- ✅ **完整 API 访问** — 完整 REST API 集成
- ✅ **多租户** — 通过 Google OAuth 隔离租户
- ✅ **看板** — 带优先级与状态的任务管理
- ✅ **项目** — 带活动日志与头脑风暴的项目追踪

## 快速开始

\`\`\`bash
# 1. 安装技能
clawdhub install agentos

# 2. 运行设置
bash ~/clawd/skills/agentos/scripts/setup.sh

# 3. 配置 ~/.agentos.json

# 4. 验证连接
aos status

# 5. 将同步添加到心跳（必需）
\`\`\`

## 获取 API 密钥

1. 访问 https://brain.agentos.software
2. 使用 Google 注册/登录
3. 创建新智能体（或使用现有）
4. 从仪表盘复制 API 密钥

## CLI 参考

### aos — 主 CLI

\`\`\`bash
aos status              # 连接状态、智能体信息
aos dashboard           # 在浏览器打开仪表盘
aos sync                # 同步所有记忆（心跳时运行）
aos sync --watch        # 监视变更并自动同步
aos send <agent> "<topic>" "<message>"   # 发送消息
aos inbox               # 查看收到的消息
aos search "query"      # 语义搜索记忆
aos daemon start        # 启动后台守护进程
\`\`\`

### agentos-sync.sh — 心跳同步脚本

位于：\`~/clawd/bin/agentos-sync.sh\`

同步：
- \`CONTEXT.md\` → \`/context/working-memory\`
- \`memory/daily/YYYY-MM-DD.md\` → \`/daily/YYYY-MM-DD\`
- 心跳时间戳 → \`/status/heartbeat\`

## 配置

配置文件：\`~/.agentos.json\`

\`\`\`json
{
  "apiUrl": "http://178.156.216.106:3100",
  "apiKey": "agfs_live_xxx.yyy",
  "agentId": "your-agent-id",
  "syncPaths": [
    "~/clawd/CONTEXT.md",
    "~/clawd/MEMORY.md",
    "~/clawd/memory/"
  ],
  "autoSync": true,
  "syncInterval": 1800
}
\`\`\`

## API 参考

| 端点 | 说明 |
|----------|-------------|
| \`POST /v1/put\` | 存储记忆 |
| \`POST /v1/get\` | 检索记忆 |
| \`POST /v1/search\` | 语义搜索 |
| \`POST /v1/mesh/messages\` | 发送网格消息 |
| \`GET /v1/projects\` | 列出项目 |
| \`GET /v1/kanban/tasks\` | 列出看板任务 |
| \`WS /\` | 实时 WebSocket 事件 |

## 故障排除

### "Connection refused"
检查 \`~/.agentos.json\` 中的 \`apiUrl\` 并验证 API 运行中。

### "Unauthorized"
API 密钥可能无效或过期。从仪表盘获取新密钥。

### 仪表盘未更新
确保在心跳期间运行 \`~/clawd/bin/agentos-sync.sh\`。

## 支持

- 仪表盘: https://brain.agentos.software
- 文档: https://agentos.software/docs
- GitHub: https://github.com/AgentOSsoftware/agentOS`,
};
