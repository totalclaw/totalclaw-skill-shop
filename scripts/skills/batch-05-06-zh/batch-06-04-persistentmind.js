module.exports = {
  skillId: 'totalclaw:totalclaw~vedantsingh60-persisent-mind',
  descriptionZh: 'AI 智能体持久、可搜索、上下文感知的记忆系统，本地运行，无需 API 密钥。',
  bodyZh: `# PersistentMind

**AI 智能体持久、可搜索、上下文感知的记忆。存储重要信息，不再丢失上下文。**

免费开源（MIT 许可证）• 零依赖 • 本地运行 • 无需 API 密钥

---

## 为什么需要此技能？

AI 智能体在会话之间会忘记一切。每次新对话都要重复相同上下文：偏好、项目设置、对先前错误的纠正、已记录的流程。本技能永久解决这一问题。

### 解决的问题：
- 智能体在会话间忘记用户偏好
- 因纠正未持久化而重复相同错误
- 每次都要重新解释项目上下文
- 无法随时间建立团队知识库

---

## 核心概念

### 记忆类型

| 类型 | 用途 | 示例 |
|------|---------|---------|
| \`fact\` | 事实信息 | 「数据库是 PostgreSQL 16」 |
| \`preference\` | 用户偏好 | 「用户偏好简洁回复」 |
| \`procedure\` | 操作步骤 | 「运行迁移：poetry run alembic upgrade head」 |
| \`correction\` | 错误与修复 | 「不要使用通配符导入 — CI 会失败」 |
| \`context\` | 背景信息 | 「这是面向 HR 团队的 B2B SaaS 产品」 |
| \`relationship\` | 事物关系 | 「AuthService 依赖 UserRepository」 |
| \`reminder\` | 稍后注意 | 「更改数据库模式前先与团队确认」 |

### 记忆范围

| 范围 | 持久性 | 用途 |
|-------|----------|---------|
| \`global\` | 始终 | 跨项目偏好、通用规则 |
| \`project\` | 项目内 | 项目特定事实、流程、纠正 |
| \`session\` | 仅当前会话 | 临时工作笔记 |

---

## 功能

### 1. 存储记忆

\`\`\`python
from persistentmind import PersistentMind, MemoryType, MemoryScope

mm = PersistentMind(project="my-app")

# 关键纠正 — 在上下文中始终优先浮现
mm.remember(
    "Never use wildcard imports — the linter will fail CI",
    memory_type=MemoryType.CORRECTION,
    scope=MemoryScope.PROJECT,
    importance=10.0,
    tags=["linting", "ci", "imports"]
)

# 全局偏好 — 处处适用
mm.remember(
    "User prefers code examples over long explanations",
    memory_type=MemoryType.PREFERENCE,
    scope=MemoryScope.GLOBAL,
    importance=8.0
)

# 未指定时自动从内容提取标签
mm.remember(
    "The Stripe API key is in .env as STRIPE_SECRET_KEY",
    memory_type=MemoryType.FACT,
    scope=MemoryScope.PROJECT,
    importance=9.0
)
\`\`\`

### 2. 搜索记忆

\`\`\`python
# 全文搜索与相关度评分
results = mm.recall("database migrations")
for r in results:
    print(f"[{r.relevance_score:.2f}] [{r.memory.memory_type}] {r.memory.content}")

# 带筛选的搜索
results = mm.recall("imports", type_filter="correction", min_importance=7.0)

# 按类型获取
corrections = mm.recall_by_type(MemoryType.CORRECTION)

# 按标签获取
db_memories = mm.recall_by_tag("database")
\`\`\`

### 3. 注入提示词上下文

\`\`\`python
# 获取格式化上下文块，前置到任何提示词
context = mm.get_context(project="my-app", max_tokens_estimate=1500)

prompt = f"""
{context}

---

User request: {user_input}
"""
\`\`\`

输出：
\`\`\`
# Relevant Memory Context

⚠️ [CORRECTION] Never use wildcard imports — the linter will fail CI
⚙️ [PREFERENCE] User prefers code examples over long explanations
📌 [FACT] The Stripe API key is in .env as STRIPE_SECRET_KEY
📋 [PROCEDURE] Run migrations with: poetry run alembic upgrade head
\`\`\`

纠正始终优先浮现。重要性评分决定排序。

### 4. 记忆管理

\`\`\`python
# 更新现有记忆
mm.update_memory(memory_id="mem_abc123", importance=9.0, tags=["critical"])

# 归档记忆（软删除）
mm.forget("mem_abc123")

# 永久删除
mm.forget("mem_abc123", permanent=True)

# N 天后自动过期
mm.remember("Temp token: abc...", expires_in_days=7)
\`\`\`

### 5. 去重

\`\`\`python
# 查找近似重复记忆（试运行 — 仅报告）
groups = mm.consolidate(dry_run=True)
for g in groups:
    print(f"Found {g['count']} similar memories:")
    for m in g['memories']:
        print(f"  - {m['content']}")

# 实际合并
mm.consolidate(dry_run=False)
\`\`\`

### 6. 团队共享

\`\`\`python
# 导出记忆集
mm.export_memories("team_memories.json")

# 导入同事的记忆
mm.import_memories("team_memories.json")
\`\`\`

### 7. 摘要与统计

\`\`\`python
print(mm.format_summary())
\`\`\`

\`\`\`
🧠 Total Active Memories: 24  |  Archived: 3
   Avg Importance: 7.4/10

📊 BY TYPE
  • correction             4
  • fact                   8
  • preference             5
  • procedure              4
  • context                3
\`\`\`

---

## 重要性评分指南

| 分数 | 使用场景 |
|-------|----------|
| 10 | 关键 — 绝不违反（如安全规则、CI 要求） |
| 8-9 | 重要 — 强偏好或关键事实 |
| 5-7 | 有用但非关键 |
| 1-4 | 了解即可，低优先级 |

---

## API 参考

### \`PersistentMind(storage_path, project, session_id, auto_cleanup_days)\`
初始化。数据默认存储在 \`.persistentmind/\`。

### \`remember(content, memory_type, scope, tags, importance, project, expires_in_days, source)\`
存储新记忆。返回 \`Memory\` 对象。

### \`recall(query, scope_filter, type_filter, project_filter, limit, min_importance)\`
搜索记忆。返回按相关度排序的 \`List[MemorySearchResult]\`。

### \`recall_by_type(memory_type, limit)\`
获取特定类型的所有记忆，按重要性排序。

### \`recall_by_tag(tag, limit)\`
获取带特定标签的所有记忆。

### \`get_context(project, max_tokens_estimate)\`
获取用于提示词注入的格式化上下文块。纠正优先浮现。

### \`update_memory(memory_id, content, importance, tags)\`
更新现有记忆的字段。

### \`forget(memory_id, permanent)\`
归档（默认）或永久删除记忆。

### \`consolidate(dry_run)\`
查找近似重复记忆。设 \`dry_run=False\` 以合并。

### \`get_stats()\`
返回记忆统计字典。

### \`format_summary()\`
人类可读的记忆摘要。

### \`export_memories(output_file, include_archived)\`
导出为 JSON 以供备份或团队共享。

### \`import_memories(input_file, overwrite_duplicates)\`
从 JSON 导出文件导入。

---

## 隐私与安全

- ✅ **零遥测** — 不向任何地方发送数据
- ✅ **仅本地存储** — 一切在机器的 \`.persistentmind/\` 中
- ✅ **无需 API 密钥** — 零凭据
- ✅ **无需认证** — 无账户或登录
- ✅ **完全透明** — MIT 许可，含源代码

---

## 更新日志

### [1.0.0] - 2026-02-16

- ✨ 首次发布 — PersistentMind
- ✨ 7 种记忆类型：fact、preference、procedure、context、correction、relationship、reminder
- ✨ 3 种范围：global、project、session
- ✨ 带相关度评分、重要性提升、时效衰减的全文搜索
- ✨ 通过 \`get_context()\` 注入提示词上下文
- ✨ 从内容自动提取标签
- ✨ 记忆合并去重
- ✨ 导出/导入以供团队共享
- ✨ 自动过期与过期会话清理
- ✨ 零依赖、仅本地存储、MIT 许可

---

**最后更新**：2026 年 2 月 16 日
**当前版本**：1.0.0
**状态**：活跃且社区维护

© 2026 UnisAI Community`,
};
