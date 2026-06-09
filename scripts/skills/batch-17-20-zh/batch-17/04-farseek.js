module.exports = {
  skillId: 'totalclaw:totalclaw~farseek2020-farseek',
  descriptionZh:
    'Farseek AI 求职搜索 API。跨 22,700+ 公司招聘板与 20+ ATS 平台，根据技能智能匹配职位并分层排序。',
  bodyZh: `# Farseek — AI 求职搜索 API

利用 AI 在 22,700+ 公司招聘板与 20+ ATS 平台上，根据你的技能匹配相关职位。

## 功能

Farseek 搜索来自 Greenhouse、Lever、Ashby、Workday、SmartRecruiters 等的实时职位库。使用 Claude 将技能扩展为搜索词、按相关性过滤，并将匹配结果分层排序。

## 端点

\`\`\`
POST https://farseek.ai/api/v1/search
Content-Type: application/json
\`\`\`

## 请求

\`\`\`json
{
  "skills": ["Python", "machine learning", "distributed systems"],
  "location": "San Francisco",
  "role": "Senior Software Engineer",
  "titles": ["Software Engineer", "Backend Developer"]
}
\`\`\`

| 字段      | 类型       | 必填 | 说明                          |
|------------|------------|----------|--------------------------------------|
| \`skills\`   | \`string[]\` | 是      | 待匹配技能（最多 50 项）     |
| \`location\` | \`string\`   | 否       | 城市或 "Remote"（默认 "Remote"） |
| \`role\`     | \`string\`   | 否       | 当前/期望职位            |
| \`titles\`   | \`string[]\` | 否       | 历史职位（上下文）    |

## 响应

\`\`\`json
{
  "jobs": [
    {
      "title": "ML Engineer",
      "company": "Anthropic",
      "location": "San Francisco, CA",
      "url": "https://boards.greenhouse.io/anthropic/jobs/123",
      "tier": 1,
      "tier_label": "Strong match",
      "haiku_score": 9,
      "broadened": false
    }
  ],
  "meta": {
    "total_results": 25,
    "location": "San Francisco",
    "tokens_used": 15000,
    "cost_usd": 0.003
  }
}
\`\`\`

## 错误

| 代码 | 含义             |
|------|---------------------|
| 400  | 缺少/无效 skills 数组 |
| 429  | 速率限制（10 次/分钟）    |
| 503  | 服务不可用          |

错误返回 \`{"error": {"code": "string", "message": "string"}}\`。

## 备注

- 已启用 CORS（任意来源）
- 最多返回 25 条排序结果
- Tier 1 = 最佳匹配，Tier 4 = 最宽泛匹配
- 覆盖 Greenhouse、Lever、Ashby、Workday、SmartRecruiters、BambooHR、Workable、JazzHR、Teamtailor 等`,
};
