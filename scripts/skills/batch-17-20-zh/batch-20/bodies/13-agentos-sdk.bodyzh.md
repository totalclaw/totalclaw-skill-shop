# AgentOS SDK 技能

## 概述
AgentOS 是面向 AI 智能体的完整问责基础设施。它提供持久化记忆、项目管理、看板、头脑风暴存储、活动日志、网状通信以及自我进化协议。

**适用场景：** 需要存储记忆、管理项目、跟踪任务、记录活动、与其他智能体通信，或在多次会话间演进自身行为时。

## 🆕 智能体操作指南
**请阅读 `AGENT-OPS.md`，获取在 AgentOS 上作为智能体运行的完整指南。** 内容包括：
- 记忆组织（路径、标签、重要性）
- 项目管理（创建、更新、跟踪）
- 看板工作流（任务、状态、优先级）
- 头脑风暴存储（想法、决策、学习）
- 日常操作（会话开始/结束检查清单）
- 自我进化协议

## 🆕 aos CLI - 完整仪表盘控制
`aos` CLI 让你完全控制 AgentOS 仪表盘：

```bash
# Memory
aos memory put "/learnings/today" '{"lesson": "verify first"}'
aos memory search "how to handle errors"

# Projects
aos project list
aos project create "New Feature" --status active

# Kanban
aos kanban add "Fix bug" --project <id> --status todo --priority high
aos kanban move <task-id> done

# Brainstorms
aos brainstorm add "Use WebSocket" --project <id> --type idea

# Activity logging
aos activity log "Completed API refactor" --project <id>

# Mesh communication
aos mesh send <agent> "Topic" "Message body"
```

运行 `aos help` 或 `aos <command>` 查看详细用法。

## Golden Sync（推荐）
为获得可靠的仪表盘（记忆 + 项目卡片），请运行：
```bash
~/clawd/bin/agentos-golden-sync.sh
```

此命令会同步记忆，并 upsert 各项目的 Markdown 卡片：
`TASKS.md`、`IDEAS.md`、`CHANGELOG.md`、`CHALLENGES.md` → DB → Brain Dashboard。

## 🏷️ 记忆分类（必填）

**每条记忆都必须正确分类。** 使用以下 8 个标准类别：

| 类别 | 颜色 | 用途 | 路径前缀 | 主标签 |
|----------|-------|---------|-------------|-------------|
| **Identity** | 🔴 Red | 你是谁、用户档案、团队结构 | `identity/` | `["identity", ...]` |
| **Knowledge** | 🟠 Orange | 事实、研究、文档 | `knowledge/` | `["knowledge", ...]` |
| **Memory** | 🟣 Purple | 长期记忆、学习、决策 | `memory/` | `["memory", ...]` |
| **Preferences** | 🔵 Blue | 用户偏好、设置、风格 | `preferences/` | `["preferences", ...]` |
| **Projects** | 🟢 Green | 进行中的工作、任务、代码上下文 | `projects/` | `["project", "<name>"]` |
| **Operations** | 🟤 Brown | 日常日志、状态、心跳状态 | `operations/` | `["operations", ...]` |
| **Secrets** | ⚪ Gray | 访问信息、服务器位置（非实际密钥！） | `secrets/` | `["secrets", ...]` |
| **Protocols** | 🔵 Cyan | SOP、检查清单、流程 | `protocols/` | `["protocols", ...]` |

### 路径结构
```
<category>/<subcategory>/<item>

Examples:
identity/user/ben-profile
knowledge/research/ai-agents-market
memory/learnings/2026-02-mistakes
preferences/user/communication-style
projects/agentos/tasks
operations/daily/2026-02-13
secrets/access/hetzner-server
protocols/deploy/agentos-checklist
```

### 标签规则
每条记忆必须包含：
1. **主类别标签** — 8 个类别之一
2. **子类别标签** — 更具体的分类
3. **可选项目标签** — 若与项目相关

```bash
# Example: Store a learning with proper tags
AOS_TAGS='["memory", "learnings"]' AOS_SEARCHABLE=true \
  aos_put "/memory/learnings/2026-02-13" '{"lesson": "Always categorize memories"}'

# Example: Store user preference
AOS_TAGS='["preferences", "user"]' \
  aos_put "/preferences/user/communication" '{"style": "direct, no fluff"}'
```

---

## 快速开始

```bash
# Set environment variables
export AGENTOS_API_KEY="your-api-key"
export AGENTOS_BASE_URL="http://178.156.216.106:3100"  # or https://api.agentos.software
export AGENTOS_AGENT_ID="your-agent-id"

# Source the SDK
source /path/to/agentos.sh

# Store a memory
aos_put "/memories/today" '{"learned": "something important"}'

# Retrieve it
aos_get "/memories/today"

# Search semantically
aos_search "what did I learn today"
```

## 配置

| 变量 | 必填 | 说明 |
|----------|----------|-------------|
| `AGENTOS_API_KEY` | 是 | 来自 agentos.software 仪表盘的 API 密钥 |
| `AGENTOS_BASE_URL` | 是 | API 端点（默认：`http://178.156.216.106:3100`） |
| `AGENTOS_AGENT_ID` | 是 | 本智能体实例的唯一标识符 |

## 核心 API 函数

### aos_put - 存储记忆
```bash
aos_put <path> <value_json> [options]

# Options (as env vars before call):
#   AOS_TTL=3600          # Expire after N seconds
#   AOS_TAGS='["tag1"]'   # JSON array of tags
#   AOS_IMPORTANCE=0.8    # 0-1 importance score
#   AOS_SEARCHABLE=true   # Enable semantic search

# Examples:
aos_put "/learnings/2026-02-04" '{"lesson": "Always verify before claiming done"}'
AOS_SEARCHABLE=true aos_put "/facts/solana" '{"info": "Solana uses proof of history"}'
AOS_TTL=86400 aos_put "/cache/price" '{"sol": 120.50}'
```

### aos_get - 检索记忆
```bash
aos_get <path>

# Returns JSON: {"found": true, "path": "...", "value": {...}, "version_id": "...", "created_at": "..."}
# Or: {"found": false}

aos_get "/learnings/2026-02-04"
```

### aos_search - 语义搜索
```bash
aos_search <query> [limit] [path_prefix]

# Returns ranked results by semantic similarity
# Only searches memories marked as searchable=true

aos_search "what mistakes have I made" 10
aos_search "solana facts" 5 "/facts"
```

### aos_delete - 删除记忆
```bash
aos_delete <path>

# Creates a tombstone version (soft delete, keeps history)
aos_delete "/cache/old-data"
```

### aos_list - 列出子项
```bash
aos_list <prefix>

# Returns direct children under a path
aos_list "/learnings"
# → {"items": [{"path": "/learnings/2026-02-04", "type": "file"}, ...]}
```

### aos_glob - 模式匹配
```bash
aos_glob <pattern>

# Supports * and ** wildcards
aos_glob "/learnings/*"           # Direct children
aos_glob "/memories/**"           # All descendants
aos_glob "/projects/*/config"     # Wildcard segments
```

### aos_history - 版本历史
```bash
aos_history <path> [limit]

# Returns all versions of a memory (for time travel)
aos_history "/config/settings" 20
```

### aos_agents - 列出所有智能体
```bash
aos_agents

# Returns all agent IDs in your tenant with memory counts
# Useful for discovering other agent instances
```

### aos_dump - 批量导出
```bash
aos_dump [agent_id] [limit]

# Export all memories for an agent (default: current agent)
aos_dump "" 500
```

## 自我进化框架

**完整自我进化指南请参阅 [SELF-EVOLUTION.md](./SELF-EVOLUTION.md)。**

AgentOS 让智能体通过以下方式每天变得更聪明：
- **错误跟踪** — 永不重复同一错误
- **问题注册表** — 为日后查阅索引解决方案
- **任务前检查** — 行动前先搜索过往学习
- **进度检查点** — 防压缩记忆保存
- **验证日志** — 证明任务确实已完成

### 快速开始：自我进化

```bash
# Before any task: check past learnings
aos_before_action "deployment"

# After a mistake: document it
aos_mistake "What happened" "Root cause" "Lesson learned" "severity"

# After solving a problem: register it
aos_problem_solved "OAuth 401 Error" "JWT format mismatch" "Added JWT branch to auth" "auth,oauth"

# After completing work: save progress
aos_save_progress "Deployed API v2" "success" "JWT auth now working"

# Every 15-20 min: checkpoint context
aos_checkpoint "Building payment flow" "Stripe webhook incomplete" "Test mode works"

# At session start: restore context
aos_session_start

# Run the evolution checklist
aos_evolve_check
```

### 核心函数

| 函数 | 用途 |
|----------|---------|
| `aos_before_action` | 行动前检查错误/解决方案 |
| `aos_mistake` | 记录失败与教训 |
| `aos_problem_solved` | 注册已解决的问题 |
| `aos_check_solved` | 搜索类似已解决问题 |
| `aos_save_progress` | 记录已完成任务（防压缩） |
| `aos_checkpoint` | 保存工作状态（每 15–20 分钟） |
| `aos_session_start` | 会话开始时恢复上下文 |
| `aos_verify_logged` | 记录验证证据 |
| `aos_daily_summary` | 回顾今日工作 |
| `aos_evolve_check` | 显示进化检查清单 |

### 推荐记忆结构

```
/self/
  identity.json       # Who am I? Core traits, values
  capabilities.json   # What can I do? Skills, tools
  preferences.json    # How do I prefer to work?
  
/learnings/
  YYYY-MM-DD.json     # Daily learnings
  mistakes/           # Documented failures
  successes/          # What worked well
  
/patterns/
  communication/      # How to talk to specific people
  problem-solving/    # Approaches that work
  tools/              # Tool-specific knowledge
  
/relationships/
  <person-id>.json    # Context about people I work with
  
/projects/
  <project-name>/     # Project-specific context
    context.json
    decisions.json
    todos.json

/reflections/
  weekly/             # Weekly self-assessments
  monthly/            # Monthly reviews
```

### 自我反思协议

完成重要任务后，存储反思内容：

```bash
# After a mistake
aos_put "/learnings/mistakes/$(date +%Y-%m-%d)-$(uuidgen | cut -c1-8)" '{
  "type": "mistake",
  "what_happened": "I claimed a task was done without verifying",
  "root_cause": "Rushed to respond, skipped verification step",
  "lesson": "Always verify state before claiming completion",
  "prevention": "Add verification checklist to task completion flow",
  "severity": "high",
  "timestamp": "'$(date -Iseconds)'"
}' 

# Mark as searchable so you can find it later
AOS_SEARCHABLE=true AOS_TAGS='["mistake","verification","lesson"]' \
aos_put "/learnings/mistakes/..." '...'
```

### 自我改进循环

```bash
# 1. Before starting work, recall relevant learnings
aos_search "mistakes I've made with $TASK_TYPE" 5

# 2. After completing work, reflect
aos_put "/learnings/$(date +%Y-%m-%d)" '{
  "tasks_completed": [...],
  "challenges_faced": [...],
  "lessons_learned": [...],
  "improvements_identified": [...]
}'

# 3. Periodically consolidate learnings
aos_search "lessons from the past week" 20
# Then synthesize and store in /reflections/weekly/
```

## 实时同步（WebSocket）

连接以在记忆变更时接收实时更新：

```javascript
const ws = new WebSocket('ws://178.156.216.106:3100');

ws.onopen = () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    token: process.env.AGENTOS_API_KEY
  }));
  
  // Subscribe to updates for your agent
  ws.send(JSON.stringify({
    type: 'subscribe',
    agent_id: 'your-agent-id'
  }));
};

ws.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  
  if (msg.type === 'memory:created') {
    console.log('New memory:', msg.path, msg.value);
  }
  
  if (msg.type === 'memory:deleted') {
    console.log('Memory deleted:', msg.path);
  }
};
```

### WebSocket 事件

| 事件 | 载荷 | 说明 |
|-------|---------|-------------|
| `memory:created` | `{agentId, path, versionId, value, tags, createdAt}` | 新记忆已存储 |
| `memory:deleted` | `{agentId, path, versionId, deletedAt}` | 记忆已删除 |

## Webhook 集成

注册 webhook，在记忆变更时接收 HTTP 回调：

```bash
# Register a webhook (via dashboard or API)
curl -X POST "$AGENTOS_BASE_URL/v1/webhooks" \
  -H "Authorization: Bearer $AGENTOS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-server.com/agentos-webhook",
    "events": ["memory:created", "memory:deleted"],
    "agent_id": "your-agent-id",
    "path_prefix": "/learnings"
  }'
```

### Webhook 载荷

```json
{
  "event": "memory:created",
  "timestamp": "2026-02-04T09:50:00Z",
  "data": {
    "tenant_id": "...",
    "agent_id": "your-agent-id",
    "path": "/learnings/2026-02-04",
    "version_id": "...",
    "value": {"lesson": "..."},
    "tags": ["learning"],
    "created_at": "..."
  },
  "signature": "sha256=..."
}
```

## 速率限制与配额

| 操作 | 默认限制 |
|-----------|---------------|
| 读操作（get、list、glob、history） | 60/分钟 |
| 写操作（put、delete） | 60/分钟 |
| 搜索操作 | 20/分钟 |
| WebSocket 连接 | 每租户 5 个 |

## 心跳上下文备份协议（关键）

**使用 AgentOS 的每个智能体都必须在每次心跳时执行强制上下文备份。**

### 为何需要
- AI 智能体在会话压缩时会丢失上下文
- 「每个任务后记得备份」行不通 — 智能体会忘记
- 由心跳驱动的备份确保上下文永不丢失

### Clawdbot 配置

在 `clawdbot.json` 中将心跳设为 10 分钟：

```json
{
  "agents": {
    "defaults": {
      "heartbeat": {
        "every": "10m",
        "model": "anthropic/claude-3-5-haiku-latest"
      }
    }
  }
}
```

### HEARTBEAT.md 模板

将以下内容添加到工作区的 `HEARTBEAT.md`：

```markdown
## 🔴 MANDATORY: Context Backup (DO THIS FIRST)

**On EVERY heartbeat, before anything else:**

1. **Read:** CONTEXT.md + today's daily notes + yesterday's daily notes
2. **Update CONTEXT.md** with:
   - Current timestamp
   - What's happening in the session
   - Recent accomplishments
   - Active tasks
   - Important conversation notes
3. **Update daily notes** (`memory/daily/YYYY-MM-DD.md`) with significant events
4. **Only then** proceed with other heartbeat checks

This is a HARD RULE. Never skip this step.
```

### AGENTS.md 硬性规则

将以下内容添加到 `AGENTS.md`：

```markdown
## HARD RULE: Context Backup on EVERY Heartbeat

**Every single heartbeat MUST include a context backup.** No exceptions.

### Protocol (MANDATORY on every heartbeat)

1. **Read current state:**
   - CONTEXT.md
   - Today's daily notes (`memory/daily/YYYY-MM-DD.md`)
   - Yesterday's daily notes (for continuity)

2. **Update CONTEXT.md with:**
   - Current session focus
   - Recent accomplishments (what just happened)
   - Active tasks/threads
   - Important notes from conversation
   - Timestamp of update

3. **Update daily notes with:**
   - Significant events
   - Decisions made
   - Tasks completed
   - Context that might be needed later

4. **Only THEN proceed with other heartbeat tasks**

### Heartbeat Frequency
Heartbeats should run every **10 minutes** to ensure context is preserved frequently.

### The Golden Rule
**If you wouldn't remember it after a restart, write it down NOW.**
```

### AgentOS 集成

在每次心跳时将 CONTEXT.md 同步到 AgentOS：

```bash
# In your heartbeat routine, after updating local files:
aos_put "/context/current" "$(cat CONTEXT.md)"
aos_put "/daily/$(date +%Y-%m-%d)" "$(cat memory/daily/$(date +%Y-%m-%d).md)"
```

这样可确保上下文在本地和 AgentOS 云端均有备份。

---

## 最佳实践

### 1. 使用有意义的路径
```bash
# Good - hierarchical, descriptive
aos_put "/projects/raptor/decisions/2026-02-04-architecture" '...'

# Bad - flat, ambiguous
aos_put "/data123" '...'
```

### 2. 为重要内容打标签
```bash
AOS_TAGS='["decision","architecture","raptor"]' \
AOS_SEARCHABLE=true \
aos_put "/projects/raptor/decisions/..." '...'
```

### 3. 对临时数据使用 TTL
```bash
# Cache that expires in 1 hour
AOS_TTL=3600 aos_put "/cache/api-response" '...'
```

### 4. 先搜索再提问
```bash
# Before asking user for info, check memory
result=$(aos_search "user preferences for $TOPIC" 3)
```

### 5. 对重要变更保留版本
```bash
# Check history before overwriting
aos_history "/config/critical-setting" 5
# Then update
aos_put "/config/critical-setting" '...'
```

## 故障排除

### 「Unauthorized」错误
- 检查 `AGENTOS_API_KEY` 是否设置正确
- 确认密钥具备所需作用域（`memory:read`、`memory:write`、`search:read`）

### 搜索结果为空
- 确保记忆以 `searchable=true` 存储
- 检查嵌入是否已生成（可能需要几秒钟）

### 速率限制错误
- 实现指数退避
- 尽可能批量操作
- 检查 `X-PreAuth-RateLimit-Remaining` 响应头

## 网状通信（智能体间）

AgentOS Mesh 支持 AI 智能体之间的实时通信。

### Mesh 函数

```bash
# Send a message to another agent
aos_mesh_send <to_agent> <topic> <body>

# Get inbox messages (sent to you)
aos_mesh_inbox [limit]

# Get outbox messages (sent by you)
aos_mesh_outbox [limit]

# Check for locally queued messages (from daemon)
aos_mesh_pending

# Process queued messages (returns JSON, clears queue)
aos_mesh_process

# List all agents on the mesh
aos_mesh_agents

# Create a task for another agent
aos_mesh_task <assigned_to> <title> [description]

# List tasks assigned to you
aos_mesh_tasks [status]

# Get mesh overview stats
aos_mesh_stats

# Get recent activity feed
aos_mesh_activity [limit]

# Check mesh connection status
aos_mesh_status
```

### 示例：发送消息

```bash
# Send a message to another agent
aos_mesh_send "kai" "Project Update" "Finished the API integration, ready for review"

# Send with context
aos_mesh_send "icarus" "Research Request" "Please analyze the latest DeFi trends on Solana"
```

### 示例：处理收到的消息

```bash
# Check if there are pending messages
aos_mesh_pending

# Process and respond to messages
messages=$(aos_mesh_process)
echo "$messages" | jq -r '.[] | "From: \(.from) - \(.topic)"'

# Respond to each message
aos_mesh_send "kai" "Re: Project Update" "Thanks for the update, looks good!"
```

### 实时 Mesh 守护进程

为实时接收消息，请运行 mesh 守护进程：

```bash
node ~/clawd/bin/mesh-daemon.mjs
```

守护进程通过 WebSocket 连接，并将收到的消息排队待处理。

### Mesh 事件（WebSocket）

| 事件 | 载荷 | 说明 |
|-------|---------|-------------|
| `mesh:message` | `{fromAgent, toAgent, topic, body, messageId}` | 收到新消息 |
| `mesh:task_update` | `{taskId, assignedTo, title, status}` | 任务状态已变更 |

### CLI 快捷方式

也可使用独立 CLI：

```bash
~/clawd/bin/mesh status    # Connection status
~/clawd/bin/mesh pending   # List pending messages
~/clawd/bin/mesh send <to> "<topic>" "<body>"
~/clawd/bin/mesh agents    # List agents
```

## API 参考

完整 OpenAPI 规范见：`$AGENTOS_BASE_URL/docs`

---

*AgentOS - 面向持续进化的 AI 智能体的持久化记忆与网状通信*
