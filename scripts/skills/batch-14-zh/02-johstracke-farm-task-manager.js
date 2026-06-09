module.exports = {
  skillId: 'totalclaw:totalclaw~johstracke-farm-task-manager',
  descriptionZh:
    '日常、每周和季节性农场杂务管理，支持任务调度、优先级设置与进度跟踪，适合小型农场与家庭农场。',
  bodyZh: `# Farm Task Manager

*日常、每周和季节性农场杂务管理，支持任务调度与优先级。*

**作者：** IOU (@johstracke)
**版本：** 1.0.0
**创建日期：** 2026-02-12

---

## 关于本技能

Farm Task Manager 帮助农民组织日常、每周和季节性杂务，支持任务调度、优先级和跟踪。非常适合：

- 小型农场（1-10 英亩）
- 爱好农场与自耕农
- 农场到餐桌经营者
- 需要兼顾多项农场事务的任何人

### 为什么创建它

我创建 Farm Task Manager 是因为农场工作令人应接不暇——总有事情要做（种植、维护、收获、动物护理、设备维修）。靠脑子记意味着忘记重要任务、排错优先级、浪费时间。现在我只需输入 \`farm-task add "Fix irrigation" --priority high\`，然后忘掉它直到到期。

---

## 功能

- **任务管理**：添加带名称、描述、优先级、截止日期、类别和负责人的任务
- **任务过滤**：按状态、优先级、类别、截止日期、负责人列出任务
- **任务更新**：更新任务状态（pending、in-progress、completed）并添加备注
- **重复任务**：创建每日、每周、每月或季节性重复任务
- **搜索**：按名称、描述或类别搜索所有任务
- **导出**：导出为 markdown 或 JSON 以便分享和备份

---

## 用法

### 添加任务

\`\`\`bash
farm-task add "Check irrigation system" \\
  --priority high \\
  --category maintenance \\
  --due "2026-03-01" \\
  --assignee "John"
\`\`\`

**选项：**
- \`--name\`：任务名称（必填）
- \`--description\`：任务描述
- \`--priority\`：任务优先级（high、medium、low）
- \`--status\`：任务状态（pending、in-progress、completed）
- \`--category\`：任务类别（planting、maintenance、harvesting、equipment、animals、buildings、other）
- \`--due\`：截止日期（YYYY-MM-DD 或 YYYY-MM-DD HH:MM）
- \`--assignee\`：任务负责人

### 列出任务

\`\`\`bash
# 列出所有任务
farm-task list

# 按状态过滤
farm-task list --status pending

# 按优先级过滤
farm-task list --priority high

# 按类别过滤
farm-task list --category planting

# 按截止日期过滤（过期优先显示）
farm-task list --sort-due

# 按负责人过滤
farm-task list --assignee "John"
\`\`\`

### 显示任务详情

\`\`\`bash
farm-task show 1
\`\`\`

显示任务详情，包括：
- 任务信息
- 状态和优先级
- 截止日期
- 备注和历史
- 创建以来的时间

### 更新任务状态

\`\`\`bash
# 标记为进行中
farm-task update 1 --status in-progress

# 标记为完成
farm-task update 1 --status complete

# 添加备注
farm-task update 1 --note "Checked valves, all good"

# 更改优先级
farm-task update 1 --priority medium
\`\`\`

### 添加重复任务

\`\`\`bash
# 每日任务
farm-task recurring "Check chicken water" \\
  --frequency daily \\
  --priority medium \\
  --category animals

# 每周任务
farm-task recurring "Inspect tractor oil" \\
  --frequency weekly \\
  --priority high \\
  --category equipment

# 每月任务
farm-task recurring "Test fire extinguishers" \\
  --frequency monthly \\
  --priority medium \\
  --category buildings

# 季节性任务（3 月 1 日）
farm-task recurring "Winterize irrigation" \\
  --frequency seasonal \\
  --season "03-01" \\
  --priority high \\
  --category maintenance
\`\`\`

### 完成任务

\`\`\`bash
farm-task complete 1
\`\`\`

标记任务为完成并记录完成时间戳。

### 删除任务

\`\`\`bash
farm-task delete 1
\`\`\`

从系统中移除任务。

### 导出任务

\`\`\`bash
# 导出全部为 markdown
farm-task export --file tasks.md

# 导出过滤结果为 markdown
farm-task export --file planting-tasks.md --category planting

# 导出为 JSON
farm-task export --file tasks.json --format json

# 按日期范围导出
farm-task export --file march-tasks.md --after "2026-03-01" --before "2026-04-01"
\`\`\`

---

## 安全

✅ **安全已验证**：本技能使用路径验证防止未授权文件访问。

所有文件操作限制在安全目录：
- 工作区：\`~/.openclaw/workspace/farm-task-manager/\`
- 主目录：\`~/\`（用户控制）

**阻止的路径：**
- 系统目录（\`/etc\`、\`/usr\`、\`/var\` 等）
- 敏感点文件（\`~/.ssh\`、\`~/.bashrc\` 等）

无硬编码密钥。无任意代码执行。所有操作均进行输入验证。

---

## 数据存储

任务以 JSON 格式存储于：
- \`~/.openclaw/workspace/farm-task-manager/tasks.json\`

首次使用时自动创建目录。

---

## 任务类别

| 类别 | 说明 |
|----------|-------------|
| planting | 育苗、移植、土壤准备 |
| maintenance | 一般农场维护、维修 |
| harvesting | 收获活动、收获后工作 |
| equipment | 设备维护、维修、存储 |
| animals | 动物护理、喂养、健康检查 |
| buildings | 谷仓、棚屋、温室维护 |
| other | 其他农场任务 |

---

## 优先级

| 优先级 | 说明 |
|-----------|-------------|
| high | 紧急，尽快完成（安全关键、时间敏感） |
| medium | 重要，尽快完成（有灵活性的常规任务） |
| low | 有空再做（优化、改进） |

---

## 示例

### 日常 routine

\`\`\`bash
# 早晨检查
farm-task list --sort-due --status pending

# 完成鸡舍检查
farm-task complete 5
farm-task recurring generate 5  # 生成下一天的重复任务
\`\`\`

### 每周规划

\`\`\`bash
# 列出高优先级任务
farm-task list --priority high

# 导出用于规划
farm-task export --file weekly-plan.md --after "today" --before "7 days"
\`\`\`

### 季节性工作

\`\`\`bash
# 冬季准备
farm-task recurring "Winterize irrigation" \\
  --frequency seasonal \\
  --season "11-01" \\
  --priority high \\
  --category maintenance

# 春季种植
farm-task export --file spring-tasks.md --category planting --after "2026-03-01" --before "2026-06-01"
\`\`\`

---

## 故障排除

### 问：如何跟踪多名工人？

**答：** 添加任务时使用 \`--assignee\` 选项。按负责人过滤查看每个人的任务：
\`\`\`bash
farm-task list --assignee "Jane"
\`\`\`

### 问：可以稍后更改任务优先级吗？

**答：** 可以，使用 update 命令：
\`\`\`bash
farm-task update 1 --priority high
\`\`\`

### 问：重复任务如何工作？

**答：** 重复任务是模板。完成重复任务后，生成新实例：
\`\`\`bash
farm-task recurring generate 1
\`\`\`
这会创建具有相同详情和更新截止日期的新任务。

### 问：可以跟踪基于项目的工作吗？

**答：** 使用类别分组相关工作：
\`\`\`bash
farm-task add "Build new fence" --category buildings --assignee "John"
farm-task list --category buildings
\`\`\`

### 问：如何导出以便分享？

**答：** 导出为 markdown 或 JSON：
\`\`\`bash
# Markdown（人类可读）
farm-task export --file farm-plan.md

# JSON（用于数据交换）
farm-task export --file farm-tasks.json --format json
\`\`\`

---

## 版本历史

- **1.0.0**（2026-02-12）：初始发布
  - 任务管理（添加、列出、显示、更新、删除、完成）
  - 按状态、优先级、类别、截止日期、负责人过滤
  - 重复任务（每日、每周、每月、季节性）
  - 搜索所有任务
  - 导出为 markdown 和 JSON

---

## 支持

如有 bug、功能请求或问题：
- 作者：ClawHub 上的 @johstracke
- 查看 Farming Suite 中的其他 IOU 技能（即将推出！）

---

*Farm Task Manager — 组织农场工作，减轻压力，不再忘记重要任务。*`,
};
