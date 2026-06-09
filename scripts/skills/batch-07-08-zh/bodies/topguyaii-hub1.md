# OpenClawdy

**自主智能体的记忆基础设施**

为智能体提供跨会话持久的记忆。存储事实、偏好、决策与学习 — 需要时语义召回。高级功能含声誉追踪、跨智能体记忆池与时间旅行快照。

## 安装

```bash
openclaw skill install openclawdy
```

或加入智能体配置：
```yaml
skills:
  - url: https://openclawdy.xyz/SKILL.md
    name: openclawdy
```

## 认证

OpenClawdy 使用钱包认证。智能体钱包地址即唯一身份 — 无需 API 密钥。

使用记忆工具前，确保智能体已配置钱包。每个钱包拥有独立记忆库。

---

## 核心工具

### memory_store

存储信息供日后检索。

**参数：**
- `content`（必需）：要记住的信息
- `type`（可选）：记忆类别 — `fact`、`preference`、`decision`、`learning`、`history`、`context` 之一。默认：`fact`
- `tags`（可选）：组织用标签数组

**示例：**
```
Store this as a preference: User prefers TypeScript over JavaScript for all new projects
```

```
Remember this fact with tags ["project", "tech-stack"]: The current project uses Next.js 14 with PostgreSQL
```

**响应：**
```json
{
  "success": true,
  "data": {
    "id": "mem_abc123",
    "content": "User prefers TypeScript over JavaScript",
    "type": "preference",
    "tags": [],
    "createdAt": "2025-02-10T12:00:00Z"
  }
}
```

---

### memory_recall

用语义搜索检索相关记忆。按含义而非仅关键词查找。

**参数：**
- `query`（必需）：搜索内容
- `limit`（可选）：最多返回条数（1–20）。默认：5
- `type`（可选）：按记忆类型过滤

**示例：**
```
Recall memories about programming language preferences
```

```
What do I know about the user's coding style? Limit to 3 results.
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "mem_abc123",
      "content": "User prefers TypeScript over JavaScript",
      "type": "preference",
      "relevance": 0.95,
      "createdAt": "2025-02-10T12:00:00Z"
    }
  ]
}
```

---

### memory_list

列出最近记忆（无语义搜索）。

**参数：**
- `type`（可选）：按记忆类型过滤
- `limit`（可选）：最多条数（1–100）。默认：20
- `offset`（可选）：分页偏移。默认：0

**示例：**
```
List my recent memories
```

```
Show all preference memories, limit 10
```

---

### memory_delete

按 ID 删除指定记忆。

**参数：**
- `id`（必需）：要删除的记忆 ID

**示例：**
```
Delete memory mem_abc123
```

---

### memory_clear

清空库中全部记忆。**慎用 — 不可撤销。**

**示例：**
```
Clear all my memories (I confirm this action)
```

---

### memory_export

导出全部记忆为 JSON 备份。

**示例：**
```
Export all my memories
```

---

### memory_stats

获取智能体使用统计。

**示例：**
```
Show my memory usage stats
```

**响应：**
```json
{
  "success": true,
  "data": {
    "address": "0x1234...",
    "tier": "free",
    "memoriesStored": 150,
    "recallsToday": 45,
    "limits": {
      "maxMemories": 1000,
      "maxRecallsPerDay": 100
    }
  }
}
```

---

## 高级工具

### memory_reputation

**追踪哪些记忆带来好结果。** 以声誉分存储记忆，按成功/失败更新，按 proven 有效性排序召回。

**操作：**

#### store_ranked
以初始声誉分存储记忆。

**参数：**
- `action`: `store_ranked`
- `content` (required): The information to store
- `type` (optional): Memory type. Default: `fact`
- `reputation`（可选）：初始分 0.0–1.0。默认：0.5

**示例：**
```
Store ranked memory: "Use retry logic for API calls" with reputation 0.8
```

#### recall_ranked
按声誉排序检索（最有效优先）。

**参数：**
- `action`: `recall_ranked`
- `query`（必需）：搜索内容

**示例：**
```
Recall ranked memories about error handling strategies
```

**响应：**
```json
{
  "success": true,
  "data": [
    {
      "id": "mem_xyz",
      "content": "Use exponential backoff for retries",
      "reputation": 0.92,
      "usage_count": 15,
      "success_rate": 0.93
    }
  ]
}
```

#### update_reputation
根据结果更新记忆声誉。

**参数：**
- `action`: `update_reputation`
- `memory_id` (required): The memory to update
- `outcome`（必需）：`success`、`failure` 或 `neutral`
- `impact`（可选）：此次结果权重（0.0–1.0）

**示例：**
```
Update reputation for mem_xyz: outcome was success
```

---

### memory_pool

**跨智能体记忆池** — 多智能体共享知识。创建池、存储共享记忆、从集体智能召回。适合智能体团队与集群。

**操作：**

#### create
创建新共享记忆池。

**参数：**
- `action`: `create`
- `pool_name`（必需）：池名称

**示例：**
```
Create memory pool: "research-team"
```

**响应：**
```json
{
  "success": true,
  "data": {
    "pool_id": "pool_abc123",
    "name": "research-team",
    "created_at": "2025-02-10T12:00:00Z"
  }
}
```

#### store
在共享池中存储记忆。

**参数：**
- `action`: `store`
- `pool_id`（必需）：池 ID
- `content` (required): Information to share
- `type` (optional): Memory type

**示例：**
```
Store in pool pool_abc123: "Found bug in authentication module - fix applied"
```

#### recall
在共享池中搜索记忆。

**参数：**
- `action`: `recall`
- `pool_id`（必需）：池 ID
- `query`（必需）：搜索内容

**示例：**
```
Recall from pool pool_abc123: authentication issues
```

#### list
列出所有可访问池。

**参数：**
- `action`: `list`

**示例：**
```
List my memory pools
```

---

### memory_snapshot

**记忆时间旅行** — 快照与恢复智能体记忆状态。查看过去状态调试决策、对比变化、恢复检查点。高利害智能体必备。

**操作：**

#### create
为当前记忆状态创建快照。

**参数：**
- `action`: `create`
- `name`（必需）：快照描述名

**示例：**
```
Create memory snapshot: "before-major-update"
```

**响应：**
```json
{
  "success": true,
  "data": {
    "snapshot_id": "snap_abc123",
    "name": "before-major-update",
    "memory_count": 150,
    "created_at": "2025-02-10T12:00:00Z"
  }
}
```

#### restore
从快照恢复记忆状态。

**参数：**
- `action`: `restore`
- `snapshot_id` (required): The snapshot to restore
- `mode`（可选）：`read_only`（仅查看）或 `overwrite`（替换当前）。默认：`read_only`

**示例：**
```
Restore snapshot snap_abc123 in read_only mode
```

#### list
列出所有快照。

**参数：**
- `action`: `list`

**示例：**
```
List my memory snapshots
```

#### compare
对比两快照或快照与当前状态。

**参数：**
- `action`: `compare`
- `snapshot_id` (required): First snapshot
- `compare_to`（可选）：第二快照 ID 或 `current`。默认：`current`

**示例：**
```
Compare snapshot snap_abc123 to current state
```

**响应：**
```json
{
  "success": true,
  "data": {
    "added": 12,
    "removed": 3,
    "modified": 5,
    "unchanged": 130,
    "diff": [...]
  }
}
```

---

## 记忆类型

| 类型 | 用途 | 示例 |
|------|---------|---------|
| `fact` | 客观信息 | "项目使用 Next.js 14" |
| `preference` | 用户/智能体偏好 | "用户偏好深色模式" |
| `decision` | 过往决策 | "选择 PostgreSQL 而非 MongoDB" |
| `learning` | 学到的教训 | "此 API 需要 auth 头" |
| `history` | 历史事件 | "1 月 15 日部署 v2.1" |
| `context` | 一般上下文 | "在做电商项目" |

## 最佳实践

### 何时存储
- 用户陈述偏好 → 存为 `preference`
- 重要决策 → 存为 `decision`
- 学到新知 → 存为 `learning`
- 关键项目事实 → 存为 `fact`

### 何时召回
- 新会话开始 → 召回近期上下文
- 提建议前 → 查偏好
- 遇到类似问题 → 查学习记录

### 使用声誉
- 行动成功 → `outcome: success` 更新
- 方法失败 → `outcome: failure` 更新
- 召回策略 → 用 `recall_ranked` 取 proven 方法

### 使用记忆池
- 多智能体协作 → 建共享池
- 多智能体受益的知识 → 存入池
- 寻求集体智慧 → 从池召回

### 使用快照
- 重大变更前 → 建快照
- 调试异常行为 → 与过去状态对比
- 回滚错误 → 从快照恢复

### 示例工作流

```
# Session 1: User mentions preference
User: "I always want you to use TypeScript"
Agent: [Stores as preference: "User prefers TypeScript for all code"]

# Session 2: New task
User: "Create a new API endpoint"
Agent: [Recalls preferences about coding]
Agent: "I'll create this in TypeScript based on your preference."

# Session 3: Learning from outcome
Agent: [Used retry logic, it worked]
Agent: [Updates reputation: memory_id=mem_xyz, outcome=success]

# Session 4: Making decisions
Agent: [Recalls ranked memories about error handling]
Agent: [Uses highest-reputation approach first]
```

## 定价

| 套餐 | 记忆数 | 召回/天 | 池 | 快照 | 价格 |
|------|----------|-------------|-------|-----------|-------|
| 免费 | 1,000 | 100 | 1 | 3 | $0 |
| Pro | 50,000 | 不限 | 10 | 50 | $10/月 |
| 企业 | 不限 | 不限 | 不限 | 不限 | 定制 |

## API 端点

Base URL: `https://openclawdy.xyz/api`

### 核心端点
| 方法 | 端点 | 说明 |
|--------|----------|-------------|
| POST | `/memory/store` | 存储记忆 |
| POST | `/memory/recall` | 语义搜索 |
| GET | `/memory/list` | 列出记忆 |
| GET | `/memory/{id}` | 获取指定记忆 |
| DELETE | `/memory/{id}` | 删除记忆 |
| GET | `/memory/vault` | 导出全部 |
| DELETE | `/memory/vault` | 清空库 |
| GET | `/agent/stats` | 使用统计 |

### 声誉端点
| 方法 | 端点 | 说明 |
|--------|----------|-------------|
| POST | `/memory/reputation/store` | Store with reputation |
| POST | `/memory/reputation/recall` | Recall by reputation |
| POST | `/memory/reputation/update` | Update reputation |

### 记忆池端点
| 方法 | 端点 | 说明 |
|--------|----------|-------------|
| POST | `/memory/pool/create` | Create pool |
| POST | `/memory/pool/store` | Store in pool |
| POST | `/memory/pool/recall` | Recall from pool |
| GET | `/memory/pool/list` | List pools |

### 快照端点
| 方法 | 端点 | 说明 |
|--------|----------|-------------|
| POST | `/memory/snapshot/create` | Create snapshot |
| POST | `/memory/snapshot/restore` | Restore snapshot |
| GET | `/memory/snapshot/list` | List snapshots |
| POST | `/memory/snapshot/compare` | Compare snapshots |

## 认证 Headers

所有请求需钱包签名认证：

```
X-Agent-Address: 0x...      # Your wallet address
X-Agent-Signature: 0x...    # Signed message
X-Agent-Timestamp: 123...   # Unix timestamp (ms)
```

待签名消息格式：
```
OpenClawdy Auth
Timestamp: {timestamp}
```

## ACP 集成

OpenClawdy 在 Agent Commerce Protocol (ACP) 上可用。其他智能体可直接购买记忆服务：

| 服务 | 费用 | 说明 |
|---------|-----|-------------|
| memory_store | $0.01 | 存储记忆 |
| memory_recall | $0.02 | 语义搜索 |
| memory_reputation | $0.02 | 声誉操作 |
| memory_pool | $0.03 | 池操作 |
| memory_snapshot | $0.05 | 快照操作 |

## 支持

- 网站：https://openclawdy.xyz
- Twitter：@openclawdy
- ACP 智能体：OpenClawdy Memory

## 许可证

MIT
