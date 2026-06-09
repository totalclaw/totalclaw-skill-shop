# 短视频文案生成器

为 TikTok、小红书、快手等平台生成病毒式短视频文案。

## 支持平台

- **抖音**：潮流、快节奏、易传播风格
- **小红书**：真实、生活方式、产品测评
- **快手**：接地气、有共鸣
- **Bilibili（B站）**：深度、垂类、社区风格

## 用法

### 交互模式

```bash
npx short-video-copywriter
```

### API 模式

```typescript
import { generateShortVideoCopy } from 'short-video-copywriter';

// 生成小红书文案
const result = await generateShortVideoCopy({
  topic: "职场穿搭",
  platform: "xiaohongshu",
  tone: "亲和",
  length: "short"
});
```

## 输入选项

| 选项 | 取值 | 默认 | 说明 |
|--------|--------|---------|-------------|
| topic | 任意文本 | 必填 | 视频主题 |
| platform | douyin/xiaohongshu/kuaishou/bilibili | douyin | 目标平台 |
| tone | professional/casual/humor/heartwarming | casual | 写作风格 |
| length | short/medium/long | short | 文案长度 |

## 输出格式

```typescript
{
  hook: "开头金句",
  body: "正文内容",
  hashtags: ["#标签1", "#标签2", "#标签3"],
  tips: "发布建议"
}
```

## 示例

### 小红书产品测评

```typescript
Input: {
  topic: "平价面膜测评",
  platform: "xiaohongshu",
  tone: "亲和"
}

Output: {
  hook: "救命！30块的面膜竟然吊打大牌？！",
  body: "...",
  hashtags: ["#平价护肤", "#面膜测评", "#学生党"],
  tips: "建议晚8点发布，互动率更高"
}
```

### 抖音 Vlog

```typescript
Input: {
  topic: "租房攻略",
  platform: "douyin",
  tone: "幽默"
}

Output: {
  hook: "租房血泪史！建议收藏！",
  body: "...",
  hashtags: ["#租房", "#避坑", "#租房攻略"],
  tips: "配合热门BGM效果更好"
}
```

## 环境变量

```env
OPENAI_API_KEY=your_api_key_here
```

## 最佳实践

1. **钩子优先**：前 3 秒决定生死
2. **贴合平台**：使用平台特有梗与趋势
3. **话题标签**：使用 3–5 个相关标签
4. **行动号召**：结尾引导互动
