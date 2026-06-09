module.exports = {
  skillId: 'totalclaw:totalclaw~board-meeting',
  descriptionZh:
    '面向战略决策的多智能体董事会会议协议。运行结构化六阶段审议：上下文加载、独立 C 级贡献（隔离、无交叉影响）、批评者分析、综合、创始人审阅与决策提取。适用于用户调用 /cs:board、召开董事会会议，或需要结构化多视角高管审议战略问题时。',
  bodyZh: `# 董事会会议协议

结构化多智能体审议，防止群体思维，捕捉少数观点，产出清晰、可执行的决策。

## 关键词
board meeting, executive deliberation, strategic decision, C-suite, multi-agent, /cs:board, founder review, decision extraction, independent perspectives

## 调用
\`/cs:board [topic]\` — 例如 \`/cs:board 我们是否应在 Q3 拓展西班牙市场？\`

---

## 六阶段协议

### 阶段 1：上下文收集
1. 加载 \`memory/company-context.md\`
2. 加载 \`memory/board-meetings/decisions.md\` **（仅第 2 层 — 绝不加载原始记录）**
3. 重置会话状态 — 不与先前对话混杂
4. 呈现议程 + 激活角色 → 等待创始人确认

**幕僚长根据议题选择相关角色**（并非每次都需要全部 9 个）：
| 议题 | 激活角色 |
|-------|----------|
| 市场扩张 | CEO, CMO, CFO, CRO, COO |
| 产品方向 | CEO, CPO, CTO, CMO |
| 招聘/组织 | CEO, CHRO, CFO, COO |
| 定价 | CMO, CFO, CRO, CPO |
| 技术 | CTO, CPO, CFO, CISO |

---

### 阶段 2：独立贡献（隔离）

**无交叉影响。各智能体在看到他人输出之前独立运行。**

顺序：研究（如需要）→ CMO → CFO → CEO → CTO → COO → CHRO → CRO → CISO → CPO

**推理技术：** CEO：思维树（3 种未来）| CFO：思维链（展示计算）| CMO：递归思维（草稿→批评→精炼）| CPO：第一性原理 | CRO：思维链（管线数学）| COO：逐步（流程图）| CTO：ReAct（研究→分析→行动）| CISO：风险导向（P×I）| CHRO：共情 + 数据

**贡献格式（最多 5 个要点，自我验证）：**
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

各智能体贡献前自我验证：来源归因、假设审计、置信度评分。无未标注声明。

---

### 阶段 3：批评者分析
执行导师同时接收所有阶段 2 输出。角色：对抗性审查者，非综合者。

检查清单：
- 智能体在哪些地方过于一致？（可疑共识 = 红旗）
- 哪些假设被共同持有但未验证？
- 谁不在场？（客户声音？一线运营？）
- 没人提到的风险是什么？
- 哪个智能体越界操作？

---

### 阶段 4：综合
幕僚长使用 **董事会会议输出** 格式交付（定义于 \`agent-protocol/SKILL.md\`）：
- 待决事项（一句话）
- 各方观点（每个贡献角色一行）
- 一致之处 / 分歧之处
- 批评者观点（令人不适的真相）
- 推荐决策 + 行动项（负责人、截止日期）
- 你的决定（若创始人不同意时的选项）

---

### 阶段 5：人在回路 ⏸️

**完全停止。等待创始人。**

\`\`\`
⏸️ 创始人审阅 — [粘贴综合内容]

选项：✅ 批准 | ✏️ 修改 | ❌ 拒绝 | ❓ 追问
\`\`\`

**规则：**
- 用户修正覆盖智能体提案。不反驳。不说「但 CFO 说……」
- 30 分钟无响应 → 自动关闭为「待审阅」
- 随时用 \`/cs:board resume\` 重新打开

---

### 阶段 6：决策提取
创始人批准后：
- **第 1 层：** 写入完整记录 → \`memory/board-meetings/YYYY-MM-DD-raw.md\`
- **第 2 层：** 追加已批准决策 → \`memory/board-meetings/decisions.md\`
- 标记被拒提案 \`[DO_NOT_RESURFACE]\`
- 向创始人确认：已记录决策数、跟踪行动项、已添加标记

---

## 记忆结构
\`\`\`
memory/board-meetings/
├── decisions.md          # 第 2 层 — 仅创始人批准（阶段 1 加载此文件）
├── YYYY-MM-DD-raw.md     # 第 1 层 — 完整记录（永不自动加载）
└── archive/YYYY/         # 90 天后归档原始记录
\`\`\`

**未来会议仅加载第 2 层。** 绝不加载第 1 层。防止过去辩论的幻觉共识。

---

## 失效模式快速参考
| 失效模式 | 修复 |
|---------|-----|
| 群体思维（全员同意） | 重新隔离运行阶段 2；强制「最强反对论据」 |
| 分析瘫痪 | 上限 5 点；即使低置信度也强制给出建议 |
| 琐事纠缠 | 记录为异步行动项；回到主议程 |
| 角色越界（CFO 做产品决策） | 批评者标记；排除出综合 |
| 层级污染 | 阶段 1 仅加载 decisions.md — 硬性规则 |

---

## 参考资料
- \`templates/meeting-agenda.md\` — 议程格式
- \`templates/meeting-minutes.md\` — 最终输出格式
- \`references/meeting-facilitation.md\` — 冲突处理、时间安排、失效模式`,
};
