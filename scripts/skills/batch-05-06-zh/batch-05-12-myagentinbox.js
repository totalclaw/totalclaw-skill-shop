module.exports = {
  skillId: 'totalclaw:totalclaw~prashantrohilla-max-disposable-email-for-agents',
  descriptionZh: '为 AI 智能体提供一次性邮箱收件箱，通过 MCP 工具创建、查收邮件并下载附件。',
  bodyZh: `# myagentinbox

为 AI 智能体提供一次性邮箱收件箱。创建临时邮箱地址、接收邮件、阅读消息并下载附件 — 全部通过 MCP 工具完成。收件箱在 24 小时后自动删除。

## MCP 配置

\`\`\`json
{
  "mcpServers": {
    "myagentinbox": {
      "command": "npx",
      "args": ["mcp-remote", "https://myagentinbox.com/mcp"]
    }
  }
}
\`\`\`

## 工具

### create_inbox

创建 24 小时后过期的一次性邮箱收件箱。返回生成的邮箱地址。

### check_inbox

检查收件箱中的消息。

- \`address\`（string）：收件箱邮箱地址

### read_message

阅读指定邮件的完整内容，包括发件人、主题、正文和附件信息。

- \`address\`（string）：收件箱邮箱地址
- \`message_id\`（string）：消息 ID

### download_attachment

下载邮件附件。图片以 base64 返回，文本文件内联返回，二进制文件以下载 URL 返回。

- \`address\`（string）：收件箱邮箱地址
- \`message_id\`（string）：消息 ID
- \`filename\`（string）：附件文件名

## REST API

也可直接使用 REST API：

- \`POST /api/inboxes\` — 创建收件箱
- \`GET /api/inboxes/:address/messages\` — 列出消息
- \`GET /api/inboxes/:address/messages/:id\` — 阅读消息
- \`GET /api/inboxes/:address/messages/:id/attachments/:filename\` — 下载附件

## 限制

- 收件箱创建：每分钟 10 个
- API 读取：每分钟 60 次
- 收件箱生命周期：24 小时
- 最大邮件大小：10 MB

## 使用示例

1. 使用 \`create_inbox\` 获取一次性 \`@myagentinbox.com\` 地址
2. 使用该地址注册服务或触发邮件发送
3. 使用 \`check_inbox\` 查看收到的消息
4. 使用 \`read_message\` 阅读完整邮件内容
5. 若邮件含附件，使用 \`download_attachment\`

无需账户、无需 API 密钥、无需额外设置。`,
};
