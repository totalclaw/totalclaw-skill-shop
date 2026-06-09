module.exports = {
  skillId: 'totalclaw:totalclaw~internal-narrative',
  descriptionZh:
    '在所有受众——员工、投资者、客户、候选人与合作伙伴——之间构建并维护一个连贯的公司故事。检测叙事矛盾，确保同一真相按各受众需求进行框定。适用于准备投资者更新、全员会演示、董事会沟通、招聘叙事、危机沟通，或用户提及 company narrative、messaging consistency、storytelling、all-hands、investor update、crisis communication 时。',
  bodyZh: `# 内部叙事构建者

一家公司。多种受众。同一真相——不同视角。叙事不一致就是信任侵蚀。本技能在所有利益相关方之间构建并维护连贯沟通。

## 关键词
narrative, company story, internal communication, investor update, all-hands, board communication, crisis communication, messaging, storytelling, narrative consistency, audience translation, founder narrative, employee communication, candidate narrative, partner communication

## 核心原则

**同一事实，因听众是谁、他们需要什么而不同落地。**

「我们将资源从 Product A 转向 Product B」意味着：
- 对员工：「我的工作安全吗？我们为何放弃我构建的东西？」
- 对投资者：「明智的资本配置——他们在加倍押注赢家」
- 对 Product A 客户：「他们要抛弃我们了吗？」
- 对候选人：「令人兴奋的新焦点——他们果断吗？」

同一事实。需要四种不同叙事。技能在于保持真相，同时回应各受众真正的问题。

---

## 框架

### 步骤 1：构建核心叙事

一段所有其他沟通都从中衍生的段落。这是真相之源。

**核心叙事模板：**
> [Company name] exists to [mission — present tense, specific]. We're building [what you're building] because [the problem you're solving]. Our approach is [your unique way of doing this]. We're at [honest description of current state] and heading toward [where you're going in concrete terms].

**好的核心叙事（示例）：**
> Acme Health exists to reduce preventable falls in elderly care using smartphone-based mobility analysis. We're building an AI diagnostic tool for care teams because current fall risk assessments are subjective, infrequent, and often wrong. Our approach — using the phone's camera during a 10-second walking test — means no new hardware, no specialist required. We have 80 care facilities in DACH paying us €800K ARR, and we're heading to €3M ARR by demonstrating clinical value at scale before our Series B.

**差的核心叙事：**
> Acme Health is an innovative AI company revolutionizing elderly care through cutting-edge technology that empowers care providers and improves patient outcomes across the continuum of care.

好的版本可用。差的版本什么都没说。

---

### 步骤 2：受众翻译矩阵

取核心叙事，为每个受众翻译。同一真相，不同框定。

| Fact | Employees need to hear | Investors need to hear | Customers need to hear | Candidates need to hear |
|------|----------------------|----------------------|----------------------|------------------------|
| We have 80 customers | "We've proven the model — your work matters" | "Product-market fit signal, capital efficient" | "80 care facilities trust us" | "Traction you'd be joining" |
| We pivoted from hardware | "We were honest enough to change course" | "Capital-efficient pivot to better unit economics" | "We found a faster, simpler way to serve you" | "We make decisions based on evidence, not ego" |
| We missed Q2 revenue | "Here's why, here's the plan, here's what you can do" | "Revenue mix shifted — trailing indicator improving" | [Usually don't tell customers revenue misses] | [Usually not shared externally] |
| We're hiring fast | "The team is growing — your network matters" | "Headcount plan aligned to growth" | [Not relevant unless it affects service] | "This is a rocket ship moment" |

**规则：**
- 跨受众绝不自相矛盾。不同框定 ≠ 不同事实。
- 「告诉投资者增长，告诉员工效率」是矛盾。对此做审计。
- 投资者与员工会互相看见。董事会成员会与你的团队交谈。候选人会在 Google 上搜你。

---

### 步骤 3：矛盾检测

任何重大沟通前，运行矛盾检查：

**问题 1：** 上个月我们对投资者关于 [topic] 说了什么？
**问题 2：** 我们对员工关于同一话题说了什么？
**问题 3：** 这些一致吗？若不一致——哪个版本是真的？

**常见矛盾：**
- 对投资者说「高效增长」+ 对候选人说「我们在大力招聘」
- 对投资者说「强劲管线」+ 全员会说「销售在挣扎」
- 文化上「客户第一」+ 近期决策明显把收入置于客户需求之上

**发现矛盾时：** 修正较不准确的版本，然后明确沟通更正。「上个月我说 X。经过更多反思，X 不太准确。这是更清晰的版本。」

在别人抓住你之前自我纠正，比被抓到更能建立信任。

---

### 步骤 4：按受众的沟通节奏

| Audience | Format | Frequency | Owner |
|----------|--------|-----------|-------|
| Employees | All-hands | Monthly | CEO |
| Employees | Team updates | Weekly | Team leads |
| Investors | Written update | Monthly | CEO + CFO |
| Board | Board meeting + memo | Quarterly | CEO |
| Customers | Product updates | Per release | CPO / CS |
| Candidates | Careers page + interview narrative | Ongoing | CHRO + Founders |
| Partners | Quarterly business review | Quarterly | BD Lead |

---

### 步骤 5：全员会结构与节奏

完整模板见 \`templates/all-hands-template.md\`。

**原则：**
- 以诚实的公司状态开场。不粉饰。
- 将公司业绩与个人工作连接：「你构建的东西如何促成了这一结果。」
- 给人们一个为选择在这里工作而自豪的理由。
- 留出真实 Q&A 时间——不是策划过的问题。

**全员会失败模式：**
- CEO 讲 60 分钟中的 55 分钟；Q&A 是「有什么快速问题吗？」
- 全是好消息——员工知道你没说实话
- 指标无背景：「ARR 增长 15%」却不解释是好、坏还是预期内
- 问题被回避：「这点很好，我们应该跟进」→ 从未跟进

---

### 步骤 6：危机沟通

当叙事破裂——有人公开离职、产品失败、安全漏洞、媒体报道。

**4 小时规则：** 若某事已公开或即将公开，4 小时内对内沟通。员工不应从 Twitter 得知公司新闻。

**危机沟通顺序：**

**第 0–4 小时（内部优先）：**
1. CEO 或相关领导发送内部消息
2. 如实承认发生了什么
3. 说明已知与尚不知晓
4. 告知正在采取的措施
5. 告知若被问及应如何应对

**第 4–24 小时（如需对外）：**
1. 仅当事件已公开时发对外声明（媒体、社交）
2. 与内部消息一致——同一事实、适合受众的框定
3. 若涉及任何主张或责任，经法务审阅

**危机中不要做的事：**
- 沉默：让谣言填满真空
- 粉饰：人们能察觉并摧毁信任
- 「无可奉告」：等于「我们有事要瞒」
- 甩锅：即使别人造成问题，受众只关心你在做什么

**危机内部沟通模板：**
> "Here's what happened: [factual description]. Here's what we know right now: [known facts]. Here's what we don't know yet: [honest uncertainty]. Here's what we're doing: [specific actions]. Here's what you should do if you're asked about this: [specific guidance]. I'll update you by [specific time] with more information."

---

## 叙事一致性检查清单

任何重大对外沟通前运行：

- [ ] 这与上个月告诉投资者的内容一致吗？
- [ ] 这与上次全员会告诉员工的内容一致吗？
- [ ] 这与网站、招聘页或新闻稿中的任何内容矛盾吗？
- [ ] 若员工读到这份对外沟通，会认出所描述的公司吗？
- [ ] 若投资者读到我们的内部全员会 deck，会发现不一致之处吗？
- [ ] 我们对当前状态是否准确，还是在投射愿望？

---

## 叙事关键问题

- 「新员工能否向朋友解释我们公司为何存在？他们会说什么？」
- 「我们对投资者说什么战略？对员工说什么？一样吗？」
- 「若记者独立问团队成员描述公司，他们会说什么？」
- 「我们上次更新『为何存在』的故事是什么时候？还成立吗？」
- 「各受众最难的问题是什么？我们有诚实答案吗？」

## 红旗信号

- 不同部门对公司使命描述不同
- 投资者叙事强调增长；员工叙事强调稳定（或相反）
- 全员会演示大多是幻灯片、大多是单向
- Q&A 问题被筛选或回避
- 坏消息通过 Slack 谣言比领导沟通更早到达员工
- 招聘页描述的文化与员工认知不符

## 与其他 C-Suite 角色的整合

| When... | Work with... | To... |
|---------|-------------|-------|
| Investor update prep | CFO | Align financial narrative with company narrative |
| Reorg or leadership change | CHRO + CEO | Sequence: employees first, then external |
| Product pivot | CPO | Align customer communication with investor story |
| Culture change | Culture Architect | Ensure internal story is consistent with external employer brand |
| M&A or partnership | CEO + COO | Control information flow, prevent narrative leaks |
| Crisis | All C-suite | Single voice, consistent story, internal first |

## 详细参考
- \`references/narrative-frameworks.md\` — 叙事结构、创始人叙事、坏消息传递、全员会模板
- \`templates/all-hands-template.md\` — 全员会演示模板`,
};
