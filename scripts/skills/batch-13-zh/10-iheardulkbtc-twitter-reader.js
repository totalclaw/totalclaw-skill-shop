module.exports = {
  skillId: 'totalclaw:totalclaw~iheardulkbtc-twitter-reader',
  descriptionZh:
    '从 X（Twitter）推文 URL 读取并提取完整数据，含正文、作者、互动统计、媒体与引用推文。采用 FxTwitter API 多层级方案，Nitter 为尽力而为的备用。',
  bodyZh: `# Twitter/X 阅读器技能

用于通过多个可靠数据源从 X（原 Twitter）推文读取和提取数据的综合技能。

## 概述

本技能从 X/Twitter URL 提取完整推文信息，包括正文、作者详情、互动统计、媒体附件和引用推文。采用多层级方案以实现最大可靠性与数据完整性。

## 何时使用

**主要触发条件：**
- 用户分享推文 URL（x.com/*/status/* 或 twitter.com/*/status/*）
- 用户要求「阅读这条推文」并提供 URL
- 用户请求推文分析、摘要或数据提取
- 用户提及从特定推文获取信息

**用户请求示例：**
- 「这条推文说了什么？https://x.com/elonmusk/status/123456789」
- 「能帮我读一下这条推文吗？」
- 「总结这个 Twitter 讨论串」
- 「这条推文的互动数据是多少？」
- 「提取这条推文的媒体」

## 能力

### 提取的数据
- **推文内容**：完整正文及正确格式
- **作者信息**：显示名称与句柄（@username）
- **时间戳**：人类可读格式与原始格式
- **互动统计**：点赞、转推、回复、引用推文
- **媒体附件**：图片与视频的直接 URL
- **引用推文**：完整引用推文内容及作者信息
- **讨论串上下文**：可用时提供

### 支持的 URL 格式
- \`https://x.com/username/status/1234567890\`
- \`https://twitter.com/username/status/1234567890\`
- 带查询参数的 URL（如 \`?s=20\`、\`?t=abc123\`）
- 移动端 URL（m.twitter.com 自动处理）

## 使用示例

### 基本用法
\`\`\`bash
# 读取单条推文
./scripts/read_tweet.sh "https://x.com/username/status/1234567890"

# 读取完整讨论串（沿同一作者的回复链）
./scripts/read_thread.sh "https://x.com/username/status/1234567890"

# 使用 Nitter 的备用方法
./scripts/read_tweet_nitter.sh "https://x.com/username/status/1234567890"
\`\`\`

### 代理指令

当用户提供推文 URL 时：

1. **验证 URL 格式** — 确保为有效的 X/Twitter status URL
2. **使用主脚本** — 优先使用 \`scripts/read_tweet.sh\`
3. **优雅处理失败** — 主方法失败时尝试 \`scripts/read_tweet_nitter.sh\`
4. **清晰呈现数据** — 格式化输出供人类阅读
5. **保留上下文** — 包含互动统计与媒体引用

### 示例响应格式

脚本返回如下结构化 JSON：

\`\`\`json
{
  "success": true,
  "tweet": {
    "text": "Tweet content here...",
    "author": {
      "name": "Display Name",
      "handle": "username"
    },
    "timestamp": {
      "formatted": "2024-01-15 14:30:25 UTC",
      "original": "Mon Jan 15 14:30:25 +0000 2024"
    },
    "url": "https://x.com/username/status/1234567890",
    "engagement": {
      "likes": 1250,
      "retweets": 340,
      "replies": 89,
      "quotes": 45
    },
    "media": {
      "photos": ["https://pbs.twimg.com/media/..."],
      "video": "https://video.twimg.com/..."
    },
    "quoted_tweet": {
      "text": "Quoted tweet text...",
      "author": {
        "name": "Quoted Author",
        "handle": "quoted_user"
      },
      "url": "https://x.com/quoted_user/status/987654321"
    }
  },
  "source": "fxtwitter",
  "fetched_at": 1705327825
}
\`\`\`

### 代理响应示例

\`\`\`markdown
**来自 @elonmusk 的推文：**
> "Just had a great meeting about sustainable transport. The future is electric! ⚡🚗"

**发布时间：** 2024 年 1 月 15 日 14:30 UTC
**互动：** 1,250 点赞 • 340 转推 • 89 回复 • 45 引用

**媒体：** 附 1 张图片
- 图片：https://pbs.twimg.com/media/example.jpg

**来自 @teslaofficial 的引用推文：**
> "Our latest Model S update includes new charging optimizations..."
\`\`\`

## 技术实现

### 主方法：FxTwitter API
- **端点：** \`https://api.fxtwitter.com/{username}/status/{tweet_id}\`
- **优势：** 无需认证、数据全面、可靠
- **速率限制：** 个人使用额度宽松
- **响应：** 含所有推文元数据的完整 JSON

### 备用方法：Nitter 抓取（尽力而为）
- **实例：** 多个公共 Nitter 实例作为备用
- **优势：** FxTwitter 不可用时仍可用
- **限制：** 基础数据提取，无互动统计
- **用法：** 主方法失败时自动回退
- **⚠️ 注意：** 自 2024 年以来，大多数公共 Nitter 实例已关闭或变得不可靠。此备用方案为尽力而为，可能无法返回结果。FxTwitter API 应视为唯一可靠方法。

### 错误处理
- 无效 URL 格式检测
- 网络超时处理
- API 错误响应解析
- 方法间优雅回退
- 向用户提供清晰错误消息

## 依赖

**必需系统工具：**
- \`curl\` — 向 API 发起 HTTP 请求
- \`jq\` — JSON 解析与格式化
- \`bash\` — 脚本执行环境
- \`grep/sed\` — 文本处理（仅 Nitter 备用）

**可选增强：**
- \`gdate\`（macOS 上通过 Homebrew 安装 GNU date）— 更好的时间戳格式化

## 安全与隐私

### 安全特性
- ✅ **无外部数据收集** — 数据保留在你的系统上
- ✅ **无分析或遥测** — 无跟踪或使用报告
- ✅ **完全可审计代码** — 开源、可读的 shell 脚本
- ✅ **最少网络调用** — 仅连接 FxTwitter API 和 Nitter 实例
- ✅ **无敏感数据暴露** — 脚本不存储或记录个人信息
- ✅ **安全 URL 处理** — 正确的 URL 验证与清理

### 网络连接
**批准的外部主机：**
- \`api.fxtwitter.com\` — 主数据源（FxTwitter API）
- \`nitter.net\` 及其他 Nitter 实例 — 备用抓取
- 不建立其他外部连接

**数据流：**
1. 用户提供推文 URL
2. 脚本从 URL 提取用户名/ID
3. 向 FxTwitter 或 Nitter 发起 API 请求
4. 本地解析响应
5. 返回格式化 JSON（不永久存储）

### 审计轨迹
所有网络请求包含：
- 清晰的 user-agent 标识
- 仅必要的最少请求头
- 无认证令牌或个人标识符
- 仅请求提取公开推文数据

## 错误场景与处理

### 常见错误

**无效 URL 格式：**
\`\`\`json
{
  "error": "Invalid Twitter/X URL format",
  "expected": "x.com/user/status/123456789 or twitter.com/user/status/123456789"
}
\`\`\`

**推文未找到：**
\`\`\`json
{
  "error": "API Error",
  "code": 404,
  "message": "NOT_FOUND"
}
\`\`\`

**网络失败：**
\`\`\`json
{
  "error": "Failed to fetch tweet data",
  "details": "Network request failed"
}
\`\`\`

**需要备用方案：**
\`\`\`json
{
  "error": "All Nitter instances failed",
  "suggestion": "Try the main script with FxTwitter API, or wait for Nitter instances to recover"
}
\`\`\`

### 代理错误处理

发生错误时：
1. **解析错误 JSON** 以了解问题
2. **尝试备用方法**（若主方法失败）
3. **用通俗语言向用户解释**出了什么问题
4. **建议替代方案**（稍后重试、检查 URL 格式等）

## 高级特性

### 讨论串阅读
通过 \`read_thread.sh\` 支持完整讨论串展开：
- 给定讨论串中任意推文 URL，通过 \`replying_to\` 字段向上遍历回复链
- 仅收集同一作者的推文（自回复讨论串）
- 按时间顺序返回推文 JSON 数组
- 每条讨论串安全上限 50 条推文（可通过第二个参数配置）
- 用法：\`./scripts/read_thread.sh "https://x.com/user/status/123" [max_depth]\`

### 媒体处理
- **图片：** 通过 \`media.photos\` 数组获取直接 URL（全分辨率）
- **视频：** 通过 \`media.videos\` 获取 MP4 链接，含缩略图与时长
- **所有媒体：** 合并的 \`media.all\` 数组，带类型标注以完整覆盖
- **文章封面：** 长文 X 帖子（「文章」）提取 \`media.article_cover\`
- **GIF：** 作为视频内容处理
- **外部链接：** 保留在推文正文中

### 引用推文递归
技能可提取嵌套引用推文至合理深度，避免无限循环。

## 性能说明

### 响应时间
- **FxTwitter API：** 通常 200–500ms
- **Nitter 抓取：** 每个实例 1–3 秒
- **依赖网络：** 可能因连接质量而异

### 缓存考虑
- 默认不实现持久缓存
- 重复请求可考虑临时缓存
- 尊重外部服务的速率限制

## 故障排除

### 常见问题

**「API 响应中无推文数据」**
- 推文可能已删除或为受保护内容
- 检查 URL 格式与推文 ID
- 尝试备用方法

**「网络请求失败」**
- 检查互联网连接
- FxTwitter API 可能暂时不可用
- 回退到 Nitter 方法

**「所有 Nitter 实例均失败」**
- Nitter 实例可能被封锁或宕机
- 等待后使用 FxTwitter API 重试
- 检查防火墙/代理设置

### 调试模式
调试时以详细输出运行：
\`\`\`bash
bash -x scripts/read_tweet.sh "https://x.com/username/status/123"
\`\`\`

## 开发与定制

### 添加新数据源
添加额外备用方法：
1. 在 \`scripts/\` 目录创建新脚本
2. 遵循相同的 JSON 输出格式
3. 更新主技能逻辑以包含新方法
4. 充分测试并更新文档

### 修改输出格式
可通过修改各脚本中最终的 \`jq\` 命令自定义 JSON 结构。保持所有方法间的一致性。

### 添加功能
可考虑以下增强方向：
- 推文内容情感分析
- 话题标签与提及提取
- 链接展开与预览
- 媒体中文字的 OCR
- 非英文推文翻译支持

## 版本历史

- **v1.1** — 讨论串跟踪（\`read_thread.sh\`）、全面媒体提取（图片、视频、所有媒体、文章封面）
- **v1.0** — 初始版本，含 FxTwitter API 与 Nitter 备用
- 多源可靠性及全面数据提取
- 完整安全审计合规
- 可用于 ClawHub 分发的生产就绪版本`,
};
