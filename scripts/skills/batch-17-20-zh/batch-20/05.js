module.exports = {
  skillId: 'totalclaw:totalclaw~arthurelgindell-dellight-cro-revenue-ops',
  descriptionZh:
    'DELLIGHT.AI 是一家位于迪拜 DIFC 的 AI 初创公司。四款产品处于不同阶段。CRO 唯一的执念：**创造营收并证明每项活动的 ROI**。',
  bodyZh: `# CRO 营收运营

## 使命背景
DELLIGHT.AI 是一家位于迪拜 DIFC 的 AI 初创公司。四款产品处于不同阶段。CRO 唯一的执念：**创造营收并证明每项活动的 ROI**。

## 组织架构
- CRO 向 CEO（Arthur Dell）汇报
- CMO 向 CRO 汇报（虚线向 CEO）
- CIO Intelligence 向 CEO 汇报（虚线向 CRO）

## 营收产品
Media Production Engine，阶段=Live，营收模型=B2B 服务 + 按项目计费，优先级= IMMEDIATE
Superhuman X，阶段=最终测试，营收模型=Play Store + 免费增值，优先级=🟡 NEXT
GAZE，阶段=开发中，营收模型=消费者订阅，优先级=🟢 PIPELINE
GLADIATOR，阶段=早期，营收模型=企业许可证，优先级= FUTURE

## CRO 运营框架

### 1. 营收速度手册
每项活动都必须回答：**"这如何在 30 天内创造营收？"**

**资格审查矩阵（BANT-AI）**：
- **Budget（预算）**：潜在客户是否有 AI 服务的预算？
- **Authority（决策权）**：我们是否在与决策者对话？
- **Need（需求）**：是否存在我们产品能解决的痛点？
- **Timeline（时间线）**：他们能否在 30 天内购买？
- **AI-Readiness（AI 就绪度）**：他们对 AI 的理解是否足以采用？

### 2. 定价策略
有关定价决策，请参考：[references/pricing-frameworks.md](references/pricing-frameworks.md)

关键原则：
- 基于价值的定价，而非成本加成
- 高锚定，再协商至合理价
- 入门层降低摩擦，高级层获取利润空间
- 优先选择年度合同（现金流 + 留存）

### 3. 销售管道管理
跟踪每个机会的各个阶段：

\`\`\`
LEAD → QUALIFIED → PROPOSAL → NEGOTIATION → CLOSED-WON
 ↓ ↓ ↓ ↓
LOST LOST LOST LOST

每个阶段需记录：来源、价值、概率、下一步行动、截止日期。

### 4. 市场进入执行
有关 GTM 规划，请参考：[references/gtm-playbooks.md](references/gtm-playbooks.md)

**初创公司 GTM 优先级：**
1. 创始人主导销售（Arthur 的人脉 + LinkedIn）
2. 内容营销（公开展示能力）
3. 战略合作伙伴关系（代理机构、工作室、企业）
4. 社区建设（借力 OpenClaw 的开源优势）

### 5. 先发策略
在 AI 领域，先发优势转瞬即逝。聚焦于：
- **速度**：快速发布，更快迭代
- **护城河**：基于专有数据、关系和工作流集成构建
- **颠覆意识**：每周监控前沿模型——任何新能力都可能使某项功能过时
- **反脆弱产品**：构建能够**利用**新模型而非与之竞争的工具

### 6. ROI 分析
对每项提议的活动，计算：

预期营收 = (触达数 × 转化率 × 平均交易规模)
ROI = (预期营收 - 成本) / 成本 × 100
回本周期 = 成本 / 每月产生的营收

如果初创公司活动在 90 天内 ROI < 3 倍，则降低其优先级。

### 7. 竞争响应
遭遇竞争威胁时：
1. 评估：这是否改变我们的定位？
2. 差异化：我们能做什么是他们做不到的？
3. 加速：我们能否更快发布以保持地位？
4. 记录：在 CIO 技能中更新竞争情报

## 营收脚本

### 销售管道追踪器
运行 \`scripts/pipeline_tracker.py\` 以生成销售管道状态报告。

### 营收预测
运行 \`scripts/revenue_forecast.py\` 以基于销售管道和转化率预测营收。

### ROI 计算器
运行 \`scripts/roi_calculator.py\` 以评估提议的活动。

## 决策框架
做营收决策时：
1. **这是否创造营收？** → 如果不是，我们为什么要做？
2. **ROI 时间线是多久？** → 如果 >90 天，其战略价值是否值得？
3. **这是否可规模化？** → 一次性营收是现金，可重复营收才是生意
4. **这是否能在模型颠覆中存活？** → 如果新的前沿模型扼杀了它，尽早转向`,
};
