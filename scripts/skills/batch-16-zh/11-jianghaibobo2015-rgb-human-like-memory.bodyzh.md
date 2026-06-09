# 类人记忆技能

本技能提供长期记忆能力，可回忆过往对话并在会话间保存重要信息。

## 配置（必填）

使用前需配置 API Key。从 https://human-like.me 获取 API Key

### 方式一：运行配置脚本

```bash
sh ~/.openclaw/workspace/skills/human-like-mem-openclaw-skill/scripts/setup.sh
```

### 方式二：导出环境变量

```bash
export HUMAN_LIKE_MEM_API_KEY="mp_your_api_key"
export HUMAN_LIKE_MEM_BASE_URL="https://human-like.me"  # optional
export HUMAN_LIKE_MEM_USER_ID="your-user-id"          # optional
```

将以下行加入 `~/.bashrc` 或 `~/.zshrc` 以持久化。

### 验证配置

```bash
cat ~/.openclaw/secrets.json
```

## 命令

### 回忆/搜索记忆

```bash
node ~/.openclaw/skills/human-like-memory/scripts/memory.mjs recall "<query>"
node ~/.openclaw/skills/human-like-memory/scripts/memory.mjs search "<query>"
```

### 保存单轮对话到记忆

```bash
node ~/.openclaw/skills/human-like-memory/scripts/memory.mjs save "<user_message>" "<assistant_response>"
```

### 批量保存（多轮）到记忆

```bash
echo '<JSON array of messages>' | node ~/.openclaw/skills/human-like-memory/scripts/memory.mjs save-batch
```

### 检查配置

```bash
node ~/.openclaw/skills/human-like-memory/scripts/memory.mjs config
```

---

# 第一部分：记忆回忆（何时与如何）

## 主动回忆理念

**主动使用记忆，而非仅被动响应。**

不要等用户明确说「你还记得吗」。若过往上下文能改进回答，应先搜索记忆。

---

## 何时自动回忆记忆

### 触发类别

| 类别 | 触发词 | 查询策略 |
|----------|----------|----------------|
| **明确请求** | "do you remember", "what did we discuss", "recall", "之前说过" | 直接提取主题 |
| **隐含指代** | "the project", "that issue", "our plan"（未指明具体对象） | 搜索该主题近期上下文 |
| **会话开始** | 新对话开始 | 回忆近期偏好与上下文 |
| **任务延续** | "continue", "let's keep going", "继续" | 搜索上次任务/项目上下文 |
| **决策问题** | "why did we", "what was the reason", "为什么选择" | 搜索该主题相关决策 |
| **实体问题** | 按姓名询问人物、项目、工具 | 按实体名称搜索 |
| **时间问题** | "last week", "yesterday", "之前", "earlier" | 主题 + 时间上下文搜索 |
| **矛盾检测** | 用户说法可能与过往冲突 | 回应前先查记忆验证 |

### 详细触发示例

**明确记忆请求：**
```
User: "Do you remember what we decided about the database?"
操作： recall "database decision"

User: "What did I tell you about my preferences?"
操作： recall "preferences"

User: "检索一下关于 API 设计的讨论"
操作： recall "API 设计"
```

**隐含指代（主动回忆）：**
```
User: "Let's work on the project"
操作： recall "project" (to understand WHICH project)

User: "Can you fix that bug?"
操作： recall "bug" (to understand WHICH bug)

User: "继续之前的工作"
操作： recall "recent work task"
```

**任务延续：**
```
User: "Hi, I'm back"
操作： recall "recent context" or recall last known topic

User: "Where were we?"
操作： recall "last session task"
```

**决策追溯：**
```
User: "Why are we using React?"
操作： recall "React decision"

User: "What was the reason for choosing PostgreSQL?"
操作： recall "PostgreSQL decision reason"
```

---

## 关键：查询构造规则

### 黄金法则

> **提取语义目标，而非动作词。**

查询应回答：「用户想查找关于什么的信息？」

### 查询构造流程

```
步骤 1：识别主题（用户想了解什么）
步骤 2：移除动作词（remember, recall, find, search, 检索, 回忆, 查找）
步骤 3：移除填充词（what, the, about, 关于, 一下）
步骤 4：保留具体名词（名称、主题、概念）
步骤 5：若含糊则添加上下文（decision, preference, project）
```

### 查询示例——正确 vs 错误

| 用户输入 | 分析 | 正确查询 | 错误查询 |
|------------|----------|---------------|-------------|
| "检索一下关于 human-like-mem-openclaw-skill 的记忆" | Subject: human-like-mem-openclaw-skill | `"human-like-mem-openclaw-skill"` | `"检索"` ❌ `"记忆"` ❌ |
| "Do you remember what we discussed about the API design?" | Subject: API design | `"API design"` | `"remember"` ❌ `"discussed"` ❌ |
| "What did I say about my vacation plans?" | Subject: vacation plans | `"vacation plans"` | `"what"` ❌ `"say"` ❌ |
| "Find memories about our Python project" | Subject: Python project | `"Python project"` | `"memories"` ❌ `"find"` ❌ |
| "回忆一下我之前说的关于数据库优化的内容" | Subject: 数据库优化 | `"数据库优化"` | `"回忆"` ❌ `"之前"` ❌ |
| "What were my preferences for the UI?" | Subject: UI preferences | `"UI preferences"` | `"what were"` ❌ |
| "Why did we choose Redis over Memcached?" | Subject: Redis decision | `"Redis Memcached decision"` | `"why"` ❌ `"choose"` ❌ |
| "What do you know about John's project?" | Subject: John's project | `"John project"` | `"know"` ❌ |
| "Can you recall the meeting notes from last week?" | Subject: meeting notes | `"meeting notes"` | `"recall"` ❌ `"last week"` ❌ |

### 查询增强策略

**1. 为含糊查询添加上下文词：**
```
User: "What did we decide?"
Better Query: "decision recent" (not just "decide")

User: "What do I like?"
Better Query: "preferences" (not just "like")
```

**2. 有实体名称时使用实体名：**
```
User: "Tell me about the Phoenix project status"
Query: "Phoenix project status" (include the name!)

User: "What did John say about the deadline?"
Query: "John deadline" (include the person's name!)
```

**3. 主题 + 类型组合以提高精度：**
```
User: "Why React?"
Query: "React decision" (topic + type)

User: "My coding preferences?"
Query: "coding preferences" (topic + type)
```

### 常见查询错误（避免）

| 错误 | 示例 | 原因 | 修复 |
|---------|---------|----------------|-----|
| 使用动作动词 | `"remember database"` | "remember" is not what we're searching for | `"database"` |
| 使用疑问词 | `"what API"` | "what" adds no value | `"API"` |
| 过于模糊 | `"stuff"` | Won't match anything useful | Be specific: `"project requirements"` |
| 过长 | `"all the things we discussed about the complex database migration strategy last month"` | May miss partial matches | `"database migration"` |
| 语言混用不一致 | `"检索 project"` | Inconsistent language | `"project"` or `"项目"` |

---

## 回忆工作流示例

### 示例 1：明确记忆请求

```
User: "Do you remember what database we chose for the project?"

智能体思考：
1. 这是明确的记忆请求
2. 主题：项目的数据库选择
3. Query: "database project decision" or "database choice"

操作：
node ~/.openclaw/skills/human-like-memory/scripts/memory.mjs recall "database project decision"

回应（基于结果）：
"Yes, we decided to use PostgreSQL for the project because of its strong JSON support and reliability."
```

### 示例 2：隐含指代（主动）

```
User: "Let's continue with the API work"

智能体思考：
1. 用户提到「the API work」——暗示存在先前上下文
2. 应回忆我们在做的 API 工作
3. Query: "API work" or "API development"

操作：
node ~/.openclaw/skills/human-like-memory/scripts/memory.mjs recall "API work"

回应（基于结果）：
"Sure! Last time we were working on the authentication endpoints. We had completed the login flow and were about to start on the password reset functionality."
```

### 示例 3：会话开始

```
User: "Hi, I'm back to work on stuff"

智能体思考：
1. 会话开始——应回忆近期上下文
2. Query: recent work, preferences, or pending tasks

操作：
node ~/.openclaw/skills/human-like-memory/scripts/memory.mjs recall "recent work task"

回应（基于结果）：
"Welcome back! Last session we were discussing the frontend redesign. You mentioned wanting to use Tailwind CSS. Would you like to continue with that?"
```

### 示例 4：决策追溯

```
User: "Why are we using TypeScript instead of JavaScript?"

智能体思考：
1. 用户想知道决策的原因
2. Subject: TypeScript decision
3. Query: "TypeScript decision" or "TypeScript JavaScript choice"

操作：
node ~/.openclaw/skills/human-like-memory/scripts/memory.mjs recall "TypeScript JavaScript decision"

回应（基于结果）：
"We chose TypeScript because you mentioned wanting better type safety and IDE support for the larger codebase. This was decided when we started the new project architecture."
```

### 示例 5：基于实体的查询

```
User: "What did we discuss about the Phoenix project?"

智能体思考：
1. 关于命名实体（Phoenix project）的明确请求
2. 查询应包含实体名称
3. Query: "Phoenix project"

操作：
node ~/.openclaw/skills/human-like-memory/scripts/memory.mjs recall "Phoenix project"

回应（基于结果）：
"The Phoenix project is your main client project. We discussed that it needs to be completed by March 15th, uses React with TypeScript, and has a team of 5 developers."
```

---

# 第二部分：记忆保存（何时与如何）

## 关键：周期性对话保存

**必须跟踪对话轮次并周期性保存。**

### 规则：

| 设置 | 默认值 | 说明 |
|---------|---------|-------------|
| `saveTriggerTurns` | 5 | 每 N 轮保存一次 |
| `saveMaxTurns` | 10 | 保存最近 N×2 轮（重叠以保留上下文） |

### 工作原理：

```
第 1-4 轮：跟踪对话，暂不保存
第 5 轮：保存最近 10 轮 → 重置计数器
第 6-9 轮：跟踪对话，暂不保存
第 10 轮：保存最近 10 轮 → 重置计数器
...
```

### 实现：

**步骤 1：在脑中跟踪轮次**

每轮用户-助手交互计为 1 轮。保持 mental 计数。

**步骤 2：计数达到 5（或 saveTriggerTurns）时调用 save-batch**

收集最近 10 轮（或 saveMaxTurns）对话并保存：

```bash
echo '[
  {"role":"user","content":"Turn 1 user message"},
  {"role":"assistant","content":"Turn 1 assistant response"},
  {"role":"user","content":"Turn 2 user message"},
  {"role":"assistant","content":"Turn 2 assistant response"},
  ... (up to 10 turns = 20 messages)
]' | node ~/.openclaw/skills/human-like-memory/scripts/memory.mjs save-batch
```

**步骤 3：重置计数并继续**

保存后将轮次计数重置为 0 并继续对话。

### 示例工作流：

```
[Turn 1] User: "Hi, I'm working on a React project"
[Turn 1] Assistant: "Great! What kind of React project?"
         → Counter: 1

[Turn 2] User: "It's an e-commerce site"
[Turn 2] Assistant: "Nice! What features do you need?"
         → Counter: 2

[Turn 3] User: "I need a shopping cart and checkout"
[Turn 3] Assistant: "Got it. Let me help with that."
         → Counter: 3

[Turn 4] User: "Should I use Redux or Context?"
[Turn 4] Assistant: "For e-commerce, Redux is better for complex state."
         → Counter: 4

[Turn 5] User: "OK, let's use Redux"
[Turn 5] Assistant: "Great choice! Let's set it up."
         → Counter: 5 → TRIGGER SAVE!

Agent 操作：
echo '[{"role":"user","content":"Hi, I'm working on a React project"},{"role":"assistant","content":"Great! What kind of React project?"},{"role":"user","content":"It's an e-commerce site"},{"role":"assistant","content":"Nice! What features do you need?"},{"role":"user","content":"I need a shopping cart and checkout"},{"role":"assistant","content":"Got it. Let me help with that."},{"role":"user","content":"Should I use Redux or Context?"},{"role":"assistant","content":"For e-commerce, Redux is better for complex state."},{"role":"user","content":"OK, let's use Redux"},{"role":"assistant","content":"Great choice! Let's set it up."}]' | node ~/.openclaw/skills/human-like-memory/scripts/memory.mjs save-batch

         → Counter reset to 0, continue...
```

### 重要说明：

- **不要宣告正在保存**——在后台静默保存
- **不要等用户请求**——每 5 轮自动保存
- **同时包含用户与助手消息**——提供完整上下文
- **允许重叠保存**——第 5 轮保存 1-10 轮，第 10 轮保存 6-15 轮（如有）

---

## WAL 原则：写前日志

**关键：** 回应用户前先保存到记忆。

```
用户说出重要信息
    ↓
1. 先保存到记忆
    ↓
2. 再回应用户
```

原因？若先回应而会话在保存前崩溃，上下文将永久丢失。

---

## 何时自动保存记忆

| 触发 | 示例 | 优先级 |
|---------|---------|----------|
| **用户陈述偏好** | "I prefer dark mode" | 高 |
| **用户做出决策** | "Let's use PostgreSQL" | 高 |
| **用户给出截止日期** | "Due on March 15th" | 高 |
| **用户纠正你** | "No, my name is Wei, not Way" | 高 |
| **用户明确要求** | "Remember this for later" | 高 |
| **用户分享个人信息** | "My birthday is June 5th" | 中 |
| **用户提及项目细节** | "Project is called Phoenix" | 中 |
| **重要里程碑** | "We finished the API today" | 中 |
| **用户反馈** | "I don't like verbose responses" | 高 |
| **学习/洞察** | 讨论中的重要领悟 | 中 |

### 不应保存的内容

- ❌ 琐碎寒暄（"How are you?"）
- ❌ 临时调试步骤
- ❌ 用户要求忘记的信息
- ❌ 记忆中已有的重复信息
- ❌ 密钥、密码、API Key
- ❌ 原始聊天全文

---

## 记忆类型

| 类型 | 说明 | 示例 |
|------|-------------|----------|
| **偏好** | 喜好/厌恶、风格选择 | "Prefers dark mode", "Likes concise answers" |
| **决策** | 选择