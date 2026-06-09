module.exports = {
  skillId: 'totalclaw:totalclaw~jarvis563-percept-listen',
  descriptionZh: '通过可穿戴设备为智能体提供环境音频采集与转写。',
  bodyZh: `# percept-listen

通过可穿戴设备为 OpenClaw 智能体提供环境音频采集与转写。

## 功能

将可穿戴麦克风（Omi 吊坠或 Apple Watch）连接到你的 OpenClaw 智能体。音频在本地转写，并以结构化对话数据流式传输 — 带说话人标签、时间戳，且可搜索。

## 何时使用

- 用户希望智能体听到环境对话
- 用户要求「开始监听」或「打开麦克风」
- 用户提到 Omi 吊坠、可穿戴设备或环境音频

## 要求

- **Percept 服务器**在本地运行（\`pip install getpercept && percept start\`）
- **Omi 吊坠**通过手机配对，或安装 Percept 应用的 Apple Watch
- **Webhook** 已配置：Omi 应用 → Settings → Webhooks → \`https://<your-tunnel>/webhook/transcript\`

## 设置

\`\`\`bash
# 安装 Percept
pip install getpercept

# 启动接收器（默认端口 8900）
percept start

# 或直接运行
PYTHONPATH=. python -m uvicorn src.receiver:app --host 0.0.0.0 --port 8900
\`\`\`

配置隧道（Cloudflare、ngrok、Tailscale），使 Omi 能访问你的本地服务器。

## 工作原理

1. Omi 吊坠采集音频 → 手机进行语音转文字 → 通过 webhook 发送转写片段
2. Percept 接收器将片段处理为对话
3. 对话存储在本地 SQLite 中，支持 FTS5 全文搜索
4. 所有处理均在本地完成 — 音频不会离开你的机器

## 数据位置

- **SQLite 数据库：** \`percept/data/percept.db\`
- **实时转写：** \`/tmp/percept-live.txt\`
- **对话：** \`percept/data/conversations/\`

## 配置

唤醒词、说话人名称及所有设置通过 Percept 仪表盘（端口 8960）管理，或直接在 SQLite 数据库中修改。

## 链接

- **GitHub：** https://github.com/GetPercept/percept
- **文档：** https://github.com/GetPercept/percept/docs`,
};
