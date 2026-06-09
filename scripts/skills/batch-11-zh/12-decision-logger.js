module.exports = {
  skillId: 'totalclaw:totalclaw~decision-logger',
  descriptionZh:
    '董事会决策的双层记忆架构。管理原始记录（第 1 层）与已批准决策（第 2 层）。适用于董事会后记录决策、用 /cs:decisions 回顾过往决策，或用 /cs:review 检查逾期行动项。董事会技能在阶段 5 创始人批准后自动调用。',
  bodyZh: `# 决策记录器

双层记忆系统。第 1 层存储一切。第 2 层仅存储创始人批准的内容。未来会议仅读第 2 层 — 防止过去辩论的幻觉共识渗入新审议。

## 关键词
decision log, memory, approved decisions, action items, board minutes, /cs:decisions, /cs:review, conflict detection, DO_NOT_RESURFACE

## 快速开始

\`\`\`bash
python scripts/decision_tracker.py --demo             # 查看示例输出
python scripts/decision_tracker.py --summary          # 概览 + 逾期项
python scripts/decision_tracker.py --overdue          # 已过截止日期的行动项
python scripts/decision_tracker.py --conflicts        # 矛盾检测
python scripts/decision_tracker.py --owner "CTO"      # 按负责人筛选
python scripts/decision_tracker.py --search "pricing" # 搜索决策
\`\`\`

---

## 命令

| 命令 | 效果 |
|---------|--------|
| \`/cs:decisions\` | 最近 10 条已批准决策 |
| \`/cs:decisions --all\` | 完整历史 |
| \`/cs:decisions --owner CMO\` | 按负责人筛选 |
| \`/cs:decisions --topic pricing\` | 按关键词搜索 |
| \`/cs:review\` | 7 天内到期的行动项 |
| \`/cs:review --overdue\` | 已过截止日期的项 |

---

## 双层架构

### 第 1 层 — 原始记录
**位置：** \`memory/board-meetings/YYYY-MM-DD-raw.md\`
- 完整阶段 2 智能体贡献、阶段 3 批评、阶段 4 综合
- 所有辩论，含被拒论点
- **永不自动加载。** 仅创始人明确要求时加载。
- 90 天后归档 → \`memory/board-meetings/archive/YYYY/\`

### 第 2 层 — 已批准决策
**位置：** \`memory/board-meetings/decisions.md\`
- 仅创始人批准的决策、行动项、用户修正
- **每次董事会阶段 1 自动加载**
- 仅追加。决策永不删除 — 仅被取代。
- 阶段 5 后由幕僚长管理。智能体绝不直接写入。

---

## 决策条目格式

\`\`\`markdown
## [YYYY-MM-DD] — [AGENDA ITEM TITLE]

**Decision:** [One clear statement of what was decided.]
**Owner:** [One person or role — accountable for execution.]
**Deadline:** [YYYY-MM-DD]
**Review:** [YYYY-MM-DD]
**Rationale:** [Why this over alternatives. 1-2 sentences.]

**User Override:** [If founder changed agent recommendation — what and why. Blank if not applicable.]

**Rejected:**
- [Proposal] — [reason] [DO_NOT_RESURFACE]

**Action Items:**
- [ ] [Action] — Owner: [name] — Due: [YYYY-MM-DD] — Review: [YYYY-MM-DD]

**Supersedes:** [DATE of previous decision on same topic, if any]
**Superseded by:** [Filled in retroactively if overridden later]
**Raw transcript:** memory/board-meetings/[DATE]-raw.md
\`\`\`

---

## 矛盾检测

记录前，幕僚长检查：
1. **DO_NOT_RESURFACE 违规** — 新决策匹配被拒提案
2. **议题矛盾** — 同一议题两条活跃决策结论不同
3. **负责人冲突** — 同一行动在不同决策中分配给不同人

发现矛盾时：
\`\`\`
⚠️ DECISION CONFLICT
New: [text]
Conflicts with: [DATE] — [existing text]

Options: (1) Supersede old  (2) Merge  (3) Defer to founder
\`\`\`

**DO_NOT_RESURFACE 执行：**
\`\`\`
🚫 BLOCKED: "[Proposal]" was rejected on [DATE]. Reason: [reason].
To reopen: founder must explicitly say "reopen [topic] from [DATE]".
\`\`\`

---

## 记录工作流（阶段 5 之后）

1. 创始人批准综合
2. 写入第 1 层原始记录 → \`YYYY-MM-DD-raw.md\`
3. 对照 \`decisions.md\` 检查矛盾
4. 呈现矛盾 → 等待创始人解决
5. 将已批准条目追加到 \`decisions.md\`
6. 确认：决策已记录、行动项已跟踪、DO_NOT_RESURFACE 标记已添加

---

## 标记行动项完成

\`\`\`markdown
- [x] [Action] — Owner: [name] — Completed: [DATE] — Result: [one sentence]
\`\`\`

永不删除已完成项。历史即记录。

---

## 文件结构

\`\`\`
memory/board-meetings/
├── decisions.md       # 第 2 层：仅追加、创始人批准
├── YYYY-MM-DD-raw.md  # 第 1 层：每次会议完整记录
└── archive/YYYY/      # 90 天后原始文件
\`\`\`

---

## 参考资料
- \`templates/decision-entry.md\` — 单条模板及字段规则
- \`scripts/decision_tracker.py\` — CLI 解析器、逾期跟踪、矛盾检测器`,
};
