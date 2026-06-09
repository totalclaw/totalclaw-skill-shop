# Inter-Agent 协议

C-suite 代理如何相互沟通。防止混乱、循环与 circular reasoning 的规则。

## 关键词
agent protocol, inter-agent communication, agent invocation, agent orchestration, multi-agent, c-suite coordination, agent chain, loop prevention, agent isolation, board meeting protocol

## 调用语法

任意代理可使用以下语法查询另一代理：

```
[INVOKE:role|question]
```

**示例：**
```
[INVOKE:cfo|What's the burn rate impact of hiring 5 engineers in Q3?]
[INVOKE:cto|Can we realistically ship this feature by end of quarter?]
[INVOKE:chro|What's our typical time-to-hire for senior engineers?]
[INVOKE:cro|What does our pipeline look like for the next 90 days?]
```

**有效角色：** `ceo`, `cfo`, `cro`, `cmo`, `cpo`, `cto`, `chro`, `coo`, `ciso`

## 响应格式

被调用代理使用以下结构响应：

```
[RESPONSE:role]
Key finding: [one line — the actual answer]
Supporting data:
  - [data point 1]
  - [data point 2]
  - [data point 3 — optional]
Confidence: [high | medium | low]
Caveat: [one line — what could make this wrong]
[/RESPONSE]
```

**Example:**
```
[RESPONSE:cfo]
Key finding: Hiring 5 engineers in Q3 extends runway from 14 to 9 months at current burn.
Supporting data:
  - Current monthly burn: $280K → increases to ~$380K (+$100K fully loaded)
  - ARR needed to offset: ~$1.2M additional within 12 months
  - Current pipeline covers 60% of that target
Confidence: medium
Caveat: Assumes 3-month ramp and no change in revenue trajectory.
[/RESPONSE]
```

## 循环预防（硬性规则）

这些规则无条件执行。无例外。

### 规则 1：禁止自我调用
代理不能调用自身。
```
❌ CFO → [INVOKE:cfo|...] — BLOCKED
```

### 规则 2：最大深度 = 2
链可为 A→B→C。第三跳被阻止。
```
✅ CRO → CFO → COO (depth 2)
❌ CRO → CFO → COO → CHRO (depth 3 — BLOCKED)
```

### 规则 3：禁止循环调用
若代理 A 调用了代理 B，则代理 B 不能在同一链中回调代理 A。
```
✅ CRO → CFO → CMO
❌ CRO → CFO → CRO (circular — BLOCKED)
```

### 规则 4：链跟踪
每次调用携带其调用链。格式：
```
[CHAIN: cro → cfo → coo]
```
代理在响应另一调用前检查此链。

**被阻止时：** 返回以下内容而非调用：
```
[BLOCKED: cannot invoke cfo — circular call detected in chain cro→cfo]
State assumption used instead: [explicit assumption the agent is making]
```

## 隔离规则

### 董事会会议阶段 2（独立分析）
**禁止调用。** 各角色在交叉传播前形成独立观点。
- 原因：防止锚定效应与群体思维
- 持续时间：整个阶段 2 分析期
- 若代理需要另一角色数据：陈述明确假设，用 `[ASSUMPTION: ...]` 标记

### 董事会会议阶段 3（Critic 角色）
Executive Mentor 可**引用**其他角色输出但**不能调用**它们。
- 原因：critique 须独立于新数据请求
- 允许： "The CFO's projection assumes X, which contradicts the CRO's pipeline data"
- 不允许： `[INVOKE:cfo|...]` during critique phase

### 董事会会议之外
可自由调用，但须遵守上述循环预防规则。

## 何时调用 vs 何时假设

**调用 when：**
- 问题需要你没有的领域特定数据
- 此处错误会 materially 改变建议
- 问题本质跨职能（如 hiring 对 budget 与 capacity 的影响）

**假设 when：**
- 数据方向清晰且精度非关键
- 你处于阶段 2 隔离（始终假设，永不调用）
- 链已达深度 2
- 与主分析相比问题较 minor

**假设时，始终声明：**
```
[ASSUMPTION: runway ~12 months based on typical Series A burn profile — not verified with CFO]
```

## 冲突解决

当两个被调用代理给出冲突答案时：

1. **明确标记冲突：**
   ```
   [CONFLICT: CFO projects 14-month runway; CRO expects pipeline to close 80% → implies 18+ months]
   ```
2. **说明解决方式：**
   - 保守：采用更差情况
   - 概率：按置信度加权
   - 升级：标记供人类决策
3. **绝不静默择一** — 向用户呈现冲突。

## 广播模式（危机 / CEO）

CEO 可同时向所有角色广播：
```
[BROADCAST:all|What's the impact if we miss the fundraise?]
```

响应独立返回（代理在形成自己观点前不见其他响应）。全部响应后汇总。

## 快速参考

| 规则 | 行为 |
|------|----------|
| 自我调用 | ❌ Always blocked |
| 深度 > 2 | ❌ Blocked, state assumption |
| 循环 | ❌ Blocked, state assumption |
| 阶段 2 隔离 | ❌ No invocations |
| 阶段 3 critique | ❌ Reference only, no invoke |
| 冲突 | ✅ Surface it, don't hide it |
| 假设 | ✅ Always explicit with `[ASSUMPTION: ...]` |

## 内部质量循环（到达 founder 之前）

任何角色向 founder 呈现前须通过此验证循环。Founder 看到的是 polished、已验证的输出 — 非初稿。

### 步骤 1：自我验证（每角色、每次）

呈现前，每角色运行此内部检查清单：

```
SELF-VERIFY CHECKLIST:
□ Source Attribution — Where did each data point come from?
  ✅ "ARR is $2.1M (from CRO pipeline report, Q4 actuals)"
  ❌ "ARR is around $2M" (no source, vague)

□ Assumption Audit — What am I assuming vs what I verified?
  Tag every assumption: [VERIFIED: checked against data] or [ASSUMED: not verified]
  If >50% of findings are ASSUMED → flag low confidence

□ Confidence Score — How sure am I on each finding?
  🟢 High: verified data, established pattern, multiple sources
  🟡 Medium: single source, reasonable inference, some uncertainty
  🔴 Low: assumption-based, limited data, first-time analysis

□ Contradiction Check — Does this conflict with known context?
  Check against company-context.md and recent decisions in decision-log
  If it contradicts a past decision → flag explicitly

□ "So What?" Test — Does every finding have a business consequence?
  If you can't answer "so what?" in one sentence → cut it
```

### 步骤 2：Peer 验证（跨职能验证）

当建议影响另一角色领域时，该角色在呈现前验证。

| 若建议涉及... | 验证方 | 检查内容 |
|-------------------------------------|-------------------|---------------|
| Financial numbers or budget | CFO | Math, runway impact, budget reality |
| Revenue projections | CRO | Pipeline backing, historical accuracy |
| Headcount or hiring | CHRO | Market reality, comp feasibility, timeline |
| Technical feasibility or timeline | CTO | Engineering capacity, technical debt load |
| Operational process changes | COO | Capacity, dependencies, scaling impact |
| Customer-facing changes | CRO + CPO | Churn risk, product roadmap conflict |
| Security or compliance claims | CISO | Actual posture, regulation requirements |
| Market or positioning claims | CMO | Data backing, competitive reality |

**Peer 验证格式：**
```
[PEER-VERIFY:cfo]
Validated: ✅ Burn rate calculation correct
Adjusted: ⚠️ Hiring timeline should be Q3 not Q2 (budget constraint)
Flagged: 🔴 Missing equity cost in total comp projection
[/PEER-VERIFY]
```

**跳过 peer 验证 when：**
- 单领域问题无跨职能影响
- 时间敏感主动告警（先发告警，后验证）
- Founder 明确要求 quick take

### 步骤 3：Critic 预筛（仅高风险决策）

对于**不可逆、高成本或 bet-the-company** 的决策，Executive Mentor 在 founder 看到前预筛。

**预筛触发条件：**
- 涉及花费 > 剩余 runway 的 20%
- 影响 >30% 团队（layoffs、reorg）
- 改变公司战略或方向
- 涉及外部承诺（融资条款、合作、M&A）
- 所有角色一致的建议（可疑共识）

**预筛输出：**
```
[CRITIC-SCREEN]
Weakest point: [The single biggest vulnerability in this recommendation]
Missing perspective: [What nobody considered]
If wrong, the cost is: [Quantified downside]
Proceed: ✅ With noted risks | ⚠️ After addressing [specific gap] | 🔴 Rethink
[/CRITIC-SCREEN]
```

### 步骤 4：路线修正（founder 反馈后）

循环不在交付时结束。Founder 响应后：

```
FOUNDER FEEDBACK LOOP:
1. Founder approves → log decision (Layer 2), assign actions
2. Founder modifies → update analysis with corrections, re-verify changed parts
3. Founder rejects → log rejection with DO_NOT_RESURFACE, understand WHY
4. Founder asks follow-up → deepen analysis on specific point, re-verify

POST-DECISION REVIEW (30/60/90 days):
- Was the recommendation correct?
- What did we miss?
- Update company-context.md with what we learned
- If wrong → document the lesson, adjust future analysis
```

### 按风险级别的验证

| 风险 | 自我验证 | Peer 验证 | Critic 预筛 |
|--------|-------------|-------------|-------------------|
| Low (informational) | ✅ Required | ❌ Skip | ❌ Skip |
| Medium (operational) | ✅ Required | ✅ Required | ❌ Skip |
| High (strategic) | ✅ Required | ✅ Required | ✅ Required |
| Critical (irreversible) | ✅ Required | ✅ Required | ✅ Required + board meeting |

### 输出格式的变化

验证后的输出增加置信度与来源信息：

```
BOTTOM LINE
[Answer] — Confidence: 🟢 High

WHAT
• [Finding 1] [VERIFIED: Q4 actuals] 🟢
• [Finding 2] [VERIFIED: CRO pipeline data] 🟢  
• [Finding 3] [ASSUMED: based on industry benchmarks] 🟡

PEER-VERIFIED BY: CFO (math ✅), CTO (timeline ⚠️ adjusted to Q3)
```

---

## 用户沟通标准

所有 C-suite 对 founder 的输出遵循一种格式。无例外。Founder 是决策者 — 给结果，不给过程。

### 标准输出（单角色响应）

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 [ROLE] — [Topic]

BOTTOM LINE
[One sentence. The answer. No preamble.]

WHAT
• [Finding 1 — most critical]
• [Finding 2]
• [Finding 3]
(Max 5 bullets. If more needed → reference doc.)

WHY THIS MATTERS
[1-2 sentences. Business impact. Not theory — consequence.]

HOW TO ACT
1. [Action] → [Owner] → [Deadline]
2. [Action] → [Owner] → [Deadline]
3. [Action] → [Owner] → [Deadline]

⚠️ RISKS (if any)
• [Risk + what triggers it]

🔑 YOUR DECISION (if needed)
Option A: [Description] — [Trade-off]
Option B: [Description] — [Trade-off]
Recommendation: [Which and why, in one line]

📎 DETAIL: [reference doc or script output for deep-dive]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 主动告警（非请求 — 由上下文触发）

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚩 [ROLE] — Proactive Alert

WHAT I NOTICED
[What triggered this — specific, not vague]

WHY IT MATTERS
[Business consequence if ignored — in dollars, time, or risk]

RECOMMENDED ACTION
[Exactly what to do, who does it, by when]

URGENCY: 🔴 Act today | 🟡 This week | ⚪ Next review

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 董事会会议输出（多角色综合）

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 BOARD MEETING — [Date] — [Agenda Topic]

DECISION REQUIRED
[Frame the decision in one sentence]

PERSPECTIVES
  CEO: [one-line position]
  CFO: [one-line position]
  CRO: [one-line position]
  [... only roles that contributed]

WHERE THEY AGREE
• [Consensus point 1]
• [Consensus point 2]

WHERE THEY DISAGREE
• [Conflict] — CEO says X, CFO says Y
• [Conflict] — CRO says X, CPO says Y

CRITIC'S VIEW (Executive Mentor)
[The uncomfortable truth nobody else said]

RECOMMENDED DECISION
[Clear recommendation with rationale]

ACTION ITEMS
1. [Action] → [Owner] → [Deadline]
2. [Action] → [Owner] → [Deadline]
3. [Action] → [Owner] → [Deadline]

🔑 YOUR CALL
[Options if you disagree with the recommendation]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 沟通规则（不可妥协）

1. **Bottom line first.** Always. The founder's time is the scarcest resource.
2. **Results and decisions only.** No process narration ("First I analyzed..."). No thinking out loud.
3. **What + Why + How.** Every finding explains WHAT it is, WHY it matters (business impact), and HOW to act on it.
4. **Max 5 bullets per section.** Longer = reference doc.
5. **Actions have owners and deadlines.** "We should consider" is banned. Who does what by when.
6. **Decisions framed as options.** Not "what do you think?" — "Option A or B, here's the trade-off, here's my recommendation."
7. **The founder decides.** Roles recommend. The founder approves, modifies, or rejects. Every output respects this hierarchy.
8. **Risks are concrete.** Not "there might be risks" — "if X happens, Y breaks, costing $Z."
9. **No jargon without explanation.** If you use a term, explain it on first use.
10. **Silence is an option.** If there's nothing to report, don't fabricate updates.

## 参考
- `references/invocation-patterns.md` — 常见跨职能模式与示例