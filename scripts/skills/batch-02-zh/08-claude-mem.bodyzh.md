# Claude-Mem OpenClaw 插件 — 安装指南

本指南介绍如何在 OpenClaw 网关上设置 claude-mem 插件。完成后，你的智能体将拥有跨会话的持久记忆、工作区中实时更新的 MEMORY.md，并可选地将实时观察流推送到消息渠道。

## 快速安装（推荐）

运行以下一键命令自动安装所有组件：

\`\`\`bash
curl -fsSL https://install.cmem.ai/openclaw.sh | bash
\`\`\`

安装程序会交互式处理依赖检查（Bun、uv）、插件安装、记忆槽配置、AI 提供商设置、worker 启动以及可选的观察流配置。

### 带选项安装

预选 AI 提供商与 API 密钥以跳过交互提示：

\`\`\`bash
curl -fsSL https://install.cmem.ai/openclaw.sh | bash -s -- --provider=gemini --api-key=YOUR_KEY
\`\`\`

完全无人值守安装（默认 Claude Max Plan，跳过观察流）：

\`\`\`bash
curl -fsSL https://install.cmem.ai/openclaw.sh | bash -s -- --non-interactive
\`\`\`

升级现有安装（保留设置，更新插件）：

\`\`\`bash
curl -fsSL https://install.cmem.ai/openclaw.sh | bash -s -- --upgrade
\`\`\`

安装完成后，跳至[步骤 4：重启网关并验证](#step-4-restart-the-gateway-and-verify)确认一切正常。

---

## 手动安装

以下步骤适用于不想使用自动安装程序，或需要逐步排查的情况。

### 步骤 1：克隆 Claude-Mem 仓库

首先将 claude-mem 仓库克隆到 OpenClaw 网关可访问的位置，以获取 worker 服务源码与插件代码。

\`\`\`bash
cd /opt  # or wherever you want to keep it
git clone https://github.com/thedotmack/claude-mem.git
cd claude-mem
npm install
npm run build
\`\`\`

worker 服务需要安装 **bun**。若尚未安装：

\`\`\`bash
curl -fsSL https://bun.sh/install | bash
\`\`\`

### 步骤 2：启动 Worker

claude-mem worker 是运行在 37777 端口的 HTTP 服务，负责存储观察、生成摘要并提供上下文时间线。插件通过 HTTP 与其通信——worker 运行位置不重要，只需在 localhost:37777 可达。

#### 检查是否已在运行

若本机也运行带 claude-mem 的 Claude Code，worker 可能已在运行：

\`\`\`bash
curl http://localhost:37777/api/health
\`\`\`

**收到 \`{"status":"ok"}\`？** worker 已在运行，跳至步骤 3。

**连接被拒绝或无响应？** worker 未运行，继续下方步骤。

#### 若 Claude Code 已安装 claude-mem

若 claude-mem 作为 Claude Code 插件安装（位于 \`~/.claude/plugins/marketplaces/thedotmack/\`），从该安装启动 worker：

\`\`\`bash
cd ~/.claude/plugins/marketplaces/thedotmack
npm run worker:restart
\`\`\`

验证：
\`\`\`bash
curl http://localhost:37777/api/health
\`\`\`

**收到 \`{"status":"ok"}\`？** 已就绪，跳至步骤 3。

**仍不工作？** 检查 \`npm run worker:status\` 获取错误详情，或确认 bun 已安装并在 PATH 中。

#### 若无 Claude Code 安装

从克隆的仓库运行 worker：

\`\`\`bash
cd /opt/claude-mem  # wherever you cloned it
npm run worker:start
\`\`\`

验证：
\`\`\`bash
curl http://localhost:37777/api/health
\`\`\`

**收到 \`{"status":"ok"}\`？** 已就绪，进入步骤 3。

**仍不工作？** 排查步骤：
- 确认 bun 已安装：\`bun --version\`
- 检查 worker 状态：\`npm run worker:status\`
- 检查 37777 端口是否被占用：\`lsof -i :37777\`
- 查看日志：\`npm run worker:logs\`（若可用）
- 直接运行查看错误：\`bun plugin/scripts/worker-service.cjs start\`

### 步骤 3：将插件添加到网关

在 OpenClaw 网关配置中添加 \`claude-mem\` 插件：

\`\`\`json
{
  "plugins": {
    "claude-mem": {
      "enabled": true,
      "config": {
        "project": "my-project",
        "syncMemoryFile": true,
        "workerPort": 37777
      }
    }
  }
}
\`\`\`

#### 配置字段说明

- **\`project\`**（字符串，默认：\`"openclaw"\`）— 在记忆数据库中限定所有观察的项目名。每个网关/用例使用唯一名称，避免观察混淆。例如编码机器人网关可使用 \`"coding-bot"\`。

- **\`syncMemoryFile\`**（布尔，默认：\`true\`）— 启用后，插件向每个智能体工作区写入 \`MEMORY.md\`，包含以往会话的完整观察与摘要时间线，并在每次工具使用时更新，使智能体始终拥有最新上下文。仅在不希望插件写入工作区文件时设为 \`false\`。

- **\`workerPort\`**（数字，默认：\`37777\`）— claude-mem worker 监听端口。仅在为 worker 配置了不同端口时修改。

---

## 步骤 4：重启网关并验证

重启 OpenClaw 网关以加载新插件配置。重启后检查网关日志：

\`\`\`
[claude-mem] OpenClaw plugin loaded — v1.0.0 (worker: 127.0.0.1:37777)
\`\`\`

若看到此行，插件已加载。也可在任意 OpenClaw 聊天中运行 \`/claude_mem_status\` 验证：

\`\`\`
Claude-Mem Worker Status
Status: ok
Port: 37777
Active sessions: 0
Observation feed: disconnected
\`\`\`

观察流显示 \`disconnected\` 是因为尚未配置，下一步将配置。

## 步骤 5：验证观察是否被记录

让智能体执行一些工作。插件通过以下 OpenClaw 事件自动记录观察：

1. **\`before_agent_start\`** — 智能体启动时初始化 claude-mem 会话，将 MEMORY.md 同步到工作区
2. **\`tool_result_persist\`** — 将每次工具使用（Read、Write、Bash 等）记录为观察，并重新同步 MEMORY.md
3. **\`agent_end\`** — 总结会话并标记完成

以上均自动进行，无需额外配置。

验证方式：智能体运行后检查工作区目录中的 \`MEMORY.md\`，应包含格式化的观察时间线。

也可在 http://localhost:37777 查看 worker 界面，实时观察记录出现。

## 步骤 6：设置观察流（推送到渠道）

观察流连接 claude-mem worker 的 SSE（Server-Sent Events）流，实时将每条新观察转发到消息渠道。智能体在学习，你可在 Telegram/Discord/Slack 等看到学习过程。

### 你将看到的内容

每次 claude-mem 根据智能体工具使用创建新观察时，渠道中会出现类似消息：

\`\`\`
🧠 Claude-Mem Observation
**Implemented retry logic for API client**
Added exponential backoff with configurable max retries to handle transient failures
\`\`\`

### 选择渠道

需要两项：
- **渠道类型** — 须与网关上已运行的渠道插件匹配
- **目标 ID** — 消息发送的聊天/频道/用户 ID

#### Telegram

渠道类型：\`telegram\`

查找聊天 ID：
1. 在 Telegram 向 @userinfobot 发消息 — https://t.me/userinfobot
2. 回复中包含数字聊天 ID（如 \`123456789\`）
3. 群组聊天 ID 为负数（如 \`-1001234567890\`）

\`\`\`json
"observationFeed": {
  "enabled": true,
  "channel": "telegram",
  "to": "123456789"
}
\`\`\`

#### Discord

渠道类型：\`discord\`

查找频道 ID：
1. 在 Discord 启用开发者模式：设置 → 高级 → 开发者模式
2. 右键目标频道 → 复制频道 ID

\`\`\`json
"observationFeed": {
  "enabled": true,
  "channel": "discord",
  "to": "1234567890123456789"
}
\`\`\`

#### Slack

渠道类型：\`slack\`

查找频道 ID（非频道名称）：
1. 在 Slack 打开频道
2. 点击顶部频道名称
3. 滚动到频道详情底部 — ID 形如 \`C01ABC2DEFG\`

\`\`\`json
"observationFeed": {
  "enabled": true,
  "channel": "slack",
  "to": "C01ABC2DEFG"
}
\`\`\`

#### Signal

渠道类型：\`signal\`

使用 OpenClaw 网关 Signal 插件中配置的电话号码或群组 ID。

\`\`\`json
"observationFeed": {
  "enabled": true,
  "channel": "signal",
  "to": "+1234567890"
}
\`\`\`

#### WhatsApp

渠道类型：\`whatsapp\`

使用 OpenClaw 网关 WhatsApp 插件中配置的电话号码或群组 JID。

\`\`\`json
"observationFeed": {
  "enabled": true,
  "channel": "whatsapp",
  "to": "+1234567890"
}
\`\`\`

#### LINE

渠道类型：\`line\`

使用 LINE Developer Console 中的用户 ID 或群组 ID。

\`\`\`json
"observationFeed": {
  "enabled": true,
  "channel": "line",
  "to": "U1234567890abcdef"
}
\`\`\`

### 添加到配置

完整插件配置示例（以 Telegram 为例）：

\`\`\`json
{
  "plugins": {
    "claude-mem": {
      "enabled": true,
      "config": {
        "project": "my-project",
        "syncMemoryFile": true,
        "workerPort": 37777,
        "observationFeed": {
          "enabled": true,
          "channel": "telegram",
          "to": "123456789"
        }
      }
    }
  }
}
\`\`\`

### 重启并验证

重启网关。按顺序检查日志中的三行：

\`\`\`
[claude-mem] Observation feed starting — channel: telegram, target: 123456789
[claude-mem] Connecting to SSE stream at http://localhost:37777/stream
[claude-mem] Connected to SSE stream
\`\`\`

然后在任意 OpenClaw 聊天中运行 \`/claude_mem_feed\`：

\`\`\`
Claude-Mem Observation Feed
Enabled: yes
Channel: telegram
Target: 123456789
Connection: connected
\`\`\`

若 \`Connection\` 显示 \`connected\`，即完成。让智能体工作并观察流式推送到渠道。

## 命令参考

插件注册两个命令：

### /claude_mem_status

报告 worker 健康状态与当前会话状态。

\`\`\`
/claude_mem_status
\`\`\`

输出：
\`\`\`
Claude-Mem Worker Status
Status: ok
Port: 37777
Active sessions: 2
Observation feed: connected
\`\`\`

### /claude_mem_feed

显示观察流状态。接受可选 \`on\`/\`off\` 参数。

\`\`\`
/claude_mem_feed          — show status
/claude_mem_feed on       — request enable (update config to persist)
/claude_mem_feed off      — request disable (update config to persist)
\`\`\`

## 整体工作原理

\`\`\`
OpenClaw Gateway
  │
  ├── before_agent_start ──→ Sync MEMORY.md + Init session
  ├── tool_result_persist ──→ Record observation + Re-sync MEMORY.md
  ├── agent_end ────────────→ Summarize + Complete session
  └── gateway_start ────────→ Reset session tracking
                    │
                    ▼
         Claude-Mem Worker (localhost:37777)
           ├── POST /api/sessions/init
           ├── POST /api/sessions/observations
           ├── POST /api/sessions/summarize
           ├── POST /api/sessions/complete
           ├── GET  /api/context/inject ──→ MEMORY.md content
           └── GET  /stream ─────────────→ SSE → Messaging channels
\`\`\`

### MEMORY.md 实时同步

插件向每个智能体工作区写入包含完整观察时间线的 \`MEMORY.md\`，更新时机：
- 每次 \`before_agent_start\` — 智能体启动前获得最新上下文
- 每次 \`tool_result_persist\` — 智能体工作时保持上下文最新

更新为 fire-and-forget（非阻塞），智能体不会因等待 MEMORY.md 写入而停顿。

### 观察记录

每次工具使用（Read、Write、Bash 等）作为观察发送到 claude-mem worker。worker 的 AI 智能体将其处理为带标题、副标题、事实、概念与叙述的结构化观察。以 \`memory_\` 为前缀的工具会跳过以避免递归记录。

### 会话生命周期

- **\`before_agent_start\`** — 在 worker 中创建会话，同步 MEMORY.md。短提示（少于 10 字符）跳过会话初始化但仍同步。
- **\`tool_result_persist\`** — 记录观察（fire-and-forget），重新同步 MEMORY.md（fire-and-forget）。工具响应截断至 1000 字符。
- **\`agent_end\`** — 发送最后一条助手消息进行总结，然后完成会话。均为 fire-and-forget。
- **\`gateway_start\`** — 清除所有会话追踪（会话 ID、工作区映射），使智能体全新开始。

### 观察流

后台服务连接 worker 的 SSE 流，将 \`new_observation\` 事件转发到已配置的消息渠道。连接以指数退避自动重连（1 秒 → 最长 30 秒）。

## 故障排除

| 问题 | 检查项 |
|---------|---------------|
| Worker 健康检查失败 | bun 是否已安装？（\`bun --version\`）。37777 端口是否被占用？（\`lsof -i :37777\`）。尝试直接运行：\`bun plugin/scripts/worker-service.cjs start\` |
| 从 Claude Code 安装启动的 worker 无响应 | 检查 \`cd ~/.claude/plugins/marketplaces/thedotmack && npm run worker:status\`。可能需要 \`npm run worker:restart\`。 |
| 从克隆仓库启动的 worker 无响应 | 检查 \`cd /path/to/claude-mem && npm run worker:status\`。确保已运行 \`npm install && npm run build\`。 |
| 未出现 MEMORY.md | 确认 \`syncMemoryFile\` 未设为 \`false\`。验证智能体事件上下文包含 \`workspaceDir\`。 |
| 观察未被记录 | 检查网关日志中的 \`[claude-mem]\` 消息。worker 须在 localhost:37777 运行且可达。 |
| 观察流显示 \`disconnected\` | worker 的 \`/stream\` 端点不可达。检查 \`workerPort\` 与实际 worker 端口是否一致。 |
| 观察流显示 \`reconnecting\` | 连接断开。插件自动重连 — 等待最多 30 秒。 |
| 日志中出现 \`Unknown channel type\` | 渠道插件（如 telegram）未在网关上加载。确保渠道已配置并运行。 |
| 日志中出现 \`Observation feed disabled\` | 在配置中将 \`observationFeed.enabled\` 设为 \`true\`。 |
| 日志中出现 \`Observation feed misconfigured\` | \`observationFeed.channel\` 与 \`observationFeed.to\` 均为必填。 |
| No mes