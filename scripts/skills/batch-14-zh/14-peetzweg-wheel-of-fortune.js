module.exports = {
  skillId: 'totalclaw:totalclaw~peetzweg-wheel-of-fortune',
  descriptionZh:
    '当用户在多个选项间难以抉择时，生成可打开交互式 3D 转盘的 URL，以随机方式做出选择。',
  bodyZh: `# Glucksrad — 决策转盘

当用户在多个选项间难以抉择、希望用有趣随机方式做决定时使用本技能。生成一个 URL，打开交互式 3D 旋转转盘。

## 何时使用

- 用户无法在几个选项间做出决定（例如「去哪吃饭？」「看哪部电影？」）
- 用户明确要求随机选择或转动转盘
- 有 2–20 个具体选项可供选择

当用户需要有理有据的推荐时**不要**使用本技能——仅在欢迎随机性时使用。

## URL 格式

\`\`\`
https://makedecisionforme.netlify.app/?items=Option1:Weight,Option2:Weight,Option3:Weight
\`\`\`

### 规则

- **基础 URL**：\`https://makedecisionforme.netlify.app/\`
- **查询参数**：\`items\` — 逗号分隔的条目列表
- **条目格式**：\`Name:Weight\`
  - \`Name\` — 选项标签。对特殊字符进行 URL 编码（空格 → \`%20\`，\`&\` → \`%26\` 等）
  - \`Weight\` — 可选整数（默认为 \`1\`）。权重越高，转盘上扇区越大。当用户表示偏好或选项概率不等时使用权重。
- 条目之间用逗号（\`,\`）分隔。条目之间不要添加空格。

### 示例

等概率：
\`\`\`
?items=Pizza,Sushi,Tacos,Burgers
\`\`\`

加权（Pizza 比 Sushi 出现概率高 3 倍）：
\`\`\`
?items=Pizza:3,Sushi:1,Tacos:2
\`\`\`

含空格的名称：
\`\`\`
?items=Thai%20Food,Fish%20and%20Chips,Mac%20%26%20Cheese
\`\`\`

## 如何回复

1. 从用户消息中收集选项。
2. 使用 \`items\` 查询参数构建 URL。
3. 将链接呈现给用户，以便点击并转动转盘。`,
};
