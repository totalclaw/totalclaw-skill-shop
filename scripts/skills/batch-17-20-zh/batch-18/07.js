module.exports = {
  skillId: 'totalclaw:totalclaw~drgeld-echodecks',
  descriptionZh:
    '与 EchoDecks 集成，用于抽认卡管理、间隔重复学习会话与 AI 生成卡片/播客。',
  bodyZh: `
# EchoDecks 技能 (v1)

与 EchoDecks 集成，用于抽认卡管理、学习会话和 AI 生成。

## 配置
此技能需要设置 \`ECHODECKS_API_KEY\` 环境变量。

## 工具

### \`echodecks_get_decks\`
列出所有可用卡组，或某个特定卡组的详情。
- \`id\`（可选）：要检索的特定卡组的 ID。

### \`echodecks_get_due_cards\`
检索当前到期需要复习的卡片。
- \`deck_id\`（可选）：按特定卡组 ID 过滤到期卡片。

### \`echodecks_submit_review\`
为某张卡片提交一次间隔重复复习。
- \`card_id\`（必填）：被复习卡片的 ID。
- \`quality\`（必填）：整数评分（0-3）。
  - 0: Again（失败/遗忘）
  - 1: Hard（困难）
  - 2: Good（良好）
  - 3: Easy（容易）

### \`echodecks_generate_cards\`
使用 AI 从主题或文本内容生成新的抽认卡。
- \`deck_id\`（必填）：新卡片的目标卡组 ID。
- \`topic\`（可选）：用于生成的简短主题字符串。
- \`text\`（可选）：用于生成的原始文本内容。
**注意：** 必须提供 \`topic\` 或 \`text\` 之一。费用：10 积分。

### \`echodecks_generate_podcast\`
从某个卡组生成音频播客摘要或对话。
- \`deck_id\`（必填）：来源卡组 ID。
- \`voice\`（可选）：声音偏好（默认："neutral"）。
- \`type\`（可选）："summary" 或 "conversation"（默认："summary"）。
**注意：** 费用：50 积分。

### \`echodecks_get_podcasts\`
检索某个卡组的现有播客。
- \`deck_id\`（可选）：按卡组 ID 过滤。
- \`id\`（可选）：特定播客 ID。

### \`echodecks_get_user_stats\`
获取当前用户资料和学习统计数据。

## 实现细节

所有工具都是对 \`skills/echodecks-v1/echodecks_client.py\` 的封装。

\`\`\`bash
# Example
./skills/echodecks-v1/echodecks_client.py get-due --deck-id 123
\`\`\``,
};
