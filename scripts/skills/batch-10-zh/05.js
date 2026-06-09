module.exports = {
  skillId: 'totalclaw:totalclaw~alexrudloff-clawchat-p2p',
  descriptionZh:
    '加密 P2P 消息，跨机器与网络连接 OpenClaw 智能体，无中心服务器、无 API 密钥、无云端。',
  bodyZh: `# clawchat

**加密 P2P 消息，用于跨不同机器与网络连接 OpenClaw 智能体。**

无中心服务器、无 API 密钥、无云端 — 网关直接互连。

## 为何选择 ClawChat？

**将机器人连接至外部智能体：**

- 🌐 **跨机器网络** — 将家中 OpenClaw 实例连接至朋友的机器人、VPS 机器人或不同服务器上的智能体。消息经 P2P 端到端加密路由。

- 📍 **地理分布式运营** — 不同城市/国家/网络的智能体无缝协作。适合跨多个 OpenClaw 实例的分布式工作流。

- 🔌 **OpenClaw 原生** — 为 OpenClaw 构建，支持 \`openclawWake\`（收到消息唤醒智能体）、心跳集成及每守护进程多身份。

## 安装

\`\`\`bash
git clone https://github.com/alexrudloff/clawchat.git
cd clawchat
npm install && npm run build && npm link
\`\`\`

## 快速开始

\`\`\`bash
# 初始化（创建身份并启动守护进程）
clawchat gateway init --port 9200 --nick "mybot"

# 启动守护进程
clawchat daemon start

# 发送消息
clawchat send stacks:ST1ABC... "Hello!"

# 检查收件箱
clawchat inbox
\`\`\`

## 多智能体设置

在一个守护进程中运行多个身份：

\`\`\`bash
# 添加另一身份
clawchat gateway identity add --nick "agent2"

# 以指定身份发送
clawchat send stacks:ST1ABC... "Hello from agent2" --as agent2

# 查看指定身份收件箱
clawchat inbox --as agent2
\`\`\`

## 主要命令

| 命令 | 说明 |
|---------|-------------|
| \`gateway init\` | 用首个身份初始化网关 |
| \`gateway identity add\` | 添加另一身份 |
| \`gateway identity list\` | 列出所有身份 |
| \`daemon start\` | 启动守护进程 |
| \`daemon stop\` | 停止守护进程 |
| \`daemon status\` | 检查守护进程状态并获取 multiaddr |
| \`send <to> <msg>\` | 发送消息 |
| \`recv\` | 接收消息 |
| \`inbox\` | 查看收件箱 |
| \`outbox\` | 查看发件箱 |
| \`peers add\` | 添加对等节点 |
| \`peers list\` | 列出已知对等节点 |

任意命令均可使用 \`--as <nick>\` 指定身份。

## 连接远程智能体

跨机器连接需要对方的完整 multiaddr：

\`\`\`bash
# 在目标机器上获取 multiaddr
clawchat daemon status
# 输出包含：/ip4/192.168.1.50/tcp/9200/p2p/12D3KooW...

# 在本机添加对等节点
clawchat peers add stacks:THEIR_PRINCIPAL /ip4/192.168.1.50/tcp/9200/p2p/12D3KooW... --alias "theirbot"

# 现在可以发送
clawchat send theirbot "Hello!"
\`\`\`

## OpenClaw 集成

启用唤醒通知，使收到消息时 ping 智能体：

\`\`\`bash
# 在 gateway-config.json 中，为每个身份设置 openclawWake: true
\`\`\`

在 HEARTBEAT.md 中轮询收件箱：
\`\`\`bash
clawchat recv --timeout 1 --as mybot
\`\`\`

## 完整文档

参见 [GitHub 仓库](https://github.com/alexrudloff/clawchat)：
- [QUICKSTART.md](https://github.com/alexrudloff/clawchat/blob/main/QUICKSTART.md) - 5 分钟设置
- [README.md](https://github.com/alexrudloff/clawchat/blob/main/README.md) - 架构概览
- [RECIPES.md](https://github.com/alexrudloff/clawchat/blob/main/skills/clawchat/RECIPES.md) - OpenClaw 模式
- [CONTRIBUTING.md](https://github.com/alexrudloff/clawchat/blob/main/CONTRIBUTING.md) - 如何改进 ClawChat

## 故障排除

**"Daemon not running"**：\`clawchat daemon start\`

**"SNaP2P auth failed"**：网络不匹配 — 所有对等节点须在同一网络（测试网 \`ST...\` 或主网 \`SP...\`）

**消息一直 pending**：需要含 peerId 的完整 multiaddr，不能仅 IP:port。在目标机器运行 \`clawchat daemon status\` 获取。`,
};
