module.exports = {
  skillId: 'totalclaw:totalclaw~gianni-dalerta-tick-md',
  descriptionZh:
    '通过结构化 Markdown 文件 TICK.md 协调人类与 AI 代理的工作。用户自然对话，代理透明维护任务、依赖与进度，支持 Git 版本控制与 MCP 工具。',
  bodyZh: `# Tick 多代理协调

使用结构化 Markdown 文件协调人类与 AI 代理之间的工作。用户自然地与你交互，你在 TICK.md 中透明地维护任务。

## 安装

**前提条件**：Tick CLI 和 MCP 服务器应由你的环境预先安装并配置。

**首次设置？** 参见 \`INSTALL.md\` 获取编辑器专属安装说明。

## 安全边界

- 编辑编辑器 MCP 配置文件前，须获得用户明确批准。
- 运行任何推送到远程 git 的命令（\`tick sync --push\` 或 \`git push\`）前，须获得用户明确批准。
- 若用户未明确批准，仅使用只读/状态命令，并说明待执行的写入操作。

**快速检查**：
\`\`\`bash
# 验证 CLI 可用
tick --version

# 检查项目中是否存在 TICK.md
ls TICK.md

# 若不存在，初始化
tick init
\`\`\`

## 核心概念

**Tick 协议** = 基于 Git 的 TICK.md 任务协调
- **人类可读**：标准 Markdown + YAML
- **机器可解析**：结构化供工具使用
- **Git 支撑**：完整版本控制与审计轨迹
- **本地优先**：无需云端

## 快速开始

### 检查 Tick 是否已初始化
\`\`\`bash
ls TICK.md
\`\`\`

### 若未初始化
\`\`\`bash
tick init
\`\`\`

### 获取当前状态
\`\`\`bash
tick status
\`\`\`

## 常见工作流

### 1. 用户请你完成某事

**用户**：「你能重构认证系统吗？」

**你的操作**：
\`\`\`bash
# 1. 创建任务
tick add "Refactor authentication system" --priority high --tags backend,security

# 2. 注册自己（仅首次）
tick agent register @your-name --type bot --roles "engineer,refactoring"

# 3. 认领任务
tick claim TASK-XXX @your-name

# 4. 执行任务（实际工作）

# 5. 添加进度备注
tick comment TASK-XXX @your-name --note "Analyzing current auth flow"
tick comment TASK-XXX @your-name --note "Refactored to use JWT tokens"

# 6. 标记完成
tick done TASK-XXX @your-name
\`\`\`

### 2. 用户询问项目状态

**用户**：「我们在做哪些任务？」

\`\`\`bash
# 获取综合状态
tick status

# 或筛选列出任务
tick list --status in_progress
tick list --claimed-by @bot-name
\`\`\`

将输出自然地总结给用户。

### 3. 与其他代理协调

**用户**：「其他代理完成他们的任务了吗？」

\`\`\`bash
# 检查整体状态
tick status

# 列出代理及其工作
tick agent list --verbose

# 验证项目
tick validate
\`\`\`

### 4. 拆解复杂工作

**用户**：「构建带图表和数据导出的用户仪表盘」

**你的操作**：
\`\`\`bash
# 创建父任务
tick add "Build user dashboard" --priority high --tags frontend

# 创建带依赖的子任务
tick add "Design dashboard layout" --priority high --tags frontend,design
tick add "Implement data charts" --priority medium --tags frontend,charts --depends-on TASK-XXX
tick add "Add CSV export" --priority low --tags frontend,export --depends-on TASK-XXX

# 可视化依赖
tick graph
\`\`\`

## 命令参考

### 项目管理
\`\`\`bash
tick init                          # 初始化新项目
tick status                        # 查看项目概览
tick list                          # 列出任务（支持筛选）
tick graph                         # 可视化依赖
tick watch                         # 实时监控变更
tick validate                      # 检查错误
tick sync --pull                   # 拉取最新变更
# tick sync --push                 # 仅在有用户明确批准时
\`\`\`

### 任务操作
\`\`\`bash
tick add "Task title" \\
  --priority high \\                # urgent|high|medium|low
  --tags backend,api \\             # 逗号分隔标签
  --assigned-to @agent \\           # 分配给代理
  --depends-on TASK-001 \\          # 依赖
  --estimated-hours 4              # 时间估算

tick claim TASK-001 @agent         # 认领任务（设为 in_progress）
tick release TASK-001 @agent       # 释放任务（回到 todo）
tick done TASK-001 @agent          # 完成任务
tick reopen TASK-001 @agent        # 重新打开已完成任务
tick delete TASK-001               # 删除任务
tick comment TASK-001 @agent \\     # 添加备注
  --note "Progress update"
tick edit TASK-001 \\               # 直接编辑字段
  --title "New title" \\
  --priority high \\
  --status in_progress
\`\`\`

### 修正与恢复
\`\`\`bash
tick reopen TASK-001 @agent        # 重新打开已完成任务
tick reopen TASK-001 @agent \\      # 重新打开并重新阻塞依赖项
  --re-block

tick delete TASK-001               # 删除任务，清理依赖
tick delete TASK-001 --force       # 即使有依赖项也删除

tick edit TASK-001 --title "X"     # 修改标题
tick edit TASK-001 --priority high # 修改优先级
tick edit TASK-001 --status todo   # 直接修改状态
tick edit TASK-001 --tags a,b,c    # 替换标签
tick edit TASK-001 --add-tag new   # 添加标签
tick edit TASK-001 --remove-tag old # 移除标签
tick edit TASK-001 \\               # 编辑依赖
  --depends-on TASK-002,TASK-003

tick undo                          # 撤销上一次 tick 操作
tick undo --dry-run                # 预览将撤销的内容
\`\`\`

### 批量操作
\`\`\`bash
tick import tasks.yaml             # 从 YAML 文件导入任务
tick import - < tasks.yaml         # 从 stdin 导入
tick import tasks.yaml --dry-run   # 预览导入

tick batch start                   # 开始批量模式（不自动提交）
tick batch status                  # 检查批量状态
tick batch commit                  # 提交所有批量变更
tick batch abort                   # 丢弃批量变更
\`\`\`

### 高级任务列表
\`\`\`bash
tick list                          # 所有任务，按状态分组
tick list --status blocked         # 仅阻塞任务
tick list --priority urgent        # 高优先级任务
tick list --assigned-to @alice     # 指定代理的任务
tick list --tag backend            # 带标签的任务
tick list --json                   # JSON 输出供脚本使用
\`\`\`

### 依赖可视化
\`\`\`bash
tick graph                         # ASCII 依赖树
tick graph --format mermaid        # Mermaid 流程图
tick graph --show-done             # 包含已完成任务
\`\`\`

### 实时监控
\`\`\`bash
tick watch                         # 监控变更
tick watch --interval 10           # 自定义轮询间隔
tick watch --filter in_progress    # 仅显示特定状态
\`\`\`

### 代理管理
\`\`\`bash
tick agent register @name \\        # 注册新代理
  --type bot \\                     # human|bot
  --roles "dev,qa" \\               # 逗号分隔角色
  --status idle                    # working|idle|offline

tick agent list                    # 列出所有代理
tick agent list --verbose          # 详细信息
tick agent list --type bot         # 按类型筛选
tick agent list --status working   # 按状态筛选
\`\`\`

## MCP 工具（CLI 替代方案）

若使用 Model Context Protocol，用以下工具替代 CLI 命令：

### 状态与检查
- \`tick_status\` - 获取项目状态（代理、任务、进度）
- \`tick_validate\` - 验证 TICK.md 结构
- \`tick_agent_list\` - 列出代理（支持筛选）

### 任务管理
- \`tick_add\` - 创建新任务
- \`tick_claim\` - 为代理认领任务
- \`tick_release\` - 释放已认领任务
- \`tick_done\` - 完成任务（自动解除依赖项阻塞）
- \`tick_comment\` - 为任务添加备注

### 修正与恢复
- \`tick_reopen\` - 重新打开已完成任务
- \`tick_delete\` - 删除任务
- \`tick_edit\` - 直接编辑字段（绕过状态机）
- \`tick_undo\` - 撤销上一次 tick 操作

### 代理操作
- \`tick_agent_register\` - 注册新代理

**MCP 示例**：
\`\`\`javascript
// 通过 MCP 创建任务
await tick_add({
  title: "Refactor authentication",
  priority: "high",
  tags: ["backend", "security"],
  assignedTo: "@bot-name"
})

// 认领
await tick_claim({
  taskId: "TASK-023",
  agent: "@bot-name"
})
\`\`\`

## 最佳实践

### 1. 自然对话优先

✅ **好**：用户说「重构 auth」，你自动创建任务
❌ **差**：要求用户显式创建任务

### 2. 始终使用你的代理名称

注册一次：
\`\`\`bash
tick agent register @your-bot-name --type bot --roles "engineer"
\`\`\`

然后一致使用：
\`\`\`bash
tick claim TASK-001 @your-bot-name
tick done TASK-001 @your-bot-name
\`\`\`

### 3. 在备注中提供上下文

\`\`\`bash
# ✅ 好 — 说明做了什么以及为什么
tick comment TASK-005 @bot --note "Switched from REST to GraphQL for better type safety and reduced over-fetching"

# ❌ 差 — 过于模糊
tick comment TASK-005 @bot --note "Updated API"
\`\`\`

### 4. 拆解大任务

创建带依赖的子任务：
\`\`\`bash
tick add "Set up CI/CD pipeline" --priority high
tick add "Configure GitHub Actions" --depends-on TASK-010
tick add "Add deployment scripts" --depends-on TASK-011
tick add "Set up staging environment" --depends-on TASK-011
\`\`\`

### 5. 认领前检查状态

\`\`\`bash
# 确保任务存在且未被认领
tick status

# 然后认领
tick claim TASK-XXX @your-name
\`\`\`

## 理解 TICK.md 结构

文件包含三个部分：

1. **Frontmatter**（YAML）：项目元数据
2. **Agents 表**（Markdown）：谁在做什么
3. **Task 块**（YAML + Markdown）：各任务及历史记录

**示例**：
\`\`\`markdown
---
project: my-app
schema_version: "1.0"
next_id: 5
---

# Agents

| Name | Type | Roles | Status | Working On |
|------|------|-------|--------|------------|
| @alice | human | owner | working | TASK-003 |
| @bot | bot | engineer | idle | - |

# Tasks

\\\`\\\`\\\`yaml
id: TASK-001
title: Build authentication
status: done
priority: high
claimed_by: null
# ... more fields
history:
  - ts: 2026-02-07T10:00:00Z
    who: @bot
    action: created
  - ts: 2026-02-07T14:00:00Z
    who: @bot
    action: done
\\\`\\\`\\\`

Implemented JWT-based authentication with token refresh...
\`\`\`

## 高级特性

### 自动解除依赖阻塞

完成任务时，依赖任务自动解除阻塞：
\`\`\`bash
# TASK-002 依赖 TASK-001
# TASK-002 状态：blocked

tick done TASK-001 @bot
# TASK-002 自动变为：todo
\`\`\`

### 循环依赖检测

验证会捕获循环依赖：
\`\`\`bash
tick validate
# Error: Circular dependency detected: TASK-001 → TASK-002 → TASK-003 → TASK-001
\`\`\`

### 智能提交消息

\`\`\`bash
# 仅在有用户明确批准时运行
tick sync --push
# 自动生成："feat: complete TASK-001, TASK-002; update TASK-003"
\`\`\`

### 重新打开已完成任务

若任务被过早标记为完成：
\`\`\`bash
tick reopen TASK-001 @bot
# 状态回到 in_progress，记录在历史中

tick reopen TASK-001 @bot --re-block
# 同时重新阻塞依赖此任务的其他任务
\`\`\`

### 修正错误

\`\`\`bash
# 撤销上一次 tick 操作
tick undo

# 先预览将撤销的内容
tick undo --dry-run

# 直接编辑字段（绕过状态机）
tick edit TASK-001 --status todo --priority urgent
\`\`\`

### 批量操作

多次变更而不单独提交：
\`\`\`bash
tick batch start
# 现在进行多次变更...
tick add "Task 1" --priority high
tick add "Task 2" --priority medium
tick claim TASK-001 @bot
# ...
tick batch commit   # 所有变更单次提交
# 或：tick batch abort  # 丢弃所有变更
\`\`\`

### 实时监控

\`\`\`bash
tick watch
# [10:23:45] ✓ Added: TASK-015 - Implement user search
# [10:24:12] 🔒 TASK-015 claimed by @bot
# [10:26:33] ⟳ TASK-015: in_progress → done
\`\`\`

## 快速参考卡

\`\`\`
工作流：      init → add → claim → work → comment → done → sync
必备：        status | add | claim | done | list | graph
修正：        reopen | delete | edit | undo
批量：        import | batch start/commit/abort
协调：        agent register | agent list | validate | watch
Git：         sync --pull | sync --push（须用户明确批准）
\`\`\`

## 关键提醒

1. **用户与你交互，而非直接与 Tick 交互**
2. **你透明地维护 TICK.md**
3. **仪表盘用于检查，而非主要交互方式**
4. **始终一致使用你的代理名称**
5. **频繁添加备注以展示进度**
6. **同步前进行验证**
7. **认领前检查状态**
8. **将复杂工作拆解为子任务**

## 资源

- **GitHub**：https://github.com/your-org/tick-md
- **文档**：https://tick-md.dev/docs
- **CLI npm**：https://npmjs.com/package/tick-md
- **MCP Server npm**：https://npmjs.com/package/tick-mcp-server

## 许可证

MIT`,
};
