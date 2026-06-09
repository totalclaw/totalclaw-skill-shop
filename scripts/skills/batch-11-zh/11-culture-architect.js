module.exports = {
  skillId: 'totalclaw:totalclaw~culture-architect',
  descriptionZh:
    '将公司文化作为运营行为来构建、衡量与演进——而非墙上的海报。涵盖使命/愿景/价值观工作坊、价值观到行为的转化、文化准则创建、文化健康评估，以及按阶段设计的文化仪式。适用于构建公司价值观、评估文化健康、设计文化仪式、创建文化准则、处理文化冲突，或用户提及 culture、values、culture debt、founder culture、culture code 时。',
  bodyZh: `# 文化架构师

文化是你**做什么**，而不是你**说什么**。本技能将文化构建为运营系统——可观察的行为、可衡量的健康度，以及可扩展的仪式。

## 关键词
culture, company culture, values, mission, vision, culture code, cultural rituals, culture health, values-to-behaviors, founder culture, culture debt, value-washing, culture assessment, culture survey, Netflix culture deck, HubSpot culture code, psychological safety, culture scaling

## 核心原则

**文化 =（你奖励什么）+（你容忍什么）+（你庆祝什么）**

若你的价值观写着「透明」，却惩罚传递坏消息的人——你真正的价值观是「面子工程」。文化不是理想化的，而是描述性的。工作在于缩小「宣称的」与「实际的」之间的差距。

## 框架

### 1. 使命 / 愿景 / 价值观工作坊

以对话方式开展，而非企业团建。三个问题：

**使命** — 我们为何存在（超越赚钱）？
- 「若我们明天消失，世界会失去什么？」
- 使命用现在时。「我们减少老年护理中可预防的跌倒。」而非「成为领先的……」

**愿景** — 5–10 年后「赢」是什么样子？
- 具体到会错。「欧洲每家养老院都用我们的系统」胜过「成为市场领导者」。

**价值观** — 我们实际示范哪些行为？
- 从观察出发，而非听起来好听。「我们上次优秀新 hire 做了哪些没人要求的事？」
- 控制在 3–5 条。超过 5 条就都不再有意义。

### 2. 价值观 → 行为转化

这才是核心工作。每个价值观都需要行为锚点，否则只是装饰。

| Value | Bad version | Behavioral anchor |
|-------|------------|-------------------|
| Transparency | "We're open and honest" | "We share bad news within 24 hours, including to our manager" |
| Ownership | "We take responsibility" | "We don't hand off problems — we own them until resolved, even across team boundaries" |
| Speed | "We move fast" | "Decisions under €5K happen at team level, same day, no approval needed" |
| Quality | "We don't cut corners" | "We stop the line before shipping something we're not proud of" |
| Customer-first | "Customers are our priority" | "Any team member can escalate a customer issue to leadership, bypassing normal channels" |

**工作坊练习：** 写下你的价值观。然后问：「新员工在第 30 天如何知道我们真在践行它？」若无法具体回答，那不是价值观——是愿望。

### 3. 文化准则创建

文化准则是描述你如何运作的公开文档。它应吓退不合适的人、吸引合适的人。

**结构：**
1. 我们是谁（使命 + 背景）
2. 谁在这里茁壮成长（具体行为，而非形容词）
3. 谁在这里难以适应（诚实——这是最有用的部分）
4. 我们如何做决策
5. 我们如何沟通
6. 我们如何培养人
7. 我们对领导者的期望

完整模板见 \`templates/culture-code-template.md\`。

**应避免的反模式：**
- 「我们是一家人」——家人不会因绩效而解雇彼此
- 只列正面特质——「谁难以适应」部分才让它可信
- 写成理想化而非描述性

### 4. 文化健康评估

每季度运行。8–12 个问题。匿名。调研设计见 \`references/culture-playbook.md\`。

**核心衡量领域：**
1. 心理安全 —「我能否无惧地提出顾虑？」
2. 清晰度 —「我是否知道自己的工作如何连接公司目标？」
3. 公平 —「决策是否一致、透明地做出？」
4. 成长 —「我是否在这里学习并受到挑战？」
5. 对领导的信任 —「我相信领导告诉我的话吗？」

**分数解读：**
| Score | Signal | Action |
|-------|--------|--------|
| 80–100% | Healthy | Maintain, celebrate, document |
| 65–79% | Warning | Identify specific friction — don't over-react |
| 50–64% | Damaged | Urgent leadership attention + specific fixes |
| < 50% | Crisis | Culture emergency — all-hands intervention |

### 5. 按阶段的文化仪式

仪式是文化的传递机制。10 人时有效的，到 100 人就会失效。

**种子期（< 15 人）**
- 每周全员会（30 分钟）：公司更新 + 一个胜利 + 一个学习
- 每月复盘：什么有效、什么无效——无层级
- 「默认透明」：除非有具体理由，否则分享一切

**早期增长（15–50 人）**
- 季度文化调研：首次正式体检
- 认可仪式：明确、公开、与价值观挂钩（不仅是结果）
- 入职伙伴计划：文化传递现在需要刻意努力
- 领导开放时段：随着层级出现，创始人保持可接触

**规模化（50–200 人）**
- 文化委员会（同伴驱动，非 HR）：4–6 人每季度轮换
- 基于价值观的绩效评审：文化契合被衡量，而非假设
- 管理者培训：文化现在在团队负责人手中生死攸关
- 部门全员会 + 公司全员会分开举行

**大型（200+ 人）**
- 文化即战略：明确的年度文化计划，有负责人与 KPI
- 文化内部 NPS（「你会把这家公司推荐给朋友吗？」）
- 亚文化管理：工程文化 ≠ 销售文化——两者都必须对齐公司核心

### 6. 文化反模式

**价值观洗白（Value-washing）：** 列出你不践行的价值观。症状：员工在价值观讨论时翻白眼。
- 修复：做价值观审计。问「上次晋升的人展示了什么？」若与价值观不符，你真正的价值观不同。

**文化债务（Culture debt）：** 随时间积累的文化妥协。「我们以后再处理那个有毒的明星员工。」「以后」会复利恶化。
- 修复：对文化违规行动比你想的必要更快。一次被容忍的坏行为，会摧毁十次好行为所建立的。

**创始人文化陷阱：** 文化冻结在创始团队个性上。新员工要么同化要么离开。
- 修复：随规模明确演进价值观。10 人时有效的（快行动、先斩后奏）在 100 人时可能破坏性（我们需要流程）。

**渗透式文化：** 假设文化自然传递。10 人时可以。50 人时不行。
- 修复：让文化有意为之。记录它。教授它。衡量它。明确奖励它。

## 与 C-Suite 的文化整合

| When... | Culture Architect works with... | To... |
|---------|---------------------------------|-------|
| Hiring surge | CHRO | Ensure culture fit is measured, not guessed |
| Org reorg | COO + CEO | Manage culture disruption from structure change |
| M&A or partnership | CEO + COO | Detect and resolve culture clashes early |
| Performance issues | CHRO | Separate culture fit from skill deficit |
| Strategy pivot | CEO | Update values/behaviors that the pivot makes obsolete |
| Rapid growth | All | Scale rituals before culture dilutes |

## 文化架构师会问的关键问题

- 「你能说出我们上次因文化原因解雇的人吗？他们做了什么？」
- 「上次晋升的员工因什么行为被晋升？这在你的价值观里吗？」
- 「新员工第 1 天会观察到什么，告诉他这里真正看重什么？」
- 「我们容忍了哪些不该容忍的？谁知道却无所作为？」
- 「柏林的团队负责人如何知道马德里的文化是什么？」

## 红旗信号

- 价值观贴在墙上，却从未在评审或决策中被引用
- 明星绩效者被免于文化标准
- 领导「没时间」参加文化仪式
- 新员工觉得文化与招聘时宣传的不同
- 没有安全提出文化顾虑的机制
- 文化调研结果从未与团队分享

## 详细参考
- \`references/culture-playbook.md\` — Netflix 分析、调研设计、仪式示例、并购 playbook
- \`templates/culture-code-template.md\` — 文化准则文档模板`,
};
