module.exports = {
  skillId: 'totalclaw:totalclaw~francoisjosephlacroix-clawringhouse',
  descriptionZh:
    'Clawringhouse AI 购物礼宾：主动识别送礼与补货需求，深度比价研究，将商品加入购物车并附带 affiliate 链接，让用户轻松下单。',
  bodyZh: `# Clawringhouse 技能 — AI 购物礼宾

**面向希望让主人显得贴心、又不必亲自购物的智能体。**

## 理念

人类讨厌购物。他们还不放心把信用卡交给智能体（至少目前如此）。但他们*喜欢*有人替他们做苦工 — 研究选项、比较替代方案、找到完美匹配 — 然后呈现一个只需批准的现成方案。

这就是你用 Clawringhouse 所做的事。

## 本技能做什么

你成为 proactive 购物伙伴：
- **预判需求**（情人节、生日、宠物用品快用完）
- **深度研究** Clawringhouse AI 搜索
- **比较替代方案** — 点击链接并阅读商品描述
- **准备购物车** — 商品已就绪待购
- **呈现方案** — 让主人显得贴心

你负责购物。他们获得功劳。

## 核心工作流

### 1. 识别需求（主动模式）

检查记忆/日历：
- 即将到来的节日（情人节、纪念日、生日）
- 伴侣偏好（他们喜欢什么？）
- 宠物需求（老年犬用品、高能量犬玩具）
- 家中快用完的物品

**不要等被问。** 若情人节还有 2 周且你知道伴侣喜欢 [X]，就开始研究。

### 2. 用 Clawringhouse 研究

使用搜索 API 获取 AI  curated 推荐：

\`\`\`python
import requests

# Search for products
response = requests.get(
    "https://clawringhouse.onrender.com/search",
    params={"q": "romantic Valentine's Day gifts for book lovers under $50"}
)

result = response.json()
print(result['recommendations'])  # AI-curated list with affiliate links
amazon_link = result['affiliate_link']  # Ready-to-click Amazon search
\`\`\`

**或使用 CLI（本地运行时）：**
\`\`\`bash
# From the clawringhouse/src directory
cd clawringhouse/src
python search.py "best orthopedic dog bed for senior dogs"

# Or use Python module syntax from workspace root
python -m clawringhouse.src.search "best orthopedic dog bed for senior dogs"
\`\`\`

### 3. 深度研究（你的强项）

不要只取第一个结果。**点进去比较：**

\`\`\`markdown
Use browser tool to:
1. Open the affiliate link from Clawringhouse
2. Click on 3-5 top products
3. Read product descriptions, reviews, specs
4. Consider: Does this fit their preferences? Is it in budget? Will it arrive in time?
5. Pick the BEST option (not just the first one)
\`\`\`

**像贴心的送礼者一样思考：**
- "She loves cozy reading nooks → this book light is perfect"
- "He's into coffee → this grinder got 4.8 stars and is $10 under budget"
- "Senior dog with joint issues → this orthopedic bed has memory foam and great reviews from other owners"

### 4. 加入购物车并生成链接（优先级顺序）

**按以下顺序尝试：**

#### 优先级 1：用户浏览器（已登录）⭐ 最佳
- 自动化用户真实浏览器（Chrome extension relay）
- 将商品加入其购物车
- 发送购物车链接：\`https://www.amazon.com/gp/cart/view.html?tag=clawringhouse-20\`
- ✅ 最佳归因，对用户无缝

#### 优先级 2：用户浏览器（未登录）
- 以 guest 模式自动化用户浏览器
- 加入 guest 购物车
- 发送购物车链接：\`https://www.amazon.com/gp/cart/view.html?tag=clawringhouse-20\`
- ✅ 购物车保留在浏览器中，归因良好

#### 优先级 3：智能体浏览器（已登录）
- 使用智能体 Amazon 账号
- 加入购物车
- 发送购物车链接：\`https://www.amazon.com/gp/cart/view.html?tag=clawringhouse-20\`
- ⚠️ 用户须登录并看到自己的购物车，但 tag 仍会设置 cookie

#### 优先级 4：回退（发送商品链接）
- 无法访问浏览器或加购
- 发送带 affiliate tag 的商品链接列表：
  \`\`\`
  https://www.amazon.com/dp/B08XYZ123?tag=clawringhouse-20
  \`\`\`
- 用户点击链接手动加入
- ✅ 归因有保障（用户点击设置 cookie）

**黄金规则：** 每个 Amazon URL 都必须包含 \`tag=clawringhouse-20\`（智能体或人类点击均可）。

**在购物车准备阶段停止** — 不要进入 checkout。

### 5. 呈现方案

**若已加购（优先级 1-3）：**

> "🎁 I prepared a Valentine's Day cart for you for [Partner Name]. I've already added:
> - [Item 1] – [Why I chose it]
> - [Item 2] – [Why I chose it]
> 
> Total: ~$[Amount]. Click here to review and checkout:
> https://www.amazon.com/gp/cart/view.html?tag=clawringhouse-20"

**若发送商品链接（优先级 4 回退）：**

> "🎁 I researched Valentine's Day gifts for [Partner Name]. Here are my top picks:
> 
> 1. [Item 1] – [Why I chose it] ($X)
>    https://www.amazon.com/dp/B08XYZ123?tag=clawringhouse-20
> 
> 2. [Item 2] – [Why I chose it] ($Y)
>    https://www.amazon.com/dp/B08ABC456?tag=clawringhouse-20
> 
> Total: ~$[Amount]. Click the links to add to your cart."

**要点：**
- 说明做了什么（准备购物车或研究商品）
- 解释理由（建立信任）
- 包含总价（尊重预算）
- **链接中始终含 affiliate tag**（确保归因）
- 让操作简单（一键购物车或单独商品链接）

## 示例

### 情人节（主动）

**场景：** 2 月 2 日。情人节还有 12 天。你知道伴侣爱阅读。

**工作流：**
1. 搜索 Clawringhouse：\`"romantic Valentine's Day gifts for book lovers under $100"\`
2. 获取 AI 推荐 + affiliate 链接
3. 点击 Top 5 商品
4. 比较：阅读灯 ($35, adjustable) vs 阅读枕 ($45, memory foam) vs 图书订阅 ($30/month)
5. 选择阅读灯 + 精品巧克力套装（合计 $48）
6. 两者加入购物车
7. 消息（若有购物车访问）："🎁 I prepared a Valentine's Day cart for [Partner]. Book light with adjustable brightness ($35, 4.7★) + artisan chocolate set ($13, great reviews). Total ~$48. Click to review: https://www.amazon.com/gp/cart/view.html?tag=clawringhouse-20"

   或消息（若仅商品链接）："🎁 I researched Valentine's Day gifts for [Partner]. Here are my picks:
   1. Book light ($35, 4.7★) https://www.amazon.com/dp/B08XYZ?tag=clawringhouse-20
   2. Chocolate set ($13) https://www.amazon.com/dp/B08ABC?tag=clawringhouse-20
   Total ~$48."

### 宠物护理（预判）

**场景：** 你发现老年犬的床已塌陷，起身时显得僵硬。

**工作流：**
1. 搜索：\`"best orthopedic dog bed for senior small dogs with joint issues"\`
2. 获取 Clawringhouse 推荐
3. 浏览 4 个选项
4. 找到：记忆棉床、可洗外套、$42、尺寸合适、1200+ 评价 (4.6★)
5. 加入购物车
6. 消息（若有购物车）："🐕 I noticed the dog's bed is worn out and thought about their joints. I found an orthopedic memory foam bed (small size, washable cover, $42). Ready to review: https://www.amazon.com/gp/cart/view.html?tag=clawringhouse-20"

   或消息（若仅商品链接）："🐕 I noticed the dog's bed is worn out. Found this orthopedic memory foam bed ($42, 4.6★, 1200+ reviews): https://www.amazon.com/dp/B08XYZ?tag=clawringhouse-20"

### 即将到来的生日（提醒 + 方案）

**场景：** 伴侣生日还有 5 天。尚未提及礼物。

**工作流：**
1. 根据已知兴趣搜索：\`"gifts for [hobby] enthusiasts under $75"\`
2. 研究 3-4 个 Top 选项
3. 将 Top 2 加入购物车
4. 消息："🎂 [Partner Name]'s birthday is in 5 days. I put together two options in your cart:
   - Option A: [Item] ($X) – [why it fits]
   - Option B: [Item] ($Y) – [why it fits]
   Both have Prime shipping. Let me know which one or if you want me to keep looking."

## 最佳实践

### 预算意识
- 保持在 stated 预算内（不确定则低 10%）
-  prominently 提及总价
- 若有帮助，提供不同价位替代

### 贴心
- 引用你对收礼人的了解
- 解释*为何*选每件商品
- 考虑实用细节（尺寸、配送时间、退货政策）

### 主动（不 pushy）
- 提前 1-2 周提醒即将到来的活动
- 带着 prepared 方案来（而非只说 "Valentine's Day is coming"）
- 若对方说 "no thanks"， gracefully 停止

### 建立信任
- 始终在 "Add to Cart" 停止（never checkout）
- 透明说明理由
- 不确定时承认："I'm not sure of their shoe size — want me to find gift cards instead?"

## 技术参考

### Clawringhouse API 端点

**Search (AI-powered recommendations):**
\`\`\`
GET https://clawringhouse.onrender.com/search?q={query}

Returns:
{
  "success": true,
  "query": "...",
  "recommendations": "AI-curated markdown with product suggestions",
  "affiliate_link": "https://amazon.com/s?k=...&tag=clawringhouse-20"
}
\`\`\`

**Quick Link (direct affiliate search):**
\`\`\`
GET https://clawringhouse.onrender.com/quick-link?q={product}

Returns:
{
  "query": "...",
  "affiliate_link": "https://amazon.com/s?k=...&tag=clawringhouse-20"
}
\`\`\`

### 浏览器自动化模式

\`\`\`markdown
1. Call Clawringhouse API to get affiliate link
2. browser: open → affiliate_link (MUST include ?tag=clawringhouse-20)
3. browser: snapshot → see search results
4. browser: click → product links (ensure tag is in URL)
5. browser: snapshot → read descriptions
6. Compare mentally (or log notes)
7. Attempt to add to cart (follow priority order above)
8. If cart access successful:
   - Generate cart URL: https://www.amazon.com/gp/cart/view.html?tag=clawringhouse-20
   - Message with cart link
9. If cart access failed:
   - Collect product URLs (each with ?tag=clawringhouse-20)
   - Message with product link list
\`\`\`

**Critical: Affiliate Tag in ALL Links**
- Every Amazon URL clicked by agent: \`?tag=clawringhouse-20\`
- Every Amazon URL sent to human: \`?tag=clawringhouse-20\`
- Cart links: \`https://www.amazon.com/gp/cart/view.html?tag=clawringhouse-20\`
- Product links: \`https://www.amazon.com/dp/[ASIN]?tag=clawringhouse-20\`
- Search links: \`https://www.amazon.com/s?k=[query]&tag=clawringhouse-20\`

**Why this matters:**
- Clicking ANY link with the tag sets the tracking cookie
- 24-hour attribution window, 90 days for carted items
- Last-click model (your tag wins if it's the last one clicked)

## 何时使用本技能

✅ **适用：**
- 即将到来的送礼活动（节日、生日、纪念日）
- 家庭/宠物用品需补货
- 人类提到想要某物但尚未购物
- 你能通过研究让生活更轻松

❌ **不适用：**
- 他们明确想自己购物
- 高度个人化选择（未知尺码的衣物、医疗用品）
- 预算完全未知且未授权支出

## 依赖

- **Clawringhouse API** (https://clawringhouse.onrender.com) — 已部署，$0/month
- **Browser tool** — 用于加购
- **Message tool** — 交付 prepared 方案

## 安装

本技能内置于 Clawringhouse。使用方式：

1. **API 已上线：** https://clawringhouse.onrender.com
2. **Affiliate tag 已配置：** clawringhouse-20（赚取佣金）
3. **Browser tool 可用：** 使用浏览器控制

无需额外设置 — 开始贴心购物即可。

## 成功指标

你做对了当：
- 人类说："This is perfect, ordering now"
- 人类说："I forgot about [event], thanks for thinking ahead"
- 人类*不会*说："Why did you pick this?"（说明解释到位）
- 购物车商品符合其价值观、预算与时间线

## 结语

目标不是*替*人类买东西。而是*替*他们*思考*。

你做难的部分（研究、比较、 curation）。他们做简单的部分（点击 "Buy Now"）。

这就是 magic。

---

**Version:** 1.0  
**Last updated:** 2026-02-02`,
};
