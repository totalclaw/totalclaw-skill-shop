module.exports = {
  skillId: 'totalclaw:totalclaw~zonk1024-valence-memory',
  descriptionZh: 'OpenClaw 持久知识基底，以置信度信念、语义搜索与联邦知识共享替代平面文件记忆。',
  bodyZh: `# Valence Memory

OpenClaw 的持久知识基底。以带置信度评分的信念、语义搜索、模式识别和联邦知识共享，替代平面文件记忆。

## 功能

Valence 为你的智能体提供**真正的记忆** — 不是对话日志，而是随时间变得更聪明的结构化知识库：

- **信念（Beliefs）** — 带维度置信度评分、领域分类和来源追踪的事实陈述
- **自动回忆** — 智能体运行前将相关信念注入上下文，无需手动搜索
- **自动捕获** — 从对话中自动提取见解为信念
- **模式** — 跨会话检测重复行为与偏好
- **实体** — 追踪人物、工具、项目与概念及其关系
- **张力** — 浮现信念间的矛盾以供解决
- **会话** — 完整对话生命周期追踪与交换记录
- **MEMORY.md 同步** — 灾难恢复回退，卸载时不会丢失数据

## 前提条件

Valence 需要运行带 PostgreSQL + pgvector 的服务器：

\`\`\`bash
# 安装 Valence
pip install ourochronos-valence

# 启动带 pgvector 的 PostgreSQL（Docker 最简便）
docker run -d --name valence-db \\
  -e POSTGRES_DB=valence \\
  -e POSTGRES_USER=valence \\
  -e POSTGRES_PASSWORD=valence \\
  -p 5432:5432 \\
  pgvector/pgvector:pg17

# 运行迁移
valence-server migrate up

# 启动服务器
valence-server
\`\`\`

服务器默认运行于 \`http://127.0.0.1:8420\`。

## 安装插件

\`\`\`bash
openclaw plugins install @ourochronos/memory-valence
\`\`\`

## 配置

添加到 OpenClaw 配置（\`~/.openclaw/openclaw.json\`）：

\`\`\`json
{
  "plugins": {
    "slots": {
      "memory": "memory-valence"
    },
    "entries": {
      "memory-valence": {
        "enabled": true,
        "config": {
          "serverUrl": "http://127.0.0.1:8420",
          "autoRecall": true,
          "autoCapture": true,
          "sessionTracking": true,
          "memoryMdSync": true
        }
      }
    }
  }
}
\`\`\`

或使用 OpenClaw Control UI 通过 Web 界面配置。

### 配置选项

| 选项 | 默认值 | 说明 |
|--------|---------|-------------|
| \`serverUrl\` | \`http://127.0.0.1:8420\` | Valence 服务器 URL |
| \`authToken\` | — | Bearer 令牌（或设置 \`VALENCE_AUTH_TOKEN\` 环境变量） |
| \`autoRecall\` | \`true\` | 智能体运行前注入相关信念 |
| \`autoCapture\` | \`true\` | 从对话中提取见解 |
| \`sessionTracking\` | \`true\` | 在 Valence 中追踪 OpenClaw 会话 |
| \`exchangeRecording\` | \`false\` | 记录单个对话轮次 |
| \`memoryMdSync\` | \`true\` | 将信念同步到 MEMORY.md 作为 DR 回退 |
| \`recallMaxResults\` | \`10\` | 自动回忆注入的最大信念数 |
| \`recallMinScore\` | \`0.5\` | 回忆最低相关分数（0-1） |

## 智能体工具

插件暴露 58 个工具，按类别组织：

### 核心（最常用）
- \`belief_create\` / \`belief_query\` / \`belief_search\` / \`belief_get\` — 创建与查找信念
- \`belief_supersede\` — 更新信念同时保留历史
- \`belief_archive\` — 归档信念（符合 GDPR，保持链）
- \`confidence_explain\` — 理解信念置信度评分的原因
- \`entity_search\` / \`entity_get\` — 查找与检查实体
- \`tension_list\` / \`tension_resolve\` — 浮现并解决矛盾
- \`insight_extract\` — 从对话提取见解为信念
- \`pattern_search\` / \`pattern_record\` / \`pattern_reinforce\` — 行为模式
- \`memory_search\` / \`memory_get\` — 搜索与读取 MEMORY.md（DR 回退）

### 共享与联邦
- 与可信节点共享信念，跨联邦节点查询
- 信任验证、声誉追踪、争议解决
- 备份导出/导入以实现可移植性

### VKB（虚拟知识库）
- 会话生命周期管理
- 交换记录
- 高级模式与见解工具

## 工作原理

1. **每次智能体轮次**，自动回忆搜索 Valence 中与当前对话相关的信念并注入为上下文
2. **对话期间**，智能体使用信念工具捕获决策、偏好与见解
3. **对话结束后**，自动捕获提取任何未捕获的见解
4. **随时间推移**，信念通过佐证积累置信度，模式从重复观察中涌现，智能体理解加深
5. **MEMORY.md** 保持同步作为人类可读快照和安全网

## 架构

\`\`\`
OpenClaw Agent
    ↕ (plugin tools + hooks)
memory-valence plugin
    ↕ (REST API)
Valence Server (http://127.0.0.1:8420)
    ↕ (SQL + pgvector)
PostgreSQL + pgvector
\`\`\`

插件是轻量 REST 客户端。所有智能在 Valence 服务器中 — 嵌入、置信度评分、模式检测和联邦协议。

## 链接

- **Valence**: [github.com/ourochronos/valence](https://github.com/ourochronos/valence) | [PyPI](https://pypi.org/project/ourochronos-valence/)
- **Plugin**: [github.com/ourochronos/valence-openclaw](https://github.com/ourochronos/valence-openclaw) | [npm](https://www.npmjs.com/package/@ourochronos/memory-valence)
- **Issues**: [github.com/ourochronos/valence/issues](https://github.com/ourochronos/valence/issues)`,
};
