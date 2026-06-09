module.exports = {
  skillId: 'totalclaw:totalclaw~staybased-cold-outreach',
  descriptionZh:
    '利用经过实战检验的框架生成高转化冷启动外联（邮件、短信、LinkedIn 私信）。',
  bodyZh: `---

## 中文说明

---

## 中文说明

# 冷启动外联 — 基于意图的转化框架

利用经过实战检验的框架生成高转化率的冷启动外联（邮件、短信、LinkedIn 私信），框架来源包括 Hormozi 的《$100M Leads》、Cleverly、Hypergen，以及 SalesHandy 对 10 万多个营销活动的分析。

所有输出保存到 \`workspace/artifacts/\`。

## 何时使用
- 给潜在客户撰写冷启动邮件/短信（B2B 或本地服务型企业）
- 设计多次触达的跟进序列
- 针对特定理想客户画像（ICP）大规模个性化外联
- 评估/重写现有的外联文案
- 构建与冷启动外联配套的引流诱饵
- 生成 Upwork 提案或自由职业者推介

## 何时不要使用
- 热情引荐或入站线索（他们已经认识你——只需提供帮助即可）
- 群发简报或营销轰炸（属于不同领域：内容营销）
- 内部团队沟通
- 回复现有对话或支持工单
- 社交媒体帖子或广告（不同格式，不同心理学）

## 反例
- "Write me a blog post" → 不行。这是用于 1 对 1 外联，而非内容营销。
- "Send a thank-you email to a client" → 不行。那是关系维护，而非冷启动外联。
- "Create a landing page" → 不行。完全是错误的漏斗阶段。
- "Help me respond to this customer complaint" → 不行。那是客户支持，而非客户开发。

## 边缘情况
- Upwork 提案 → 可以。这是向招聘发布者发起的冷启动外联。使用模板 E。
- LinkedIn 连接请求 + 留言 → 可以。使用模板 F（请求内容不超过 300 字符）。
- 再激活已死的线索（冷却 6 个月以上）→ 可以。当作冷线索处理——他们已经忘了你。
- 转冷的热情引荐 → 介于两者之间。如果超过 30 天无回复，按带背景的冷线索处理。

---

## 原理：为什么大多数冷启动外联会失败

大多数冷启动邮件石沉大海——Hunter.io 报告称比例为 95.9%，但真实比例因行业和定位质量而异（80-95% 是较现实的区间）。这些失败有共同的模式：

### 秒删触发因素（绝不要做这些）
1. **以自我为中心的开场白**："We're the leading..." / "I'm excited to share..." — 此刻没人在乎你。
2. **泛泛群发**：同一条消息发给 1,000 人 → 2.1% 回复。50 个精准目标 → 5.8% 回复。
3. **第一封邮件就硬推销**：在建立任何价值之前就谈价格、演示、"book a call" → 咄咄逼人，注定失败。
4. **"Hope this finds you well"**：暴露群发特征。潜在客户的大脑会自动删除。
5. **"Just checking in" / "Circling back"**：毫无价值增量。每次触达都必须赢得注意力。
6. **大段文字**：超过 125 字的冷启动邮件会流失 50% 以上的读者。理想长度：50-100 字。

### 真正有效的心理学
- **3 秒法则**：潜在客户在 3 秒内决定是否继续读下去。第一句话必须证明你研究过他们本人。
- **互惠**：在请求之前先给予价值（Hormozi 的引流诱饵原则——免费解决一个小问题，他们就会想要你的付费方案）。
- **打破模式**：跳出模板化的感觉。具体性是垃圾邮件感的解药。
- **损失厌恶**："You're losing X" 比 "You could gain X" 更有冲击力。

---

## Hormozi 的 4 步冷启动外联系统

出自《$100M Leads》（每天产生 20,000 多条线索）：

### 第 1 步：构建名单（ICP 优先）
在写下任何一个字之前，先定义你的理想客户画像：
- **谁**：行业、公司规模、角色/职位、地域
- **什么痛点**：他们面临的具体问题（不是泛泛的 "grow revenue"）
- **什么信号**：什么表明他们现在就需要帮助？（招聘、扩张、差评、没有自动化）
- **去哪里找**：LinkedIn Sales Nav、Google Maps、行业名录、招聘网站

**质量检查**：如果你无法用一句话描述他们每天具体的挫败感，说明你的 ICP 还不够精准。

### 第 2 步：个性化以触发回应
不要只停留在 \`{FirstName}\`。可引用：
- 他们公司近期的新闻、招聘或里程碑
- 他们网站上的某个具体页面（证明你看过）
- 共同的人脉或共同的经历
- 从外部就能看出的问题（没有在线预约、Yelp 回复糟糕等）

### 第 3 步：以价值开场（引流诱饵原则）
每封冷启动邮件都应给予一些东西：
- 他们此前没有的洞见（"businesses like yours are losing X because of Y"）
- 一个速效成果（"here's one thing you can fix today"）
- 社会证明（"we helped [similar business] achieve [specific result]"）

**Hormozi 的法则**：如果你的免费内容好得不足以收费，那它也好得不足以白送。

### 第 4 步：自动化序列
一封邮件无法促成转化。构建一个 3-5 次触达的序列：
- 大多数正面回复来自跟进（常被引用为 60%，但真实比例不一——原则成立：坚持有回报）
- 每次跟进都要增加新的价值（绝不能 "just bumping this"）
- 触达间隔 3-5 天
- 尽可能混合渠道（email → LinkedIn → email → SMS）

---

## 文案框架

选择与潜在客户认知水平相匹配的框架：

### PAS — 问题、激化、解决
**最适合**：知道自己有问题但尚未解决的潜在客户。
\`\`\`
[PROBLEM] Noticed [Business] doesn't have [specific thing].
[AGITATE] Most [business type] in [area] lose [X customers/dollars] monthly because of this — and it compounds.
[SOLVE] We built a [solution] for [similar business] that [specific result in timeframe].

Worth 10 minutes to see how it works?
\`\`\`

### BAB — 之前、之后、桥接
**最适合**：尚未意识到自己有问题的潜在客户。
\`\`\`
[BEFORE] Right now, [Business] is [current state — manual booking, no reviews, etc.].
[AFTER] Imagine [desired state — automated scheduling, 5-star reviews flowing in, phone never missed].
[BRIDGE] We help [business type] get there with [method]. [Similar business] made the switch in [timeframe].

Quick look?
\`\`\`

### AIDA — 注意、兴趣、欲望、行动
**最适合**：需要用钩子抓住的潜在客户。
\`\`\`
[ATTENTION] [Surprising stat or observation about their business]
[INTEREST] We've been studying [their industry] and found that [insight].
[DESIRE] [Similar business] used this to [specific desirable result].
[ACTION] Can I share the playbook? Takes 2 minutes to read.
\`\`\`

### 神级一句话（The Goated One-Liner）
**最适合**：繁忙的高管、第二/第三次跟进、短信。
\`\`\`
[Observation] + [Result for similar company] + [Soft ask]

Example: "Saw [Business] is still using [old method] — helped [competitor] cut [pain] by [X%]. Worth a look?"
\`\`\`

---

## 模板

### 模板 A：本地服务型企业（Alfred 风格）
\`\`\`
Subject: Quick question about [Business Name]

Hi [Name],

I looked at [Business Name] online — [specific observation: no online booking, reviews stopped 3 months ago, website doesn't show availability].

I help [business type] in [area] fix exactly this. One client went from [X missed calls/week] to [Y booked appointments/week] in [timeframe] with automated [SMS/booking/reviews].

Would it help to see a 2-minute walkthrough of how it works?

[Signature]
\`\`\`

### 模板 B：B2B SaaS / 科技
\`\`\`
Subject: [Their company] + [your solution category]

Hi [Name],

Noticed [Company] just [trigger: raised funding, hired for X role, launched Y].

When [similar companies] hit that stage, they usually struggle with [specific pain]. We helped [reference client] solve it — [specific metric].

Want me to send over the case study?

[Signature]
\`\`\`

### 模板 C：跟进 #1（增加价值，第 3-4 天）
\`\`\`
Subject: Re: [original subject]

Hi [Name],

Quick thought — [industry stat or tactical tip they can use regardless of buying].

This is what [specific client] did before working with us, and it alone moved the needle [X%].

Happy to share more if useful.

[Signature]
\`\`\`

### 模板 D：跟进 #2（断舍离，第 12-14 天）
\`\`\`
Subject: Closing the loop

Hi [Name],

I've reached out a couple times about [topic]. Totally fine if the timing's off.

If [pain point] becomes a priority down the road, I'm here. Otherwise I'll get out of your inbox.

[Signature]
\`\`\`

### 模板 E：Upwork / 自由职业提案
\`\`\`
[Opening]: Reference THEIR specific project details (proves you read it, not mass-applying)
[Credibility]: One relevant result — "[Similar project] → [outcome] in [timeframe]"
[Differentiator]: What you'll do that other applicants won't
[De-risk]: "Happy to do [small first milestone] so you can evaluate before committing"
[CTA]: Specific next step, not vague
\`\`\`

### 模板 F：LinkedIn 连接请求（不超过 300 字符）
\`\`\`
Hi [Name] — saw your [post/company/role]. Working on [relevant thing] and thought we'd have good overlap. Would love to connect.
\`\`\`

---

## 序列蓝图

| 触达 | 天数 | 渠道 | 框架 | 目的 |
|-------|-----|---------|-----------|---------|
| 1 | 0 | Email | PAS or BAB | 问题感知型开场 |
| 2 | 3 | LinkedIn | — | 建立连接 + 互动其内容 |
| 3 | 5 | Email | Value-add | 分享洞见/案例研究 |
| 4 | 10 | SMS/Email | One-liner | 简短的个人触达 |
| 5 | 14 | Email | Breakup | 优雅地收尾 |

---

## 指标与基准

| 指标 | 差 | 平均 | 良好 | 优秀 |
|--------|-----|---------|------|-------|
| 打开率 | <30% | 40-50% | 50-65% | 65%+ |
| 回复率 | <2% | 3-5% | 5-8% | 8%+ |
| 正面回复 | <1% | 1-2% | 2-4% | 4%+ |
| 预约会议 | <0.5% | 0.5-1% | 1-2% | 2%+ |

**诊断**：
- 打开率低 → 主题行问题
- 有打开但无回复 → 信息相关性或 CTA 问题
- 有回复但无会议 → 报价或时机问题
- 有会议但无成交 → 销售对话问题（超出本技能范围）

---

## 送达率清单

- [ ] 在发信域名上配置 SPF、DKIM、DMARC 记录
- [ ] 使用次级域名发送（保护主品牌域名）
- [ ] 域名预热 2 周以上（从每天 5 封开始，每天增加 5 封）
- [ ] 每个邮箱每天少于 50 封邮件
- [ ] 不使用垃圾触发词（"free"、"guarantee"、"act now"、"limited time"）
- [ ] 纯文本或极简 HTML（无大量图片/格式）
- [ ] 包含退订链接（符合 CAN-SPAM / GDPR）
- [ ] 退信率低于 3%（发送前先验证名单）
- [ ] 追踪互动：打开、回复、退订——每周调整

---

## 关键数字
- 冷启动邮件 ROI：每花 1 美元回报 30-50 美元，视执行而定（Litmus：$36，ProfitOutreach：$42，其他：$30-50 区间）
- 50 封精准邮件在回复率上比 1,000 封泛泛邮件高出 2.7 倍
- 大多数转化需要 2 次以上跟进（具体比例不一，但单次触达的外联表现一贯欠佳）
- 理想冷启动邮件：50-100 字
- 最佳发送时间：周二至周四，收件人时区上午 8-10 点`,
};
