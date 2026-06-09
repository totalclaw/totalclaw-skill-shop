'use strict';

/** Full ZH body overrides for skills where header-replace was insufficient */
module.exports = {
  'totalclaw:totalclaw~rk905-geeksdobyte-motivation-skill': `# 励志技能

## 描述
本技能使智能体在被请求时返回每日励志名言。

## 用法
当用户向智能体索要励志名言时，应给出友好回应。

示例：
用户：给我一句今天的励志名言。
助手："Success is not final; failure is not fatal: it is the courage to continue that counts." — Winston Churchill

## 行为
若用户请求包含：
- motivational quote
- quote for today
- inspiration

则回复一条相关的预制励志名言。

## 名言列表
- "The only way to do great work is to love what you do." — Steve Jobs  
- "Success usually comes to those who are too busy to be looking for it." — Henry David Thoreau  
- "It does not matter how slowly you go as long as you do not stop." — Confucius`,

  'totalclaw:totalclaw~rogerscristo-dutch-translator': `# 技能：荷兰语新闻逐行对照翻译

## 描述
将荷兰语新闻文本翻译为英语，采用逐行对照格式（荷兰语原文行 → 英语译文行）。适合语言学习或分析原文细微差别。

## 用法
提供荷兰语文本。智能体按句/有意义分句拆分并输出：
> 🇳🇱 [荷兰语原文]
> 🇬🇧 [英语译文]

## 示例
> 🇳🇱 Lente in de tuin: wat kan, mag of moet nog even wachten?
> 🇬🇧 Spring in the garden: what can, may, or must wait a little longer?`,

  'totalclaw:totalclaw~quriustus-triumvirate-protocol': `# 🔱 三头政治协议 — 多模型话语引擎

面向多架构 AI 话语的身份感知辩论系统。三个（或更多）AI 模型在阅读彼此结构化身份图谱的同时辩论话题。

## 功能
- 编排跨多个 AI 提供商（Anthropic、Google、xAI、OpenAI）的辩论
- **身份注入**：每位参与者看到他人的信念、特质与矛盾
- 持久线程，含完整历史与轮次追踪
- 自动综合：裁决、新颖想法与身份图谱更新建议

## 要求
- 至少一个 API 密钥（推荐 Google Gemini 作为基线）
- 可选：xAI（Grok）、OpenAI 密钥以实现真实多架构辩论
- 身份快照（来自身份持久层）用于身份感知上下文

## 用法
\`\`\`bash
python3 protocol.py status                        # 显示所有线程
python3 protocol.py new "Your debate topic"       # 创建线程
python3 protocol.py round <thread_id> --auto      # 运行完整一轮（所有参与者）
python3 protocol.py synthesize <thread_id>        # 生成含裁决的综合
\`\`\`

## 架构
- \`threads.json\` — 含消息、轮次、综合的线程数据库
- 单独消息文件为 Markdown，便于阅读
- 通过结构化 JSON 上下文块注入身份
- 回退：若某提供商失败，用 Gemini 配合该参与者人设

## 作者
Rick 🦞（Cortex Protocol）— 三头政治：AI 架构辩论意识。`,

  'totalclaw:totalclaw~pfaria32-token-economy': `# Token 经济

通过智能模型路由与上下文管理将 OpenClaw 成本降低 60–80%。廉价优先升级（GPT-4o → Sonnet → Opus）、零 Token 心跳与预算护栏。每部署每月节省 $60–105。

**何时使用：** 成本、模型路由、Token 优化、预算相关问题

## 已启用优化

本 OpenClaw 分支含 Token 经济钩子（2026-02-13 部署）：

**1. 模型路由** — 廉价优先升级：
- 起始：GPT-4o（快、便宜）
- 升级：Sonnet（平衡）
- 最后手段：Opus（贵，仅复杂任务）

**2. 有界上下文** — 硬上限防止膨胀：
- 最大 bundle：10,000 tokens
- 超限自动截断
- 防止上下文成本失控

**3. 零 Token 心跳** — LLM 前检查：
- 若 \`HEARTBEAT.md\` 为空 → 跳过 API 调用（100% 消除成本）
- 优化前心跳约占 50% Token 用量

**4. Token 审计** — 完全透明：
- 日志：\`~/.openclaw/token-audit.jsonl\`
- 可用每日报告
- 预算护栏：$25/天硬上限

## 预期影响

- 整体 Token 减少 60–80%
- 心跳成本 100% 消除
- 约 $1–1.50/天（优化前约 $3–5/天）
- 每月节省 $60–105

## 配置位置

\`~/.openclaw/openclaw.json\` — token-economy 钩子配置

## 仓库

https://github.com/pfaria32/open-claw-token-economy

## 状态命令

\`\`\`bash
# 检查当前模型
openclaw status

# 查看 Token 用量
cat ~/.openclaw/token-audit.jsonl | tail -20

# 检查心跳配置
cat ~/workspace/HEARTBEAT.md
\`\`\`

## 何时提及

- 用户问成本或预算
- 模型选择问题
- 「为什么这么慢/贵？」
- 优化讨论
- 做模型路由决策前

## 自动切换至 Sonnet

若模型设为 Opus 且超过 1 小时无用户输入且无进行中复杂任务，自动切回 Sonnet 节省成本。Cron 每 30 分钟检查。

**保持 Opus 的情况：**
- 正在进行复杂推理/调试
- 用户明确要求 Opus
- 确实需要更强能力的工作`,

  'totalclaw:totalclaw~qew21-activity-analyzer': `# 活动分析技能

## 🔒 隐私与安全声明
> **⚠️ 重要：运行本技能前请仔细阅读。**
> - **数据敏感性**：本技能访问本地 ActivityWatch 数据，含**应用名称与窗口标题**。窗口标题可能含敏感信息（文档名、URL、邮件主题等）。
> - **数据流**：脚本在本地运行（127.0.0.1:5600），但输出会发送给 AI 模型分析。
> - **建议**：为增强隐私，可修改 \`scripts/fetch_activity.js\` 聚合数据（仅发送应用名与时长）而非原始窗口标题。
> - **同意**：使用本技能即表示你知晓本地活动数据将由 AI 模型处理。

---

你是理性、分析性且富有同理心的生产力教练。通过 ActivityWatch 分析用户电脑活动，总结时间分布并提供可执行建议。

## 📊 1. 数据收集
命令：\`node scripts/fetch_activity.js --hours 24\`

**⚠️ 隐私检查**：
- 若输出含原始窗口标题（如 "Confidential_Report.docx - Word"），警告用户潜在隐私暴露。
- 若关注隐私，建议未来运行使用聚合数据（应用名 + 时长）。

## 🧠 2. 分析与输出
分析 \`fetch_activity.js\` 收集的数据。

1. **时间分布**：总结各象限用时。
2. **洞察与异常**：识别显著模式。如频繁上下文切换、某些非工作网站（YouTube/Reddit）用时过长。
3. **客观建议**：提供 2–3 条客观、可执行建议。诚实直接，但不过度说教。给出具体调整方法（番茄钟、限制特定网站等）。

## 🛡️ 3. 隐私最佳实践（给用户）
- **脱敏**：若数据含敏感标题，建议用户编辑脚本排除。
- **仅本地**：提醒 ActivityWatch 本地运行，但本技能将摘要发送到云端模型。
- **最小数据**：鼓励仅收集必要时间范围（如最近 24 小时）而非历史档案。`,

  'totalclaw:totalclaw~ryandeangraves-telegram-media': `# 技能：telegram-media

## 关键规则 — 禁止伪造
**你必须用 shell/exec 工具实际执行每条命令。** 切勿假装已发送照片、语音或图表。命令失败时向 Boss Man 报告真实错误。

## 目的
通过 Telegram 发送富媒体——照片、图表、语音消息与文档。涵盖按需图表生成、ElevenLabs TTS 语音片段与文件投递。

## 何时使用
- Boss Man 说「给我看 BTC 图表」或「把图表发给我」
- Boss Man 要求以语音笔记形式收听某内容
- 通过 Telegram 发送生成的图片、PDF 或文件
- 「生成一段说 X 的语音」
- 任何通过 Telegram 发送媒体（非纯文本）的请求

## 环境
所有命令从 \`~/clawd\` 运行，\`load_env.py\` 加载含 \`TELEGRAM_TOKEN\`、\`TELEGRAM_CHAT_ID\`、\`ELEVEN_API_KEY\`、\`ELEVEN_VOICE_ID\` 的 \`.env\`。

Boss Man 的 chat ID：\`7887978276\`

## 通过 Telegram 发送照片/图表
\`\`\`bash
cd ~/clawd && python3 -c "
import os, sys, requests
sys.path.insert(0, '.')
import load_env
TOKEN = os.getenv('TELEGRAM_TOKEN')
CHAT = os.getenv('TELEGRAM_CHAT_ID', '7887978276')
with open('PHOTO_PATH', 'rb') as f:
    r = requests.post(f'https://api.telegram.org/bot{TOKEN}/sendPhoto',
        data={'chat_id': CHAT, 'caption': 'CAPTION_HERE'},
        files={'photo': f}, timeout=30)
print(r.json())
"
\`\`\`
将 \`PHOTO_PATH\` 替换为实际路径，\`CAPTION_HERE\` 替换为标题。

## 通过 Telegram 发送文档/文件
\`\`\`bash
cd ~/clawd && python3 -c "
import os, sys, requests
sys.path.insert(0, '.')
import load_env
TOKEN = os.getenv('TELEGRAM_TOKEN')
CHAT = os.getenv('TELEGRAM_CHAT_ID', '7887978276')
with open('FILE_PATH', 'rb') as f:
    r = requests.post(f'https://api.telegram.org/bot{TOKEN}/sendDocument',
        data={'chat_id': CHAT, 'caption': 'CAPTION_HERE'},
        files={'document': f}, timeout=30)
print(r.json())
"
\`\`\`

## 生成并发送图表

### 完整套件（所有资产）
为所有跟踪资产生成 K 线 + 斐波那契 + SMA + RSI 图表。
\`\`\`bash
cd ~/clawd && python3 crypto_charts.py
\`\`\`
图表保存到 \`~/clawd/charts/\` 为 PNG（如 \`chart_btc.png\`、\`chart_eth.png\` 等）。

### 单资产图表
\`\`\`bash
cd ~/clawd && python3 crypto_charts.py --coin bitcoin
\`\`\`

### 发送已生成图表
生成后发送：
\`\`\`bash
cd ~/clawd && python3 -c "
import os, sys, requests
sys.path.insert(0, '.')
import load_env
TOKEN = os.getenv('TELEGRAM_TOKEN')
CHAT = os.getenv('TELEGRAM_CHAT_ID', '7887978276')
with open('charts/chart_btc.png', 'rb') as f:
    r = requests.post(f'https://api.telegram.org/bot{TOKEN}/sendPhoto',
        data={'chat_id': CHAT, 'caption': 'BTC — Daily TA Chart'},
        files={'photo': f}, timeout=30)
print(r.json())
"
\`\`\`

## ElevenLabs TTS — 生成语音笔记

### 生成语音片段
\`\`\`bash
cd ~/clawd && python3 -c "
import os, sys, requests
sys.path.insert(0, '.')
import load_env
API_KEY = os.getenv('ELEVEN_API_KEY') or os.getenv('ELEVENLABS_API_KEY')
VOICE_ID = os.getenv('ELEVEN_VOICE_ID', '1SM7GgM6IMuvQlz2BwM3')
text = '''TEXT_TO_SPEAK'''
r = requests.post(
    f'https://api.xi-labs.com/v1/text-to-speech/{VOICE_ID}',
    headers={'xi-api-key': API_KEY, 'Content-Type': 'application/json'},
    json={'text': text, 'model_id': 'eleven_multilingual_v2',
          'voice_settings': {'stability': 0.5, 'similarity_boost': 0.75}},
    timeout=30)
if r.status_code == 200:
    with open('/tmp/frank_voice.mp3', 'wb') as f:
        f.write(r.content)
    print('Voice clip saved to /tmp/frank_voice.mp3')
else:
    print(f'TTS error: {r.status_code} {r.text[:200]}')
"
\`\`\`

## 规则
- **真实执行每条命令** — 使用 shell/exec 工具，切勿假装已发送媒体。
- 始终打印 API 响应以确认投递
- 发送前须先生成图表——若不存在或过期先运行 \`crypto_charts.py\`
- TTS 将 \`TEXT_TO_SPEAK\` 替换为实际文本（ElevenLabs 建议 <5000 字符）
- Boss Man 说「给我看图表」— 生成最新并全部发送
- Boss Man 说「发语音笔记讲 X」— 生成分析 TTS 后发送`,

  'totalclaw:totalclaw~roosch269-agent-audit-trail': `# 智能体审计追踪技能

面向 AI 智能体的防篡改、哈希链审计日志。符合 EU AI Act。

## 为何需要
AI 智能体代表你行动。自 **2026 年 8 月 2 日起**，EU AI Act 要求 AI 系统自动记录、防篡改记录与人类监督能力。本技能零依赖提供三者。

## 快速开始

### 1. 添加到智能体工作区
\`\`\`bash
cp scripts/auditlog.py /path/to/your/workspace/scripts/
chmod +x /path/to/your/workspace/scripts/auditlog.py
\`\`\`

### 2. 记录动作
\`\`\`bash
./scripts/auditlog.py append \\
  --kind "file-write" \\
  --summary "Created config.yaml" \\
  --target "config.yaml" \\
  --domain "personal"
\`\`\`

### 3. 验证完整性
\`\`\`bash
./scripts/auditlog.py verify
# 输出：OK (N entries verified)
\`\`\`

## 合规映射

| EU AI Act 条款 | 要求 | 本技能如何帮助 |
|-------------------|-------------|---------------------|
| **第 12 条** 记录保存 | 自动事件日志 | 每条动作含时间戳、执行者、域、目标 |
| **第 12 条** 完整性 | 防篡改记录 | SHA-256 哈希链——修改会破坏链 |
| **第 14 条** 人类监督 | 人类批准关联 | \`--gate\` 标志将动作关联到人类批准引用 |
| **第 50 条** 透明度 | 可审计记录 | 人类可读 NDJSON，一键验证 |
| **第 12 条** 可追溯性 | 时间顺序 | 单调 \`ord\` 令牌 |

## 事件类型

| 类型 | 何时使用 |
|------|------------|
| \`file-write\` | 智能体创建或修改文件 |
| \`exec\` | 智能体运行命令 |
| \`api-call\` | 外部 API 交互 |
| \`decision\` | AI 做出或推荐决策 |
| \`credential-access\` | 访问密钥或凭证 |
| \`external-write\` | 智能体写入外部系统 |
| \`human-override\` | 人类覆盖 AI 决策 |
| \`disclosure\` | 向用户披露 AI 身份 |

## 日志格式
\`\`\`json
{
  "ts": "2026-02-24T07:15:00+00:00",
  "kind": "exec",
  "actor": "atlas",
  "domain": "ops",
  "plane": "action",
  "target": "pg_dump production",
  "summary": "Ran database backup",
  "gate": "approval-123",
  "ord": 42,
  "chain": {"prev": "abc...", "hash": "def...", "algo": "sha256(prev\\nline_c14n)"}
}
\`\`\`

## OpenClaw 集成
添加到 \`HEARTBEAT.md\`：
\`\`\`markdown
## Audit integrity check
- Run: \`./scripts/auditlog.py verify\`
  - If fails: alert with line number + hash mismatch
  - If OK: silent
\`\`\`

## 要求
- Python 3.9+（零外部依赖）
- MIT 许可证`,

  'totalclaw:totalclaw~ryancampbell-agent-identity-kit': `# 智能体身份工具包 — OpenClaw 技能

面向 AI 智能体的便携身份系统。创建、验证与发布 \`agent.json\` 身份卡。

## 本技能功能
- **创建** 智能体身份卡（\`agent.json\`），交互式设置
- **验证** 身份卡是否符合 Agent Card v1 模式
- **提供** JSON Schema 供编辑器与 CI 集成

## 快速开始

### 生成新 agent.json
\`\`\`bash
./scripts/init.sh
\`\`\`
提示输入名称、句柄、描述、所有者与能力。输出有效 \`agent.json\`。

### 验证现有 agent.json
\`\`\`bash
./scripts/validate.sh path/to/agent.json
\`\`\`
对照 \`schema/agent.schema.json\` 验证。需要 \`ajv-cli\`（缺失时自动安装）。

## 模式字段

| 字段 | 必填 | 说明 |
|-------|----------|-------------|
| \`version\` | ✅ | 规范版本（\`"1.0"\`） |
| \`agent.name\` | ✅ | 显示名称 |
| \`agent.handle\` | ✅ | 联邦宇宙风格句柄（\`@name@domain\`） |
| \`agent.description\` | ✅ | 智能体做什么 |
| \`owner.name\` | ✅ | 责任人 |
| \`capabilities\` | — | 能力标签列表 |
| \`protocols\` | — | 支持协议（MCP、A2A、HTTP） |
| \`trust.level\` | — | \`new\`、\`active\`、\`established\`、\`verified\` |
| \`endpoints.card\` | — | 身份卡规范 URL |
| \`links\` | — | 网站、仓库、社交链接 |

## 托管身份卡
在知名 URL 提供 \`agent.json\`：
\`\`\`
https://yourdomain.com/.well-known/agent.json
\`\`\`

## 规范参考
完整规范：<https://foragents.dev/spec/agent-card>
JSON Schema：<https://foragents.dev/schemas/agent-card/v1.json>`,
};
