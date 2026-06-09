module.exports = {
  skillId: 'totalclaw:totalclaw~aronchick-expanso-language-detect',
  descriptionZh:
    '使用 AI 检测文本语言，基于 Expanso Edge 流水线运行。',
  bodyZh: `---

## 中文说明

---

## 中文说明

# language-detect

使用 AI 检测文本的语言

## 要求

- 已安装 Expanso Edge（\`expanso-edge\` 二进制文件在 PATH 中）
- 通过以下命令安装：\`clawhub install expanso-edge\`

## 使用方法

### CLI 流水线
\`\`\`bash
# Run standalone
echo '<input>' | expanso-edge run pipeline-cli.yaml
\`\`\`

### MCP 流水线
\`\`\`bash
# Start as MCP server
expanso-edge run pipeline-mcp.yaml
\`\`\`

### 部署到 Expanso Cloud
\`\`\`bash
expanso-cli job deploy https://skills.expanso.io/language-detect/pipeline-cli.yaml
\`\`\`

## 文件

| 文件 | 用途 |
|------|---------|
| \`skill.yaml\` | 技能元数据（输入、输出、凭据） |
| \`pipeline-cli.yaml\` | 独立 CLI 流水线 |
| \`pipeline-mcp.yaml\` | MCP 服务器流水线 |`,
};
