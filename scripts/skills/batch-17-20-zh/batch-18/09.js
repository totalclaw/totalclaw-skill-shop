module.exports = {
  skillId: 'totalclaw:totalclaw~gprecious-engineering-as-marketing',
  descriptionZh:
    '以「工程即营销」策略通过免费工具获取自然搜索流量并转化为付费客户。适用于零广告预算增长、低竞争关键词工具页规划与优化。',
  bodyZh: `# 工程即营销

通过构建能在低竞争关键词上排名的免费工具来增长产品，将访客转化为付费客户。零广告支出。

## 策略概览

1. 寻找低竞争关键词（KD < 15，搜索量 > 500），搭配工具意图修饰词（generator、checker、converter、validator、calculator）
2. 为每个关键词构建简单、单一用途的免费工具
3. 托管在产品域名（\`/tools/[slug]\`）上以继承域名权重
4. 添加情境化 CTA，将每个工具链接到主产品
5. 规模化：以第一个工具为模板，用 AI 在数分钟内创建新工具

**已验证基准：** 50+ 工具 → 每月 5 万访客 → $13K MRR，$0 营销预算。

## 工作流

### 阶段 1：关键词发现

寻找高搜索量、低竞争的机会：

\`\`\`
种子词：与产品领域相关的词汇
修饰词：generator、checker、converter、validator、calculator、tester、maker、builder、finder
公式：[种子词] + [修饰词] → 检查 KD + 搜索量 → 按搜索量/KD 比优先排序
\`\`\`

筛选条件：**KD ≤ 15**，**搜索量 ≥ 500**，**与目标受众相关**。

详细关键词研究流程、工具对比与 API 自动化选项 → 阅读 [references/strategy-playbook.md](references/strategy-playbook.md) 第 2 与第 6 节。

### 阶段 2：工具设计与构建

四种已验证模式：

| 模式 | 示例 | 工作量 | 搜索量 |
|---------|---------|--------|--------|
| 转换器/生成器 | PDF→Markdown、调色板 | 低 | 高 |
| 检查器/验证器 | SSL 检查器、站点地图验证器 | 中 | 高 |
| 计算器/估算器 | ROI 计算器、定价估算器 | 低 | 中 |
| AI 驱动生成器 | Meta 描述撰写器、FAQ 生成器 | 中 | 高 |

**构建流程：**
1. 手动创建第一个工具（作为模板）
2. 对每个新关键词：将模板 + 目标关键词交给 AI → 5 分钟内生成工具
3. 部署到产品域名的 \`/tools/[keyword-slug]\`

工具页结构、SEO 检查清单与技术栈建议 → 阅读 [references/strategy-playbook.md](references/strategy-playbook.md) 第 3 与第 5 节。

### 阶段 3：转化与衡量

每个工具页需要连接主产品的**情境化 CTA**：

- 转换器 → 「需要大规模转换？试试 [Product]」
- 检查器 → 「发现问题？[Product] 自动监控」
- 生成器 → 「[Product] 能做这个 + 10 倍更多」

**目标漏斗：** 工具访客 → 3-5% 点击 CTA → 25-40% 试用转付费。

完整转化漏斗架构与 KPI 跟踪 → 阅读 [references/strategy-playbook.md](references/strategy-playbook.md) 第 4 与第 7 节。

## 快速启动检查清单

- [ ] 列出产品领域的 5-10 个种子词
- [ ] 生成关键词候选：种子词 × 修饰词
- [ ] 筛选：KD ≤ 15，搜索量 ≥ 500，受众相关
- [ ] 按搜索量/KD 比优先选前 5 个
- [ ] 构建第一个工具（作为模板）
- [ ] 部署到产品域名 \`/tools/[slug]\`
- [ ] 添加情境化 CTA、FAQ 区块、schema 标记
- [ ] 提交到 Google Search Console
- [ ] 复制：从模板再创建 4 个工具
- [ ] 每月跟踪：排名、流量、CTR、转化`,
};
