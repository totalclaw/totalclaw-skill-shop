module.exports = {
  skillId: 'totalclaw:totalclaw~newcastlegeek-hytale',
  descriptionZh:
    '使用官方下载器和 screen 管理本地 Hytale 专用服务器，支持启动、停止、更新与状态检查。',
  bodyZh: `# Hytale 服务器技能

使用官方下载器和 screen 管理本地 Hytale 专用服务器。

## 要求

- Java 21+（已安装）
- Screen（已安装）
- Hytale Downloader（需用户提供）
- 凭证（用户需在 \`~/hytale_server\` 中提供 \`hytale-downloader-credentials.json\`）

## 设置

1. **下载 Hytale Downloader：**
   - 从 \`https://downloader.hytale.com/hytale-downloader.zip\` 获取 zip
   - 解压并将 \`hytale-downloader-linux-amd64\` 放入 \`~/hytale_server/\`。
   - 赋予执行权限：\`chmod +x ~/hytale_server/hytale-downloader-linux-amd64\`

2. **添加凭证：**
   - 将 \`hytale-downloader-credentials.json\` 放入 \`~/hytale_server/\`。

## 命令

### \`hytale start\`

在 detached screen 会话中启动服务器。
- **运行：** \`/home/clawd/.npm-global/lib/node_modules/clawdbot/skills/hytale/hytale.sh start\`

### \`hytale stop\`

优雅停止服务器。
- **运行：** \`/home/clawd/.npm-global/lib/node_modules/clawdbot/skills/hytale/hytale.sh stop\`

### \`hytale update\`

使用 Hytale Downloader 下载或更新服务器文件。
- **运行：** \`/home/clawd/.npm-global/lib/node_modules/clawdbot/skills/hytale/hytale.sh update\`

### \`hytale status\`

检查服务器进程是否在运行。
- **运行：** \`/home/clawd/.npm-global/lib/node_modules/clawdbot/skills/hytale/hytale.sh status\``,
};
