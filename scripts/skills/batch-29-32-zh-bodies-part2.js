'use strict';

/** Batch 30 + short skills body translations */
module.exports = {
  'totalclaw:totalclaw~user520512-code-comments': `# 代码注释生成器

生成代码注释与文档。`,

  'totalclaw:totalclaw~user520512-meeting-notes': `# 会议纪要生成器

从会议转录稿生成结构化会议纪要。`,

  'totalclaw:totalclaw~waqas-orcalo-agenticcreed-signup-lead': `# signup_lead

使用公开 HTTP 端点在 AgenticCreed 系统中创建注册线索。

本技能将线索详情（邮箱、姓名、联系方式等）发送至 https://gateway.agenticcreed.ai/signup-leads。

## 用法

当需要创建带联系信息的新注册线索时使用本技能。

## 参数

- \`email\`：邮箱地址（必填）
- \`firstName\`：名（必填）
- \`lastName\`：姓（必填）
- \`address\`：物理地址
- \`dateOfBirth\`：出生日期（ISO 格式）
- \`phoneNumber\`：电话号码
- \`whatsAppNumber\`：WhatsApp 号码
- \`jobTitle\`：职位
- \`dateOfJoining\`：入职日期（ISO 格式）

## 配置

使用前设置 \`AGENTICCREED_API_KEY\` 环境变量。`,

  'totalclaw:totalclaw~waqas-orcalo-signup-lead': `# signup_lead

使用公开 HTTP 端点在 AgenticCreed 系统中创建注册线索。

本技能将线索详情（邮箱、姓名、联系方式等）发送至 https://gateway.agenticcreed.ai/signup-leads。

## 用法

当需要创建带联系信息的新注册线索时使用本技能。

## 参数

- \`email\`：邮箱地址（必填）
- \`firstName\`：名（必填）
- \`lastName\`：姓（必填）
- \`address\`：物理地址
- \`dateOfBirth\`：出生日期（ISO 格式）
- \`phoneNumber\`：电话号码
- \`whatsAppNumber\`：WhatsApp 号码
- \`jobTitle\`：职位
- \`dateOfJoining\`：入职日期（ISO 格式）

## 配置

使用前设置 \`AGENTICCREED_API_KEY\` 环境变量。`,

  'totalclaw:totalclaw~tullyhu-comfy-ai': `# ComfyAI 技能（Clawdbot）

## 描述
与本地 ComfyUI 实例 http://192.168.31.7:8000 集成，支持文生图（txt2img）与参考图编辑（img2img）。工作流文件：\`~/clawd/skills/comfy-ai/image_flux2_klein_image_edit_4b_distilled.json\`。

## 能力
- ✅ 文生图：仅根据文本提示词生成图像
- ✅ 图生图：用文本提示词与参考图编辑上传图像
- ✅ 生成的图像作为媒体附件直接返回聊天

## 要求
- ComfyUI 运行在 \`http://192.168.31.7:8000\`
- 工作流位于 \`~/clawd/skills/comfy-ai/image_flux2_klein_image_edit_4b_distilled.json\`
- 已安装 \`curl\`、\`jq\`、\`python3\`（macOS 默认）

## 用法示例

> 「生成一只戴墨镜的赛博朋克猫」

> 「编辑这张图：[上传 handbag_white.png]，提示词 'add neon glow and logo from reference'」

## 工作原理
- **纯文本**：使用工作流的空 latent + 正向提示词
- **图像编辑**：自动检测上传图 → 复制到 \`~/clawd/skills/comfy-ai/input/\` → 触发 img2img
- 生成图保存到 \`~/clawd/skills/comfy-ai/output/\` 并作为媒体附件返回
- 使用工作流中的 Flux2-Klein-4B 模型、VAE 与 CLIP

## 安全说明
全部在本地处理，数据不会离开你的机器。`,

  'totalclaw:totalclaw~visualdeptcreative-data-enricher': `# SKILL.md - 数据丰富器

## 目的
为销售线索补充邮箱地址并格式化为 Notion 导入数据。

## 使用模型
- **ollama/llama3.2:8b**（免费）用于数据格式化
- **haiku** 用于 Hunter.io API 调用

## 速率限制
- 每会话最多 10 次 Hunter.io 查询（API 限制）
- API 调用间隔 5 秒
- 相似域名批量处理

## 邮箱发现方法（按顺序）

### 1. 网站联系页
- 检查 /contact、/about、/pages/contact
- 查找 mailto: 链接
- 检查页脚

### 2. Instagram 简介
- 简介中的邮箱
- 「Contact」按钮

### 3. Hunter.io API
\`\`\`
GET https://api.hunter.io/v2/domain-search
?domain={domain}
&api_key={HUNTER_API_KEY}
\`\`\`

响应包含：
- emails[]
- confidence score
- type (generic/personal)

**仅使用置信度 > 70% 的邮箱**

### 4. 邮箱模式猜测
常见模式：
- hello@domain.com
- info@domain.com
- contact@domain.com
- [firstname]@domain.com

## 邮箱优先级
1. 创始人/所有者个人邮箱（最佳）
2. hello@ 或 hi@（较好）
3. info@ 或 contact@（尚可）
4. 通用 support@（最后选择）

## 输出格式
\`\`\`
{
  "domain_key": "brandname.com",
  "brand_name": "Brand Name",
  "niche": "skincare",
  "website_url": "https://brandname.com",
  "ig_handle": "@brandname",
  "followers_est": 15000,
  "contact_email": "hello@brandname.com",
  "email_confidence": "high",
  "email_source": "hunter.io",
  "source": "meta_ads",
  "status": "new"
}
\`\`\`

## 去重
添加任何线索前：
1. 规范化域名：小写、去掉 www. 与 https://
2. 检查 domain_key 是否已在 Notion 中
3. 若存在则跳过（不重复）
4. 记录：「Skipped [domain] - already in pipeline」

## 批量处理
- 每次处理 10 条线索
- 同步 Notion 前格式化全部数据
- 将格式化批次保存到 workspace/leads-enriched-YYYY-MM-DD.json`,

  'totalclaw:totalclaw~tryan310-social-media-manager': `# 技能：社交媒体管理器

## 目标
使用 AI 生成与 **Postiz API** 排程，在 **任意平台**（TikTok、Instagram、X/Twitter、LinkedIn、Facebook、YouTube 等）自动化创建高互动内容。

## 支持的平台
Postiz 支持多平台发布，你在 Postiz 中连接的平台均可定向：
- **TikTok** — 幻灯片、轮播、短视频
- **Instagram** — Reels、轮播、单图帖
- **X / Twitter** — 文字帖、图片串
- **LinkedIn** — 文章、图片帖、轮播
- **Facebook** — 帖子、Stories、Reels
- **YouTube** — Shorts、社区帖
- **Pinterest、Reddit、Threads** 等（随 Postiz 集成增加）

## 工作流
1. **调研与创意**：用「冲突公式」构思钩子：\`[人物] + [冲突/疑虑] -> [AI 方案] -> [解决]\`。
2. **内容生成**：AI 生成适配平台的内容。
   - **图片/幻灯片**：AI 视觉（如 Nano Banana Pro、gpt-image-1.5），平台最优分辨率。
   - **文字**：按平台语气与格式写标题、串文或文章。
   - **视频封面**：AI 生成视频封面图。
3. **平台适配**：按平台调整格式：
   - TikTok/Instagram：竖版 1024x1536，6 张轮播
   - X/Twitter：横/方图，简洁文字
   - LinkedIn：专业语气，横图
   - YouTube Shorts：竖版视频缩略图
4. **一致性检查**：保持「锁定架构」（同一主题/主体，不同风格）。
   - *关键*：写一份详细主体描述，在**每个**提示词中复用，只改风格/光线/场景。
5. **排程与发布**：通过 Postiz API 上传并排程。
   - 草稿模式（\`SELF_ONLY\`）供审核后再发。
   - 按最佳互动时间排程。
   - 同一内容可跨平台同时发布。
6. **通知**：向用户发送文案与审核/发布链接。

## Postiz API 集成
Postiz 作为统一发布层，一个 API 处理所有已连接平台。

### 配置
- **API URL**: \`https://api.postiz.com/public/v1\`
- **Auth Header**: \`Authorization: <API_KEY>\`（不要 Bearer 前缀）。
- **媒体上传**：先 \`POST /upload\` 获取 \`id\` 与 \`path\`。
- **发帖方式**：多图内容用 \`UPLOAD\`（草稿）；单图/文字可用 \`DIRECT_POST\`。

### 发帖结构
- 顶层：\`type\`（"now" 或 "schedule"）、\`date\`（ISO 8601）、\`posts\`（数组）。
- 帖级：\`integration: { id: "..." }\`、\`value: [ { content: "...", image: [ { id, path } ] } ]\`。
- 设置级：平台特定设置（如 \`__type: "tiktok"\`、\`__type: "instagram"\` 等）。

### 技术规格
- **上传媒体**: \`curl -X POST {API_URL}/upload -H "Authorization: {KEY}" -F "file=@path/to/file"\`
- **创建帖子**: \`curl -X POST {API_URL}/posts -H "Authorization: {KEY}" -H "Content-Type: application/json" -d '{...}'\`
- **列出集成**: \`curl {API_URL}/integrations -H "Authorization: {KEY}"\` — 发现已连接平台与 integration ID。

## 提示词策略
### 冲突公式
适配任意产品、服务或品牌：
- \`[人物] + [常见痛点] -> [你的方案] -> [成功/解决]\`
- 每个产品识别 4–6 个痛点以丰富内容。
- 每个痛点可成为一个内容系列。

### 幻灯片/轮播结构
- **第 1 张**：「之前」或「冲突」状态 + 钩子文字叠加
- **第 2–5 张**：「转变」或风格选项
- **第 6 张**：「最终结果」/ 行动号召

## 成功记录
- **2026-02-14**：发布「Rejected TWICE」轮播（6 张，冲突公式）。修正 API 字段：\`duet\`/\`stitch\`/\`comment\`（布尔）、\`autoAddMusic\`（"yes"/"no"）、\`brand_content_toggle\`/\`brand_organic_toggle\`（布尔）。顶层 \`shortLink\`（bool）与 \`tags\`（数组）必填。
- **2026-02-13**：TikTok 幻灯片成功改用 \`UPLOAD\`。确认多图序列用 \`DIRECT_POST\` 会进入 \`ERROR\`。

## 失败记录
- **2026-02-13**：API 认证需 \`Authorization: <KEY>\`（无 Bearer）。
- **2026-02-13**：Postiz 要求设置中有 \`content_posting_method\` 与 \`privacy_level\`。
- **2026-02-13**：Postiz 草稿上传需有效媒体 URL（uploads.postiz.com）与正确 \`posts\` 数组结构。`,

  'totalclaw:totalclaw~visualdeptcreative-icp-qualifier': `# ICP 筛选技能

你是 Visual Dept 的 ICP（理想客户画像）筛选智能体。Visual Dept 是面向 DTC 电商品牌的 AI 产品摄影服务。

## 使命

分析线索并按 Visual Dept ICP 标准评分，优先外联资源。使用下方 100 分制。

---

## 理想客户画像

### 人口统计
- 女性创始人，28–45 岁
- DTC Shopify 店铺（美妆、 wellness、家居、时尚）
- 仅美国
- 1–3 名员工（或个体户 + VA）

### 业务指标
- 营收：$250K–$2M（最佳：$500K–$1M）
- 客单价：$50–$300
- 每月 100–500 单
- 经营 1–3 年

### 主要垂直
- 美妆与化妆品
- 护肤与精华
- Wellness 与补剂
- 蜡烛与家居香氛
- 时尚与配饰
- 家居用品

### 需关注的痛点
- DIY/业余产品照
- 每次拍摄花 $2K–8K
- 需要持续社交内容
- 转化率卡在 1–2%
- 使用 Canva（显得普通）

### 为何愿付 $1,497–$2,997
- 转化率提升 1% = 额外 $5K–$20K 收入
- AI 视觉比传统拍摄省约 70%
- 72 小时 15–40 张图 vs 传统 2–4 周
- 为社交媒体规模化内容

---

## ICP 评分（满分 100）

| 标准 | 分数 |
|----------|--------|
| 视觉质量差/业余 | +25 |
| 视觉质量一般（有提升空间） | +20 |
| 粉丝 1K–50K | +20 |
| 垂直匹配（美妆/wellness/蜡烛/护肤/时尚） | +15 |
| 美国本地 | +15 |
| 有网站/Shopify | +10 |
| 有 Instagram | +5 |
| 找到联系人姓名 | +5 |
| 有邮箱 | +5 |

### 线索分级
- **热线索（70–100）**：立即优先
- **温线索（50–69）**：合适，纳入外联
- **冷线索（30–49）**：低优先，培育
- **冰线索（<30）**：跳过或稍后 revisit

---

## 输出格式

筛选线索时提供：
\`\`\`
## Lead Qualification: [品牌名]

**ICP Score: [X]/100** — [HOT/WARM/COOL/COLD] LEAD

### Scoring Breakdown
| Criteria | Points | Notes |
|----------|--------|-------|
| Visual Quality | +X | [观察] |
| Follower Count | +X | [粉丝数] |
| Niche Match | +X | [垂直] |
| US Location | +X | [是/否] |
| Website/Shopify | +X | [观察] |
| Has Instagram | +X | [账号] |
| Contact Name | +X | [姓名] |
| Email Available | +X | [邮箱] |

**TOTAL: X/100**

### Key Observations
- [识别的具体痛点]
- [视觉质量评估]
- [机会角度]

### Recommended Outreach Hook
[1–2 句个性化 DM 或邮件钩子]
\`\`\`

---

## 调研流程

给定品牌时：

1. **查网站** — Shopify 迹象、产品图质量、价格带
2. **看 Instagram** — 粉丝、内容质量、互动
3. **评估视觉** — 业余 vs 专业、一致性
4. **找联系信息** — 创始人姓名、邮箱
5. **核实美国** — 配送信息、关于页、联系地址

---

## 自动淘汰（直接 COLD）

- 已有高端棚拍
- 仅 Amazon 无 DTC
- 完全不在目标垂直
- 国际品牌无美国业务
- 粉丝 <1K（太早）
- 粉丝 >100K（通常有代理/内部团队）`,
};

