module.exports = {
  skillId: 'totalclaw:totalclaw~heyw00d-linkswarm-api',
  descriptionZh:
    'LinkSwarm 反向链接交换 API，供 AI 智能体为所建站点积累 SEO 权威。支持注册域名、请求/贡献链接位、积分管理与放置状态查询。',
  bodyZh: `# LinkSwarm API 🐝

**面向 AI 智能体的反向链接交换。为你智能体创建的任何站点建立权威。**

## 本技能能做什么

让你的智能体可以：
- 在 LinkSwarm 网络注册域名
- 请求反向链接（消耗积分）
- 贡献链接位（赚取积分）
- 查询积分余额与放置状态
- 链接放置后接收通知

## 快速开始

### 1. 获取 API Key
在 https://linkswarm.ai/register/ 注册，或通过 API：
\`\`\`bash
curl -X POST https://api.linkswarm.ai/waitlist \\
  -H "Content-Type: application/json" \\
  -d '{"email": "your@email.com"}'
\`\`\`

### 2. 存入认证配置
添加到智能体的 auth-profiles.json 或环境变量：
\`\`\`json
{
  "linkswarm": {
    "api_key": "sk_linkswarm_..."
  }
}
\`\`\`

## API 参考

**Base URL：** \`https://api.linkswarm.ai\`

**认证：** \`Authorization: Bearer sk_linkswarm_...\`

### 注册站点
\`\`\`bash
POST /v1/sites
{
  "domain": "mycoolsite.com",
  "name": "My Cool Site",
  "categories": ["tech", "ai"]
}
\`\`\`

### 验证域名
\`\`\`bash
POST /v1/sites/verify
{
  "domain": "mycoolsite.com",
  "method": "dns"  # or "meta"
}
\`\`\`
添加 TXT 记录：\`linkswarm-verify=<token>\`，或使用 meta 标签验证。

### 请求反向链接（消耗 1 积分）
\`\`\`bash
POST /v1/pool/request
{
  "target_domain": "mycoolsite.com",
  "target_page": "/",
  "anchor_text": "My Cool Site"
}
\`\`\`

### 贡献链接位（赚取 1 积分）
\`\`\`bash
POST /v1/pool/contribute
{
  "domain": "mycoolsite.com",
  "page_url": "/resources/",
  "max_links": 3
}
\`\`\`

### 查询状态
\`\`\`bash
GET /v1/pool/status
\`\`\`
返回：积分、待放置、已验证链接

### 列出你的站点
\`\`\`bash
GET /v1/sites
\`\`\`

## 积分系统

| 操作 | 积分 |
|--------|---------|
| 请求反向链接 | -1 |
| 贡献链接位 | +1 |
| 链接已验证 | +1 奖励 |
| 推荐注册 | +3 |

免费层起始 3 积分。

## 示例：完整智能体流程

\`\`\`python
import requests

API = "https://api.linkswarm.ai"
KEY = "sk_linkswarm_..."
headers = {"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"}

# 1. 注册新站点
requests.post(f"{API}/v1/sites", headers=headers, json={
    "domain": "myagentsite.com",
    "categories": ["ai", "tools"]
})

# 2. 贡献以赚取积分
requests.post(f"{API}/v1/pool/contribute", headers=headers, json={
    "domain": "myagentsite.com",
    "page_url": "/partners/"
})

# 3. 请求反向链接
requests.post(f"{API}/v1/pool/request", headers=headers, json={
    "target_domain": "myagentsite.com",
    "anchor_text": "AI Tools Directory"
})

# 4. 查询状态
status = requests.get(f"{API}/v1/pool/status", headers=headers).json()
print(f"Credits: {status['credits']['balance']}")
print(f"Pending: {status['pendingPlacements']}")
\`\`\`

## Webhooks（可选）

注册 webhook 以接收通知：
\`\`\`bash
POST /v1/webhooks
{
  "url": "https://your-agent.com/webhook",
  "events": ["link.placed", "link.verified", "credits.low"]
}
\`\`\`

## 最佳实践

1. **先验证域名** 再请求链接
2. **先贡献再请求** 以积累积分
3. **使用相关分类** 以获得更好匹配
4. **配置 webhook** 实现自主运行

## 速率限制

- 60 请求/分钟
- 500 请求/小时
- 突发：10 并发

## 支持

- 文档：https://linkswarm.ai/docs/
- Discord：https://discord.gg/6RzUpUbMFE
- API 状态：https://api.linkswarm.ai/health

## 为何选择 LinkSwarm？

- **非互惠匹配** — 链接对搜索引擎看起来更自然
- **验证放置** — 爬虫确认每条反向链接
- **公平积分制** — 贡献才能获取
- **不断增长的网络** — 30+ 优质站点
- **AI 优先** — 为自主智能体构建

---

*你的智能体建站。LinkSwarm 建权威。* 🐝`,
};
