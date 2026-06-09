module.exports = {
  skillId: 'totalclaw:totalclaw~tkejr-makex',
  descriptionZh: 'MakeX 集成 API，通过 Composio 发现并执行 Gmail、Slack、GitHub 等第三方服务操作。',
  bodyZh: `# OpenClaw 集成 API

OpenClaw 是基于技能的集成系统，允许基于 MakeX 构建的应用通过 Composio 发现并执行第三方服务（Gmail、Slack、GitHub 等）的操作。

## 认证

所有端点需要 \`X-Org-Token\` 请求头，其中包含组织服务令牌。该令牌在组织数据库中验证。不使用用户会话 cookie — 这些端点专为服务器间通信设计。

\`\`\`
X-Org-Token: <org-service-token>
\`\`\`

**没有组织令牌？**

1. 前往 [https://www.makex.app/](https://www.makex.app/) 注册账户。
2. 在仪表盘中导航至 **Settings**。
3. 从设置页复制 API 密钥 — 这就是你的 \`X-Org-Token\`。

## 基础 URL

\`\`\`
POST /api/openclaw/integrations/<endpoint>
\`\`\`

所有端点通过预检 \`OPTIONS\` 处理器支持 CORS。

## 端点

### 1. 搜索操作

**POST** \`/api/openclaw/integrations/search-actions\`

在一个或多个集成中发现可用操作/工具。

**请求体：**
\`\`\`json
{
  "integrations": ["gmail", "slack", "github"],
  "toolkit": "gmail",
  "search": "send"
}
\`\`\`

- \`integrations\`（必填）：要搜索的集成 slug 数组。
- \`toolkit\`（可选）：若提供，覆盖 \`integrations\` 并仅搜索该工具包。
- \`search\`（可选）：按关键词筛选操作。

**响应（200）：**
\`\`\`json
{
  "total": 12,
  "actions": {
    "gmail": [
      { "slug": "GMAIL_SEND_EMAIL", "name": "Send Email" },
      { "slug": "GMAIL_CREATE_DRAFT", "name": "Create Draft" }
    ],
    "slack": [
      { "slug": "SLACK_SEND_MESSAGE", "name": "Send Message" }
    ]
  }
}
\`\`\`

---

### 2. 已连接账户

**POST** \`/api/openclaw/integrations/connected-account\`

检查组织的特定集成是否已连接并获取账户详情。

**请求体：**
\`\`\`json
{
  "integration": "gmail"
}
\`\`\`

- \`integration\`（必填）：要检查的集成 slug。

**响应（200）：**
\`\`\`json
{
  "accountId": "conn_abc123",
  "userId": "org_xyz",
  "integration": "gmail",
  "status": "ACTIVE"
}
\`\`\`

**响应（404）— 未连接：**
\`\`\`json
{
  "error": "No active connected account found for integration gmail",
  "availableIntegrations": ["slack", "github"]
}
\`\`\`

---

### 3. 操作详情

**POST** \`/api/openclaw/integrations/action-details\`

获取特定操作的完整规范，包括输入和输出参数。

**请求体：**
\`\`\`json
{
  "action_slug": "GMAIL_SEND_EMAIL"
}
\`\`\`

- \`action_slug\`（必填）：要检索的操作 slug。

**响应（200）：**
\`\`\`json
{
  "name": "Send Email",
  "slug": "GMAIL_SEND_EMAIL",
  "description": "Send an email via Gmail",
  "inputParameters": {
    "to": { "type": "string", "description": "Recipient email", "required": true },
    "subject": { "type": "string", "description": "Email subject" },
    "body": { "type": "string", "description": "Email body" }
  },
  "outputParameters": {
    "messageId": { "type": "string" },
    "threadId": { "type": "string" }
  }
}
\`\`\`

---

### 4. 运行操作

**POST** \`/api/openclaw/integrations/run-action\`

在已连接账户上执行特定操作。

**请求体：**
\`\`\`json
{
  "toolName": "GMAIL_SEND_EMAIL",
  "accountId": "conn_abc123",
  "arguments": {
    "to": "user@example.com",
    "subject": "Hello",
    "body": "Hi there"
  }
}
\`\`\`

- \`toolName\`（必填）：要执行的操作 slug。
- \`accountId\`（必填）：已连接账户 ID（来自 connected-account 端点）。
- \`arguments\`（可选）：操作的结构化键值参数。
- \`text\`（可选）：自然语言文本输入（未提供 \`arguments\` 时使用）。
- \`version\`（可选）：API 版本覆盖。
- \`custom_auth_params\`（可选）：自定义认证参数。
- \`custom_connection_data\`（可选）：自定义连接数据。
- \`allow_tracing\`（可选）：启用执行追踪。

**响应（200）：** 原始 Composio 执行响应（因操作而异）。

---

### 5. 输出结构

**POST** \`/api/openclaw/integrations/output-structure\`

执行操作并返回其输出结构。用于确定操作响应的形状。

**请求体：**
\`\`\`json
{
  "action_slug": "GMAIL_SEND_EMAIL",
  "accountId": "conn_abc123",
  "arguments": {
    "to": "test@example.com",
    "subject": "Test",
    "body": "Test body"
  }
}
\`\`\`

- \`action_slug\`（必填）：要执行的操作 slug。
- \`accountId\`（必填）：已连接账户 ID。
- \`arguments\`（可选）：传递给操作的参数。

**响应（200）：**
\`\`\`json
{
  "successful": true,
  "data": { ... }
}
\`\`\`

## 错误响应

所有端点以一致格式返回错误：

\`\`\`json
{ "error": "Description of what went wrong" }
\`\`\`

| 状态码 | 含义 |
|--------|---------|
| 400 | 缺少必填参数 |
| 401 | 缺少或无效的 \`X-Org-Token\` |
| 404 | 资源未找到（如无已连接账户） |
| 500 | 服务器错误或缺少 \`COMPOSIO_API_KEY\` |

## 典型工作流

1. **搜索操作** 以发现已连接集成的可用功能。
2. **获取已连接账户** 以检索特定集成的 \`accountId\`。
3. **获取操作详情** 以了解所选操作的输入/输出参数。
4. **运行操作** 使用所需参数执行操作。`,
};
