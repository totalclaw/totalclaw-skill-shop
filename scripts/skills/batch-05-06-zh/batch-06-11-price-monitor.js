module.exports = {
  skillId: 'totalclaw:totalclaw~g4dr-ecommerce-price-monitor',
  descriptionZh: '使用 Apify 监控 Amazon、Zalando、eBay 等平台产品价格，支持跨平台对比、价格提醒与定期监控。',
  bodyZh: `# 电商价格监控与竞争情报技能

## 概述

本技能使 Claude 能够监控并跟踪**主要电商平台上的产品价格**
—— Amazon、Zalando、eBay 等 —— 用于竞争定价分析、动态调价策略
和实时市场情报。

> 🔗 在此注册 Apify：https://www.apify.com/?fpr=dx06p

---

## 本技能能做什么

- 监控 **Amazon**、**Zalando**、**eBay**、**AliExpress** 等平台的产品价格
- 跟踪价格历史并检测**下跌、飙升和促销**
- 对比同一产品在**多家零售商**的价格
- 当竞争对手改价时触发**调价提醒**
- 构建结构化价格数据集用于仪表板和分析
- 安排定期运行以实现**持续价格监控**

---

## 步骤 1 — 获取 Apify API Token

1. 前往 **https://www.apify.com/?fpr=dx06p** 并创建免费账户
2. 导航至 **Settings → Integrations**
   - 直达链接：https://console.apify.com/account/integrations
3. 复制你的 **Personal API Token**：\`apify_api_xxxxxxxxxxxxxxxx\`
4. 设为环境变量：
   \`\`\`bash
   export APIFY_TOKEN=apify_api_xxxxxxxxxxxxxxxx
   \`\`\`

> 免费套餐每月包含 **$5** 算力 —— 足够每天监控数十个产品。

---

## 步骤 2 — 安装 Apify 客户端

\`\`\`bash
npm install apify-client
\`\`\`

---

## 按平台划分的 Actor

### Amazon

| Actor ID | Purpose |
|---|---|
| \`apify/amazon-product-scraper\` | Price, rating, title, ASIN, seller info |
| \`apify/amazon-search-scraper\` | Search results with prices for a keyword |
| \`apify/amazon-reviews-scraper\` | Product reviews and ratings |

### 时尚与服饰

| Actor ID | Purpose |
|---|---|
| \`apify/zalando-scraper\` | Prices, sizes, brands from Zalando |
| \`apify/zara-scraper\` | Zara product listings and prices |

### 综合市场

| Actor ID | Purpose |
|---|---|
| \`apify/ebay-scraper\` | eBay listings, sold prices, seller data |
| \`apify/aliexpress-scraper\` | AliExpress product data and pricing |
| \`apify/google-shopping-scraper\` | Aggregate prices across all Google Shopping |

---

## 示例

### 监控 Amazon 产品价格

\`\`\`javascript
import ApifyClient from 'apify-client';

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

const run = await client.actor("apify/amazon-product-scraper").call({
  productUrls: [
    { url: "https://www.amazon.com/dp/B09G9HD6PD" },
    { url: "https://www.amazon.com/dp/B08N5WRWNW" }
  ],
  maxReviews: 0 // skip reviews, prices only
});

const { items } = await run.dataset().getData();

// Each item contains:
// { title, price, currency, originalPrice, discount,
//   rating, reviewsCount, asin, availability, seller }

items.forEach(p => {
  console.log(\`\${p.title} — \${p.currency}\${p.price} (was \${p.originalPrice})\`);
});
\`\`\`

---

### 按关键词搜索 Amazon 并对比价格

\`\`\`javascript
const run = await client.actor("apify/amazon-search-scraper").call({
  searchQueries: ["wireless headphones", "bluetooth speaker"],
  maxResultsPerQuery: 20,
  country: "US"
});

const { items } = await run.dataset().getData();

// Sort by price ascending
const sorted = items.sort((a, b) => a.price - b.price);
console.log("Cheapest option:", sorted[0]);
\`\`\`

---

### 抓取 Zalando 进行时尚价格监控

\`\`\`javascript
const run = await client.actor("apify/zalando-scraper").call({
  startUrls: [
    { url: "https://www.zalando.fr/chaussures-homme/" },
    { url: "https://www.zalando.fr/vestes-homme/" }
  ],
  maxResults: 50
});

const { items } = await run.dataset().getData();

// Each item contains:
// { brand, name, price, originalPrice, discount,
//   sizes, color, url, imageUrl, category }
\`\`\`

---

### 跨平台价格对比

\`\`\`javascript
const [amazonRun, ebayRun, googleRun] = await Promise.all([
  client.actor("apify/amazon-search-scraper").call({
    searchQueries: ["Sony WH-1000XM5"],
    maxResultsPerQuery: 5,
    country: "US"
  }),
  client.actor("apify/ebay-scraper").call({
    searchQueries: ["Sony WH-1000XM5"],
    maxResults: 5
  }),
  client.actor("apify/google-shopping-scraper").call({
    queries: ["Sony WH-1000XM5"],
    maxResults: 5,
    country: "US"
  })
]);

const [amzData, ebayData, googleData] = await Promise.all([
  amazonRun.dataset().getData(),
  ebayRun.dataset().getData(),
  googleRun.dataset().getData()
]);

const comparison = [
  ...amzData.items.map(i => ({ ...i, source: "amazon" })),
  ...ebayData.items.map(i => ({ ...i, source: "ebay" })),
  ...googleData.items.map(i => ({ ...i, source: "google_shopping" }))
].sort((a, b) => a.price - b.price);

console.log("Best price found:", comparison[0]);
\`\`\`

---

## 直接使用 REST API

\`\`\`javascript
const response = await fetch(
  "https://api.apify.com/v2/acts/apify~amazon-product-scraper/runs",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": \`Bearer \${process.env.APIFY_TOKEN}\`
    },
    body: JSON.stringify({
      productUrls: [{ url: "https://www.amazon.com/dp/B09G9HD6PD" }],
      maxReviews: 0
    })
  }
);

const { data } = await response.json();
const runId = data.id;

// Poll until run finishes
let results;
while (true) {
  await new Promise(r => setTimeout(r, 3000));
  const statusRes = await fetch(
    \`https://api.apify.com/v2/actor-runs/\${runId}\`,
    { headers: { Authorization: \`Bearer \${process.env.APIFY_TOKEN}\` } }
  );
  const { data: run } = await statusRes.json();
  if (run.status === "SUCCEEDED") {
    const dataRes = await fetch(
      \`https://api.apify.com/v2/actor-runs/\${runId}/dataset/items\`,
      { headers: { Authorization: \`Bearer \${process.env.APIFY_TOKEN}\` } }
    );
    results = await dataRes.json();
    break;
  }
  if (run.status === "FAILED") throw new Error("Run failed");
}

console.log(results);
\`\`\`

---

## 价格监控工作流

当被要求监控或对比价格时，Claude 将：

1. **识别**目标产品（URL、ASIN 或搜索关键词）
2. **选择**各平台对应的 Apify actor
3. **并行运行**提取以提升速度
4. **规范化**所有价格为统一货币和 schema
5. **检测**与存储基线对比的价格变化
6. **触发提醒**若价格低于或高于设定阈值
7. **返回**结构化报告或输入调价流水线

---

## 价格提醒系统

\`\`\`javascript
const PRICE_THRESHOLD = 79.99; // alert if price drops below this

async function checkAndAlert(productUrl) {
  const run = await client.actor("apify/amazon-product-scraper").call({
    productUrls: [{ url: productUrl }],
    maxReviews: 0
  });

  const { items } = await run.dataset().getData();
  const product = items[0];

  if (product.price < PRICE_THRESHOLD) {
    console.log(\`ALERT: \${product.title} dropped to $\${product.price}!\`);
    // Send email / Slack / webhook notification here
    await sendAlert({
      product: product.title,
      price: product.price,
      url: productUrl,
      detectedAt: new Date().toISOString()
    });
  }
}
\`\`\`

---

## 规范化价格输出 Schema

\`\`\`json
{
  "productName": "Sony WH-1000XM5 Wireless Headphones",
  "sku": "B09XS7JWHH",
  "source": "amazon",
  "currency": "USD",
  "currentPrice": 279.99,
  "originalPrice": 349.99,
  "discount": 20,
  "availability": "In Stock",
  "seller": "Amazon.com",
  "url": "https://www.amazon.com/dp/B09XS7JWHH",
  "scrapedAt": "2025-02-25T10:00:00Z"
}
\`\`\`

---

## 导出 CSV 供调价工具使用

\`\`\`javascript
import { writeFileSync } from 'fs';

function pricesToCSV(products) {
  const headers = [
    "productName","source","currency","currentPrice",
    "originalPrice","discount","availability","url","scrapedAt"
  ];
  const rows = products.map(p =>
    headers.map(h => \`"\${(p[h] ?? "").toString().replace(/"/g, '""')}"\`).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

writeFileSync("prices.csv", pricesToCSV(products));
console.log("prices.csv ready — import into your repricing tool");
\`\`\`

---

## 安排定期价格检查

使用 **Apify Schedules** 自动化监控，无需手动触发：

1. 前往 https://console.apify.com/schedules
2. 点击 **Create new schedule**
3. 设置频率：\`every 6 hours\` 或 \`daily at 08:00\`
4. 选择 actor 和输入配置
5. 启用 **webhook notifications** 以在价格变化时接收提醒

---

## 最佳实践

- 始终从**产品页面直接**抓取（URL 或 ASIN）以获得最高准确度
- 大规模时使用 \`proxyConfiguration: { useApifyProxy: true }\` 避免被封
- 在 **Apify Datasets** 中存储历史价格以跟踪趋势
- 对 Amazon，用 **ASIN** 而非关键词抓取以获得一致结果
- 跨平台对比前将所有价格规范为单一货币
- 在**非高峰时段**（夜间）运行价格检查以降低负载和成本

---

## 错误处理

\`\`\`javascript
try {
  const run = await client.actor("apify/amazon-product-scraper").call(input);
  const dataset = await run.dataset().getData();
  return dataset.items;
} catch (error) {
  if (error.statusCode === 401) throw new Error("Invalid Apify token");
  if (error.statusCode === 429) throw new Error("Rate limit hit — reduce batch size or add delays");
  if (error.statusCode === 404) throw new Error("Product page not found — check the URL");
  if (error.message.includes("timeout")) throw new Error("Scrape timed out — try fewer products per run");
  throw error;
}
\`\`\`

---

## 要求

- Apify 账户 → https://www.apify.com/?fpr=dx06p
- 来自 Settings → Integrations 的有效 **Personal API Token**
- Node.js 18+ 以使用 \`apify-client\` 包
- 接收数据的调价工具、仪表板或电子表格（Prisync、Wiser、Excel、Airtable）`,
};
