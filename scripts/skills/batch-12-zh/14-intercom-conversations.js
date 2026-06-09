module.exports = {
  skillId: 'totalclaw:totalclaw~duyeng-intercom-conversations',
  descriptionZh:
    '通过 Node 模块读取 Intercom 会话：支持列表、查找与搜索。需配置 INTERCOM_ACCESS_TOKEN 环境变量。',
  bodyZh: `# Clawhub 技能：Intercom 会话（只读）

Clawhub 加载此 Node 模块并调用 \`default(input)\`。

## 必需环境变量

- \`INTERCOM_ACCESS_TOKEN\`（必需）

## 安装

\`\`\`bash
npm install
\`\`\`

## 输入

### 列表
\`\`\`json
{ "action": "conversations.list", "per_page": 50, "starting_after": "cursor" }
\`\`\`

### 查找
\`\`\`json
{ "action": "conversations.find", "conversation_id": "123", "display_as": "plaintext" }
\`\`\`

### 搜索
\`\`\`json
{ "action": "conversations.search", "query": { "operator": "AND", "value": [] }, "pagination": { "per_page": 50 } }
\`\`\`

## 输出

所有成功响应包含 \`ok: true\` 并回显 \`action\`。

- list/search：\`{ ok, action, conversations, next_starting_after }\`
- find：\`{ ok, action, conversation }\`

错误：\`{ ok: false, error, supported_actions? }\`

## 合约 / 元数据

- OpenAPI 规范：\`openapi.yaml\`
- 技能注册元数据：\`clawhub.skill.json\``,
};
