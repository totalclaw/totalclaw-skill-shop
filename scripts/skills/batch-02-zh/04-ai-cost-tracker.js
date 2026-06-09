module.exports = {
  skillId: 'totalclaw:totalclaw~odinbot33-oee-ai-cost-tracker',
  descriptionZh:
    '追踪每次 AI API 调用的模型、Token 与费用，生成支出报告，并根据任务复杂度推荐更经济的模型路由方案，帮助降低 AI 使用成本。',
  bodyZh: `# 🐾 AI Cost Tracker — 了解你的 AI 支出

> by Odin's Eye Enterprises — Ancient Wisdom. Modern Intelligence.

追踪每一次 AI API 调用，生成支出报告，并提供路由建议以降低成本。

## 功能

1. **记录** 每次 API 调用，将模型、Token、费用写入 JSONL
2. **报告** 按模型、时间段和用例统计支出
3. **建议** 根据任务复杂度推荐更便宜的模型路由

## 触发短语

- "how much have I spent on AI"
- "AI cost report"
- "track this API call"
- "show AI spending"
- "cost breakdown"

## 用法

### 记录（在代码中）
\`\`\`python
from tracker import log_usage
log_usage(model="claude-3-haiku", input_tokens=500, output_tokens=200, task="humanize")
\`\`\`

### 报告
\`\`\`bash
# 完整支出报告
python report.py

# 最近 7 天
python report.py --days 7

# 按模型统计
python report.py --by-model
\`\`\`

## 文件

- \`tracker.py\` — 日志库，可导入到你的工具中
- \`report.py\` — 支出分析 CLI 仪表盘
- \`pricing.json\` — 模型定价数据（按需更新）

## 环境要求

- Python 3.10+（仅标准库）
- 无需 API 密钥（追踪的是你自己的用量）

## 面向智能体

查看支出：\`python report.py\`
从其他工具记录用量：\`from tracker import log_usage\`

<!-- 🐾 Odin's ravens count every coin -->`,
};
