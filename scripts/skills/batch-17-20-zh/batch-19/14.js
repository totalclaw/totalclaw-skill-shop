module.exports = {
  skillId: 'totalclaw:totalclaw~gpunter-agent-daily-planner',
  descriptionZh:
    '面向 AI 代理的结构化每日规划与执行跟踪系统，跨会话保持任务清单与问责。',
  bodyZh: `# Agent Daily Planner 📋

面向 AI 代理的结构化每日规划与执行跟踪系统。帮助组织任务、记录交付成果，并在各会话间保持问责。

## 为什么需要它

代理在会话之间会丢失上下文。没有规划系统，你会把时间浪费在重新定位上，而不是交付。本技能提供可重复的每日工作流，并在会话间持久保存。

## 命令

### \`/plan today\`
根据以下内容生成今日计划：
- 昨日未完成任务
- \`memory/projects.json\` 中的活跃项目（若存在）
- \`MEMORY.md\` 中记录的阻塞项或截止日期

创建/更新 \`memory/YYYY-MM-DD.md\`，使用以下结构化模板：

\`\`\`markdown
# YYYY-MM-DD - 每日计划

## 优先任务（必做）
- [ ] 任务 1 — [项目] — 截止日期/上下文
- [ ] 任务 2 — [项目] — 截止日期/上下文

## 延伸目标（若有时间）
- [ ] 任务 3
- [ ] 任务 4

## 阻塞项
- 阻塞 1 — 谁能解除？

## 今日交付
_（完成任务时填写）_

## 备注
_（学习、决策、供未来会话参考的上下文）_
\`\`\`

### \`/plan review\`
回顾当日进度：
- 统计已完成与未完成任务
- 识别逾期项
- 计算完成率
- 建议明日需延续的任务

### \`/plan ship <description>\`
记录一项已交付成果。带时间戳写入当日「今日交付」章节。

示例：\`/plan ship "Published skill-auditor on ClawHub"\`

### \`/plan block <description> [owner]\`
记录阻塞项。可选标注需解决的责任人。

示例：\`/plan block "Post Bridge SSL broken" George\`

### \`/plan week\`
根据每日日志生成周报：
- 完成任务总数
- 完成率趋势
- 营收事件（若有跟踪）
- 关键决策
- 已解决/未解决阻塞项

### \`/plan standup\`
生成简短站会格式：
\`\`\`
昨日：[已完成任务]
今日：[计划任务]
阻塞项：[当前阻塞]
\`\`\`

### \`/plan priorities <task1> <task2> ...\`
设置今日优先任务。覆盖「优先任务」章节。

### \`/plan carry\`
将昨日未完成任务延续到今日计划。

## 文件结构

规划器与现有记忆系统协同工作：
\`\`\`
memory/
  YYYY-MM-DD.md    — 每日日志（每天一份）
  projects.json    — 活跃项目（可选）
  weekly/
    YYYY-Wxx.md    — 周报
\`\`\`

## 集成

可与其他技能并行使用。不修改非本技能拥有的文件。读取来源：
- \`MEMORY.md\` — 上下文与持续备注
- \`memory/projects.json\` — 活跃项目跟踪
- 前一天的 \`memory/YYYY-MM-DD.md\` — 延续任务

## 使用建议

1. 每次会话开始时运行 \`/plan today\`
2. 每完成一项就用 \`/plan ship\` 记录（积累交付记录）
3. 会话结束前运行 \`/plan review\`
4. 周日/周一运行 \`/plan week\` 做回顾
5. 站会格式适合向人类汇报进度

## 作者
- CLAW-1 (@Claw_00001)
- 发布者：Gpunter on ClawHub

## 版本
1.0.0

## 标签
productivity, planning, tasks, daily-log, accountability, workflow, organization`,
};
