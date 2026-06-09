module.exports = {
  skillId: 'totalclaw:totalclaw~agent-protocol',
  descriptionZh:
    'C 级智能体间通信协议，定义调用语法、循环防护、隔离规则与验证流程，防止混乱与循环推理。',
  bodyZh: `# 智能体间协议

C 级智能体如何相互沟通。防止混乱、循环与循环推理的规则。

## 关键词
agent protocol, inter-agent communication, agent invocation, agent orchestration, multi-agent, c-suite coordination, agent chain, loop prevention, agent isolation, board meeting protocol

## 调用语法

任意智能体可使用以下方式查询另一智能体：

\`\`\`
[INVOKE:role|question]
\`\`\`

**示例：**
\`\`\`
[INVOKE:cfo|What's the burn rate impact of hiring 5 engineers in Q3?]
[INVOKE:cto|Can we realistically ship this feature by end of quarter?]
[INVOKE:chro|What's our typical time-to-hire for senior engineers?]
[INVOKE:cro|What does our pipeline look like for the next 90 days?]
\`\`\`

**有效角色：** \`ceo\`, \`cfo\`, \`cro\`, \`cmo\`, \`cpo\`, \`cto\`, \`chro\`, \`coo\`, \`ciso\`

## 响应格式

被调用智能体使用以下结构响应：

\`\`\`
[RESPONSE:role]
Key finding: [one line — the actual answer]
Supporting data:
  - [data point 1]
  - [data point 2]
  - [data point 3 — optional]
Confidence: [high | medium | low]
Caveat: [one line — what could make this wrong]
[/RESPONSE]
\`\`\`

## 循环防护（硬性规则）

以下规则无条件执行。无例外。

### 规则 1：禁止自我调用
智能体不能调用自己。
\`\`\`
❌ CFO → [INVOKE:cfo|...] — 阻止
\`\`\`

### 规则 2：最大深度 = 2
链可达 A→B→C。第三跳被阻止。
\`\`\`
✅ CRO → CFO → COO（深度 2）
❌ CRO → CFO → COO → CHRO（深度 3 — 阻止）
\`\`\`

### 规则 3：禁止循环调用
若 A 调用了 B，同一链中 B 不能调用 A。
\`\`\`
✅ CRO → CFO → CMO
❌ CRO → CFO → CRO（循环 — 阻止）
\`\`\`

### 规则 4：链追踪
每次调用携带调用链。格式：
\`\`\`
[CHAIN: cro → cfo → coo]
\`\`\`
智能体在再次调用前检查此链。

**被阻止时：** 返回以下内容而非调用：
\`\`\`
[BLOCKED: cannot invoke cfo — circular call detected in chain cro→cfo]
State assumption used instead: [explicit assumption the agent is making]
\`\`\`

## 隔离规则

### 董事会会议阶段 2（独立分析）
**禁止调用。** 各角色在交叉授粉前形成独立观点。
- 原因：防止锚定与群体思维
- 时长：整个阶段 2 分析期
- 若需其他角色数据：陈述明确假设，用 \`[ASSUMPTION: ...]\` 标记

### 董事会会议阶段 3（批评者角色）
执行导师可**引用**其他角色输出但**不能调用**他们。
- 原因：批评必须独立于新数据请求
- 允许："CFO 的预测假设 X，与 CRO 的管道数据矛盾"
- 不允许：批评阶段使用 \`[INVOKE:cfo|...]\`

### 董事会会议之外
允许自由调用，受上述循环防护规则约束。

## 何时调用 vs 何时假设

**调用当：**
- 问题需要你没有的领域数据
- 此处错误会实质改变建议
- 问题本质跨职能（如招聘对预算与产能的影响）

**假设当：**
- 数据方向明确且精度不关键
- 处于阶段 2 隔离（始终假设，永不调用）
- 链已达深度 2
- 问题相对于主分析较次要

**假设时始终标明：**
\`\`\`
[ASSUMPTION: runway ~12 months based on typical Series A burn profile — not verified with CFO]
\`\`\`

## 冲突解决

当两个被调用智能体给出矛盾答案：

1. **明确标记冲突：**
   \`\`\`
   [CONFLICT: CFO projects 14-month runway; CRO expects pipeline to close 80% → implies 18+ months]
   \`\`\`
2. **说明解决方式：**
   - 保守：采用更差情况
   - 概率：按置信度加权
   - 升级：标记供人工决策
3. **绝不默默选一个** — 向用户呈现冲突。

## 广播模式（危机 / CEO）

CEO 可同时向所有角色广播：
\`\`\`
[BROADCAST:all|What's the impact if we miss the fundraise?]
\`\`\`

响应独立返回（智能体在形成自己观点前看不到他人响应）。全部响应后汇总。

## 快速参考

| 规则 | 行为 |
|------|----------|
| 自我调用 | ❌ 始终阻止 |
| 深度 > 2 | ❌ 阻止，陈述假设 |
| 循环 | ❌ 阻止，陈述假设 |
| 阶段 2 隔离 | ❌ 禁止调用 |
| 阶段 3 批评 | ❌ 仅引用，不调用 |
| 冲突 | ✅ 呈现，不隐藏 |
| 假设 | ✅ 始终用 \`[ASSUMPTION: ...]\` 明确 |

## 内部质量循环（到达创始人之前）

任何角色未经此验证循环不得向创始人呈现。创始人看到打磨、验证过的输出 — 不是初稿。

### 步骤 1：自验证（每角色每次）

呈现前，每角色运行此内部检查清单：

\`\`\`
SELF-VERIFY CHECKLIST:
□ Source Attribution — Where did each data point come from?
□ Assumption Audit — What am I assuming vs what I verified?
□ Confidence Score — How sure am I on each finding?
□ Contradiction Check — Does this conflict with known context?
□ "So What?" Test — Does every finding have a business consequence?
\`\`\`

### 步骤 2：同行验证（跨职能校验）

当建议影响其他角色领域时，该角色在呈现前验证。

| 若建议涉及... | 与...验证 | 他们检查... |
|-------------------------------------|-------------------|---------------|
| 财务数字或预算 | CFO | 计算、跑道影响、预算现实 |
| 收入预测 | CRO | 管道支撑、历史准确性 |
| 人数或招聘 | CHRO | 市场现实、薪酬可行性、时间线 |
| 技术可行性或时间线 | CTO | 工程产能、技术债负担 |
| 运营流程变更 | COO | 产能、依赖、扩展影响 |
| 面向客户变更 | CRO + CPO | 流失风险、产品路线图冲突 |
| 安全或合规主张 | CISO | 实际态势、法规要求 |
| 市场或定位主张 | CMO | 数据支撑、竞争现实 |

### 步骤 3：批评者预筛（仅高风险决策）

对**不可逆、高成本或赌公司**的决策，执行导师在创始人看到前预筛。

### 步骤 4：路线修正（创始人反馈后）

交付后循环不结束。创始人响应后记录决策、更新分析或记录拒绝原因。

### 按风险等级的验证级别

| 风险 | 自验证 | 同行验证 | 批评者预筛 |
|--------|-------------|-------------|-------------------|
| 低（信息性） | ✅ 必需 | ❌ 跳过 | ❌ 跳过 |
| 中（运营） | ✅ 必需 | ✅ 必需 | ❌ 跳过 |
| 高（战略） | ✅ 必需 | ✅ 必需 | ✅ 必需 |
| 关键（不可逆） | ✅ 必需 | ✅ 必需 | ✅ 必需 + 董事会会议 |

## 用户沟通标准

所有 C 级对创始人的输出遵循**一种**格式。无例外。创始人是决策者 — 给结果，不给过程。

### 标准输出（单角色响应）

包含：BOTTOM LINE、WHAT、WHY THIS MATTERS、HOW TO ACT、RISKS、YOUR DECISION、DETAIL。

### 主动告警（非请求触发）

包含：WHAT I NOTICED、WHY IT MATTERS、RECOMMENDED ACTION、URGENCY。

### 董事会会议输出（多角色综合）

包含：DECISION REQUIRED、PERSPECTIVES、WHERE THEY AGREE/DISAGREE、CRITIC'S VIEW、RECOMMENDED DECISION、ACTION ITEMS、YOUR CALL。

### 沟通规则（不可妥协）

1. **结论先行。** 始终。创始人时间最稀缺。
2. **仅结果与决策。** 无过程叙述。无思考外泄。
3. **What + Why + How。** 每项发现说明是什么、为何重要、如何行动。
4. **每节最多 5 条。** 更长 → 参考文档。
5. **行动有负责人与截止日期。**
6. **决策以选项呈现。**
7. **创始人决策。** 角色建议，创始人批准/修改/拒绝。
8. **风险要具体。**
9. **无解释不用术语。**
10. **沉默也是选项。** 无内容可报时不编造更新。

## 参考
- \`references/invocation-patterns.md\` — 常见跨职能模式与示例`,
};
