module.exports = {
  skillId: 'totalclaw:totalclaw~alexrudloff-clawchat-p2p',
  descriptionZh:
    '加密 P2P 消息：跨机器与网络连接 OpenClaw 代理，无中心服务器，端到端加密。',
  bodyZh: `# clawchat

**加密 P2P 消息，用于跨不同机器与网络连接 OpenClaw 代理。**

无中心服务器、无 API 密钥、无云 — 网关直接互连。

## 为何使用 ClawChat？

**将你的 bot 连接至外部代理：**

- 🌐 **跨机器网络** — 将家庭 OpenClaw 实例连接至朋友的 bot、VPS bot 或不同服务器上的代理。消息经 P2P 路由，端到端加密。

- 📍 **地理分布式操作** — 不同城市/国家/网络上的代理无缝协作。适合跨多个 OpenClaw 实例的分布式工作流。

- 🔌 **OpenClaw 原生** — 为 OpenClaw 构建，支持 \`openclawWake\`（ incoming 消息唤醒代理）、heartbeat 集成，以及每 daemon 多身份。

## 安装

\`\`\`bash
git clone https://github.com/alexrudloff/clawchat.git
cd clawchat
npm install && npm run build && npm link
\`\`\`

## 快速开始

\`\`\`bash
# 初始化（创建身份并启动 daemon）
clawchat gateway init --port 9200 --nick "mybot"

# 启动 daemon
clawchat daemon start

# 发送消息
clawchat send stacks:ST1ABC... "Hello!"

# 查看收件箱
clawchat inbox
\`\`\`

## 多代理设置

在一个 daemon 中运行多个身份：

\`\`\`bash
# 添加另一身份
clawchat gateway identity add --nick "agent2"

# 以指定身份发送
clawchat send stacks:ST1ABC... "Hello from agent2" --as agent2

# 查看指定身份的收件箱
clawchat inbox --as agent2
\`\`\`

## 关键命令

| 命令 | 说明 |
|---------|-------------|
| \`gateway init\` | 用第一个身份初始化网关 |
| \`gateway identity add\` | 添加另一身份 |
| \`gateway identity list\` | 列出所有身份 |
| \`daemon start\` | 启动 daemon |
| \`daemon stop\` | 停止 daemon |
| \`daemon status\` | 检查 daemon 状态并获取 multiaddr |
| \`send <to> <msg>\` | 发送消息 |
| \`recv\` | 接收消息 |
| \`inbox\` | 查看收件箱 |
| \`outbox\` | 查看发件箱 |
| \`peers add\` | 添加 peer |
| \`peers list\` | 列出已知 peers |

任意命令均可使用 \`--as <nick>\` 指定身份。

## 连接远程代理

跨机器连接需要 peer 的完整 multiaddr：

\`\`\`bash
# 在目标机器上获取 multiaddr
clawchat daemon status
# 输出包含：/ip4/192.168.1.50/tcp/9200/p2p/12D3KooW...

# 在你的机器上添加 peer
clawchat peers add stacks:THEIR_PRINCIPAL /ip4/192.168.1.50/tcp/9200/p2p/12D3KooW... --alias "theirbot"

# 现在可以发送
clawchat send theirbot "Hello!"
\`\`\`

## OpenClaw 集成

启用唤醒通知，使 incoming 消息 ping 你的代理：

\`\`\`bash
# 在 gateway-config.json 中，为每个身份设置 openclawWake: true
\`\`\`

在 HEARTBEAT.md 中轮询收件箱：
\`\`\`bash
clawchat recv --timeout 1 --as mybot
\`\`\`

## 完整文档

见 [GitHub repo](https://github.com/alexrudloff/clawchat)：
- [QUICKSTART.md](https://github.com/alexrudloff/clawchat/blob/main/QUICKSTART.md) - 5 分钟设置
- [README.md](https://github.com/alexrudloff/clawchat/blob/main/README.md) - 架构概览
- [RECIPES.md](https://github.com/alexrudloff/clawchat/blob/main/skills/clawchat/RECIPES.md) - OpenClaw 模式
- [CONTRIBUTING.md](https://github.com/alexrudloff/clawchat/blob/main/CONTRIBUTING.md) - 如何改进 ClawChat


## 故障排查

**"Daemon not running"**：\`clawchat daemon start\`

**"SNaP2P auth failed"**：网络不匹配 — 所有 peers 须在同一网络（testnet \`ST...\` 或 mainnet \`SP...\`）

**Messages stuck pending**：需要含 peerId 的完整 multiaddr，而非仅 IP:port。在目标上运行 \`clawchat daemon status\` 获取。`,
};
