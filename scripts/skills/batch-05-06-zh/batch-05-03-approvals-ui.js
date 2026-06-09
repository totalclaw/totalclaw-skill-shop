module.exports = {
  skillId: 'totalclaw:totalclaw~fizzy2390-approvals-ui',
  descriptionZh: 'Web 仪表盘，用于管理设备配对、频道审批与浏览器内实时终端。',
  bodyZh: `# Approvals UI

用于管理 OpenClaw 设备配对、频道审批及实时终端的 Web 仪表盘 — 全部在浏览器中完成。

## 安装

将此文件夹放置于：

\`\`\`
~/.openclaw/workspace/projects/p1
\`\`\`

文件结构应如下：

\`\`\`
~/.openclaw/workspace/projects/p1/
├── SKILL.md
├── server.py
└── templates/
    ├── channel_approvals.html
    ├── dashboard.html
    ├── device_pairings.html
    ├── index.html
    ├── login.html
    └── terminal.html
\`\`\`

## 要求

安装 Python 依赖：

\`\`\`bash
pip install flask flask-socketio
\`\`\`

## ⚠️ 重要 — 运行前请修改

本技能附带**占位凭据**，使用前**必须**修改：

打开 \`server.py\`，更新文件顶部附近的以下值：

| 项目 | 变量 | 默认值 | 操作 |
|---|---|---|---|
| 仪表盘登录用户名 | \`ADMIN_USERNAME\` | \`Drinnas\` | 改为你自己的用户名 |
| 仪表盘登录密码 | \`ADMIN_PASSWORD\` | \`admin\` | 改为强密码 |
| API 认证密码 | \`AUTH_PASSWORD\` / 环境变量 \`SERVER_AUTH_PASSWORD\` | \`Bb7766!server\` | 改为强密码或设置环境变量 |
| Flask 密钥 | 环境变量 \`FLASK_SECRET_KEY\` | 开发占位符 | 在环境中设为随机字符串 |

**示例：**

\`\`\`bash
export FLASK_SECRET_KEY="$(python3 -c 'import secrets; print(secrets.token_hex(32))')"
export SERVER_AUTH_PASSWORD="your-strong-api-password-here"
\`\`\`

> **请勿使用默认值运行。** 知道默认值的人可登录并访问你的终端与网关令牌。

### 凭据说明

存在**两层独立认证**：

1. **仪表盘登录**（\`ADMIN_USERNAME\` / \`ADMIN_PASSWORD\`）— 保护 Web UI 页面（仪表盘、设备配对、频道审批、终端）。
2. **API 密码**（\`AUTH_PASSWORD\` / 环境变量 \`SERVER_AUTH_PASSWORD\`）— 保护后端 API 端点（\`/pair\`、\`/sync\`、\`/approve\`），供程序化访问。这些端点不在 Web UI 中暴露，但用于自动化/脚本。

两者均应设为强且唯一的值。

## 用法

启动服务器：

\`\`\`bash
cd ~/.openclaw/workspace/projects/p1
python3 server.py
\`\`\`

然后在浏览器打开 **http://127.0.0.1:9100**。

## 功能

- **仪表盘** — 带快速导航的落地页
- **设备配对** — 查看待处理与已配对浏览器/设备连接，批准或拒绝配对请求，复制网关令牌到剪贴板
- **频道审批** — 审核并批准待处理频道配对请求（Telegram、Discord、WhatsApp 等），通过 Socket.IO 实时更新
- **终端** — 使用 xterm.js 在浏览器中的完整交互式终端会话

## 工作原理

- 直接从 \`~/.openclaw/devices/pending.json\` 和 \`~/.openclaw/devices/paired.json\` 读取设备配对
- 从 \`~/.openclaw/credentials/*-pairing.json\` 读取频道配对请求
- 从 \`~/.openclaw/openclaw.json\` → \`gateway.auth.token\` 读取网关令牌
- 批准/拒绝操作使用 \`openclaw devices approve\` 和 \`openclaw devices reject\` CLI 命令
- 无需外部数据库 — 全部从 OpenClaw 自身状态文件读取

## 安全说明

- **仅本地** — 服务器默认绑定 \`127.0.0.1\`。除非置于带 TLS 和强认证的反代之后，否则不要改为 \`0.0.0.0\`
- **终端访问** — 终端功能授予对你机器的完整 shell 访问。若不需要，可移除 \`/terminal\` 路由和 \`terminal.html\` 模板
- **敏感文件** — 应用会读取 \`openclaw.json\`（网关令牌）、设备配对文件和凭据配对文件。能访问 Web UI 的人都能看到这些数据
- **API 端点** — \`POST /pair\`、\`POST /sync\`、\`POST /approve\` 接受带密码字段的 JSON。由 \`AUTH_PASSWORD\` 保护，用于脚本/自动化，而非 Web UI

## 配置

| 设置 | 位置 | 默认值 |
|---|---|---|
| 服务器端口 | \`server.py\` 底部 | \`9100\` |
| 仪表盘登录 | \`server.py\` \`ADMIN_USERNAME\` / \`ADMIN_PASSWORD\` | \`Drinnas\` / \`admin\` |
| API 密码 | \`server.py\` \`AUTH_PASSWORD\` / 环境变量 \`SERVER_AUTH_PASSWORD\` | \`Bb7766!server\` |
| Flask 密钥 | 环境变量 \`FLASK_SECRET_KEY\` | 开发占位符 |
| OpenClaw 状态目录 | 环境变量 \`OPENCLAW_STATE_DIR\` | \`~/.openclaw\` |

## 标签

\`ui\` \`dashboard\` \`pairings\` \`approvals\` \`terminal\` \`web\``,
};
