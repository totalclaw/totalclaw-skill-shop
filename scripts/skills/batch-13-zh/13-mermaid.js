module.exports = {
  skillId: 'totalclaw:totalclaw~jarekbird-mermaid',
  descriptionZh:
    '使用 Mermaid 从文本生成图表。将 .mmd 语法渲染为 PNG/SVG，支持流程图、时序图、类图、甘特图等多种类型。',
  bodyZh: `# Mermaid 图表技能

使用 [Mermaid](https://mermaid.js.org/) 从文本生成图表。

## 要求

- \`@mermaid-js/mermaid-cli\`（\`npm install -g @mermaid-js/mermaid-cli\`）

## 用法

1. 将 Mermaid 语法写入 \`.mmd\` 文件
2. 运行 \`mmdc\` 渲染 PNG/SVG
3. 将图片返回给用户

### 基础命令

\`\`\`bash
mmdc -i input.mmd -o output.png -t dark -b transparent
\`\`\`

### 选项

| 标志 | 说明 |
|---|---|
| \`-i\` | 输入 \`.mmd\` 文件 |
| \`-o\` | 输出文件（\`.png\`、\`.svg\`、\`.pdf\`） |
| \`-t\` | 主题：\`default\`、\`dark\`、\`forest\`、\`neutral\` |
| \`-b\` | 背景色（\`transparent\`、十六进制） |
| \`-w\` | 宽度（像素，默认 800） |
| \`-H\` | 高度（像素） |
| \`-s\` | 缩放因子（默认 1，高分辨率用 2-3） |
| \`-c\` | 高级主题配置 JSON 文件 |

### 支持的图表类型

- **流程图**：\`graph TD\` / \`graph LR\`
- **时序图**：\`sequenceDiagram\`
- **类图**：\`classDiagram\`
- **状态图**：\`stateDiagram-v2\`
- **ER 图**：\`erDiagram\`
- **甘特图**：\`gantt\`
- **饼图**：\`pie\`
- **思维导图**：\`mindmap\`
- **时间线**：\`timeline\`
- **Git 图**：\`gitGraph\`
- **象限图**：\`quadrantChart\`
- **块图**：\`block-beta\`

### 工作流

1. 根据用户需求选择最佳图表类型
2. 将 \`.mmd\` 文件写入 \`/tmp/mermaid-<name>.mmd\`
3. 渲染：\`mmdc -i /tmp/mermaid-<name>.mmd -o /tmp/mermaid-<name>.png -t dark -b transparent -s 2\`
4. 通过 \`Read\` 工具向用户展示图片
5. 若不需要则清理临时文件

### 示例：架构图

\`\`\`mermaid
graph TD
    A[Client] -->|HTTPS| B[API Gateway]
    B --> C[Auth Service]
    B --> D[App Server]
    D --> E[(PostgreSQL)]
    D --> F[(Redis Cache)]
\`\`\`

### 示例：时序图

\`\`\`mermaid
sequenceDiagram
    participant U as User
    participant A as API
    participant DB as Database
    U->>A: POST /login
    A->>DB: Validate credentials
    DB-->>A: User record
    A-->>U: JWT token
\`\`\`

### 技巧

- 横向流程用 \`graph LR\`，纵向用 \`graph TD\`
- 节点标签保持简短——细节放在 tooltip 或注释中
- 用 subgraph 分组相关组件
- 深色背景用 \`-t dark -b transparent\`
- 视网膜屏用 \`-s 2\` 或 \`-s 3\` 获得清晰图像
- **调用 \`mmdc\` 时始终使用 \`pty: false\`**

### 主题

自定义颜色时创建配置 JSON：

\`\`\`json
{
  "theme": "base",
  "themeVariables": {
    "primaryColor": "#f59e0b",
    "primaryTextColor": "#1a1a1a",
    "primaryBorderColor": "#d97706",
    "lineColor": "#6b7280",
    "secondaryColor": "#10b981",
    "tertiaryColor": "#3b82f6"
  }
}
\`\`\`

然后：\`mmdc -i input.mmd -o output.png -c config.json\``,
};
