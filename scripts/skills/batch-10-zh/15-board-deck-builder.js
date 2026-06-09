module.exports = {
  skillId: 'totalclaw:totalclaw~board-deck-builder',
  descriptionZh:
    '整合 C-suite 各角色视角，组装董事会与投资人更新 deck。适用于董事会会议、投资人更新、季度业务回顾或融资叙事。',
  bodyZh: `# Board Deck Builder

构建讲故事的董事会 deck — 而非仅展示数据。每个部分都有负责人、叙事与「所以呢」。

## 关键词
board deck, investor update, board meeting, board pack, investor relations, quarterly review, board presentation, fundraising deck, investor deck, board narrative, QBR, quarterly business review

## 快速开始

\`\`\`
/board-deck [quarterly|monthly|fundraising] [stage: seed|seriesA|seriesB]
\`\`\`

提供可用指标。构建器用明确占位符填补缺口 — 绝不编造数字。

## Deck 结构（标准顺序）

每个部分遵循：**标题 → 数据 → 叙事 → 请求/下一步**

### 1. 执行摘要（CEO）
**3 句话。不多于此。**
- 第 1 句：业务状态（我们在哪里）
- 第 2 句：本周期最重要的事
- 第 3 句：下季度方向

*差：* "We had a good quarter with lots of progress across all areas."
*好：* "We closed Q3 at $2.4M ARR (+22% QoQ), signed our largest enterprise contract, and enter Q4 with 14-month runway. The strategic shift to mid-market is working — ACV up 40% and sales cycle down 3 weeks. Q4 priority: close the $3M Series A and hit $2.8M ARR."

### 2. 关键指标仪表盘（COO）
**最多 6-8 个指标。使用表格。**

| Metric | This Period | Last Period | Target | Status |
|--------|-------------|-------------|--------|--------|
| ARR | $2.4M | $1.97M | $2.3M | ✅ |
| MoM growth | 8.1% | 7.2% | 7.5% | ✅ |
| Burn multiple | 1.8x | 2.1x | <2x | ✅ |
| NRR | 112% | 108% | >110% | ✅ |
| CAC payback | 11 months | 14 months | <12 months | ✅ |
| Headcount | 24 | 21 | 25 | 🟡 |

选择董事会实际跟踪的指标。替换他们表示不关心的项。

### 3. 财务更新（CFO）
- P&L 摘要：Revenue、COGS、Gross margin、OpEx、Net burn
- 现金头寸与 runway（月数）
- Burn multiple 趋势（3 季度视图）
- 与计划的差异（有何不同及原因）
- 下季度预测更新

**每个差异一句话。** 董事会讨厌「收入低于目标」却无解释。说明原因。

### 4. 收入与管道（CRO）
- ARR waterfall：期初 → 新增 → 扩展 → 流失 → 期末
- NRR 与 logo churn 率
- 按阶段的 pipeline（以 $ 计，非仅数量）
- 预测：下季度及置信度
- Top 3 交易：名称/金额/关闭日期/风险

**预测必须有置信度。** "We expect $2.8M" 太弱。"High confidence $2.6M, upside to $2.9M if two late-stage deals close" 才有用。

### 5. 产品更新（CPO）
- 本季度已发布：3-5 条 bullet，每条的用户影响
- 下季度计划发布：3-5 条 bullet 及目标日期
- PMF 信号：NPS 趋势、DAU/MAU 比、功能采用
- 客户研究的一项关键学习

**不要功能清单。** 仅展示有用户影响证据的功能。

### 6. 增长与营销（CMO）
- 按渠道的 CAC（表格）
- 按渠道的 pipeline 贡献（$）
- 与阶段相关的品牌/认知指标（流量、声量份额）
- 什么有效、什么被砍、什么在测试

### 7. 工程与技术（CTO）
- 交付速度趋势（近 4 季度）
- 技术债比例与计划
- 基础设施：uptime、事件、成本趋势
- 安全态势（一行，标记待办项）

**除非有重大 issue，保持简短。** 董事会不需要 sprint 细节。

### 8. 团队与人员（CHRO）
- 人数：实际 vs 计划
- 招聘：待发 offer、pipeline、time-to-fill 趋势
- 流失： regrettable vs non-regrettable
- 敬业度：最近调研分数、趋势
- 本季度关键 hire、关键 open roles

### 9. 风险与安全（CISO）
- 安全态势：关键控制状态
- 合规：进行中的认证、截止日期
- 本季度事件（如有）：影响、解决、预防
- Top 3 风险及缓解状态

### 10. 战略展望（CEO）
- 下季度优先级：3-5 项，排序
- 需要董事会做出的关键决策
- 请求：预算、介绍、建议、投票

**「asks」幻灯片最重要。** 要具体。"We'd like 3 warm introductions to CFOs at Series B companies" 胜过 "any help would be appreciated."

### 11. 附录
- 详细财务模型
- 完整 pipeline 数据
- 队列留存图表
- 客户案例研究
- 详细人数 breakdown

---

## 叙事框架

董事会每季度看 10+ 份 deck。你的需要一条主线。

**四幕结构：**
1. **我们说好会在哪里**（上季度目标）
2. **我们实际在哪里**（诚实评估）
3. **差距为何存在**（每个差异一个原因，非借口）
4. **我们在做什么**（具体、有日期的行动）

好消息与坏消息均适用。因承认现实而可信。

**开场框架：** 从最重要的一件事开始 — 董事会应在第 3 张幻灯片而非第 30 张知道核心信息。

---

## 传达坏消息

不要掩盖。董事会终会知道。晚知道更糟。

**框架：**
1. **直说** — "We missed Q3 ARR target by $300K (12% gap)"
2. **承担原因** — "Primary driver was longer-than-expected sales cycle in enterprise segment"
3. **展示理解** — "We analyzed 8 lost/stalled deals; the pattern is X"
4. **提出修复** — "We've made 3 changes: [specific, dated changes]"
5. **更新预测** — "Revised Q4 target is $2.6M; here's the bottom-up build"

**不要做的事：**
- 不要用好消息软化坏消息 — 董事会会察觉并不信任这种 framing
- 不要只解释不担责 — "market conditions" 是背景不是原因
- 不要无数据支撑就提修复
- 不要展示修订预测却不展示假设

---

## 常见 Board Deck 错误

| 错误 | 修复 |
|---------|-----|
| 幻灯片过多（>25） |  ruthlessly 删减 — 无法在会议室讲清则幻灯片有问题 |
| 指标无目标 | 每个指标需目标与状态 |
| 无叙事 | 无故事的数据迫使董事会自行结论 |
| 掩盖坏消息 | 先说、担责、修复 |
| 模糊 asks | 仅具体、可执行、有负责人的 asks |
| 无差异解释 | 每个与目标的差距需一句话原因 |
| 附录过时 | 附录仅在其为最新时有价值 |
| 为读者而非会议室设计 | deck 用于演示 — 必须适合口头讲述 |

---

## 节奏说明

**季度（标准）：** 完整 deck，所有部分，20-30 张幻灯片。提前 48 小时发送。
**月度（早期阶段）：**  condensed — 指标仪表盘、财务、pipeline、top 风险。8-12 张。
**融资：** 以市场/愿景开场，以 ask 收尾。见 \`references/deck-frameworks.md\` 的 Sequoia 格式。

## 参考
- \`references/deck-frameworks.md\` — SaaS board pack 格式、Sequoia 结构、投资人定制
- \`templates/board-deck-template.md\` — 完整 board deck 填空模板`,
};
