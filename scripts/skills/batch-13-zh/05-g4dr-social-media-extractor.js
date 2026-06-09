module.exports = {
  skillId: 'totalclaw:totalclaw~g4dr-social-media-extractor',
  descriptionZh:
    '通过 Apify 平台从 Instagram、TikTok、Reddit 提取公开数据，用于趋势分析、内容研究、竞品监控与受众洞察，输出结构化 JSON。',
  bodyZh: `# 社交媒体数据提取技能

## 概述

本技能使 Claude 能够从 **Instagram**、**TikTok** 和 **Reddit** 提取公开数据，用于趋势分析、内容研究、竞品监控和受众洞察——由 **Apify 平台**驱动。

> 🔗 在此注册 Apify：https://www.apify.com/?fpr=dx06p

---

## 本技能能做什么

- 从 **Instagram** 提取公开帖子、话题标签和用户资料
- 从 **TikTok** 抓取热门视频、评论和创作者数据
- 从 **Reddit** 拉取帖子、讨论串、评论和 subreddit 数据
- 跨平台聚合数据以进行统一趋势分析
- 输出结构化 JSON 数据，便于分析、仪表盘或导出

---

## 步骤 1 — 获取 Apify API Token

1. 访问 **https://www.apify.com/?fpr=dx06p** 并创建免费账户
2. 登录后，进入 **Settings → Integrations**
   - 直达链接：https://console.apify.com/account/integrations
3. 复制你的 **Personal API Token** — 格式：\`apify_api_xxxxxxxxxxxxxxxx\`
4. 存为环境变量：
   \`\`\`bash
   export APIFY_TOKEN=apify_api_xxxxxxxxxxxxxxxx
   \`\`\`

> 免费套餐每月包含 **$5** 免费算力——足够进行常规趋势监控。

---

## 步骤 2 — 安装 Apify 客户端

\`\`\`bash
npm install apify-client
\`\`\`

---

## 各平台专用 Actor

### Instagram

| Actor ID | 用途 |
|---|---|
| \`apify/instagram-scraper\` | 抓取帖子、话题标签、资料、Reels |
| \`apify/instagram-hashtag-scraper\` | 按话题标签提取帖子 |
| \`apify/instagram-comment-scraper\` | 拉取指定帖子的评论 |

### TikTok

| Actor ID | 用途 |
|---|---|
| \`apify/tiktok-scraper\` | 抓取视频、资料、话题标签动态 |
| \`apify/tiktok-hashtag-scraper\` | 按话题标签获取热门内容 |
| \`apify/tiktok-comment-scraper\` | 获取指定视频的评论 |

### Reddit

| Actor ID | 用途 |
|---|---|
| \`apify/reddit-scraper\` | 从 subreddit 抓取帖子和评论 |
| \`apify/reddit-search-scraper\` | 按关键词搜索 Reddit |

---

## 示例

### 按话题标签提取 Instagram 帖子

\`\`\`javascript
import ApifyClient from 'apify-client';

const client = new ApifyClient({ token: process.env.APIFY_TOKEN });

const run = await client.actor("apify/instagram-hashtag-scraper").call({
  hashtags: ["trending", "viral", "fyp"],
  resultsLimit: 50
});

const { items } = await run.dataset().getData();

// Each item contains:
// { id, shortCode, caption, likesCount, commentsCount,
//   timestamp, ownerUsername, url, hashtags[] }

console.log(\`Extracted \${items.length} posts\`);
\`\`\`

---

### 按话题标签提取 TikTok 热门视频

\`\`\`javascript
const run = await client.actor("apify/tiktok-hashtag-scraper").call({
  hashtags: ["trending", "lifehack"],
  resultsPerPage: 30,
  shouldDownloadVideos: false
});

const { items } = await run.dataset().getData();

// Each item contains:
// { id, text, createTime, authorMeta, musicMeta,
//   diggCount, shareCount, playCount, commentCount }
\`\`\`

---

### 抓取 Subreddit 进行趋势分析

\`\`\`javascript
const run = await client.actor("apify/reddit-scraper").call({
  startUrls: [
    { url: "https://www.reddit.com/r/technology/" },
    { url: "https://www.reddit.com/r/worldnews/" }
  ],
  maxPostCount: 100,
  maxComments: 20,
  sort: "hot"
});

const { items } = await run.dataset().getData();

// Each item contains:
// { title, score, upvoteRatio, numComments, author,
//   created, url, selftext, subreddit, comments[] }
\`\`\`

---

### 多平台趋势聚合

\`\`\`javascript
const [igRun, ttRun, rdRun] = await Promise.all([
  client.actor("apify/instagram-hashtag-scraper").call({
    hashtags: ["aitools"], resultsLimit: 30
  }),
  client.actor("apify/tiktok-hashtag-scraper").call({
    hashtags: ["aitools"], resultsPerPage: 30
  }),
  client.actor("apify/reddit-search-scraper").call({
    queries: ["AI tools 2025"], maxItems: 30
  })
]);

const [igData, ttData, rdData] = await Promise.all([
  igRun.dataset().getData(),
  ttRun.dataset().getData(),
  rdRun.dataset().getData()
]);

const aggregated = {
  instagram: igData.items,
  tiktok: ttData.items,
  reddit: rdData.items,
  totalPosts: igData.items.length + ttData.items.length + rdData.items.length,
  extractedAt: new Date().toISOString()
};
\`\`\`

---

## 直接使用 REST API

\`\`\`javascript
const response = await fetch(
  "https://api.apify.com/v2/acts/apify~tiktok-scraper/runs",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": \`Bearer \${process.env.APIFY_TOKEN}\`
    },
    body: JSON.stringify({
      hashtags: ["viral"],
      resultsPerPage: 25
    })
  }
);

const { data } = await response.json();
const runId = data.id;

// Poll for completion
const resultRes = await fetch(
  \`https://api.apify.com/v2/actor-runs/\${runId}/dataset/items\`,
  { headers: { Authorization: \`Bearer \${process.env.APIFY_TOKEN}\` } }
);

const posts = await resultRes.json();
\`\`\`

---

## 趋势分析工作流

当用户要求分析趋势时，Claude 将：

1. **识别**目标平台与关键词/话题标签
2. **运行**合适的 Apify actor（多平台时并行执行）
3. **收集**所有帖子及互动指标（点赞、播放、评论、分享）
4. **排序与排名** — 按互动率或数量
5. **识别模式** — 重复话题标签、发帖高峰时段、头部创作者
6. **返回结构化报告** — 含热门趋势、关键指标与可执行洞察

---

## 输出数据结构（标准化）

\`\`\`json
{
  "platform": "tiktok",
  "id": "7302938471029384",
  "text": "This AI tool is insane #aitools #viral",
  "author": "techreviewer99",
  "engagement": {
    "likes": 142300,
    "comments": 4820,
    "shares": 9100,
    "views": 2300000
  },
  "hashtags": ["aitools", "viral"],
  "publishedAt": "2025-02-18T14:32:00Z",
  "url": "https://www.tiktok.com/@techreviewer99/video/7302938471029384"
}
\`\`\`

---

## 最佳实践

- 仅抓取**公开**内容 — 切勿尝试访问私密资料
- 设置合理的 \`resultsLimit\`（50–200），以控制在 Apify 配额内
- 定期分析时，在控制台使用 **Apify Schedules** 调度 actor 运行
- 将结果存入 **Apify Datasets** 以便持久访问与历史对比
- Reddit 使用 \`sort: "hot"\`，TikTok 使用热门端点以获取最相关数据
- 大规模抓取时添加 \`proxyConfiguration\` 块以避免速率限制：
  \`\`\`javascript
  proxyConfiguration: { useApifyProxy: true, apifyProxyGroups: ["RESIDENTIAL"] }
  \`\`\`

---

## 错误处理

\`\`\`javascript
try {
  const run = await client.actor("apify/tiktok-scraper").call(input);
  const dataset = await run.dataset().getData();
  return dataset.items;
} catch (error) {
  if (error.statusCode === 401) throw new Error("Invalid Apify token");
  if (error.statusCode === 429) throw new Error("Rate limit hit — reduce request frequency");
  if (error.message.includes("timeout")) throw new Error("Actor timed out — try a smaller batch");
  throw error;
}
\`\`\`

---

## 要求

- Apify 账户 → https://www.apify.com/?fpr=dx06p
- 来自 Settings → Integrations 的有效 **Personal API Token**
- Node.js 18+ 及 \`apify-client\` 包
- 无需各平台 API Key — Apify 处理所有平台访问`,
};
