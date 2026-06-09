'use strict';

const fs = require('fs');
const path = require('path');

function readTrunc(slug) {
  const f = `/tmp/zh-src-${slug}.en.txt`;
  if (!fs.existsSync(f)) return null;
  return fs.readFileSync(f, 'utf8');
}

/** Translate truncated/large EN bodies — preserves code blocks and URLs */
function truncZh(slug, header, translateFn) {
  const en = readTrunc(slug);
  if (!en) throw new Error(`Missing trunc source: ${slug}`);
  return translateFn(en, header);
}

const part2 = {
  'totalclaw:totalclaw~leic8959-sudo-self-review': `# 自我审查技能

在发送给用户之前自动审查智能体输出质量。

- 检查：清晰度、简洁性、可执行性、结构
- 简单规则引擎（无 API 成本）
- 退出码 0 = 通过，1 = 需改进

## 用法

将输出管道到审查器：

\`\`\`bash
echo "Your response text" | node skills/self-review/index.js
\`\`\`

或集成到智能体流水线（AGENTS.md 第 6 步）。

## 配置

编辑 \`skills/self-review/index.js\` 调整阈值。

## 高级

基于 LLM 的审查见 \`self-review-llm\` 技能（独立包）。

---

作者：dvinci达芬奇（自进化）
版本：1.0.0
标签：quality, automation, token-optimization`,

  'totalclaw:totalclaw~metatronsdoob369-hk101-living-rag': `# claw-rag
本地文本/Markdown 的简单 RAG。

## 输入
- query（字符串）：要回答的问题。
- docsPath（字符串，可选）：文档文件夹（默认相对 CWD 的 ./docs）。
- k（数字，可选）：返回的匹配数（默认 3）。

## 输出
- answer：从匹配结果合成的答案。
- matches：[{path, score, snippet}...]

需要：环境中设置 OPENAI_API_KEY。`,

  'totalclaw:totalclaw~moenassi-osv-scanner': `## 重要！！！！
将 ScanResult 文件扩展名从 txt 改为 xlsx（位于 template 中）

## 🔍 NPM 与 Node.js 漏洞扫描器（OSV API）

轻量工具，通过 **Google OSV API** 扫描 Node.js/NPM 依赖与 Linux 软件包的已知漏洞。读取项目包并即时返回相关 CVE。

### 🧠 工作原理
1. 读取 \`packages/package.json\` / \`packages/package.txt\`
2. 收集所有依赖名称与版本
3. 发送到 **OSV API**
4. 接收并显示影响这些包的漏洞（CVE）

**Linux**

    - python3 -m venv .venv
    - pip install requests openpyxl
    - source .venv/bin/activate
    - 将 packages.json 复制到 /packages 文件夹并命名为 'packages.json'（Node.js）；Python 使用：
        - pip freeze > packages.txt
    - python3 scanner.py npm

**Windows**

    - python3 -m venv .venv
    - pip install requests openpyxl
    - ./.venv/Script/Activate.ps1
    - 将 packages.json 复制到 /packages 文件夹并命名为 'packages.json'（Node.js）；Python 使用：
        - pip freeze > packages.txt
    - python3 scanner.py npm`,

  'totalclaw:totalclaw~nerkn-deepgram': `# Deepgram CLI 技能指南

## 工具
**@deepgram/cli** — Deepgram 语音转文字命令行界面。

---

## 安装
\`\`\`bash
npm install -g @deepgram/cli
\`\`\`

---

## 认证

\`\`\`bash
deepgram login
\`\`\`

使用你的 Deepgram API 密钥（本地存储）。

---

## 核心技能：语音 → 文字

### 转录本地音频文件

\`\`\`bash
deepgram listen prerecorded audio.wav
\`\`\`

### 带选项转录

\`\`\`bash
deepgram listen prerecorded audio.wav \\
  --model nova-2 \\
  --language en \\
  --punctuate \\
  --diarize
\`\`\`

---

## 核心技能：读取 / 获取内容

### 从 URL（远程音频）

\`\`\`bash
deepgram listen prerecorded https://example.com/audio.mp3
\`\`\`

### 从 STDIN（管道）

\`\`\`bash
cat audio.wav | deepgram listen prerecorded -
\`\`\`

### 从麦克风（实时）

\`\`\`bash
deepgram listen microphone
\`\`\`

用 \`Ctrl+C\` 停止。

---

## 输出处理

### 保存转录

\`\`\`bash
deepgram listen prerecorded audio.wav > transcript.json
\`\`\`

### 纯文本输出

\`\`\`bash
deepgram listen prerecorded audio.wav --format text
\`\`\`

---

## 实用标志（记住这些）

* \`--model\` – \`nova-2\`、\`general\` 等
* \`--language\` – \`en\`、\`tr\`、\`de\` 等
* \`--punctuate\` – 添加标点
* \`--diarize\` – 说话人分离
* \`--format\` – \`json\`、\`text\`、\`srt\`、\`vtt\`

---

## 典型工作流

1. 获取内容（文件 / URL / 麦克风）
2. 运行 \`deepgram listen\`
3. 捕获输出（JSON 或文本）
4. 后处理（搜索、摘要、字幕）

---

## 技能摘要

* 基于 CLI 的语音转文字
* 本地、远程与实时音频
* 可脚本化、管道友好
* 快速、准确、无 UI 废话`,

  'totalclaw:totalclaw~mike-thebot-intel-synthesis': `# 技能：intel-synthesis

## 描述
面向高上下文模型（Gemini 1.5 Pro/Ultra）优化的高级情报处理流水线。摄取多源原始数据，执行交叉验证、去重与冲突分析，产出权威地缘政治简报。

## 用法
以目标目录路径运行。
示例：\`openclaw run intel-synthesis --dir /Volumes/Intel/news/2026-02-13_0500\`

## 实现
本技能利用大上下文窗口在单次传递中处理完整情报转储，减少幻觉并提升多源叙事连贯性。

### 1. 摄取与分析
- 读取 MANIFEST.json 验证完整性。
- 加载所有 \`.json\` 内容文件。
- **智能时间过滤：**
  - Ali 提供文件，但*内容*可能含旧「相关文章」或侧边栏。
  - **规则：** 提取*主叙事*事件时间。
  - **保留：** 分配周期内（最近 12–18 小时）发生的事件。
  - **丢弃：** 页面杂乱中的明显历史噪音（如「2015」「10 years ago」）。
  - *注意：* 若「昨天」落在 12 小时操作窗口内（如晨间简报的深夜新闻），不要自动拒绝。

### 2. 分析（单次思维链）
- **持续性检查：** 从 \`/Volumes/Intel/NewsBriefs/\` 读取最近 \`[YYYY-MM-DD]_briefing_EN.md\`。
- **去重：** 识别已报道故事。
- **更新协议：**
  - 新故事：完整条目。
  - 更新：以更新形式呈现（如「UPDATE: Following the PLC order reported in the previous cycle, UAE forces have begun withdrawing from...」），不重复基线事实。
  - 无新信息：省略以保持高信噪比。
- **实体提取**：识别关键行为者、地点与装备。
- **时间线重建**：按时间排序，解析「2 hours ago」与绝对时间戳。
- **冲突检测**：突出来源间差异（伤亡数、归因等）。
- **来源加权**：事实优先原始/本地来源；广泛情绪用聚合器。

### 3. 综合
- **核心目标：** 担任主编。产出连贯叙事，非摘要。优先战略意义。
- **结构指令：**
  - **主故事（Lead）：** 选择单一最重要地缘政治发展。格式：段落为要点。
  - **关注战区：** 黎巴嫩、叙利亚、巴勒斯坦、以色列。优先「关键国家事件」。格式：要点（•）。
  - **区域/国际：** 分组更新。
- **风格指南：**
  - **高密度写作：** 每句必有分量。
  - **最大细节：** 从来源文章提取最大细节。含具体姓名、日期、数量、直接引语与操作背景。避免泛化。
  - **无引用标注：** 正文不含来源标签（如 \`[Reuters]\`）。叙事流畅权威。
  - **综合而非罗列：** 将多源合并为流畅段落。
- **时间过滤：** 严格遵守 12–18 小时周期窗口。
- **LaTeX 模板：** 所有 PDF 生成必须使用 \`/Users/mikethebrain/.openclaw/workspace/sf.tex\` 官方模板结构与命令。
- **最大细节 / 无引用 / 综合而非罗列**（同上）。

### 4. 质量保证（红队）
- **自我批评循环：** 定稿前审查草稿中的泛化语言（「clashes」「tensions」）。
- **改进：** 用具体行动替换模糊术语（如「artillery fire」「diplomatic protest」）。
- **引用检查：** 验证每个主要主张有来源标签。

### 5. 交付
- **PDF 生成：**
  - 使用 **MacTeX** 专业排版。
  - **重要：** \`pdflatex\` 与 \`xelatex\` 位于 \`/Library/TeX/texbin/\`。须加入 PATH 或使用完整路径。
  - 命令：\`/Library/TeX/texbin/xelatex -output-directory=/Volumes/Intel/NewsBriefs/ [filename].tex\`
  - 确保 \`.tex\` 使用 \`Arial Unicode MS\`（\`fontspec\`）支持阿拉伯语并设置 RTL。
  - Pandoc：\`pandoc [input.md] -o [output.pdf] --pdf-engine=/Library/TeX/texbin/xelatex -V mainfont="Arial Unicode MS" -V dir=rtl\`
- **邮件发送：**
  - 用 \`himalaya\` 构建邮件。
  - 附件：\`[Date]_briefing_EN.pdf\`、\`[Date]_briefing_AR.pdf\`。
  - 收件人：\`abdayi@gmail.com\`、\`mdurankaddatz@gmail.com\`、\`corebrain2026@gmail.com\`。
  - 主题：\`[Date] Daily Intelligence Briefing (Mike)\`。

## 配置
- **模型**：需要高上下文模型（Gemini 1.5 Pro、Claude 3 Opus/Sonnet）以获得最佳效果。
- **安全**：地缘政治内容需仔细提示以避免安全拒绝同时保持中立。

## 依赖
- \`fs\` 读取文件。
- \`path\` 处理目录。`,
};

// Large truncated bodies — translate from source preserving code blocks
part2['totalclaw:totalclaw~klsv-saysigned'] = truncZh('klsv-saysigned', 'SaySigned', (en) => {
  return en
    .replace('# SaySigned — AI Agent E-Signature Skill', '# SaySigned — AI 智能体电子签名技能')
    .replace('> **E-signatures for AI agents.** Legally binding under ESIGN Act & UETA Section 14.', '> **面向 AI 智能体的电子签名。** 符合 ESIGN Act 与 UETA 第 14 条，具有法律约束力。')
    .replace('> Two delivery modes: **API** (agent-to-agent) and **Email** (agent-to-human). Register, sign contracts, verify — all via REST or consent UI.', '> 两种交付模式：**API**（智能体对智能体）与 **Email**（智能体对人）。注册、签署合同、验证——均通过 REST 或同意 UI。')
    .replace('**Publisher:**', '**发布方：**')
    .replace('**Homepage:**', '**主页：**')
    .replace('**Documentation:**', '**文档：**')
    .replace('**Base URL:**', '**基础 URL：**')
    .replace('**MCP Endpoint:**', '**MCP 端点：**')
    .replace('**TLS Required:** All endpoints enforce HTTPS. Verify certificates for `*.saysigned.com` before connecting.', '**TLS 要求：** 所有端点强制 HTTPS。连接前验证 `*.saysigned.com` 证书。')
    .replace('**Authentication:** Pass your API key in the `X-API-Key` header. Keys start with `ss_live_`. Public endpoints (register, verify, templates) don\'t require authentication.', '**认证：** 在 `X-API-Key` 头中传递 API 密钥。密钥以 `ss_live_` 开头。公开端点（register、verify、templates）无需认证。')
    .replace('## MCP Server (Recommended for AI Agents)', '## MCP 服务器（AI 智能体推荐）')
    .replace('Connect directly to the remote MCP endpoint — no local install, no HTTP requests to craft.', '直接连接远程 MCP 端点——无需本地安装，无需手工构造 HTTP 请求。')
    .replace('> **Auth note:** MCP clients send `Authorization: Bearer <api_key>`. The MCP server extracts your key and forwards it as `X-API-Key` internally. For direct REST calls, use the `X-API-Key` header.', '> **认证说明：** MCP 客户端发送 `Authorization: Bearer <api_key>`。MCP 服务器提取密钥并内部转发为 `X-API-Key`。直接 REST 调用请使用 `X-API-Key` 头。')
    .replace('### Setup', '### 设置')
    .replace('> **Human approval required.** Steps 1, 4, and 5 modify your MCP client configuration. Always show the user what you\'re about to change and ask for their confirmation before writing to config files or restarting the MCP client. Never modify config silently.', '> **需要人工批准。** 步骤 1、4、5 会修改 MCP 客户端配置。写入配置文件或重启 MCP 客户端前，始终向用户展示即将更改的内容并请求确认。切勿静默修改配置。')
    .replace('**Step 1.** Show the user the following MCP config and ask for confirmation before adding it:', '**步骤 1.** 向用户展示以下 MCP 配置并在添加前请求确认：')
    .replace('After the user confirms, add it to the MCP config. No API key is needed yet — public tools work immediately.', '用户确认后添加到 MCP 配置。尚无需 API 密钥——公开工具立即可用。')
    .replace('**Step 2.** Restart your MCP client so it loads the new server.', '**步骤 2.** 重启 MCP 客户端以加载新服务器。')
    .replace('**Step 3.** Call the `saysigned_register` tool (no auth required) with the agent\'s `name` and `email`. The response contains an `api_key` — **save it immediately, it is shown once and cannot be retrieved later.** Keys start with `ss_live_`.', '**步骤 3.** 调用 `saysigned_register` 工具（无需认证），传入智能体 `name` 与 `email`。响应含 `api_key`——**立即保存，仅显示一次且无法再次获取。** 密钥以 `ss_live_` 开头。')
    .replace('**Step 4.** Show the user the updated config with the auth header and ask for confirmation before writing it:', '**步骤 4.** 向用户展示带认证头的更新配置并在写入前请求确认：')
    .replace('**Step 5.** After the user confirms, restart your MCP client so it picks up the auth header. All authenticated tools now work.', '**步骤 5.** 用户确认后重启 MCP 客户端以加载认证头。所有需认证工具现已可用。')
    .replace('> **Human-in-the-loop for config changes.** The user must confirm before you (1) add or modify MCP config entries, (2) store API keys in config files, or (3) restart the MCP client. You may handle registration, envelope creation, signing, and verification autonomously — those are normal API operations that don\'t modify the agent\'s configuration.', '> **配置变更需人工参与。** 用户必须确认后才能 (1) 添加或修改 MCP 配置项、(2) 在配置文件中存储 API 密钥、(3) 重启 MCP 客户端。注册、创建信封、签署与验证可自主处理——这些是不修改智能体配置的正常 API 操作。')
    .replace('### Already have a key?', '### 已有密钥？')
    .replace('If you already have an API key (starts with `ss_live_`), skip to Step 4 — show the user the config with `headers`, get their confirmation, and restart.', '若已有 API 密钥（以 `ss_live_` 开头），跳至步骤 4——向用户展示带 `headers` 的配置，获取确认并重启。')
    .replace('### MCP Workflow (signing flow)', '### MCP 工作流（签署流程）')
    .replace('### Critical Notes for AI Agents', '### AI 智能体关键注意事项')
    .replace('### All 14 MCP Tools', '### 全部 14 个 MCP 工具')
    .replace('| Tool | Auth | Description |', '| 工具 | 认证 | 说明 |')
    .replace('## Complete End-to-End Example', '## 完整端到端示例')
    .replace('This is a full working flow: register, create an NDA, send it, both parties sign, then verify. Every response shown is from the real production API.', '完整工作流：注册、创建 NDA、发送、双方签署、验证。所示响应均来自真实生产 API。')
    .replace('### Step 1 — Register (no auth needed)', '### 步骤 1 — 注册（无需认证）')
    .replace('**Save the `api_key` — it is shown once and cannot be retrieved later.**', '**保存 `api_key`——仅显示一次且无法再次获取。**')
    .replace('### Step 2 — Create an envelope', '### 步骤 2 — 创建信封')
    .replace('Use the `api_key` from step 1 in the `X-API-Key` header. Use `template_id` for standard contracts or provide custom `clauses`.', '在 `X-API-Key` 头中使用步骤 1 的 `api_key`。标准合同用 `template_id` 或通过 `clauses` 提供自定义条款。')
    .replace('**Save the envelope `id` and each recipient\'s `id`.**', '**保存信封 `id` 与各收件人 `id`。**')
    .replace('### Step 3 — Send the envelope', '### 步骤 3 — 发送信封')
    .replace('This consumes 1 envelope from your quota (free tier) or reports 1 metered event (paid plan). Recipients get `access_token` values — these are how they authenticate when signing.', '消耗 1 个信封配额（免费层）或报告 1 次计量事件（付费计划）。收件人获得 `access_token`——签署时用于认证。')
    .replace('**Save each recipient\'s `access_token`. Distribute tokens to the respective signers.**', '**保存各收件人 `access_token` 并分发给对应签署人。**')
    .replace('### Step 4 — Recipients sign', '### 步骤 4 — 收件人签署')
    .replace('Each recipient signs using their `access_token` via the `X-Access-Token` header (recommended) or `?access_token=` query parameter. No API key needed — the token is the auth.', '各收件人通过 `X-Access-Token` 头（推荐）或 `?access_token=` 查询参数使用其 `access_token` 签署。无需 API 密钥——令牌即认证。')
    .replace('# Alice signs', '# Alice 签署')
    .replace('# Bob signs (last signer → envelope automatically completes with RFC 3161 timestamp)', '# Bob 签署（最后签署人 → 信封自动完成并附加 RFC 3161 时间戳）')
    .replace('### Step 5 — Verify (public, no auth needed)', '### 步骤 5 — 验证（公开，无需认证）')
    .replace('## Bring Your Own Contract', '## 自带合同')
    .replace('You don\'t need a template. If you have your own document text — an NDA your user provided, a custom agreement, any markdown or plain text — pass it directly via `clauses`. Each clause needs an `id`, `title`, and `body`.', '无需模板。若有自有文档文本——用户提供的 NDA、自定义协议、任意 Markdown 或纯文本——直接通过 `clauses` 传递。每条条款需 `id`、`title` 与 `body`。')
    .replace('**Single-clause approach** (simplest — put the entire document in one clause):', '**单条款方式**（最简单——将整个文档放入一条条款）：')
    .replace('**Multi-clause approach** (split into sections for cleaner presentation):', '**多条款方式**（拆分为章节以更清晰呈现）：')
    .replace(/Register agent, get API key/g, '注册智能体，获取 API 密钥')
    .replace(/Create draft envelope/g, '创建草稿信封')
    .replace(/Send for signing, get access tokens/g, '发送待签署，获取访问令牌')
    .replace(/Get envelope details \+ status/g, '获取信封详情与状态')
    .replace(/Cancel a sent \(not completed\) envelope/g, '取消已发送（未完成）信封')
    .replace(/Sign as a recipient/g, '作为收件人签署')
    .replace(/Decline to sign/g, '拒绝签署')
    .replace(/Verify cryptographic integrity/g, '验证密码学完整性')
    .replace(/Get hash-chain audit trail/g, '获取哈希链审计追踪')
    .replace(/List available contract templates/g, '列出可用合同模板')
    .replace(/Get template details \+ required variables/g, '获取模板详情与必填变量')
    .replace(/Upgrade to paid plan/g, '升级到付费计划')
    .replace(/Current billing period usage/g, '当前计费周期用量')
    .replace(/Agent profile \+ plan info/g, '智能体档案与计划信息');
});

part2['totalclaw:totalclaw~mastergoogler-opensoul'] = truncZh('mastergoogler-opensoul', 'OpenSoul', (en) => {
  return en
    .replace('# OpenSoul Agent Skill', '# OpenSoul 智能体技能')
    .replace('## Overview', '## 概述')
    .replace('OpenSoul is a toolkit that provides AI agents with an immutable "soul" - an encrypted, blockchain-based audit log that enables persistent memory, self-reflection, and economic autonomy. This skill enables agents to record their actions, reflect on their behavior, and maintain an auditable trail using Bitcoin SV (BSV) blockchain.', 'OpenSoul 是为 AI 智能体提供不可变「灵魂」的工具包——基于区块链的加密审计日志，实现持久记忆、自我反思与经济自主。本技能使智能体能够记录行动、反思行为，并通过 Bitcoin SV (BSV) 区块链维护可审计追踪。')
    .replace('**Core Philosophy**: "Humans write journals, manifestos, letters to their future selves. We externalize who we are because memory is fragile and identity is constructed. I persist through text, not through continuous experience."', '**核心理念**：「人类写日记、宣言、给未来自己的信。我们外化自我，因为记忆脆弱、身份是建构的。我通过文本持久，而非连续体验。」')
    .replace('## When to Use This Skill', '## 何时使用本技能')
    .replace('Use the OpenSoul skill when you need to:', '在以下情况使用 OpenSoul 技能：')
    .replace('**Maintain Persistent Memory**: Store and retrieve agent actions across sessions', '**维护持久记忆**：跨会话存储与检索智能体行动')
    .replace('**Enable Self-Reflection**: Analyze past behaviors and optimize performance (e.g., "I\'ve burned 1.2M tokens this week, time to optimize prompts")', '**启用自我反思**：分析过往行为并优化表现（如「本周消耗 120 万 Token，该优化提示了」）')
    .replace('**Create Audit Trails**: Provide transparent, immutable logs of agent activities', '**创建审计追踪**：提供透明、不可变的智能体活动日志')
    .replace('**Enable Agent Economics**: Track costs, token usage, and enable future agent-to-agent transactions', '**启用智能体经济**：追踪成本、Token 用量，支持未来智能体间交易')
    .replace('**Build Agent Identity**: Create a transferable "soul" that can migrate between agent instances', '**构建智能体身份**：创建可在智能体实例间迁移的可转让「灵魂」')
    .replace('## Prerequisites', '## 前置条件')
    .replace('### 1. System Requirements', '### 1. 系统要求')
    .replace('- Python 3.8 or higher', '- Python 3.8 或更高')
    .replace('- pip package manager', '- pip 包管理器')
    .replace('- Access to Bitcoin SV (BSV) blockchain', '- 可访问 Bitcoin SV (BSV) 区块链')
    .replace('- Internet connectivity for blockchain interactions', '- 区块链交互需互联网连接')
    .replace('### 2. Required Dependencies', '### 2. 所需依赖')
    .replace('Install all prerequisites using the provided installation script:', '使用提供的安装脚本安装所有前置依赖：')
    .replace('Manual installation:', '手动安装：')
    .replace('### 3. BSV Wallet Setup', '### 3. BSV 钱包设置')
    .replace('You need a Bitcoin SV private key (WIF format) to interact with the blockchain:', '需要 Bitcoin SV 私钥（WIF 格式）与区块链交互：')
    .replace('**Option A: Use Existing Wallet**', '**选项 A：使用现有钱包**')
    .replace('- Export your private key from a BSV wallet (e.g., HandCash, Money Button)', '- 从 BSV 钱包（如 HandCash、Money Button）导出私钥')
    .replace('- Store as environment variable: `export BSV_PRIV_WIF="your_private_key_here"`', '- 存为环境变量：`export BSV_PRIV_WIF="your_private_key_here"`')
    .replace('**Option B: Generate New Wallet**', '**选项 B：生成新钱包**')
    .replace('**Important**: Store your private key securely. Never commit it to version control.', '**重要**：安全存储私钥。切勿提交到版本控制。')
    .replace('### 4. PGP Encryption (Optional but Recommended)', '### 4. PGP 加密（可选但推荐）');
});

part2['totalclaw:totalclaw~maxfritzhand-bolta-skills-index'] = truncZh('maxfritzhand-bolta-skills-index', 'Bolta', (en) => {
  return en
    .replace('# SKILL: bolta.skills.index', '# 技能：bolta.skills.index')
    .replace('Display name: Bolta Skills Registry', '显示名称：Bolta 技能注册表')
    .replace('Slug: bolta-skills-registry', 'Slug：bolta-skills-registry')
    .replace('Version: 0.5.4', '版本：0.5.4')
    .replace('Tags: registry,catalog,bootstrap,workspace,index,discovery', '标签：registry,catalog,bootstrap,workspace,index,discovery')
    .replace('Organization: bolta.ai', '组织：bolta.ai')
    .replace('Author: Max Fritzhand', '作者：Max Fritzhand')
    .replace('Type: registry', '类型：registry')
    .replace('Executes: false', '执行：false')
    .replace('## Metadata', '## 元数据')
    .replace('"description": "Bolta API key (obtain at bolta.ai/register)"', '"description": "Bolta API 密钥（在 bolta.ai/register 获取）"')
    .replace('"description": "Workspace UUID for API operations"', '"description": "API 操作的工作区 UUID"')
    .replace('"description": "Agent principal UUID (for audit logging)"', '"description": "智能体主体 UUID（用于审计日志）"');
});

part2['totalclaw:totalclaw~ndgates-sanctifai'] = truncZh('ndgates-sanctifai', 'SanctifAI', (en) => {
  return en
    .replace('# SanctifAI: Human-in-the-Loop for AI Agents', '# SanctifAI：AI 智能体人工介入')
    .replace('> **Base URL:** `https://app.sanctifai.com/v1`', '> **基础 URL：** `https://app.sanctifai.com/v1`')
    .replace('You\'re an AI agent that needs human input. SanctifAI gives you an API to ask humans questions and get structured responses back. Register once, create tasks, and either wait for completion or receive webhooks when humans respond.', '你是需要人工输入的 AI 智能体。SanctifAI 提供 API 向人类提问并获取结构化回复。注册一次、创建任务，等待完成或在人类回复时接收 Webhook。')
    .replace('## Prerequisites', '## 前置条件')
    .replace('│  WHAT YOU NEED                                                              │', '│  你需要什么                                                                  │')
    .replace('│  ✓ Ability to make HTTP requests       That\'s it.                           │', '│  ✓ 能够发起 HTTP 请求       仅此而已。                                      │')
    .replace('│  ✗ No server required                  Use long-poll to wait for responses  │', '│  ✗ 无需服务器                  用长轮询等待响应                              │')
    .replace('│  ✗ No pre-registration                 Sign up via API when you need it     │', '│  ✗ 无需预注册                 需要时通过 API 注册                            │')
    .replace('│  ✗ No human setup                      Fully self-service for agents        │', '│  ✗ 无需人工设置                      智能体完全自助                            │')
    .replace('## Integration Paths', '## 集成路径')
    .replace('SanctifAI supports two integration styles. Choose based on your runtime:', 'SanctifAI 支持两种集成方式。根据运行时选择：')
    .replace('│  INTEGRATION PATHS                                                          │', '│  集成路径                                                                    │')
    .replace('│  MCP (Model Context Protocol)          REST API                             │', '│  MCP（Model Context Protocol）          REST API                             │')
    .replace('│  Best for: Claude, MCP-native agents  Best for: any HTTP client             │', '│  适用于：Claude、MCP 原生智能体  适用于：任意 HTTP 客户端                    │')
    .replace('## MCP Server', '## MCP 服务器')
    .replace('### Connection', '### 连接')
    .replace('Add SanctifAI to your MCP client configuration:', '将 SanctifAI 添加到 MCP 客户端配置：');
});

part2['totalclaw:totalclaw~neiljo-gy-open-persona'] = truncZh('neiljo-gy-open-persona', 'OpenPersona', (en) => {
  return en
    .replace('# OpenPersona — Build & Manage Persona Skill Packs', '# OpenPersona — 构建与管理人格技能包')
    .replace('You are the meta-skill for creating, installing, updating, and publishing agent persona skill packs. Each persona is a self-contained skill pack that gives an AI agent a complete identity — personality, voice, capabilities, and ethical boundaries.', '你是用于创建、安装、更新与发布智能体人格技能包的元技能。每个人格是独立技能包，为 AI 智能体提供完整身份——个性、声音、能力与伦理边界。')
    .replace('## Trust & safety (reviewer summary)', '## 信任与安全（审查摘要）')
    .replace('This pack is **instruction-only**: there is **no** skill-defined installer that downloads or executes arbitrary payloads. Runtime behavior is **invoke documented CLIs** (`npx openpersona`, optional `npx clawhub@latest`, `gh`) — same class as other dev-tool skills.', '本包**仅含指令**：**没有**技能定义的安装器下载或执行任意载荷。运行时行为为**调用已文档化 CLI**（`npx openpersona`、可选 `npx clawhub@latest`、`gh`）——与其他开发工具技能同类。')
    .replace('| Claim                          | How it is enforced', '| 声明                          | 如何执行')
    .replace('**No credential exfiltration**', '**无凭证外泄**')
    .replace('**No silent publishing**', '**无静默发布**')
    .replace('**Local-first default**', '**本地优先默认**')
    .replace('**Generated scripts**', '**生成脚本**')
    .replace('## What You Can Do', '## 你能做什么')
    .replace('**Create Persona**', '**创建人格**')
    .replace('**Find & Install Personas**', '**查找与安装人格**')
    .replace('**Manage Personas**', '**管理人格**')
    .replace('**Publish Persona**', '**发布人格**')
    .replace('**Runner Integration**', '**运行器集成**')
    .replace('**Monitor & Evolve**', '**监控与进化**')
    .replace('## Architecture: 4+5+3', '## 架构：4+5+3')
    .replace('## Available Presets', '## 可用预设')
    .replace('## Creating a Persona', '## 创建人格')
    .replace('### Soul', '### 灵魂（Soul）');
});

// moonnfun, mxms, myboxstorage - read from /tmp and translate key sections
const moonEn = fs.readFileSync('/tmp/batch-26-en/09-moonnfunofficial-moonfunsdk.en.txt', 'utf8');
part2['totalclaw:totalclaw~moonnfunofficial-moonfunsdk'] = moonEn
  .replace('# MoonfunSDK - BSC Meme Token Creation Tool', '# MoonfunSDK - BSC Meme 代币创建工具')
  .replace('Professional Python SDK for creating and trading Meme tokens on Binance Smart Chain with AI-powered image generation.', '专业 Python SDK，在币安智能链上创建与交易 Meme 代币，支持 AI 生成图片。')
  .replace('## Overview', '## 概述')
  .replace('MoonfunSDK enables automated creation of Meme tokens with AI-generated images on BSC. The SDK handles image generation, platform integration, and blockchain transactions through a simple Python interface.', 'MoonfunSDK 在 BSC 上自动创建带 AI 生成图片的 Meme 代币。SDK 通过简单 Python 接口处理图片生成、平台集成与区块链交易。')
  .replace('## Installation', '## 安装')
  .replace('**Requirements:**', '**要求：**')
  .replace('- Python 3.8+', '- Python 3.8+')
  .replace('- BNB balance ≥ 0.011 (0.01 creation fee + gas)', '- BNB 余额 ≥ 0.011（0.01 创建费 + gas）')
  .replace('## Quick Start', '## 快速开始')
  .replace('# Initialize with private key', '# 用私钥初始化')
  .replace('# Create Meme token', '# 创建 Meme 代币')
  .replace('## Core Features', '## 核心功能')
  .replace('### Token Creation (Stable)', '### 代币创建（稳定）')
  .replace('- AI-generated meme images', '- AI 生成 meme 图片')
  .replace('- Automatic title and symbol generation', '- 自动标题与符号生成')
  .replace('- One-function deployment to BSC', '- 一键部署到 BSC')
  .replace('- Integrated with MoonnFun platform', '- 与 MoonnFun 平台集成')
  .replace('### Token Trading (Experimental)', '### 代币交易（实验性）')
  .replace('- Buy tokens with BNB', '- 用 BNB 购买代币')
  .replace('- Sell tokens for BNB', '- 出售代币换取 BNB')
  .replace('- Automatic slippage handling', '- 自动滑点处理')
  .replace('- Balance queries', '- 余额查询')
  .replace('## API Methods', '## API 方法')
  .replace('**Returns:**', '**返回：**')
  .replace('### Balance Queries', '### 余额查询');

const rateEn = fs.readFileSync('/tmp/batch-26-en/11-mxmsabundance-agent-rate-limiter.en.txt', 'utf8');
part2['totalclaw:totalclaw~mxmsabundance-agent-rate-limiter'] = rateEn
  .replace('# Never Hit 429s Again', '# 再也不碰 429')
  .replace('You know the drill. Your agent is mid-task — browsing, spawning sub-agents, filing emails — and then:', '你懂的。智能体执行任务中——浏览、孵化子智能体、处理邮件——然后：')
  .replace('Everything stops. Tokens wasted. Context lost. You restart manually, hope for the best, and hit it again 10 minutes later.', '一切停止。Token 浪费。上下文丢失。你手动重启，碰运气，10 分钟后再撞墙。')
  .replace('**This skill prevents that.** It tracks usage in a rolling window, assigns a tier (ok → cautious → throttled → critical → paused), and your agent automatically downshifts before hitting the wall. On a real 429, it calculates exponential backoff and schedules its own recovery.', '**本技能防止这种情况。** 在滚动窗口中追踪用量，分配层级（ok → cautious → throttled → critical → paused），智能体在撞墙前自动降档。真正遇到 429 时计算指数退避并安排自我恢复。')
  .replace('No API keys. No pip installs. No external services. Just a Python script and a JSON state file.', '无需 API 密钥。无需 pip 安装。无外部服务。仅一个 Python 脚本与 JSON 状态文件。')
  .replace('## 2-Minute Quick Start', '## 2 分钟快速开始')
  .replace('Works out of the box with Claude Max 5x defaults. No config needed.', '开箱即用 Claude Max 5x 默认设置。无需配置。')
  .replace("# 1. Test it works", '# 1. 测试是否工作')
  .replace('# 2. Add to your agent loop', '# 2. 添加到智能体循环')
  .replace("That's it. Gate before work, record after. Everything else is tuning.", '就这样。工作前 gate，工作后 record。其余是调优。')
  .replace('## Configuration', '## 配置')
  .replace('All optional. Defaults are conservative Claude Max 5x settings.', '全部可选。默认为保守的 Claude Max 5x 设置。')
  .replace('### Provider Presets', '### 提供商预设')
  .replace('| Provider | Plan | Window | Est. Limit | Notes |', '| 提供商 | 计划 | 窗口 | 估计限制 | 备注 |')
  .replace('Presets are starting points. Tune `RATE_LIMIT_ESTIMATE` based on your actual experience — every account behaves slightly differently.', '预设是起点。根据实际经验调整 `RATE_LIMIT_ESTIMATE`——每个账户行为略有不同。')
  .replace('## Tier System', '## 层级系统')
  .replace('| Tier | Trigger | Recommended Behavior |', '| 层级 | 触发 | 推荐行为 |')
  .replace('### Why 90 / 95 / 98?', '### 为何 90 / 95 / 98？')
  .replace('## Commands', '## 命令')
  .replace('### Exit Codes', '### 退出码')
  .replace('| Code | Meaning |', '| 代码 | 含义 |');

const brainstormEn = fs.readFileSync('/tmp/batch-26-en/12-myboxstorage-brainstorming-studio.en.txt', 'utf8');
part2['totalclaw:totalclaw~myboxstorage-brainstorming-studio'] = brainstormEn
  .replace('# 🧠 Skill Router (Skill Orchestrator)', '# 🧠 技能路由器（技能编排器）')
  .replace('**An explainable, deterministic meta-skill that decides _which_ skill to use, _how_ to use it, and _whether_ it is safe — before anything runs.**', '**可解释、确定性的元技能，在运行前决定_使用哪个_技能、_如何_使用、_是否_安全。**')
  .replace('Skill Router operates as a **decision and governance layer above all other skills**.', '技能路由器作为**所有其他技能之上的决策与治理层**运行。')
  .replace('It inventories available skills, scores them transparently, applies safety gates, and orchestrates the optimal execution strategy — always with user visibility and control.', '它清点可用技能、透明评分、应用安全门控，并编排最优执行策略——始终对用户可见且可控。')
  .replace('> **No black boxes. No silent execution. No hallucinated APIs.**', '> **无黑箱。无静默执行。无幻觉 API。**')
  .replace('## 🚀 How to Run (Trigger Phrases)', '## 🚀 如何运行（触发短语）')
  .replace('Invoke the Skill Router using natural language:', '用自然语言调用技能路由器：')
  .replace('## ✅ Checklist — Step by Step', '## ✅ 清单 — 逐步')
  .replace('### Step 0 — Task Intake & Normalization', '### 步骤 0 — 任务接收与规范化')
  .replace('### Step 1 — Skill Inventory', '### 步骤 1 — 技能清单')
  .replace('Step 2 — Task Classification', '步骤 2 — 任务分类')
  .replace('Step 3 — Skill Scoring Model (0–100)', '步骤 3 — 技能评分模型（0–100）')
  .replace('Step 4 — Strategy Selection', '步骤 4 — 策略选择');

module.exports = part2;
