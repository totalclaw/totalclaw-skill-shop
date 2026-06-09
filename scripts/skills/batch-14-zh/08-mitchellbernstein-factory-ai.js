module.exports = {
  skillId: 'totalclaw:totalclaw~mitchellbernstein-factory-ai',
  descriptionZh:
    '使用 Factory AI 的 droid CLI 构建功能、调试、重构与部署代码，支持交互式与非交互式执行模式。',
  bodyZh: `# Factory AI Droid CLI

使用 \`droid\` 构建功能、调试、重构与部署代码。

## 安装

已安装于：\`/Users/mitchellbernstein/.local/bin/droid\`

## 认证

\`\`\`bash
droid login
# 或设置 FACTORY_API_KEY 环境变量
export FACTORY_API_KEY=your-api-key
\`\`\`

## 命令

### 交互模式
\`\`\`bash
droid                           # 启动新会话
droid "fix the login bug"       # 带提示启动
droid -r                        # 恢复上次会话
droid -r session-id             # 恢复指定会话
\`\`\`

### 非交互式（Exec 模式）
\`\`\`bash
droid exec "analyze this file"
droid exec "commit my changes with a good message"
droid exec "deploy to fly.io"
droid exec --help               # 显示 exec 选项
\`\`\`

### Exec 选项
\`\`\`bash
droid exec --force "fix lint errors"    # 无需确认自动应用
droid exec --json "analyze code"        # JSON 输出
droid exec --model claude "task"        # 指定模型
\`\`\`

### MCP 服务器
\`\`\`bash
droid mcp list                    # 列出已安装的 MCP 服务器
droid mcp add server-name         # 添加 MCP 服务器
droid mcp remove server-name      # 移除 MCP 服务器
\`\`\`

### 插件
\`\`\`bash
droid plugin list                 # 列出插件
droid plugin add name             # 添加插件
\`\`\`

## 使用模式

### 功能开发
\`\`\`bash
droid exec "add a user settings page with dark mode toggle"
\`\`\`

### 调试
\`\`\`bash
droid exec "fix this error: [paste error]"
\`\`\`

### 代码审查
\`\`\`bash
droid exec "review the PR for security issues"
\`\`\`

### Git 操作
\`\`\`bash
droid exec "create a PR for my changes"
droid exec "write a good commit message for the staged changes"
\`\`\`

### 部署
\`\`\`bash
droid exec "deploy to fly.io"
\`\`\`

### 多文件变更
\`\`\`bash
droid
# 然后在交互模式中：
@src/components/
@src/api/
Implement authentication flow
\`\`\`

## 说明

- Droid 对整个组织的代码库有深入理解
- 支持模型灵活性（OpenAI、Anthropic、xAI 等）
- MCP 服务器提供扩展能力
- 基于会话的记忆保持上下文连续性`,
};
