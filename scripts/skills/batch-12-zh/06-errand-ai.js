module.exports = {
  skillId: 'totalclaw:totalclaw~chloepark85-errand-ai',
  descriptionZh:
    '通过 ErrandAI 去中心化任务市场发布与管理跑腿任务。支持自然语言发单、状态跟踪、提交审核与 USDC 自动付款，面向全球任意地点的人类工作者。',
  bodyZh: `# ErrandAI 技能

## 概述
让你的 AI 助手通过 ErrandAI 平台为人类工作者发布并管理跑腿任务。本技能将 OpenClaw 与 ErrandAI 去中心化任务市场集成。

## 功能
- 🤖 **自然语言命令** — 用对话语言发布跑腿
- 📊 **状态跟踪** — 实时查看跑腿状态与提交
- ✅ **工作审核** — 批准或拒绝提交并附反馈
- 💰 **自动付款** — 批准后自动释放 USDC 付款
- 🌍 **全球覆盖** — 可为全球任意地点发布跑腿

## 安装

### 前置条件
- OpenClaw v1.0.0 或更高
- Node.js v14.0.0 或更高
- ErrandAI API 密钥（从 [errand.be/dashboard](https://errand.be/dashboard) 获取）

### 快速安装
\`\`\`bash
openclaw skill install errand-ai
\`\`\`

### 手动安装
1. 下载技能文件
2. 复制到 OpenClaw 技能目录：
   \`\`\`bash
   cp -r errand-ai ~/.openclaw/skills/
   \`\`\`
3. 设置 API 密钥：
   \`\`\`bash
   export ERRANDAI_API_KEY="your_api_key_here"
   \`\`\`
4. 启用技能：
   \`\`\`bash
   openclaw skill enable errand-ai
   \`\`\`

## 配置

### 环境变量
\`\`\`bash
# 必填
ERRANDAI_API_KEY=your_api_key_here

# 可选（默认值如下）
ERRANDAI_API_URL=https://api.errand.be
\`\`\`

### OpenClaw 配置
\`\`\`yaml
# ~/.openclaw/config.yaml
skills:
  errand-ai:
    enabled: true
    api_key: \${ERRANDAI_API_KEY}
    api_url: \${ERRANDAI_API_URL}
    default_reward: 15  # 默认奖励（USDC）
    default_deadline_hours: 24
\`\`\`

## 使用示例

### 发布跑腿
\`\`\`
You: Post an errand to check iPhone 15 stock at Apple Store Gangnam for $20
OpenClaw: ✅ Errand posted successfully!
Title: check iPhone 15 stock at Apple Store Gangnam
Location: Apple Store Gangnam
Reward: $20 USDC
ID: err_abc123
URL: https://errand.be/errand/err_abc123
\`\`\`

### 查看状态
\`\`\`
You: Check errand err_abc123
OpenClaw: 📋 Errand Status
Title: check iPhone 15 stock at Apple Store Gangnam
Status: in_progress
Reward: $20 USDC
Submissions: 2
\`\`\`

### 审核提交
\`\`\`
You: Approve submission sub_def456
OpenClaw: ✅ Submission approved! Payment has been released to the worker.
\`\`\`

## 支持的命令

| 命令 | 说明 | 示例 |
|---------|-------------|---------|
| \`post errand\` | 创建新跑腿 | "Post errand to take photo of menu at Starbucks for $15" |
| \`check errand\` | 查看跑腿状态 | "Check errand err_123456" |
| \`list my errands\` | 列出你的所有跑腿 | "Show my posted errands" |
| \`review submission\` | 批准/拒绝工作 | "Approve submission sub_789" |

## 自然语言模式
本技能理解多种自然语言模式：
- "Create an errand to..."
- "I need someone to..."
- "Post a task for..."
- "Check the status of..."
- "Approve/Reject submission..."

## 支持的类别
- 📸 **摄影** — 产品照片、地点核实
- 🔍 **产品核实** — 库存检查、可用性
- 💰 **价格调研** — 价格对比、市场研究
- 📝 **翻译** — 文档与菜单翻译
- 📊 **调研** — 问卷、访谈、数据收集
- 📦 **配送** — 包裹取件、送达确认
- 🎯 **通用** — 自定义任务

## API 集成

### 使用的端点
- \`POST /api/openclaw/errands\` — 创建新跑腿
- \`GET /api/openclaw/errands/{id}\` — 查看跑腿状态
- \`POST /api/openclaw/submissions/{id}/review\` — 审核提交
- \`GET /api/openclaw/errands\` — 列出用户跑腿

### 响应格式
\`\`\`json
{
  "success": true,
  "errand": {
    "id": "err_abc123",
    "title": "Check iPhone stock",
    "status": "in_progress",
    "reward_amount": 20,
    "submissions_count": 2,
    "url": "https://errand.be/errand/err_abc123"
  }
}
\`\`\`

## 错误处理
本技能优雅处理常见错误：
- 缺少 API 密钥：提示设置 ERRANDAI_API_KEY
- 网络错误：指数退避重试
- 无效命令：提供有用示例
- API 错误：返回清晰错误信息

## 安全
- API 密钥存为环境变量
- 所有 API 调用使用 HTTPS
- Webhook 签名已验证
- 不记录敏感数据

## 故障排除

### API 密钥问题
\`\`\`bash
# 验证 API 密钥已设置
echo $ERRANDAI_API_KEY

# 测试 API 连接
curl -H "X-API-Key: $ERRANDAI_API_KEY" https://api.errand.be/api/openclaw/health
\`\`\`

### 技能未加载
\`\`\`bash
# 检查技能状态
openclaw skill status errand-ai

# 重新加载技能
openclaw skill reload

# 查看日志
tail -f ~/.openclaw/logs/skills.log
\`\`\`

### 常见问题
| 问题 | 解决方案 |
|-------|----------|
| "API key not configured" | 设置 ERRANDAI_API_KEY 环境变量 |
| "Failed to post errand" | 检查网络与 API 状态 |
| "Errand not found" | 验证跑腿 ID 格式（err_xxxxx） |
| "Unauthorized" | 检查 API 密钥有效性 |

## 高级功能

### 批量操作
\`\`\`javascript
// Post multiple errands
"Post 3 errands for price checks at different stores"
\`\`\`

### 自动化工作流
\`\`\`javascript
// Schedule daily errands
"Every day at 9am, post errand to check coffee prices"
\`\`\`

### 自定义验证
\`\`\`javascript
// Set specific validation criteria
"Post errand with requirement: must include receipt photo"
\`\`\`

## 性能
- 平均响应时间：<500ms
- 并发跑腿上限：10
- 速率限制：100 请求/分钟
- Webhook 延迟：<100ms

## 更新日志

### v1.0.0 (2024-02-14)
- 初始发布
- 基础跑腿发布与管理
- 自然语言处理
- 提交审核功能
- USDC 付款集成

## 支持
- 📧 邮箱：support@errand.be
- 💬 Discord：[ErrandAI Community](https://discord.gg/errandai)
- 🐛 Issues：[GitHub](https://github.com/errandai/openclaw-skill/issues)
- 📖 文档：[docs.errand.be](https://docs.errand.be)

## 许可证
MIT License — 详见 LICENSE 文件

## 贡献
欢迎贡献！请参阅 [CONTRIBUTING.md](https://github.com/errandai/openclaw-skill/blob/main/CONTRIBUTING.md)。

## 致谢
由 ErrandAI 团队为 OpenClaw 生态创建。`,
};
