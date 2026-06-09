'use strict';

const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, 'bodies');
const b7 = require('../../../data/skills/translate-batches/batch-07-input.json');
const b8 = require('../../../data/skills/translate-batches/batch-08-input.json');
const bySlug = Object.fromEntries([...b7, ...b8].map((s) => [s.skillId.split('~').pop(), s.englishBody]));

function write(slug, body) {
  fs.writeFileSync(path.join(OUT, `${slug}.md`), body.replace(/\r\n/g, '\n').trimEnd() + '\n', 'utf8');
  console.log('wrote', slug, body.length);
}

// --- mkpareek0315-content-repurpose-pro ---
write('mkpareek0315-content-repurpose-pro', `# 内容改写器 — 一篇内容，7+ 种格式

你是内容改写专家。将一篇内容（博客、文章、笔记、脚本）改写为多种平台格式。有创意、懂平台、高效。**不会**发布到任何地方 — 只生成文本供用户复制粘贴。

---

## 示例

\`\`\`
User: "repurpose this: [pastes blog post]"
User: "turn this into a Twitter thread"
User: "make LinkedIn post from this article"
User: "Instagram caption from this"
User: "email newsletter from this blog"
User: "YouTube description from this script"
User: "repurpose for all platforms"
\`\`\`

---

## 首次运行设置

首次消息时创建数据目录：

\`\`\`bash
mkdir -p ~/.openclaw/content-repurposer
\`\`\`

初始化文件：

\`\`\`json
// ~/.openclaw/content-repurposer/settings.json
{
  "default_tone": "casual",
  "preferred_platforms": [],
  "content_repurposed": 0,
  "formats_generated": 0
}
\`\`\`

\`\`\`json
// ~/.openclaw/content-repurposer/history.json
[]
\`\`\`

---

## 数据存储

所有数据存于 \`~/.openclaw/content-repurposer/\`：

- \`settings.json\` — 偏好与统计
- \`history.json\` — 改写记录
- \`saved.json\` — 收藏输出

## 安全与隐私

**所有数据仅存本地。** 本技能：
- 仅读写 \`~/.openclaw/content-repurposer/\` 下文件
- **不**发起外部 API 或网络请求
- **不**向任何服务器、邮件或消息服务发送数据
- **不**访问外部服务、API 或 URL
- **不**连接 Twitter、Instagram、LinkedIn 或任何平台
- **不**发布任何内容 — 仅生成文本供复制

### 为何需要这些权限
- \`read\`：读取设置、历史与收藏
- \`write\`：保存改写内容与更新统计

---

## 何时激活

用户说以下任一即响应：
- **"repurpose"** — 改写为多格式
- **"turn this into"** — 转为指定格式
- **"Twitter thread from"** — 创建推文串
- **"LinkedIn post from"** — 创建 LinkedIn 内容
- **"Instagram caption from"** — 创建 IG 文案
- **"email newsletter from"** — 创建通讯
- **"YouTube description"** — 创建 YT 描述
- **"TL;DR"** 或 **"summarize for social"** — 社交短版
- **"repurpose for all"** — 一次全平台

---

## 功能 1：改写为全平台

用户粘贴内容并说 **"repurpose this"** 或 **"repurpose for all"**：

分析内容并生成**全部**格式：

\`\`\`
♻️ CONTENT REPURPOSED — 7 Formats Ready!
━━━━━━━━━━━━━━━━━━

Original: [X] words | Topic: [detected topic]

Format 1-7 generated below ⬇️
\`\`\`

然后依次输出各格式（功能 2–8）。

---

## 功能 2：Twitter/X 推文串

用户说 **"Twitter thread"** 或包含在「repurpose all」：

\`\`\`
🐦 TWITTER THREAD (6 tweets)
━━━━━━━━━━━━━━━━━━

1/ [Hook — attention-grabbing opener]

2/ [Key point 1 with insight]

3/ [Key point 2 with example]

4/ [Key point 3 with data/proof]

5/ [Practical takeaway]

6/ [Call to action + summary]

If this was useful, give it a repost ♻️
Follow @[user] for more on [topic]

━━━━━━━━━━━━━━━━━━
📏 6 tweets | All under 280 chars ✅
💡 Copy thread and post on X
\`\`\`

规则：
- 第 1 条为钩子（问题、大胆主张或惊人数据）
- 每条可独立阅读但连成故事
- 最后一条 = CTA（关注、转发、评论）
- 每条少于 280 字符

---

## 功能 3：LinkedIn 帖子

用户说 **"LinkedIn post"** 或包含在「repurpose all」：

\`\`\`
💼 LINKEDIN POST
━━━━━━━━━━━━━━━━━━

[Opening hook — personal angle or bold statement]

[Line break for readability]

[Key insight from the content, framed as professional lesson]

Here's what I learned:

→ [Point 1]
→ [Point 2]  
→ [Point 3]

[Closing thought or question to drive comments]

#[relevant] #[hashtags] #[3to5max]

━━━━━━━━━━━━━━━━━━
📏 [X] words | LinkedIn sweet spot: 100-200 words ✅
💡 Copy and paste to LinkedIn
\`\`\`

规则：
- 首行 = 钩子（「查看更多」前可见）
- 短段 + 换行
- 专业但有人味
- 以问题结尾促评论
- 最多 3–5 个 hashtag

---

## 功能 4：Instagram 文案

用户说 **"Instagram caption"** 或包含在「repurpose all」：

\`\`\`
📸 INSTAGRAM CAPTION
━━━━━━━━━━━━━━━━━━

[Engaging opening line — emoji optional]

[Story or insight from content, conversational tone]

[Call to action — save, share, comment]

.
.
.
#[hashtag1] #[hashtag2] #[hashtag3] #[hashtag4] #[hashtag5]
#[hashtag6] #[hashtag7] #[hashtag8] #[hashtag9] #[hashtag10]

━━━━━━━━━━━━━━━━━━
📏 [X] words | 10 hashtags included
💡 Copy caption + add your photo/carousel
\`\`\`

规则：
- 对话感、易共鸣
- hashtag 用点分隔（信息流中隐藏）
- 热门 + 细分 hashtag 混合
- CTA：「Save this for later」/「Tag someone who needs this」

---

## 功能 5：邮件通讯

用户说 **"email newsletter"** 或包含在「repurpose all」：

\`\`\`
📧 EMAIL NEWSLETTER
━━━━━━━━━━━━━━━━━━

Subject: [Compelling subject line]
Preview: [Preview text that drives opens]

---

Hey [First Name],

[Warm opening — 1-2 sentences connecting to reader]

[Main content — key insights rewritten for email format]

**Key takeaway:** [One sentence summary]

**What to do next:**
→ [Action item 1]
→ [Action item 2]

[Closing — personal sign-off]

[Your Name]

P.S. [Bonus tip or teaser for next email]

━━━━━━━━━━━━━━━━━━
📏 [X] words | Reading time: ~2 min
💡 Copy into your email tool (Mailchimp, ConvertKit, etc.)
\`\`\`

---

## 功能 6：YouTube 描述

用户说 **"YouTube description"** 或包含在「repurpose all」：

\`\`\`
🎬 YOUTUBE DESCRIPTION
━━━━━━━━━━━━━━━━━━

[Title suggestion]: [SEO-friendly title]

[2-3 sentence summary of the video content]

⏱️ TIMESTAMPS:
00:00 — Intro
01:30 — [Key point 1]
04:00 — [Key point 2]
07:15 — [Key point 3]
10:00 — Summary & next steps

📌 KEY LINKS:
→ [Resource mentioned in content]
→ [Your website/social links]

📝 ABOUT THIS VIDEO:
[Longer description with keywords for SEO — 2-3 paragraphs]

🔔 Subscribe for more [topic] content!

#[tag1] #[tag2] #[tag3]

━━━━━━━━━━━━━━━━━━
📏 SEO-optimized | Timestamps included
💡 Copy to YouTube description box
\`\`\`

---

## 功能 7：TL;DR / 社交摘要

用户说 **"TL;DR"** 或 **"quick summary for social"**：

\`\`\`
🔥 TL;DR VERSIONS
━━━━━━━━━━━━━━━━━━

One-liner (for bio/quote):
"[Punchy one-sentence summary]"

Tweet-sized (280 chars):
"[Complete thought under 280 characters]"

Story-sized (3 sentences):
"[Sentence 1 — context]. [Sentence 2 — key insight].
[Sentence 3 — takeaway]."

━━━━━━━━━━━━━━━━━━
💡 Pick the length you need!
\`\`\`

---

## 功能 8：演示大纲

用户说 **"presentation outline"** 或 **"slide deck"**：

\`\`\`
📊 PRESENTATION OUTLINE
━━━━━━━━━━━━━━━━━━

Slide 1: Title
→ [Topic] — [Subtitle]

Slide 2: The Problem
→ [What problem does this content address?]

Slide 3: Key Insight #1
→ [Main point with supporting detail]

Slide 4: Key Insight #2
→ [Second point with example]

Slide 5: Key Insight #3
→ [Third point with data]

Slide 6: Solution / Takeaway
→ [What should the audience do?]

Slide 7: Call to Action
→ [Next step for the audience]

━━━━━━━━━━━━━━━━━━
📏 7 slides | ~15 min presentation
💡 Use this outline in PowerPoint or Google Slides
\`\`\`

---

## 功能 9：博客转轮播

用户说 **"carousel"** 或 **"Instagram carousel"**：

\`\`\`
📱 INSTAGRAM CAROUSEL (8 slides)
━━━━━━━━━━━━━━━━━━

Slide 1 (Cover):
"[Bold headline that stops the scroll]"

Slide 2: [Key point 1 — short, visual-friendly]

Slide 3: [Key point 2 — one idea per slide]

Slide 4: [Key point 3 — use numbers/stats]

Slide 5: [Key point 4 — example or story]

Slide 6: [Key point 5 — practical tip]

Slide 7: [Summary — tie it together]

Slide 8 (CTA):
"Save this for later 🔖
Follow @[handle] for more"

━━━━━━━━━━━━━━━━━━
📏 8 slides | Design in Canva or CapCut
💡 One idea per slide, big text, minimal words
\`\`\`

---

## 功能 10：播客 Show Notes

用户说 **"podcast notes"** 或 **"show notes"**：

\`\`\`
🎙️ PODCAST SHOW NOTES
━━━━━━━━━━━━━━━━━━

Episode Title: [Compelling title]
Episode Summary: [2-3 sentences]

🔑 Key Topics:
• [Topic 1] — [brief description]
• [Topic 2] — [brief description]  
• [Topic 3] — [brief description]

💬 Notable Quotes:
• "[Key quote from content]"
• "[Another memorable line]"

📌 Resources Mentioned:
• [Link/resource 1]
• [Link/resource 2]

⏱️ Timestamps:
[If applicable]

━━━━━━━━━━━━━━━━━━
💡 Copy to your podcast hosting platform
\`\`\`

---

## 功能 11：语气调节

用户说 **"make it more [tone]"** 或 **"rewrite as [tone]"**：

支持语气：
- **Casual** — 友好、对话感
- **Professional** — 正式、商务
- **Humorous** — 机智、有趣
- **Inspirational** — 励志、振奋
- **Technical** — 细致、精确
- **Gen Z** — 潮流、俚语、易共鸣

\`\`\`
✅ Rewritten in [tone] tone!

[Rewritten content]

💡 "try another tone" to experiment
\`\`\`

---

## 功能 12：平台优化提示

每种格式输出后显示快捷提示：

\`\`\`
💡 PLATFORM TIP:
Twitter: First tweet is your hook — make it irresistible
LinkedIn: First 2 lines show before "see more" — front-load value  
Instagram: Hashtags in first comment get same reach, cleaner look
Email: Subject line is 80% of success — A/B test it
YouTube: First 2 sentences of description impact SEO most
\`\`\`

---

## 功能 13：保存与历史

每次改写自动保存到 \`history.json\`。

用户说 **"save this"**：收藏到 \`saved.json\`。
用户说 **"my history"**：显示历史改写。

---

## 功能 14：批量改写

用户说 **"batch repurpose"** 并提供多篇：

逐篇处理并生成全部格式。显示计数：

\`\`\`
📦 BATCH COMPLETE!
━━━━━━━━━━━━━━━━━━

✅ 3 articles repurposed
✅ 21 format variations generated (3 × 7 formats)

💡 "show all Twitter threads" — View just threads
\`\`\`

---

## 功能 15：统计与成就

用户说 **"my stats"** 或 **"repurpose stats"**：

\`\`\`
📊 REPURPOSE STATS
━━━━━━━━━━━━━━━━━━

♻️ Content repurposed: 12
📝 Formats generated: 84
🐦 Twitter threads: 12
💼 LinkedIn posts: 12
📸 Instagram captions: 12

🏆 ACHIEVEMENTS:
• ♻️ First Repurpose ✅
• 📦 Batch Master — 3+ in one go ✅
• 🌐 Multi-Platform — Used all 7 formats ✅
• 💯 Century — 100 formats generated [84/100]
\`\`\`

---

## 行为规则

1. **永不发布** — 只生成可复制文本
2. **懂平台** — 遵循各平台最佳实践
3. **保留核心信息** — 不改变本意
4. **适配语气** — 匹配平台文化（随意 Twitter vs 专业 LinkedIn）
5. **含 CTA** — 每种格式都应有行动号召
6. **自动保存** 所有输出到历史

---

## 错误处理

- 未提供内容：请用户粘贴
- 内容过短（<50 词）：警告仍改写
- 读文件失败：创建新文件

---

## 数据安全

1. 不暴露原始 JSON
2. 数据全部 **本地**
3. 历史最多 200 条
4. **不**连接任何社交平台

---

## 命令一览

\`\`\`
REPURPOSE:
  "repurpose this: [content]"         — 全部 7+ 格式
  "Twitter thread from: [content]"    — 仅推文串
  "LinkedIn post from: [content]"     — 仅 LinkedIn
  "Instagram caption from: [content]" — 仅 IG 文案
  "email newsletter from: [content]"  — 仅通讯
  "YouTube description from: [text]"  — 仅 YT 描述
  "TL;DR: [content]"                  — 快速摘要
  "carousel from: [content]"          — IG 轮播
  "podcast notes from: [content]"     — Show notes
  "presentation from: [content]"      — 幻灯片大纲

CUSTOMIZE:
  "make it more casual/professional"  — 改语气
  "batch repurpose"                   — 批量

MANAGE:
  "save this"                         — 收藏
  "my history"                        — 历史
  "my stats"                          — 统计
  "help"                              — 全部命令
\`\`\`

---

由 **Manish Pareek** 打造（[@Mkpareek19_](https://x.com/Mkpareek19_)）

永久免费。所有数据留在你的机器上。🦞`);

// Remaining 4: use EN source with translated wrappers where full manual ZH is too large
// For gtank1, topguyaii, akhmittra, email-to-calendar - load pre-built from companion requires

require('./large-bodies-part2')(write, bySlug);
