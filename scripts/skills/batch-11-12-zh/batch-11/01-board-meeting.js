module.exports = {
  skillId: 'totalclaw:totalclaw~board-meeting',
  descriptionZh:
    '多智能体董事会会议协议，用于战略决策。结构化 6 阶段审议：上下文加载、C-Suite 独立贡献（隔离、无交叉影响）、批评分析、综合、创始人评审与决策提取。适用于调用 /cs:board、召开董事会或需要多视角高管审议。',
  bodyZh: `# 董事会会议协议

结构化多智能体审议，防止群体思维、捕捉少数观点，产出清晰可执行决策。

## 关键词
董事会会议、高管审议、战略决策、C-Suite、多智能体、/cs:board、创始人评审、决策提取、独立视角

## 调用
\`/cs:board [议题]\` — 例如 \`/cs:board 我们是否应在 Q3 拓展西班牙？\`

---

## 6 阶段协议

### 阶段 1：上下文收集
1. 加载 \`memory/company-context.md\`
2. 加载 \`memory/board-meetings/decisions.md\` **（仅 Layer 2 — 永不加载原始记录）**
3. 重置会话状态 — 不与先前对话混杂
4. 呈现议程 + 激活角色 → 等待创始人确认

**幕僚长按议题选择相关角色**（非每次 9 个全上）：
| 议题 | 激活 |
|-------|----------|
| 市场拓展 | CEO, CMO, CFO, CRO, COO |
| 产品方向 | CEO, CPO, CTO, CMO |
| 招聘/组织 | CEO, CHRO, CFO, COO |
| 定价 | CMO, CFO, CRO, CPO |
| 技术 | CTO, CPO, CFO, CISO |

---

### 阶段 2：独立贡献（隔离）

**禁止交叉影响。各智能体在未见他人输出前运行。**

顺序：调研（如需）→ CMO → CFO → CEO → CTO → COO → CHRO → CRO → CISO → CPO

**推理技巧：** CEO：思维树（3 种未来）| CFO：思维链（展示计算）| CMO：递归思维（草稿→批评→精炼）| CPO：第一性原理 | CRO：思维链（管线数学）| COO：逐步（流程图）| CTO：ReAct（调研→分析→行动）| CISO：风险导向（P×I）| CHRO：共情 + 数据

**贡献格式（最多 5 要点，自验证）：**
\`\`\`
## [ROLE] — [DATE]

Key points (max 5):
• [Finding] — [VERIFIED/ASSUMED] — 🟢/🟡/🔴
• [Finding] — [VERIFIED/ASSUMED] — 🟢/🟡/🔴

Recommendation: [clear position]
Confidence: High / Medium / Low
Source: [where the data came from]
What would change my mind: [specific condition]
\`\`\`

各智能体贡献前自验证：来源归因、假设审计、置信度评分。无未标记主张。

---

### 阶段 3：批评分析
执行导师同时接收全部阶段 2 输出。角色：对抗性评审，非综合者。

检查清单：
- 智能体何处过于一致？（可疑共识 = 红旗）
- 哪些假设被共享但未验证？
- 谁不在场？（客户声音？一线运营？）
- 无人提及的风险？
- 哪位智能体越界？

---

### 阶段 4：综合
幕僚长按 **董事会会议输出** 格式交付（定义于 \`agent-protocol/SKILL.md\`）：
- 待决事项（一句话）
- 各贡献角色视角（每角色一行）
- 一致点 / 分歧点
- 批评者观点（不舒服的真相）
- 建议决策 + 行动项（负责人、截止）
- 你的决定（创始人不同意时的选项）

---

### 阶段 5：人在回路 ⏸️

**完全停止。等待创始人。**

\`\`\`
⏸️ FOUNDER REVIEW — [粘贴综合]

Options: ✅ Approve | ✏️ Modify | ❌ Reject | ❓ Ask follow-up
\`\`\`

**规则：**
- 用户修正覆盖智能体建议。不反驳。不说「但 CFO 说...」
- 30 分钟无活动 → 自动关闭为「待评审」
- 随时用 \`/cs:board resume\` 重开

---

### 阶段 6：决策提取
创始人批准后：
- **Layer 1：** 完整记录 → \`memory/board-meetings/YYYY-MM-DD-raw.md\`
- **Layer 2：** 追加批准决策 → \`memory/board-meetings/decisions.md\`
- 被拒提案标记 \`[DO_NOT_RESURFACE]\`
- 向创始人确认：已记录决策数、跟踪行动、添加标记

---

## 记忆结构
\`\`\`
memory/board-meetings/
├── decisions.md          # Layer 2 — 仅创始人批准（阶段 1 加载）
├── YYYY-MM-DD-raw.md     # Layer 1 — 完整记录（永不自动加载）
└── archive/YYYY/         # 90 天后归档原始记录
\`\`\`

**未来会议仅加载 Layer 2。** 永不 Layer 1。防止幻觉共识。

---

## 失败模式速查
| 失败 | 修复 |
|---------|-----|
| 群体思维（全同意） | 隔离重跑阶段 2；强制「最强反对论据」 |
| 分析瘫痪 | 上限 5 点；即使低置信也强制建议 |
| 琐碎争论 | 记为异步行动项；回到主议程 |
| 角色越界（CFO 做产品决策） | 批评者标记；综合时排除 |
| Layer 污染 | 阶段 1 仅加载 decisions.md — 硬规则 |

---

## 参考
- \`templates/meeting-agenda.md\` — 议程格式
- \`templates/meeting-minutes.md\` — 最终输出格式
- \`references/meeting-facilitation.md\` — 冲突处理、节奏、失败模式`,
};
