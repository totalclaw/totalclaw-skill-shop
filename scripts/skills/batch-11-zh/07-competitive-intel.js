module.exports = {
  skillId: 'totalclaw:totalclaw~competitive-intel',
  descriptionZh:
    '系统化竞品跟踪，支撑 CMO 定位、CRO battlecards 与 CPO 路线图决策。适用于分析竞品、构建销售 battlecards、跟踪市场动向、相对替代品定位，或用户提及 competitive intelligence、竞争分析、竞品研究、battlecards、win/loss 或市场定位时。',
  bodyZh: `# 竞争情报

系统化竞品跟踪。不是执念——驱动真实决策的情报。

## 关键词
competitive intelligence, competitor analysis, battlecard, win/loss analysis, competitive positioning, competitive tracking, market intelligence, competitor research, SWOT, competitive map, feature gap analysis, competitive strategy

## 快速开始

\`\`\`
/ci:landscape         — 绘制竞争空间（直接、间接、未来）
/ci:battlecard [name] — 为特定竞品构建销售 battlecard
/ci:winloss           — 按原因分析近期赢单与丢单
/ci:update [name]     — 跟踪竞品近期动态
/ci:map               — 构建竞争定位图
\`\`\`

## 框架：五层情报体系

### 第 1 层：竞品识别

**直接竞品：** 相同 ICP、相同问题、可比方案、相近价格点。
**间接竞品：** 相同预算、不同方案（含「什么都不做」与「自建」）。
**未来竞品：** 相邻领域融资充足的初创；路线图重叠的大型 incumbent。

**2x2 威胁矩阵：**

| | 相同 ICP | 不同 ICP |
|---|---|---|
| **相同问题** | 直接威胁 | 相邻（观察） |
| **不同问题** | 替代风险 | 暂可忽略 |

每季度更新。谁换了象限？

### 第 2 层：跟踪维度

每个竞品跟踪这 8 个维度：

| 维度 | 来源 | 节奏 |
|-----------|---------|---------|
| **产品动向** | Changelog、G2/Capterra 评价、Twitter/LinkedIn | 每月 |
| **定价变化** | 定价页、销售通话情报、客户反馈 | 事件触发 |
| **融资** | Crunchbase、TechCrunch、LinkedIn | 事件触发 |
| **招聘信号** | LinkedIn 职位、Indeed | 每月 |
| **合作** | 新闻稿、联合营销 | 事件触发 |
| **客户赢单** | 案例、评价站、LinkedIn | 每月 |
| **客户流失** | Win/loss 访谈、churn 账户 | 持续 |
| **信息变化** | 首页、广告（Facebook/Google Ad Library） | 每季度 |

### 第 3 层：分析框架

**每竞品 SWOT：**
- Strengths：他们擅长什么？在哪赢？
- Weaknesses：在哪输？客户抱怨什么？
- Opportunities：他们可能做什么威胁你？
- Threats：他们的生存风险是什么？

**竞争定位图（双轴）：**
选买家关心的轴：
- 常见：价格 vs 功能深度；企业就绪 vs SMB 就绪；易实施 vs 可配置
- 选能清晰展示**你**差异化的轴

**功能差距分析：**
| 功能 | You | Competitor A | Competitor B | 差距状态 |
|---------|-----|-------------|-------------|------------|
| [Feature] | ✅ | ✅ | ❌ | 你的优势 |
| [Feature] | ❌ | ✅ | ✅ | 差距 — 路线图？ |
| [Feature] | ✅ | ❌ | ❌ | 护城河 |
| [Feature] | ❌ | ❌ | ✅ | 仅 Competitor B |

### 第 4 层：输出格式

**销售（CRO）：** Battlecards — 每竞品一页，用于通话前准备。
见 \`templates/battlecard-template.md\`

**营销（CMO）：** 定位更新 — 信息转向、新差异化、应停止或开始的主张。

**产品（CPO）：** 功能差距摘要 — 客户要而我们没有的、竞品发布的、应重排的优先级。

**CEO/董事会：** 月度竞争摘要 — 1 页：谁动了、意味着什么、建议响应。

### 第 5 层：情报节奏

**每月（固定）：**
- 审阅所有 tier-1 竞品（直接威胁、前 3）
- 用新情报更新 battlecards
- 向领导层发布 1 页摘要

**事件触发：**
- 竞品融资 → 48 小时内评估影响
- 竞品发布重大功能 → 1 周内产品 + 销售响应
- 竞品挖走关键客户 → 2 周内 win/loss 访谈
- 竞品改价 → 1 周内分析并响应

**每季度：**
- 完整竞争格局审阅
- 更新定位图
- 刷新 ICP 竞争威胁评估
- 增减跟踪名单

---

## Win/Loss 分析

这是信号最强的竞争数据。多数公司做得太少。

**何时访谈：**
- 每笔丢单 >$50K ACV
- 每次 churn >6 个月 tenure
- 每次竞争赢单（弄清原因——可能不是你想的那样）

**由谁执行：**
- 不是负责该单的 AE（太近，prospect 不会 candid）
- 客户成功、产品团队或外部研究员

**问题结构：**
1. 「请走一遍你的评估流程」
2. 「还考虑了谁？」
3. 「决策的前 3 条标准是什么？」
4. 「[我们的产品] 在哪不足？」
5. 「决定性因素是什么？」
6. 「什么会改变你的决定？」

**每月汇总：**
- 赢单原因（按频率排序）
- 丢单原因（按频率排序）
- 竞品胜率（按竞品、按细分）
- 随时间模式

---

## 平衡：情报而不执念

**过度跟踪竞品的信号：**
- 路线图主要由「他们刚上了 X」驱动
- 竞品融资时团队士气下降
- 为对标 checklist 上你不信的功能
- 定价讨论总从「他们收 X」开始

**跟踪不足的信号：**
- AE 在通话中被突袭
- Prospect 比你们团队更懂竞品
- 重大产品发布直到客户告知才知道
- 市场动了 12+ 个月定位未变

**正确姿态：**
- 足够了解竞品以战胜他们
- 不要让他们定你的议程
- 路线图由客户问题主导，竞争差距作参考

---

## 情报分发

| 受众 | 格式 | 节奏 | 负责人 |
|----------|--------|---------|-------|
| AE + SDR | CRM 中更新的 battlecards | 每月 + 事件触发 | CRO |
| 产品 | 功能差距分析 | 每季度 | CPO |
| 营销 | 定位简报 | 每季度 | CMO |
| 领导层 | 1 页竞争摘要 | 每月 | CEO/COO |
| 董事会 | 竞争格局 slide | 每季度 | CEO |

**单一事实来源：** 所有竞争情报集中一处（Notion、Confluence、Salesforce）。避免只在 Slack 分发——会消失。

---

## 竞争情报红旗

| 信号 | 含义 |
|--------|---------------|
| 竞品在你核心细分胜率 >50% | 根本定位问题，非销售问题 |
| 5+ 笔单同一异议：「竞品有 X」 | 真实功能差距，非表象 |
| 竞品在你领域招 10 名工程师 | 重大产品投入将至 |
| 竞品融资 >$20M 且瞄准你的 ICP | 他们有 12 个月硬刚跑道 |
| Prospect 评估你只为 justify 竞品决定 | 你是「checkbox」— 修认知或细分 |

## 与 C 级角色集成

| 情报类型 | 输送给 | 输出格式 |
|------------------|----------|---------------|
| 产品动向 | CPO | 路线图输入、功能差距分析 |
| 定价变化 | CRO, CFO | 定价响应建议 |
| 融资轮 | CEO, CFO | 战略定位更新 |
| 招聘信号 | CHRO, CTO | 人才市场情报 |
| 客户赢/输 | CRO, CMO | Battlecard 更新、定位转向 |
| 营销活动 | CMO | 反定位、渠道情报 |

## 参考
- \`references/ci-playbook.md\` — OSINT 来源、win/loss 框架、定位图构建
- \`templates/battlecard-template.md\` — 销售 battlecard 模板`,
};
