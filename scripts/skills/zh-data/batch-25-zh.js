'use strict';

/** @type {Record<string, { descriptionZh: string, bodyZh?: string }>} */
module.exports = {
  'totalclaw:totalclaw~hmyaoyuan-weibo-manager': {
    descriptionZh: '通过 Puppeteer 控制微博（非官方 API），支持请求发帖、管理员审批流程及带文字/图片的发布。所有发布须遵循 Request → Approve → Execute 工作流，禁止自主发布。',
  },
  'totalclaw:totalclaw~holl4ndtv-tiktok-video-analyzer': {
    descriptionZh: '粘贴视频 URL 即可分析内容：支持 TikTok、YouTube、Instagram、X 等 1000+ 站点，本地转录音频并回答关于视频内容的任何问题。',
    bodyZh: `# 视频分析技能

粘贴视频 URL 即可分析任意视频。支持 TikTok、YouTube、Instagram、Twitter/X 及 1000+ 其他站点。在本地转录音频并回答关于内容的任何问题。

---

## 何时使用本技能

在以下情况激活：
- 用户分享视频 URL（tiktok.com、youtube.com、instagram.com、twitter.com、x.com 等）
- 用户询问「这个视频讲什么」「总结一下」「他们在教什么」「钩子是什么」等
- 用户询问此前已保存视频的相关问题

---

## ⚠️ 关键规则 — 请先阅读

**规则 1 — 第一条消息永远是这个，无例外：**

在运行任何 exec 命令之前，使用 \`message\` 工具发送：
> 📡 已收到视频，正在分析...

必须是 \`message\` 工具调用，而非最终回复文本。使用 message 工具可在继续处理时立即通知用户。若放在回复文本中，用户要等全部完成才能看到——这完全违背了设计目的。

不要引用对话历史、先前测试或当前会话中的任何内容。每个 URL 都视为全新处理。

**规则 2 — 绝不沉默**
处理过程中用户必须每 30–60 秒收到一条消息。沉默 = 故障。
- 下载步骤后：发送「📥 已下载！正在转录...」
- 任何步骤超过 30 秒：发送「⏳ 仍在处理中...」

**规则 3 — 绝不添加个人评论**
不要添加以下内容：
- 「这似乎是我们已经测试过的视频」
- 「我认得这个 URL」/「你之前发过」
- 「提醒一下——这是同一个链接」
- 任何关于 URL 或先前使用的脚注、括号或旁白

直接运行技能并给出答案。以保存提示结束。仅此而已。
若转录已缓存：说「📚 在你的库中找到了！」然后回答。就这样。

**规则 4 — 首次运行警告**
若 transcripts 文件夹为空（首次运行），提前警告：
> ⚠️ 首次运行——正在下载 AI 模型（约 150MB）。仅需 2–4 分钟，之后不再重复。

---

## 前置依赖检查

首次运行前，检查依赖是否已安装：

\`\`\`bash
which ffmpeg && python3 -c "import faster_whisper; print('ok')" && python3 -c "import yt_dlp; print('ok')"
\`\`\`

**若有缺失，引导用户：**

Mac/本地：
\`\`\`bash
brew install ffmpeg
pip3 install faster-whisper yt-dlp --break-system-packages
\`\`\`

Linux/VPS：
\`\`\`bash
apt install -y ffmpeg
pip install faster-whisper yt-dlp --break-system-packages
\`\`\`

---

## 流程

### 步骤 1 — 立即确认（先于一切）
发送：\`📡 已收到视频，正在分析...\`

### 步骤 1b — 首次运行警告
若似为首次（无缓存转录），警告用户：
> ⚠️ 首次运行——AI 转录模型需下载（约 150MB）。仅需 2–4 分钟，之后不再重复。喝杯咖啡 ☕

### 步骤 2 — 下载（第 1 步，共 2 步）

\`\`\`bash
python3 ~/.openclaw/skills/tiktok-analyzer/transcribe.py --download-only "URL_HERE"
\`\`\`

返回含 \`status: "downloaded"\` 和 \`video_id\` 的 JSON。若 \`from_cache: true\` + \`skip_transcribe: true\` → 直接进入步骤 3，跳过 2b。

### 步骤 2b — 发送进度消息（通过 message 工具），然后转录

使用 \`message\` 工具发送：\`📥 已下载！正在转录...\`

然后立即运行：
\`\`\`bash
python3 ~/.openclaw/skills/tiktok-analyzer/transcribe.py --transcribe-only "VIDEO_ID"
\`\`\`

将 \`VIDEO_ID\` 替换为上一步的 \`video_id\`。

返回 JSON：
\`\`\`json
{
  "transcript": "full text here...",
  "language": "en",
  "video_id": "abc123",
  "from_cache": false
}
\`\`\`

若 \`from_cache: true\`（来自步骤 2）→ 说「📚 在你的库中找到了——即时回答！」并跳过等待消息。

若有 \`"error"\` 键 → 清晰转述（绝不向用户展示 Python 堆栈）。

### 步骤 3 — 回答问题
用转录内容回答用户问题。若无具体问题，提供：
- **内容概述**（1–2 句）
- **要点 / 教学内容**（要点列表）
- **语气 / 风格**（教育、娱乐、故事等）

### 步骤 4 — 提供保存（from_cache: false 时强制）
给出答案后，始终询问——不要跳过：
> 💾 要保存此转录以便日后追问而无需重新下载吗？（yes/no）

仅当 \`from_cache: true\`（已保存）时跳过。

若 yes：
\`\`\`bash
python3 ~/.openclaw/skills/tiktok-analyzer/save_transcript.py "VIDEO_ID" 'JSON_DATA'
\`\`\`

确认：\`✅ 已保存到你的视频库！\`

---

## 搜索已保存转录

当用户询问此前分析过的内容：
1. 列出 \`~/.openclaw/skills/tiktok-analyzer/transcripts/\` 中的文件
2. 读取相关 \`.json\` 文件
3. 根据已保存转录回答

---

## 错误处理

| 错误 | 回应 |
|-------|----------|
| 私密/已删除视频 | 「该视频为私密或已被删除。请尝试其他 URL。」 |
| 无 ffmpeg | 「需要 ffmpeg。运行：\`brew install ffmpeg\`（Mac）或 \`apt install ffmpeg\`（Linux）」 |
| 无 faster-whisper | 「运行：\`pip install faster-whisper yt-dlp\` 后重试。」 |
| 超时 / 视频过长 | 「这个需要更久——试试更短的片段或检查网络。」 |

---

## 演示技巧

- **演示时：** 使用已分析过的视频（缓存命中 = 即时响应，效果很好）
- **首次运行：** 始终提前警告 150MB 模型下载
- **支持 yt-dlp 支持的任意平台** — TikTok、YouTube、Instagram、Twitter、Reddit、Vimeo 及 1000+ 更多`,
  },
};
