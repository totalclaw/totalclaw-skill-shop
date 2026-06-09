module.exports = {
  skillId: 'totalclaw:totalclaw~brokenwatch24-jobtread-api',
  descriptionZh:
    '通过 Pave Query API 在 openclaw 中操作 JobTread，管理客户、项目、文档、任务与 Webhook 订阅。',
  bodyZh: `# 技能：通过 Pave Query API 使用 JobTread

## 摘要
本技能让你通过 openclaw 使用基于 Pave 的 API \`https://api.jobtread.com/pave\` 完全操作 JobTread。每个请求都是带 \`query\` 对象的单次 POST，镜像 GraphQL 风格表达式，你决定返回哪些字段。凭正确的 grant key，可创建和管理账户（客户/供应商）、项目、文档、任务、位置、自定义字段，甚至订阅 Webhook 获取实时更新。

## 设置与凭证
1. **创建 grant：** 登录 https://app.jobtread.com/grants 为自动化创建新 grant。复制一次性 \`grantKey\`（以 \`grant_\` 开头，仅显示一次）。
2. **本地存储密钥：** 使用安全文件如 \`~/.config/jobtread/grant_key\`。示例：
   \`\`\`bash
   mkdir -p ~/.config/jobtread
   echo "grant_xxx" > ~/.config/jobtread/grant_key
   chmod 600 ~/.config/jobtread/grant_key
   \`\`\`
3. **保持有效：** JobTread 在 3 个月不活动后使密钥过期，请安排提醒（cron/心跳）在过期前轮换或重新使用 grant。
4. **可选 Webhook 密钥：** 若计划接收 Webhook，记录端点 URL 并将 Webhook ID 保存在同一文件夹以便后续禁用或检查。

## 认证
- 每次 POST 到 \`/pave\` 必须在 \`query.$.grantKey\` 下包含 grant key。示例载荷：
  \`\`\`json
  {
    "query": {
      "$": { "grantKey": "grant_xxx" },
      "currentGrant": { "id": {}, "user": { "name": {} } }
    }
  }
  \`\`\`
- 还可在 \`$\` 内设置 \`notify\`、\`timeZone\` 或 \`viaUserId\` 以抑制通知或限定结果范围。
- 对于签名查询（PDF 令牌、预签名数据），调用 \`pdfToken: { _: signQuery, $: { query: {...} } }\` 并将令牌附加到 \`https://api.jobtread.com/t/\`。

## API 基础与请求流程
- 所有请求发往 \`POST https://api.jobtread.com/pave\`，\`Content-Type: application/json\`。
- 结构：
  \`\`\`json
  {
    "query": {
      "$": { "grantKey": "grant_xxx" },
      "operation": {
        "$": { ...inputs... },
        "field": { ...fields... }
      }
    }
  }
  \`\`\`
- 请求的字段（\`id\`、\`name\` 等）决定 JobTread 返回内容。计划后续引用对象时始终包含 \`id\`。
- 响应中的 \`_type\` 告知该节点的 schema。

## 常见模式与示例

### 1. 发现组织 ID
\`\`\`yaml
currentGrant:
  user:
    memberships:
      nodes:
        organization:
          id: {}
          name: {}
\`\`\`
在后续查询中使用返回的 \`organization.id\`。

### 2. 创建客户/供应商
- **客户**
\`\`\`yaml
createAccount:
  $:
    name: "Test Customer"
    type: customer
    organizationId: "ORG_ID"
  createdAccount:
    id: {}
    name: {}
    type: {}
\`\`\`
- **供应商**（同上但 \`type: vendor\`）。

### 3. 读取或更新账户
- **按 ID 读取账户**：
\`\`\`yaml
account:
  $:
    id: "ACCOUNT_ID"
  id: {}
  name: {}
  isTaxable: {}
\`\`\`
- **更新**（可按需包含 \`customFieldValues\`）：
\`\`\`yaml
updateAccount:
  $:
    id: "ACCOUNT_ID"
    isTaxable: false
  account:
    id: {}
    isTaxable: {}
\`\`\`

### 4. 带分页、排序与筛选的账户列表查询
\`\`\`yaml
organization:
  $: {}
  id: {}
  accounts:
    $:
      size: 25
      page: 0
      where:
        - field: type
          operator: equals
          value: customer
    nodes:
      id: {}
      name: {}
      type: {}
    pageInfo:
      hasNextPage: {}
      totalCount: {}
\`\`\`

### 5. 创建与管理项目（Jobs）
\`\`\`yaml
createJob:
  $:
    name: "Kitchen Remodel"
    accountId: "ACCOUNT_ID"
    organizationId: "ORG_ID"
  createdJob:
    id: {}
    name: {}
    status: {}
\`\`\`

### 6. 任务与文档
- 使用 \`createTask\`、\`updateTask\`、\`createDocument\` 等操作
- 始终请求 \`id\` 字段以便后续引用

### 7. Webhook 订阅
订阅实时更新：
\`\`\`yaml
createWebhook:
  $:
    url: "https://your-endpoint.com/jobtread"
    events: ["job.created", "task.updated"]
    organizationId: "ORG_ID"
  createdWebhook:
    id: {}
    url: {}
\`\`\`

## 最佳实践

- 将 grant key 存储在 \`~/.config/jobtread/grant_key\` 并设置 \`chmod 600\`
- 每次查询仅请求需要的字段以减少载荷
- 对列表查询使用分页（\`size\`、\`page\`）
- 创建对象后保存返回的 \`id\` 供后续操作
- 定期使用 grant 以防止 3 个月不活动过期
- 对 PDF/预签名数据使用 \`pdfToken\` 签名查询

## 故障排除

| 问题 | 可能原因 | 修复 |
|-------|----------|-----|
| 401 Unauthorized | grant key 无效或过期 | 在 app.jobtread.com/grants 创建新 grant |
| 空响应 | 未请求字段 | 在 query 中添加所需字段如 \`id: {}\` |
| 组织未找到 | 未先查询 organization ID | 运行 currentGrant 查询 |
| Webhook 未触发 | URL 不可达或事件未订阅 | 验证端点并检查 events 列表 |

## 安全

- 切勿在日志或聊天中暴露 grant key
- 使用 HTTPS 端点接收 Webhook
- 定期轮换 grant key
- 限制自动化 grant 的权限范围

## API 端点

- 主 API：\`POST https://api.jobtread.com/pave\`
- 预签名令牌：\`https://api.jobtread.com/t/\`
- Grant 管理：https://app.jobtread.com/grants`,
};
