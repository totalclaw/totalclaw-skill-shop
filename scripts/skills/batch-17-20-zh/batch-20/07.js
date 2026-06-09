module.exports = {
  skillId: 'totalclaw:totalclaw~odinbot33-oee-crm-intelligence',
  descriptionZh:
    '为你的个人 CRM 提供两阶段 Berman 风格筛选与联系人评分。它会学习对你而言重要的内容。',
  bodyZh: `# 🐾 CRM Intelligence — 智能联系人筛选

> 由 Odin's Eye Enterprises 出品 —— 古老智慧，现代智能。

为你的个人 CRM 提供两阶段 Berman 风格筛选与联系人评分。它会学习对你而言重要的内容。

## 功能简介

1. **第 1 阶段** —— 快速的关键词/模式筛选（快速、低成本）
2. **第 2 阶段** —— 由 AI 驱动的相关性评分（更深入的分析）
3. **学习** —— 根据你的反馈不断改进

## 触发短语

- "filter my contacts"
- "score this lead"
- "who should I reach out to"
- "CRM filter"
- "prioritize contacts"

## 用法

\`\`\`bash
# Filter contacts from a CSV/JSON
python crm_filter.py filter contacts.json

# Score a specific contact
python crm_filter.py score "John Doe" --context "met at conference"

# Show learning stats
python crm_filter.py stats
\`\`\`

## 文件

- \`crm_filter.py\` —— 主筛选引擎
- \`learning.json\` —— 已学习的偏好（自动更新）

## 系统要求

- Python 3.10+
- \`ANTHROPIC_API_KEY\` 环境变量（用于第 2 阶段的 AI 评分）

## 面向 Agent

从该技能目录运行。筛选结果以 JSON 形式输出到 stdout。

\`\`\`bash
python crm_filter.py filter contacts.json --top 10
\`\`\``,
};
