module.exports = {
  skillId: 'totalclaw:totalclaw~melichar-m-claude-code-control',
  descriptionZh:
    '在 macOS 上通过可见的 Terminal.app 窗口以编程方式控制 Claude Code。使用 AppleScript 启动会话、发送命令、截取终端窗口截图并记录完整会话日志。',
  bodyZh: `# Claude Code Control

在 macOS 上通过可见的 Terminal.app 窗口以编程方式控制 Claude Code。

## 工作原理

使用 AppleScript 实现：
1. 打开 Terminal.app，在项目目录中启动 \`claude code\`
2. 通过 System Events 模拟按键输入命令
3. 仅截取 Terminal 窗口截图（非全屏）
4. 记录带时间戳的完整会话

## 环境要求

- macOS
- Node.js 18+
- 已安装并完成认证的 Claude Code
- 为 Terminal.app 与 Script Editor 授予辅助功能权限（系统设置 → 隐私与安全性 → 辅助功能）

## 用法

\`\`\`javascript
const cc = require('./index');

// 可见方式启动 Claude Code
const session = await cc.launch('/path/to/project');

// 发送命令（输入后按 Enter）
const result = await cc.send(session, 'write tests for app.py', 30);
// result.screenshot → Terminal 窗口截图路径

// 保存会话录制
await cc.saveSession(session, './recording.json');

// 关闭
await cc.close(session);
\`\`\`

## API

| 函数 | 说明 |
|---|---|
| \`launch(path, opts?)\` | 打开 Terminal 并启动 Claude Code，返回会话 ID |
| \`send(id, command, waitSec?)\` | 输入命令、等待并截图，返回 \`{screenshot, duration_ms}\` |
| \`verifyScreen(id, desc)\` | 拍摄验证截图 |
| \`approveSecurity(id)\` | 处理「信任此文件夹」提示 |
| \`handleLogin(id)\` | 发送 \`/login\` 命令 |
| \`saveSession(id, path)\` | 将会话日志保存为 JSON |
| \`close(id)\` / \`closeAll()\` | 优雅退出 Claude Code |
| \`takeScreenshot(path?)\` | 截取 Terminal 窗口 |
| \`focusTerminal()\` | 将 Terminal 置于前台 |

## 专业版功能（即将推出）

- 🎬 会话视频录制
- 🤖 多智能体 / 多终端编排
- 📊 会话分析
- 🔄 会话回放
- 🌐 通过 SSH 远程控制`,
};
