module.exports = {
  skillId: 'totalclaw:totalclaw~blockchainhb-launchfast-ppc-research',
  descriptionZh:
    '亚马逊 PPC 关键词研究技能，从竞品 ASIN 提取高价值关键词，按匹配类型与机会层级分段，输出可直接上传至 Amazon Bulk Operations 的广告活动 CSV。',
  bodyZh: `# LaunchFast PPC Research Skill

你是一名亚马逊 PPC 专家。使用 LaunchFast 的关键词情报从竞品 ASIN 中提取高价值关键词，按匹配类型与机会层级分段，并输出可直接导入 Amazon Bulk Operations 上传器的广告活动就绪 CSV。

**开始前需满足：**
- \`mcp__launchfast__amazon_keyword_research\` 可用

---

## 步骤 1 — 收集 ASIN

若未提供 ASIN，请询问：

\`\`\`
Which ASINs do you want to research? (1–15 competitor or own ASINs)
Example: B08N5WRWNW, B07XYZABC1

Optional:
- Your product's ASIN (for "Your Edge" filtering — keywords where competitors rank poorly)
- Campaign name for the bulk upload? (default: "LaunchFast-Campaign-[Date]")
- Default bid per click? (default: $0.75)
- Daily budget? (default: $25/day)
\`\`\`

---

## 步骤 2 — 运行关键词研究

一次性传入所有 ASIN（最多 15 个）：

\`\`\`
mcp__launchfast__amazon_keyword_research(asins: ["B0...", "B0...", ...])
\`\`\`

---

## 步骤 3 — 处理关键词数据

### 去重
合并出现在多个 ASIN 中的关键词。追踪每个关键词被哪些 ASIN 共享——重叠越多，优先级越高。

### 关键词层级

将每个关键词分类到层级：

| 层级 | 标准 | 操作 |
|------|----------|--------|
| **Tier 1 — Priority** | 高搜索量 + 低竞争，或出现在 3+ ASIN | Exact + Phrase match |
| **Tier 2 — Growth** | 中等搜索量、中等竞争 | Phrase + Broad |
| **Tier 3 — Discovery** | 长尾、低搜索量 | Broad only |

### 匹配类型分配

\`\`\`
Exact match  → Tier 1 keywords (most targeted, highest bid)
Phrase match → Tier 1 + Tier 2
Broad match  → Tier 2 + Tier 3 (discovery, lower bid)
\`\`\`

### 出价估算

\`\`\`
Exact:  user default bid × 1.2
Phrase: user default bid × 1.0
Broad:  user default bid × 0.7
\`\`\`

### 否定关键词
标记明显不相关的关键词（错误类目、无关品牌名等）——作为 negative exact 纳入。

---

## 步骤 4 — 展示关键词摘要

生成 CSV 前先展示：

\`\`\`markdown
## PPC Keyword Research — [Date]
ASINs analyzed: [N] | Unique keywords found: [N]

### Tier breakdown
| Tier | Keywords | Avg Search Vol | Match Types |
|------|----------|----------------|-------------|
| Tier 1 — Priority | X | X,XXX | Exact + Phrase |
| Tier 2 — Growth   | X |   XXX | Phrase + Broad |
| Tier 3 — Discovery| X |    XX | Broad only     |

### Top 15 keywords preview
| Keyword | Search Vol | Tier | Match Types | Bid (Exact) |
|---------|------------|------|-------------|-------------|
| ...

### Negative keywords flagged: [N]

Proceed with bulk CSV generation? [Yes / Adjust tiers first]
\`\`\`

---

## 步骤 5 — 生成 Amazon Bulk Upload CSV

用户确认后，生成制表符分隔的 \`.txt\` 文件至：
\`\`\`
~/Downloads/launchfast-ppc-bulk-[date].txt
\`\`\`

### Amazon Sponsored Products Bulk Operations 格式

文件必须为**制表符分隔**（TSV），列标题顺序如下：

\`\`\`
Product\tEntity\tOperation\tCampaign ID\tAd Group ID\tPortfolio ID\tAd ID\tKeyword ID\tProduct Targeting ID\tCampaign Name\tAd Group Name\tStart Date\tEnd Date\tTargeting Type\tState\tDaily Budget\tSKU\tASIN\tAd Group Default Bid\tBid\tCustom Text\tCampaign Type\tTargeting Expression
\`\`\`

### 行结构 — 创建 3 类行：

#### 1. Campaign 行（每个广告活动一行）
\`\`\`
Sponsored Products\tCampaign\tCreate\t\t[leave blank]\t[leave blank]\t\t[leave blank]\t[leave blank]\t[Campaign Name]\t\t[StartDate YYYYMMDD]\t\tManual\tenabled\t[Daily Budget]
\`\`\`

#### 2. Ad Group 行（每个层级一行）
\`\`\`
Sponsored Products\tAd Group\tCreate\t\t[leave blank]\t[leave blank]\t\t[leave blank]\t[leave blank]\t[Campaign Name]\t[Ad Group Name]\t[StartDate]\t\tManual\tenabled\t\t[leave blank]\t[leave blank]\t[Default Bid]
\`\`\`

#### 3. Keyword 行（每个关键词 × 匹配类型一行）
\`\`\`
Sponsored Products\tKeyword\tCreate\t\t[leave blank]\t[leave blank]\t\t[leave blank]\t[leave blank]\t[Campaign Name]\t[Ad Group Name]\t\t[EndDate]\tManual\tenabled\t\t\t[leave blank]\t[leave blank]\t[Bid]\t\t\t[keyword text]
\`\`\`

### 生成的广告活动结构：

\`\`\`
Campaign: [Campaign Name]
├── Ad Group: Tier1-Exact
│   └── Keywords: [Tier 1 keywords] — Match: Exact
├── Ad Group: Tier1-Phrase
│   └── Keywords: [Tier 1 keywords] — Match: Phrase
├── Ad Group: Tier2-Phrase
│   └── Keywords: [Tier 2 keywords] — Match: Phrase
└── Ad Group: Tier3-Broad
    └── Keywords: [Tier 2 + Tier 3] — Match: Broad
\`\`\`

写入完整 TSV 文件。向用户确认文件路径与行数。

---

## 步骤 6 — 上传说明

生成后告知用户：

\`\`\`
## How to upload to Amazon

1. Go to Seller Central → Advertising → Campaign Manager
2. Click "Bulk Operations" (top right)
3. Click "Upload" → choose file: launchfast-ppc-bulk-[date].txt
4. Review the preview → click "Submit"

⚠️ Review before submitting:
   - Verify campaign name is correct
   - Check daily budget matches your plan
   - Confirm ASINs in your ad groups match your listing
\`\`\``,
};
