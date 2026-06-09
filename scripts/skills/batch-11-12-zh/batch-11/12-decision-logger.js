module.exports = {
  skillId: 'totalclaw:totalclaw~decision-logger',
  descriptionZh:
    '用于董事会决策的两层记忆架构。管理原始记录（第 1 层）和已批准决策（第 2 层）。适用于在董事会会议后记录决策、通过 /cs:decisions 回顾历史决策，或通过 /cs:review 检查逾期行动项。由董事会会议技能在第 5 阶段创始人批准后自动调用。',
  bodyZh: `# 决策记录器

两层记忆系统。第 1 层存储所有内容。第 2 层仅存储创始人批准的内容。未来的会议只读取第 2 层——这防止了过去辩论的幻觉共识渗入新的审议。

## 关键词
decision log, memory, approved decisions, action items, board minutes, /cs:decisions, /cs:review, conflict detection, DO_NOT_RESURFACE

## 快速开始

\`\`\`bash
python scripts/decision_tracker.py --demo             # 查看示例输出
python scripts/decision_tracker.py --summary          # 概览 + 逾期事项
python scripts/decision_tracker.py --overdue          # 已过截止日期的行动项
python scripts/decision_tracker.py --conflicts        # 矛盾检测
python scripts/decision_tracker.py --owner "CTO"      # 按负责人筛选
python scripts/decision_tracker.py --search "pricing" # 搜索决策
\`\`\`

---

## 命令

| 命令 | 效果 |
|------|------|
| \`/cs:decisions\` | 最近 10 条已批准决策 |
| \`/cs:decisions --all\` | 完整历史 |
| \`/cs:decisions --owner CMO\` | 按负责人筛选 |
| \`/cs:decisions --topic pricing\` | 按关键词搜索 |
| \`/cs:review\` | 7 天内到期的行动项 |
| \`/cs:review --overdue\` | 已过截止日期的事项 |

---

## 两层架构

### 第 1 层 — 原始记录
**位置：** \`memory/board-meetings/YYYY-MM-DD-raw.md\`
- 第 2 阶段完整智能体贡献、第 3 阶段批评、第 4 阶段综合
- 所有辩论，包括被拒绝的论点
- **永不自动加载。** 仅在创始人明确请求时加载。
- 90 天后归档 → \`memory/board-meetings/archive/YYYY/\`

### 第 2 层 — 已批准决策
**位置：** \`memory/board-meetings/decisions.md\`
- 仅限创始人批准的决策、行动项、用户修正
- **每次董事会会议第 1 阶段自动加载**
- 仅追加。决策永不删除——只被取代。
- 第 5 阶段后由幕僚长管理。智能体不得直接写入。

---

## 决策条目格式

\`\`\`markdown
## [YYYY-MM-DD] — [议程项目标题]

**决策：** [一句话清楚陈述决定内容。]
**负责人：** [一个人或角色——负责执行。]
**截止日期：** [YYYY-MM-DD]
**复查日期：** [YYYY-MM-DD]
**理由：** [为何选此而非其他方案。1–2 句话。]

**用户覆盖：** [若创始人修改了智能体建议——改了什么以及为什么。不适用时留空。]

**被拒绝的方案：**
- [方案] — [原因] [DO_NOT_RESURFACE]

**行动项：**
- [ ] [行动] — 负责人：[姓名] — 截止日期：[YYYY-MM-DD] — 复查日期：[YYYY-MM-DD]

**取代：** [若取代了同一主题的前一个决策，填入该决策日期]
**被取代：** [若后续被覆盖，事后填入]
**原始记录：** memory/board-meetings/[DATE]-raw.md
\`\`\`

---

## 冲突检测

记录前，幕僚长检查：
1. **DO_NOT_RESURFACE 违规** — 新决策与被拒方案匹配
2. **主题矛盾** — 同一主题上存在两条结论不同的有效决策
3. **负责人冲突** — 同一行动在不同决策中被分配给不同的人

发现冲突时：
\`\`\`
⚠️ 决策冲突
新增：[文本]
与以下冲突：[DATE] — [现有文本]

选项：(1) 取代旧条目  (2) 合并  (3) 提交给创始人
\`\`\`

**DO_NOT_RESURFACE 执行：**
\`\`\`
🚫 已拦截："[方案]"于 [DATE] 被拒绝。原因：[原因]。
如需重新讨论：创始人必须明确说"重新打开来自 [DATE] 的 [主题]"。
\`\`\`

---

## 记录工作流（第 5 阶段后）

1. 创始人批准综合内容
2. 写入第 1 层原始记录 → \`YYYY-MM-DD-raw.md\`
3. 对照 \`decisions.md\` 检查冲突
4. 呈现冲突 → 等待创始人处理
5. 将已批准条目追加到 \`decisions.md\`
6. 确认：已记录决策数、已追踪行动项、已添加 DO_NOT_RESURFACE 标记

---

## 标记行动项为完成

\`\`\`markdown
- [x] [行动] — 负责人：[姓名] — 完成日期：[DATE] — 结果：[一句话]
\`\`\`

永远不要删除已完成的条目。历史记录即为档案。

---

## 文件结构

\`\`\`
memory/board-meetings/
├── decisions.md       # 第 2 层：仅追加，创始人批准
├── YYYY-MM-DD-raw.md  # 第 1 层：每次会议完整记录
└── archive/YYYY/      # 90 天后的原始文件
\`\`\`

---

## 参考资料
- \`templates/decision-entry.md\` — 含字段规则的单条条目模板
- \`scripts/decision_tracker.py\` — CLI 解析器、逾期追踪、冲突检测`,
};
