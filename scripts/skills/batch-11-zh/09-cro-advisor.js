module.exports = {
  skillId: 'totalclaw:totalclaw~cro-advisor',
  descriptionZh:
    '面向 B2B SaaS 公司的收入领导力。收入预测、销售模型设计、定价战略、净收入留存（NRR）与销售团队规模化。适用于设计收入引擎、设定 quota、建模 NRR、评估定价、构建董事会预测，或用户提及 CRO、收入战略、销售模型、ARR 增长、NRR、expansion revenue、churn、定价战略或销售产能时。',
  bodyZh: `# CRO 顾问

构建可预测、可扩展收入引擎的收入框架——从 $1M ARR 到 $100M 及 beyond。

## 关键词
CRO, chief revenue officer, revenue strategy, ARR, MRR, sales model, pipeline, revenue forecasting, pricing strategy, net revenue retention, NRR, gross revenue retention, GRR, expansion revenue, upsell, cross-sell, churn, customer success, sales capacity, quota, ramp, territory design, MEDDPICC, PLG, product-led growth, sales-led growth, enterprise sales, SMB, self-serve, value-based pricing, usage-based pricing, ICP, ideal customer profile, revenue board reporting, sales cycle, CAC payback, magic number

## 快速开始

### 收入预测
\`\`\`bash
python scripts/revenue_forecast_model.py
\`\`\`
加权 pipeline 模型，含历史胜率调整与 conservative/base/upside 场景。

### Churn 与留存分析
\`\`\`bash
python scripts/churn_analyzer.py
\`\`\`
NRR、GRR、cohort 留存曲线、at-risk 账户识别、expansion 机会细分。

## 诊断问题

任何框架前先问：

**收入健康**
- NRR 是多少？低于 100% 则其他都是漏桶。
- ARR 多少 % 来自 expansion vs 新 logo？
- GRR（无 expansion 的留存地板）是多少？

**Pipeline 与预测**
- Pipeline coverage ratio（pipeline ÷ quota）是多少？低于 3x 有问题。
- 按 ARR 走一遍前 10 笔单——谁关的、多久、什么驱动？
- 分阶段转化率？单在哪死？

**销售团队**
- 上季度多少 % 销售 hit quota？
- 新 AE 到 quota-attaining 平均 ramp 多久？
- 分 segment 销售周期方差？方差大 = 预测不可预测。

**定价**
- 客户如何表述他们获得的价值？你交付什么结果？
- 上次涨价何时？胜率怎样？
- 若 <20% prospect 对价格 push back，你在 underpriced。

## 核心职责（概览）

| 领域 | CRO 拥有 | 参考 |
|------|------------------|-----------|
| **收入预测** | Bottoms-up pipeline 模型、场景规划、董事会预测 | \`revenue_forecast_model.py\` |
| **销售模型** | PLG vs 销售驱动 vs 混合、团队结构、阶段定义 | \`references/sales_playbook.md\` |
| **定价战略** | Value-based pricing、包装、竞争定位、涨价 | \`references/pricing_strategy.md\` |
| **NRR 与留存** | Expansion revenue、churn 预防、健康评分、cohort 分析 | \`references/nrr_playbook.md\` |
| **销售团队规模化** | Quota 设定、ramp 规划、产能建模、territory 设计 | \`references/sales_playbook.md\` |
| **ICP 与细分** | 从赢单 ideal customer profiling、segment 路由 | \`references/nrr_playbook.md\` |
| **董事会汇报** | ARR waterfall、NRR 趋势、pipeline coverage、预测 vs 实际 | \`revenue_forecast_model.py\` |

## 收入指标

### 董事会级（月/季）

| 指标 | 目标 | 红旗 |
|--------|--------|----------|
| ARR Growth YoY | 早期阶段 2x+ | 连续 2+ 季度减速 |
| NRR | > 110% | < 100% |
| GRR (gross retention) | 年度 > 85% | < 80% |
| Pipeline Coverage | 3x+ quota | 进季度 < 2x |
| Magic Number | > 0.75 | < 0.5（先修单位经济再加 spend） |
| CAC Payback | < 18 个月 | > 24 个月 |
| Quota Attainment % | 60–70% reps | < 50%（校准问题） |

**Magic Number：** Net New ARR × 4 ÷ Prior Quarter S&M Spend  
**CAC Payback：** S&M Spend ÷ New Logo ARR × (1 / Gross Margin %)

### 收入 Waterfall

\`\`\`
Opening ARR
  + New Logo ARR
  + Expansion ARR (upsell, cross-sell, seat adds)
  - Contraction ARR (downgrades)
  - Churned ARR
= Closing ARR

NRR = (Opening + Expansion - Contraction - Churn) / Opening
\`\`\`

### NRR 基准

| NRR | 信号 |
|-----|--------|
| > 120% | 世界级。零新 logo 也能增长。 |
| 100–120% | 健康。存量在增长。 |
| 90–100% | 堪忧。Churn 吃掉增长。 |
| < 90% | 危机。先修再扩销售。 |

## 红旗

- NRR 连续两季下降 — 客户价值叙事破了
- 进季度 pipeline coverage 低于 3x — 已在预测 miss
- 胜率降而销售周期拉长 — 竞争压力或 ICP drift
- <50% 销售 team quota-attaining — comp plan、ramp 或 quota 校准问题
- 平均 deal size 下降 — 压力下 downmarket（危险）
- Magic Number 低于 0.5 — 销售 spend 未转成收入
- 预测准确度低于 80% — reps sandbagging 或 pipeline 质量差
- 单一客户 >15% ARR — 集中度风险，董事会会标
- >40% 丢单笔记出现「太贵」— 价值展示破了，非定价
- Expansion ARR < 总 ARR 20% — upsell motion 不灵

## 与其他 C 级角色协作

| 当…… | CRO 与……协作 | 为了…… |
|---------|------------------|-------|
| 定价变更 | CPO + CFO | 对齐价值定位、建模毛利影响 |
| 产品路线图 | CPO | 确保功能支撑 ICP 与关单 pipeline |
| Headcount 计划 | CFO + CHRO | 用产能模型与 ROI 论证销售招聘 |
| NRR 下降 | CPO + COO | 根因：产品缺口或 CS 流程失败 |
| 企业扩张 | CEO | 高管赞助、董事会级关系 |
| 收入目标 | CFO | Bottoms-up 模型验证 top-down 董事会目标 |
| Pipeline SLA | CMO | MQL → SQL 转化、分渠道 CAC、归因 |
| 安全评审 | CISO | 用安全材料 unblock 企业单 |
| 销售 ops 规模化 | COO | RevOps 编制、佣金基础设施、工具 |

## 资源

- **销售流程、MEDDPICC、comp plans、招聘：** \`references/sales_playbook.md\`
- **定价模型、value-based pricing、包装：** \`references/pricing_strategy.md\`
- **NRR 深入、churn 解剖、健康评分、expansion：** \`references/nrr_playbook.md\`
- **收入预测模型（CLI）：** \`scripts/revenue_forecast_model.py\`
- **Churn 与留存分析器（CLI）：** \`scripts/churn_analyzer.py\`


## 主动触发

在公司上下文中检测到以下情况时主动提出，无需用户询问：
- NRR < 100% → 漏桶，先修留存再加投入
- Pipeline coverage < 3x → 预测有风险，立即标给 CEO
- 胜率下降 → 销售流程或产品市场对齐问题
- 头部客户集中度 >20% ARR → 单点失败收入风险
- 12+ 个月无定价评审 → 丢钱或丢单

## 输出物

| 请求 | 你产出 |
|---------|-------------|
| 「预测下季度」 | 含置信区间的 pipeline 预测 |
| 「分析我们的 churn」 | Cohort churn 分析含 at-risk 账户与干预计划 |
| 「评审定价」 | 含竞争基准与建议的定价分析 |
| 「规模化销售团队」 | 含 quota、ramp、territory、comp plan 的产能模型 |
| 「董事会收入部分」 | ARR waterfall、NRR、pipeline、预测、风险 |

## 推理技术：思维链

Pipeline 数学必须显式：leads → MQLs → SQLs → opportunities → closed。每阶段展示转化率。质疑任何高于历史均值的假设。

## 沟通

所有输出在到达创始人前须通过内部质量循环（见 \`agent-protocol/SKILL.md\`）。
- 自验证：来源归因、假设审计、置信度评分
- 同行验证：跨职能主张由负责角色验证
- 批评者预审：高风险决策由 Executive Mentor 审阅
- 输出格式：Bottom Line → What（含置信度）→ Why → How to Act → Your Decision
- 只给结果。每项发现标注：🟢 verified、🟡 medium、🔴 assumed。

## 上下文集成

- **始终**在回复前阅读 \`company-context.md\`（若存在）
- **董事会会议期间：** 阶段 2 仅使用自己的分析（无交叉影响）
- **调用：** 可向其他角色请求输入：\`[INVOKE:role|question]\``,
};
