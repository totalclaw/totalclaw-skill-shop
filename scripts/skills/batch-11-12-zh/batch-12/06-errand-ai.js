module.exports = {
  skillId: 'totalclaw:totalclaw~chloepark85-errand-ai',
  descriptionZh:
    '通过 ErrandAI 平台为 AI 助手发布与管理跑腿任务。支持自然语言发布、状态跟踪、审核提交与 USDC 自动支付。',
  bodyZh: `# ErrandAI Skill

## 概述
让 AI 助手通过 ErrandAI 平台为人类工作者发布和管理跑腿任务。本技能将智能体与 ErrandAI 去中心化任务市场集成。

## 功能
- 🤖 **自然语言命令** - 用对话语言发布跑腿
- 📊 **状态跟踪** - 实时查看跑腿状态与提交
- ✅ **工作审核** - 批准或拒绝提交并附反馈
- 💰 **自动支付** - 批准后自动释放 USDC
- 🌍 **全球覆盖** - 为全球任意地点发布跑腿

## 安装

### 前置条件
- Node.js v14.0.0 或更高
- ErrandAI API 密钥（从 [errand.be/dashboard](https://errand.be/dashboard) 获取）

### 快速安装
\`\`\`bash
# 将技能文件复制到技能目录并配置 API 密钥
export ERRANDAI_API_KEY="your_api_key_here"
\`\`\`

### 手动安装
1. 下载技能文件
2. 复制到技能目录：
   \`\`\`bash
   cp -r errand-ai ~/.skills/errand-ai/
   \`\`\`
3. 设置 API 密钥：
   \`\`\`bash
   export ERRANDAI_API_KEY="your_api_key_here"
   \`\`\`
4. 启用技能

## 配置

### 环境变量
\`\`\`bash
# 必需
ERRANDAI_API_KEY=your_api_key_here

# 可选（默认值如下）
ERRANDAI_API_URL=https://api.errand.be
\`\`\`

### 配置示例
\`\`\`yaml
skills:
  errand-ai:
    enabled: true
    api_key: \${ERRANDAI_API_KEY}
    api_url: \${ERRANDAI_API_URL}
    default_reward: 15  # 默认 USDC 奖励
    default_deadline_hours: 24
\`\`\`

## 使用示例

### 发布跑腿
\`\`\`
你：发布跑腿，到江南 Apple Store 查 iPhone 15 库存，$20
助手：✅ 跑腿发布成功！
标题：查江南 Apple Store iPhone 15 库存
地点：Apple Store Gangnam
奖励：$20 USDC
ID：err_abc123
URL：https://errand.be/errand/err_abc123
\`\`\`

### 查看状态
\`\`\`
你：查看跑腿 err_abc123
助手：📋 跑腿状态
标题：查江南 Apple Store iPhone 15 库存
状态：in_progress
奖励：$20 USDC
提交数：2
\`\`\`

### 审核提交
\`\`\`
你：批准提交 sub_def456
助手：✅ 提交已批准！已向工作者释放付款。
\`\`\`

## 支持的命令

| 命令 | 说明 | 示例 |
|---------|-------------|---------|
| \`post errand\` | 创建新跑腿 | "发布跑腿：在星巴克拍菜单照，$15" |
| \`check errand\` | 查看跑腿状态 | "查看跑腿 err_123456" |
| \`list my errands\` | 列出你的跑腿 | "显示我发布的跑腿" |
| \`review submission\` | 批准/拒绝工作 | "批准提交 sub_789" |

## 自然语言模式
技能理解多种自然语言模式：
- "创建一个跑腿..."
- "我需要有人..."
- "发布任务..."
- "查看...状态"
- "批准/拒绝提交..."

## 支持的类别
- 📸 **摄影** - 产品照、地点核实
- 🔍 **产品核实** - 库存检查、可用性
- 💰 **价格调研** - 价格对比、市场研究
- 📝 **翻译** - 文档与菜单翻译
- 📊 **调研** - 问卷、访谈、数据采集
- 📦 **配送** - 取件、送达确认
- 🎯 **通用** - 自定义任务

## API 集成

### 使用的端点
- \`POST /api/openclaw/errands\` - 创建跑腿
- \`GET /api/openclaw/errands/{id}\` - 查看状态
- \`POST /api/openclaw/submissions/{id}/review\` - 审核提交
- \`GET /api/openclaw/errands\` - 列出用户跑腿

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
技能优雅处理常见错误：
- 缺少 API 密钥：提示设置 ERRANDAI_API_KEY
- 网络错误：指数退避重试
- 无效命令：提供有用示例
- API 错误：返回清晰错误信息

## 安全
- API 密钥存于环境变量
- 所有 API 调用使用 HTTPS
- 验证 Webhook 签名
- 不记录敏感数据

## 故障排除

### API 密钥问题
\`\`\`bash
# 验证 API 密钥
echo $ERRANDAI_API_KEY

# 测试 API 连接
curl -H "X-API-Key: $ERRANDAI_API_KEY" https://api.errand.be/api/openclaw/health
\`\`\`

### 技能未加载
检查技能状态、重新加载技能、查看日志。

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
// 发布多个跑腿
"在多家店发布 3 个价格检查跑腿"
\`\`\`

### 自动化工作流
\`\`\`javascript
// 每日定时跑腿
"每天上午 9 点发布咖啡价格检查跑腿"
\`\`\`

### 自定义验证
\`\`\`javascript
// 设置特定验证条件
"发布跑腿，要求：必须包含收据照片"
\`\`\`

## 性能
- 平均响应时间：<500ms
- 并发跑腿限制：10
- 速率限制：100 请求/分钟
- Webhook 延迟：<100ms

## 更新日志

### v1.0.0 (2024-02-14)
- 初始发布
- 基础跑腿发布与管理
- 自然语言处理
- 提交审核
- USDC 支付集成

## 支持
- 📧 Email: support@errand.be
- 💬 Discord: [ErrandAI Community](https://discord.gg/errandai)
- 🐛 Issues: [GitHub](https://github.com/errandai/openclaw-skill/issues)
- 📖 Docs: [docs.errand.be](https://docs.errand.be)

## 许可证
MIT License - 详见 LICENSE 文件

## 贡献
欢迎贡献！见 [CONTRIBUTING.md](https://github.com/errandai/openclaw-skill/blob/main/CONTRIBUTING.md)

## 致谢
由 ErrandAI 团队创建。`,
};
