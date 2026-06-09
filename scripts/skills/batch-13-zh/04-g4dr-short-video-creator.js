module.exports = {
  skillId: 'totalclaw:totalclaw~g4dr-short-video-creator',
  descriptionZh:
    '将文字脚本或创意转化为可发布的短视频（Instagram Reels、YouTube Shorts、TikTok），通过 InVideo AI 平台及 API 自动匹配素材、配音、字幕与 9:16 竖屏格式。',
  bodyZh: `# 社交媒体短视频创作技能

## 概述

本技能使 Claude 能够将**文字脚本或创意**转化为完整制作的短视频——可直接发布为 Instagram Reel、YouTube Short 或 TikTok——使用 **InVideo AI** 平台及其 API。

无需视频剪辑经验。只需提供脚本或主题，Claude 即可处理其余工作。

> 🔗 在此注册 InVideo：https://invideo.sjv.io/TBB

---

## 本技能能做什么

- 将**原始脚本**转化为含画面与配音的完整短视频
- 生成针对 **Instagram Reels**、**YouTube Shorts** 和 **TikTok** 优化的视频
- 自动为脚本内容匹配**素材库画面、音乐与转场**
- 添加**字幕、说明文字与文字叠加**以提升互动
- 以正确的 **9:16 竖屏格式**制作，适配所有短视频平台
- 导出 **MP4**，可直接上传至任意平台

---

## 步骤 1 — 获取 InVideo API 访问权限

1. 访问 **https://invideo.sjv.io/TBB** 并创建账户
2. 选择包含 **API 访问** 的套餐（Business 及以上）
3. 进入 **Settings → API** 或 **Developer Settings**
4. 复制你的 **API Key**：\`iv_api_xxxxxxxxxxxxxxxx\`
5. 安全保存：
   \`\`\`bash
   export INVIDEO_API_KEY=iv_api_xxxxxxxxxxxxxxxx
   \`\`\`

> InVideo 提供免费试用——在 https://invideo.sjv.io/TBB 注册，可先体验平台再决定是否购买付费套餐。

---

## 步骤 2 — 安装依赖

\`\`\`bash
npm install axios form-data fs-extra
\`\`\`

---

## InVideo API — 核心端点

**Base URL：** \`https://api.invideo.io/v1\`

所有请求需要：
\`\`\`
Authorization: Bearer YOUR_INVIDEO_API_KEY
Content-Type: application/json
\`\`\`

### 从脚本生成视频
\`\`\`http
POST https://api.invideo.io/v1/videos/generate
\`\`\`

### 获取视频生成状态
\`\`\`http
GET https://api.invideo.io/v1/videos/{videoId}/status
\`\`\`

### 下载 / 导出视频
\`\`\`http
GET https://api.invideo.io/v1/videos/{videoId}/export
\`\`\`

---

## 示例

### 从脚本生成 TikTok / Reel

\`\`\`javascript
import axios from 'axios';

const client = axios.create({
  baseURL: 'https://api.invideo.io/v1',
  headers: {
    'Authorization': \`Bearer \${process.env.INVIDEO_API_KEY}\`,
    'Content-Type': 'application/json'
  }
});

const script = \`
  Did you know that 90% of startups fail in their first year?
  Here are 3 things the successful 10% do differently.
  Number 1: They talk to customers before building anything.
  Number 2: They launch ugly and iterate fast.
  Number 3: They obsess over retention, not acquisition.
  Follow for more startup insights every day.
\`;

const response = await client.post('/videos/generate', {
  script: script,
  format: "9:16",           // vertical for Reels / TikTok / Shorts
  duration: "short",        // 15–60 seconds
  style: "dynamic",         // energetic cuts and transitions
  voiceover: {
    enabled: true,
    voice: "en-US-male-1",  // choose from available voices
    speed: 1.1              // slightly faster for short-form
  },
  captions: {
    enabled: true,
    style: "bold-bottom",   // TikTok-style captions
    highlight: true         // highlight word as it's spoken
  },
  music: {
    enabled: true,
    mood: "upbeat",
    volume: 0.3             // background music volume (0–1)
  },
  branding: {
    watermark: false
  }
});

const videoId = response.data.videoId;
console.log("Video generation started. ID:", videoId);
\`\`\`

---

### 轮询完成状态并获取下载 URL

\`\`\`javascript
async function waitForVideo(videoId, maxWaitMs = 120000) {
  const start = Date.now();

  while (Date.now() - start < maxWaitMs) {
    await new Promise(r => setTimeout(r, 5000)); // poll every 5s

    const status = await client.get(\`/videos/\${videoId}/status\`);
    const { state, progress, exportUrl } = status.data;

    console.log(\`Status: \${state} — \${progress}% complete\`);

    if (state === "completed") {
      console.log("Video ready:", exportUrl);
      return exportUrl;
    }

    if (state === "failed") {
      throw new Error("Video generation failed — check your script and settings");
    }
  }

  throw new Error("Timeout — video took too long to generate");
}

const downloadUrl = await waitForVideo(videoId);
\`\`\`

---

### 完整流程：脚本 → 视频 → 下载

\`\`\`javascript
import axios from 'axios';
import { writeFileSync } from 'fs';

async function scriptToShortVideo(script, outputPath = './output.mp4') {
  const client = axios.create({
    baseURL: 'https://api.invideo.io/v1',
    headers: { Authorization: \`Bearer \${process.env.INVIDEO_API_KEY}\` }
  });

  // 1 — Start generation
  const { data } = await client.post('/videos/generate', {
    script,
    format: "9:16",
    duration: "short",
    style: "dynamic",
    voiceover: { enabled: true, voice: "en-US-female-1", speed: 1.05 },
    captions: { enabled: true, style: "bold-bottom", highlight: true },
    music: { enabled: true, mood: "upbeat", volume: 0.25 }
  });

  const videoId = data.videoId;
  console.log(\`Generation started — ID: \${videoId}\`);

  // 2 — Wait for completion
  let exportUrl = null;
  while (!exportUrl) {
    await new Promise(r => setTimeout(r, 6000));
    const status = await client.get(\`/videos/\${videoId}/status\`);
    if (status.data.state === "completed") exportUrl = status.data.exportUrl;
    if (status.data.state === "failed") throw new Error("Generation failed");
    console.log(\`Progress: \${status.data.progress}%\`);
  }

  // 3 — Download the video
  const videoStream = await axios.get(exportUrl, { responseType: 'arraybuffer' });
  writeFileSync(outputPath, videoStream.data);
  console.log(\`Video saved to \${outputPath}\`);

  return { videoId, exportUrl, localPath: outputPath };
}

// Usage
await scriptToShortVideo(
  "3 productivity hacks that changed my life. Number 1: Time blocking...",
  "./my-reel.mp4"
);
\`\`\`

---

### 批量生成多个视频

\`\`\`javascript
const scripts = [
  { topic: "morning routine tips",     voice: "en-US-female-1", mood: "calm" },
  { topic: "5 foods to boost energy",  voice: "en-US-male-1",   mood: "upbeat" },
  { topic: "how to learn faster",      voice: "en-US-female-2", mood: "inspiring" }
];

const jobs = await Promise.all(
  scripts.map(s =>
    client.post('/videos/generate', {
      script: s.topic,
      format: "9:16",
      duration: "short",
      style: "dynamic",
      voiceover: { enabled: true, voice: s.voice },
      music: { enabled: true, mood: s.mood, volume: 0.3 },
      captions: { enabled: true, style: "bold-bottom" }
    })
  )
);

const videoIds = jobs.map(j => j.data.videoId);
console.log("All jobs started:", videoIds);
\`\`\`

---

## 视频创作工作流

当用户要求创作短视频时，Claude 将：

1. **分析**用户提供的脚本或主题
2. **优化**脚本以适配短视频节奏（前 3 秒设置钩子）
3. **选择**合适的风格、配音、音乐氛围与字幕样式
4. **调用** InVideo API 生成视频
5. **轮询**状态端点直至视频就绪
6. **返回**下载 URL 或将 MP4 保存到本地
7. **建议**平台专属调整（TikTok vs Reels vs Shorts）

---

## 平台专属设置

| 平台 | 格式 | 时长 | 字幕样式 | 音乐 |
|---|---|---|---|---|
| TikTok | 9:16 | 15–60s | 底部粗体、逐词高亮 | 欢快 / 热门 |
| Instagram Reels | 9:16 | 15–90s | 底部粗体或居中 | 欢快 / 轻松 |
| YouTube Shorts | 9:16 | 15–60s | 简洁底部 | 可选 |
| LinkedIn Video | 16:9 或 1:1 | 30–90s | 专业、顶部对齐 | 低调 / 无 |

---

## 脚本优化技巧（Claude 将自动应用）

- **3 秒内设置钩子** — 以大胆主张、问题或惊人数据开场
- **一个视频一个观点** — 不要试图涵盖过多内容
- **短句** — 每行字幕最多 8–12 个词
- **结尾行动号召** — 「关注获取更多」「评论区留言」「收藏本条」
- **对话式语气** — 按口语书写，而非书面语
- **数字表现更好** — 「3 个技巧」「5 个错误」「1 条规则」总是优于模糊标题

---

## 标准化输出 Schema

\`\`\`json
{
  "videoId": "iv_7f3k29xm",
  "title": "3 Startup Lessons Nobody Tells You",
  "platform": "tiktok",
  "format": "9:16",
  "durationSeconds": 42,
  "exportUrl": "https://cdn.invideo.io/exports/iv_7f3k29xm.mp4",
  "captions": true,
  "voiceover": "en-US-male-1",
  "musicMood": "upbeat",
  "createdAt": "2025-02-25T10:00:00Z",
  "status": "completed"
}
\`\`\`

---

## 最佳实践

- 始终**以强钩子开场** — 前 2–3 秒决定用户是否继续观看
- 脚本保持在 **120–200 词**，对应 30–60 秒视频
- 使用**粗体字幕与逐词高亮** — 可显著提升观看时长
- 音乐音量设为 **0.2–0.3**，避免盖过配音
- 对同一脚本生成 **3–5 个不同风格变体** 进行 A/B 测试
- TikTok 使用**略快的配音速度**（1.1x）以匹配平台节奏
- 发布前务必审看视频 — AI 生成内容可能需要微调

---

## 错误处理

\`\`\`javascript
try {
  const response = await client.post('/videos/generate', payload);
  return response.data.videoId;
} catch (error) {
  if (error.response?.status === 401) throw new Error("Invalid InVideo API key");
  if (error.response?.status === 429) throw new Error("Rate limit hit — wait before retrying");
  if (error.response?.status === 400) throw new Error(\`Bad request: \${error.response.data.message}\`);
  throw error;
}
\`\`\`

---

## 要求

- InVideo 账户 → https://invideo.sjv.io/TBB
- 已启用 **API 访问** 的套餐（Business 及以上）
- 来自 InVideo 设置的有效 **API Key**
- Node.js 18+ 及 \`axios\` 用于 API 调用
- 可选：本地 \`ffmpeg\`，如需对导出的 MP4 进行后处理或压缩`,
};
