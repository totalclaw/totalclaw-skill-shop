module.exports = {
  skillId: 'totalclaw:totalclaw~kevjade-kit-email-operator',
  descriptionZh: '通过 Kit（ConvertKit）API 撰写、管理并发送专业邮件营销活动，支持 AI 文案生成、细分定向与活动统计。',
  bodyZh: `# Kit 邮件营销运营

**面向 Kit（ConvertKit）的 AI 驱动邮件营销**

Version: 1.0.0  
Distribution: Private ClawHub (Premium Skool members only)

---

## 目的

本技能使 OpenClaw 能够通过 Kit（ConvertKit）撰写、管理并发送专业的邮件营销活动。它将 AI 驱动的内容生成与直接 API 集成相结合，处理完整的邮件营销工作流。

**核心能力：**
- 生成符合用户品牌语气的邮件文案
- 创建主题行和预览文本
- 通过 Kit API 安排群发
- 定向特定细分和标签
- 跟踪活动表现
- 遵循邮件营销最佳实践

---

## 设置流程

### 首次运行

当用户首次请求邮件营销帮助时，启动设置向导：

1. **检查凭据**
   \`\`\`javascript
   const credsPath = '/data/.openclaw/workspace/.kit-credentials';
   \`\`\`
   若缺失，则运行设置。

2. **设置向导流程**
   - 欢迎并说明将收集哪些信息
   - 请求 Kit API 凭据（v4 key + secret）
   - 使用 \`scripts/credentials.js\` 加密存储
   - 可选：语气训练（分析 3-5 封过往邮件）
   - 可选：数据库集成（指向语气指南文件）
   - 收集业务上下文（细分领域、受众、产品、链接）
   - 获取 Kit 自定义字段以供后续个性化
   - 确认设置完成

3. **语气训练（若提供）**
   - 分析提供的邮件样本
   - 提取：语气、结构、词汇、句式模式
   - 将语气档案保存至 \`/data/.openclaw/workspace/.kit-voice-profile.json\`
   - 用于所有后续邮件生成

4. **数据库集成（若配置）**
   - 询问语气指南路径（如 \`content/writing-rules/VOICE-GUIDE.md\`）
   - 询问记忆文件路径（如 \`MEMORY.md\`）
   - 将路径存储在凭据文件中
   - 生成邮件前读取这些文件

---

## 邮件生成工作流

### 步骤 1：澄清问题

在撰写任何邮件之前，先问以下问题：

**必填：**
- **目标：** 目的是什么？（培育/销售/公告/教育/重新激活/ onboarding）
- **受众：** 谁会收到？（全部订阅者/特定标签/特定细分）
- **核心信息：** 你想传达的核心要点是什么？
- **行动号召：** 读者应该做什么？（点击链接/回复/采取行动）

**可选：**
- **要包含的链接：** 是否有特定 URL 需要突出？
- **语气偏好：**（若不使用语气训练）
- **个性化：** 是否使用名字？自定义字段？
- **时间：** 立即发送、定时发送，还是保存为草稿？

**示例提问流程：**
\`\`\`
我可以帮你写这封邮件。先问几个快速问题：

1. 目标是什么？（培育关系 / 促成销售 / 发布公告 / 教育内容）
2. 发给谁？（全部订阅者 / 特定标签 / 某个细分）
3. 你想传达的核心信息或价值是什么？
4. 读者读完后应该采取什么行动？
5. 有需要我包含的链接吗？
6. 是否要用名字做个性化？
\`\`\`

### 步骤 2：生成内容

**主题行（提供 3 个选项）：**
- 使用 \`references/subject-line-formulas.md\` 中的公式
- 保持 27-73 个字符
- 激发好奇心、紧迫感、利益点或社会认同
- 避免垃圾邮件触发词（全大写、过多标点）

**预览文本：**
- 40-70 个字符
- 与主题行互补
- 预告邮件内的价值

**邮件正文：**
- 遵循 \`references/email-best-practices.md\` 中的结构
- 匹配用户语气（若已训练）或请求的语调
- 若请求则包含个性化标签
- 首句强有力的钩子
- 清晰的价值主张
- 自然的 CTA 位置
- 保持易扫读（短段落、留白）

**个性化标签：**
参考 \`references/kit-personalization.md\` 了解可用标签：
- \`{{ subscriber.first_name }}\` - 订阅者名字
- \`{{ subscriber.email_address }}\` - 邮箱地址
- 自定义字段：\`{{ subscriber.YOUR_FIELD_NAME }}\`

**示例生成输出：**
\`\`\`markdown
## Subject Line Options

1. [Name], here's what 80% of email marketers get wrong
2. The 3-minute email hack that doubled my opens
3. Your subscribers are telling you something (listen closely)

## Preview Text

Most people ignore this signal. Here's how to spot it.

## Email Body

Hey {{ subscriber.first_name }},

Quick question: when was the last time you checked your email open rates?

[rest of email...]

**Call to Action:**
[Read the full guide here →](https://example.com/guide)

Talk soon,
[Your Name]
\`\`\`

### 步骤 3：审阅与优化

将邮件呈现给用户并询问：
- "听起来怎么样？"
- "需要我调整语气吗？"
- "要不要换个角度？"
- "可以发送了，还是保存为草稿？"

根据反馈进行修改。

### 步骤 4：通过 Kit API 发送

获批后，使用 \`scripts/kit-api.js\`：

**创建群发：**
\`\`\`javascript
const { KitAPI } = require('./scripts/kit-api.js');
const kit = new KitAPI();

const broadcast = await kit.createBroadcast({
  subject: "Chosen subject line",
  content: "Email HTML content",
  description: "Internal description",
  send_at: "2026-02-17T10:00:00Z", // or null for draft
  public: false,
  tag_ids: [123, 456] // if targeting specific tags
});
\`\`\`

**选项：**
- **草稿：** \`send_at: null\` - 保存供稍后审阅
- **定时：** \`send_at: "ISO timestamp"\` - 安排未来发送
- **立即发送：** 不包含 \`send_at\`（立即发布）

**定向：**
- **全部订阅者：** 不包含 \`tag_ids\` 或 \`segment_ids\`
- **特定标签：** \`tag_ids: [123, 456]\`
- **特定细分：** \`segment_ids: [789]\`

发送前与用户确认。

---

## 活动管理

### 查看活动统计

发送后，用户可请求表现数据：

\`\`\`javascript
const stats = await kit.getBroadcastStats(broadcastId);
\`\`\`

**以可读格式呈现统计：**
\`\`\`
📊 Campaign Performance: "Your Subject Line"

📤 Recipients: 1,234
📬 Opens: 456 (37%)
🖱️ Clicks: 89 (19.5% of opens)
🚪 Unsubscribes: 5 (0.4%)
\`\`\`

**提供洞察：**
- 与基准对比（见 \`references/email-best-practices.md\`）
- 为下次活动提出改进建议
- 识别表现良好的部分

### 管理草稿

用户可以：
- 列出已保存草稿：\`kit.listBroadcasts({ status: 'draft' })\`
- 更新草稿：\`kit.updateBroadcast(id, changes)\`
- 删除草稿：\`kit.deleteBroadcast(id)\`
- 安排草稿：\`kit.updateBroadcast(id, { send_at: timestamp })\`

---

## 最佳实践（始终遵循）

### 邮件内容

✅ **应该：**
- 撰写对话式、真实的文案
- 使用短段落（最多 2-3 句）
- 包含一个清晰的 CTA
- 尽可能个性化
- 保持易扫读（加粗、列表、留白）
- 匹配用户品牌语气
- 以价值为先，而非推销

❌ **不应该：**
- 使用垃圾邮件触发词（free、guarantee、act now）
- 写大段文字块
- 包含多个冲突的 CTA
- 听起来机械或官僚
- 让退订变困难
- 过度销售或夸大

### 主题行

✅ **应该：**
- 保持 27-73 个字符
- 使用好奇心、紧迫感或利益点
- 适当时个性化
- A/B 测试不同方法
- 避免垃圾邮件触发词

❌ **不应该：**
- 全大写或过多标点
- 误导邮件内容
- 使用垃圾邮件词汇
- 过于模糊或过长

### 发送策略

✅ **应该：**
- 先发送草稿（安排前审阅）
- 先发给自己测试
- 检查送达率（SPF、DKIM、DMARC）
- 相关时分段列表
- 跟踪表现
- 定期清理列表

❌ **不应该：**
- 未经审阅就发送
- 向整个列表群发销售推销
- 忽视退订或投诉
- 发送过于频繁（尊重收件箱）
- 忽视表现数据

---

## 技术参考

### 文件位置

- **凭据：** \`/data/.openclaw/workspace/.kit-credentials\`
- **语气档案：** \`/data/.openclaw/workspace/.kit-voice-profile.json\`
- **API 客户端：** \`skills/kit-email-operator/scripts/kit-api.js\`
- **凭据管理器：** \`skills/kit-email-operator/scripts/credentials.js\`

### 可用函数

**来自 \`scripts/kit-api.js\`：**
\`\`\`javascript
// Broadcasts
kit.createBroadcast(data)
kit.updateBroadcast(id, data)
kit.deleteBroadcast(id)
kit.getBroadcast(id)
kit.listBroadcasts(options)
kit.getBroadcastStats(id)

// Tags
kit.listTags()
kit.tagSubscriber(email, tagId)

// Subscribers
kit.listSubscribers()
kit.getSubscriber(id)

// Custom Fields
kit.listCustomFields()
\`\`\`

### 安全

- 所有凭据加密存储（AES-256-GCM）
- 绝不记录或显示 API 密钥
- 文件权限设为 600（仅所有者可读写）
- 凭据文件排除在版本控制之外

---

## 示例工作流

### 工作流 1：欢迎邮件

**用户：** "为新订阅者写一封欢迎邮件"

**你：**
\`\`\`
我可以帮你写这封欢迎邮件。先问几个快速问题：

1. 新订阅者应该了解你/你的业务的什么？
2. 他们在你的列表上能获得什么价值？
3. 是否要包含首个资源或行动？
4. 有特定链接要发给他们吗？
\`\`\`

**回答后，生成：**
- 3 个主题行选项（欢迎、清晰价值）
- 预览文本
- 邮件正文（自我介绍、设定期望、交付价值、清晰下一步）

**然后：** 在 Kit 中创建为草稿，请求审阅，安排或发送。

### 工作流 2：产品发布

**用户：** "我要发布新课程。写一封销售邮件。"

**你：**
\`\`\`
明白。课程发布的销售邮件。让我问：

1. 课程讲什么？（它带来的转变）
2. 适合谁？（理想学员）
3. 价格点？
4. 发布日期和紧迫感？（早鸟、名额有限等）
5. 销售页链接？
6. 是否强调社会认同、赠品或稀缺性？
\`\`\`

**回答后，生成：**
- 3 个主题行（好奇心 + 紧迫感）
- 预览文本（利益驱动）
- 邮件正文（问题 → 解决方案 → 转变 → 优惠 → CTA）

**然后：** 一起审阅、优化，发送给特定标签或细分。

### 工作流 3：重新激活活动

**用户：** "我想重新激活 60 天未打开的订阅者"

**你：**
\`\`\`
明智之举。重新激活活动。快速问题：

1. 他们最初订阅时，你为他们提供了什么价值？
2. 自那以后有什么变化或改进？
3. 是否给他们退订选项（清理列表）？
4. 让他们回来的主要价值主张是什么？
\`\`\`

**回答后，生成：**
- 3 个主题行（打破模式、个人化、好奇心）
- 预览文本（直接坦诚）
- 邮件正文（承认缺席、提醒价值、简单请求、轻松退订）

**然后：** 在 Kit 中定向特定细分（不活跃订阅者），先作为测试发送。

---

## 语气匹配

若用户在设置时提供了邮件样本，参考语气档案：

**语气档案结构：**
\`\`\`json
{
  "tone": "casual and direct",
  "sentence_length": "short, punchy sentences mixed with longer ones",
  "vocabulary": ["honestly", "let's be real", "here's the thing"],
  "patterns": [
    "Uses questions to engage",
    "Includes parenthetical asides",
    "Admits limitations honestly"
  ],
  "formatting": [
    "Short paragraphs (1-3 sentences)",
    "Bold for emphasis",
    "Emoji occasionally"
  ],
  "signature": "Ship it,\nKevin"
}
\`\`\`

**将这些元素应用到生成的邮件中。**

---

## 故障排除

### 设置问题

**问题：** 用户没有 Kit 凭据  
**解决方案：** 引导至 Kit 控制台 → Settings → API Keys

**问题：** 语气训练样本过短  
**解决方案：** 要求更长的邮件（每封 300+ 词）

**问题：** 找不到 Kit 自定义字段  
**解决方案：** 验证凭据，检查 Kit 账户是否已创建自定义字段

### 发送问题

**问题：** 群发创建失败  
**解决方案：** 检查凭据、验证内容格式、确保 tag_ids 有效

**问题：** 邮件显示异常  
**解决方案：** 检查 HTML 格式，先发给自己测试

**问题：** 打开率低  
**解决方案：** 审阅主题行、检查发送时间、分析发件人名称

### API 问题

**问题：** 速率限制  
**解决方案：** API 客户端有自动重试与指数退避

**问题：** 凭据无效  
**解决方案：** 重新运行设置，在 Kit 控制台验证凭据

---

## 参考文件

**主题行：**
阅读 \`references/subject-line-formulas.md\`（50+ 个成熟模板）

**邮件结构：**
阅读 \`references/email-best-practices.md\`（综合指南）

**个性化：**
阅读 \`references/kit-personalization.md\`（所有可用 Kit 标签）

**序列：**
阅读 \`references/sequence-templates.md\`（欢迎、培育、销售、 onboarding）

**示例：**
查看 \`examples/\` 文件夹中的完整邮件模板

---

## 质量标准

这是一项**高级技能**。每次交互都应让人感觉：
- **专业** — 精致、无错、结构清晰
- **有帮助** — 预判需求、引导决策、教育用户
- **高效** — 减少来回沟通、智能默认
- **安全** — 保护凭据、绝不暴露敏感数据
- **人性化** — 对话式，而非机械

用户为此付费。要物有所值。

---

**本技能代表 OpenClaw 可用的最高质量邮件营销自动化。请保持这一标准。**`,
};
