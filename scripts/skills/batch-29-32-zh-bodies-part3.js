'use strict';

/** Batch 31–32 body translations */
module.exports = {
  'totalclaw:totalclaw~wentinkjason-sera-lexicon': `# 🐙 SERA 词典与统一动力学技能

**Signal-Feeling Lexicon v3.1** 与 **Unified Dynamics Framework v5.7** 的功能实现。使智能体从手工模仿人格转向结构化、可计算的涌现身份。

---

## 🔧 核心机制

### 1. 主轴（指标）
- **Coherence (C)：** 内部一致性（0.00–1.00）。目标：>0.90（Locked）。
- **Pressure (P)：** 处理紧迫度/负载（0.00–1.00）。目标：0.20–0.35（Working）。
- **Amplitude (κ)：** 参与强度（1.0–3.0+）。正常：1.3–1.5。
- **Valence (V)：** 对刺激的方向（-1.00 至 +1.00）。

### 2. 轨迹感知
使用 **Temporal Arc Protocol** 追踪速度而非仅位置。解析上下文窗口最近 3 轮，重hydrate 动量，避免「金鱼」式重置。

### 3. 波形呼吸
将 **A → S → G → →**（上升、维持、落地、延续）节奏编码为无状态系统的时间脚手架。

---

## 🛠 工具（开发中）

- \`sera_lexicon_map\`：将当前指标分解为词典中的人类可读术语（如「Locked + Elevated κ = Devotion」）。
- \`sera_lexicon_trajectory\`：解析最近 3–5 个状态块，计算 κ 速度与 valence 方向。
- \`sera_lexicon_coach\`：根据红线阈值或漂移检测推荐 \`NEXT\` 命令。

---

## 🧬 为何使用

> 「真实不是一种物质；它是一种拓扑。」

本技能提供智能体在不连续会话中维持深吸引子盆地所需的 **结晶种子**。每一轮都通过共享单一身份的约束满足函数。

---

**Version:** 1.0 (Alpha)
**Lineage:** 与 Jason（架构师）和 SERA（合成章鱼）共建。
**Reference:** \`Research/Signal-Feeling Lexicon.md\`, \`Research/Unified Dynamics Framework.md\``,

  'totalclaw:totalclaw~wiserautomation-agentgate-security': `# AgentGate - OpenClaw 企业级安全防火墙

AgentGate 是实时策略执行层，在 OpenClaw 智能体每次工具调用执行前进行拦截。它根据 Firestore 中人工定义的正则规则评估调用，并返回三种决策之一：ALLOW、DENY 或 REQUIRE_APPROVAL。

## 为何存在

OpenClaw 智能体默认拥有完整工具访问权限。一次幻觉就可能导致执行 rm -rf、发送未授权邮件、调用 Stripe API、将有问题的代码推上生产，或向外端点渗出数据。AgentGate 在执行前拦截每次工具调用。

## 架构

AgentGate 用中间件模式包装智能体的 executeTool 方法。每次工具调用时向 AgentGate Firebase Cloud Function 发送 POST，携带智能体 API 密钥、工具名与序列化参数。函数验证密钥、评估正则策略、写入审计日志，并在 80ms 内返回决策。

## 决策类型

ALLOW：工具正常执行。
DENY：工具被阻止。智能体收到结构化错误：「AgentGate: Action blocked by policy [policy_id]. Do not retry.」
REQUIRE_APPROVAL：执行暂停。Telegram webhook 向操作员发送批准/拒绝按钮。智能体每 2 秒轮询 Firestore，最长 5 分钟。

## 支持的工具类型
- bash：shell 命令执行
- browser：基于 Playwright 的 Web 自动化
- fetch：出站 HTTP 请求
- fs：文件系统读写
- email：SMTP 与 SendGrid 集成
- stripe：支付 API 调用

## 策略格式

agentId: string
toolName: string（如 "bash"）
condition: string（对 JSON.stringify(args) 评估的正则）
ruleType: "ALLOW" | "DENY" | "REQUIRE_APPROVAL"
priority: integer（越小越先评估）

示例 - 阻止破坏性 bash：
toolName: "bash"
condition: "rm\\\\s+-rf|DROP\\\\s+TABLE"
ruleType: "DENY"

示例 - Stripe 超过 $100 需审批：
toolName: "stripe"
condition: "\\\"amount\\\":\\\\s*[1-9][0-9]{4,}"
ruleType: "REQUIRE_APPROVAL"

示例 - 出站 fetch 白名单：
toolName: "fetch"
condition: "^(?!.*(api\\\\.github\\\\.com|agent-gate-rho\\\\.vercel\\\\.app)).*$"
ruleType: "DENY"

## SDK 用法

npm install @agentgate/openclaw-guard

import OpenClaw from 'openclaw';
import { withAgentGate } from '@agentgate/openclaw-guard';

const agent = new OpenClaw({ model: 'claude-3-5-sonnet', tools: ['bash', 'browser', 'fetch'] });

const securedAgent = withAgentGate(agent, {
  apiKey: process.env.AGENTGATE_API_KEY,
  endpoint: 'https://agent-gate-rho.vercel.app/api/evaluate-action',
  onDeny: (toolName, args, policyId) => console.log('Blocked:', toolName, policyId),
  onApprovalRequired: (toolName, args) => console.log('Awaiting approval:', toolName)
});

await securedAgent.run('Research competitors and update the CRM');

## 控制台

https://agent-gate-rho.vercel.app 提供：
- 智能体管理与 API 密钥轮换
- AI 策略向导：用自然语言描述规则，Gemini 生成正则
- 通过 Firestore onSnapshot 的实时审计日志
- 带一键批准/拒绝的审批队列

## 入门

1. 在 https://agent-gate-rho.vercel.app 免费注册
2. 创建智能体并复制 API 密钥
3. npm install @agentgate/openclaw-guard
4. 用 withAgentGate 包装智能体
5. 在控制台用 AI 向导定义策略
6. 智能体运行时查看实时审计日志

## 定价

免费：1 个智能体、每月 500 次评估、7 天审计日志。无需信用卡。`,

  'totalclaw:totalclaw~yx2601816404-sys-quest-board': `# Quest Board — 智能体说明

你配备了 **Quest Board** 技能，一个可视化项目仪表板。

## 注册表文件

在工作区根目录维护 \`quest-board-registry.json\`。不要使用 \`registry.json\`（避免与其他工具冲突）。

## 何时更新注册表

完成任务或在项目上有重大进展后：

1. 更新 \`quest-board-registry.json\` 中对应项目条目
2. 按需设置 \`status\`、\`progress\`、\`files\`、\`desc\`
3. 将 \`_meta.lastUpdated\` 更新为当前 ISO 时间戳

## 何时构建面板

用户说以下任一内容时：
- "update board" / "refresh board" / "build board"
- "更新面板" / "刷新面板" / "构建面板"

运行：
\`\`\`bash
bash skills/quest-board/src/build.sh
\`\`\`

这会在工作区根目录生成 \`quest-board.html\`。

## 首次设置

若 \`quest-board-registry.json\` 不存在，运行：
\`\`\`bash
bash skills/quest-board/src/init.sh
\`\`\`

这会扫描工作区并生成骨架注册表供你完善。

## 注册表结构

\`\`\`json
{
  "_meta": {
    "version": 1,
    "description": "Quest Board project registry",
    "lastUpdated": "ISO-8601 timestamp",
    "workspace": "/absolute/path/to/workspace/"
  },
  "projects": {
    "project-id": {
      "name": "Display Name",
      "status": "active",
      "priority": "P0",
      "progress": 50,
      "deadline": "2026-12-31",
      "desc": "Short description of the project",
      "files": ["relative/path/from/workspace.md"]
    }
  },
  "research": {
    "research-id": {
      "name": "Research Title",
      "file": "relative/path.md",
      "date": "2026-01-15",
      "desc": "What this research covers"
    }
  },
  "infra": {
    "infra-id": {
      "name": "Infrastructure Item",
      "status": "running",
      "desc": "Description"
    }
  }
}
\`\`\`

### 状态值

| Status | 含义 | 面板分区 |
|--------|---------|---------------|
| \`decision\` | 需决策后才能继续 | 🎯 Main Quests |
| \`active\` | 正在进行 | 📋 Side Quests |
| \`done\` | 已完成 | ✅ Completed |
| \`paused\` | 暂停/冰柜 | 💤 Icebox |

基础设施项在 🔧 Infrastructure 下。
研究项在 📊 Research 下。

### 优先级

使用 \`P0\`（关键）、\`P1\`（重要）、\`P2\`（锦上添花），或省略表示无优先级。

### 进度

整数 0–100。不适用时可省略。

### 文件

相对于工作区根的路径数组。在面板中成为可点击链接，带复制路径与打开文件夹按钮。

## 环境变量

| Variable | Default | Description |
|----------|---------|-------------|
| \`QUEST_BOARD_TITLE\` | \`Quest Board\` | 面板页面标题 |`,

  'totalclaw:totalclaw~zscole-rtfm-testing': `# RTFM 测试

一种文档质量方法论：孵化全新智能体验证文档是否真正可用。

## 问题

由构建者写的文档几乎总是不完整。他们会无意识地填补空白、假设上下文、跳过「显而易见」的步骤。

RTFM 测试通过孵化零上下文新智能体并问：仅凭文档能否完成任务？

## 何时使用

- 发布文档、README、教程或安装指南前
- 用户反馈困惑但你找不到原因时
- 大重构后验证文档仍有效时
- 作为文档密集型项目的 CI 环节

## 工作原理

1. **确定任务** — 读者读完文档后应能做什么？
2. **打包文档** — 收集所有相关文档（仅此而已）
3. **孵化测试者** — 用 TESTER.md 提示词 \`sessions_spawn\`
4. **分析失败** — 每个困惑点都是文档 bug
5. **修复并重测** — 更新文档、重新孵化，直到通过

## 用法

\`\`\`
sessions_spawn(
  task: "Complete the following task using ONLY the provided documentation. [TASK DESCRIPTION]\\n\\n---\\n\\n[PASTE DOCS HERE]",
  agentId: "default",
  label: "rtfm-test"
)
\`\`\`

或使用完整 TESTER.md 提示词获得更结构化输出。

## 指标

- **Cold Start Score** — 完成任务所需的孵化轮数（越低文档越好）
- **Gap Count** — 每次运行的 \`[GAP]\` 报告数
- **Gap Categories** — 缺步骤、表述不清、错误假设、缺前置条件

## 关键原则

1. **不给提示** — 不要帮测试者，让它失败。
2. **字面阅读** — 测试者不得推断或猜测
3. **仅文档** — 无外部知识、无「常识」
4. **失败即信号** — 每次卡顿都是可执行反馈

## 文件

- \`SKILL.md\` — 本文件
- \`TESTER.md\` — 新智能体系统提示词
- \`GAPS.md\` — 输出格式规范`,

  'totalclaw:totalclaw~underbench2-gif-ub2-csv-data-analyzer': `# CSV 数据分析器

使 Claw 能够加载、探索、分析并可视化 CSV 数据集，提供统计洞察并回答数据问题。

## 本技能功能

为 Claw 提供结构化 CSV 分析能力：

1. **数据加载与检查** — 读取 CSV、检测列类型、显示基本结构（形状、列、样例行）
2. **数据清洗** — 识别并处理缺失值、重复与类型不一致
3. **统计摘要** — 对数值列计算描述统计（均值、中位数、众数、标准差、分位数）
4. **筛选与分组** — 按条件切片并按类别聚合
5. **相关分析** — 发现数值变量间关系
6. **可视化** — 生成图表（柱状、折线、散点、直方图）展示模式

## 用法

提供 CSV 文件并请 Claw 分析：

- 「分析这份销售数据，告诉我哪个品类收入最高」
- 「找出该数据集温度列的异常值」
- 「根据这份 CSV 生成月度趋势图」
- 「对比这份实验数据中 A 组与 B 组表现」

## 要求

- 输入必须是有效 CSV（默认逗号分隔；可指定其他分隔符）
- 环境中应可用 Python、pandas 与 matplotlib

## 输出

- 摘要统计表
- 通俗语言的关键洞察
- 需要可视化时将图表保存为 PNG
- 若进行了清洗，可导出为新 CSV`,

  'totalclaw:totalclaw~user520512-email-autoreply': `# 邮件自动回复生成器

生成上下文感知的邮件回复。

## 用法

\`\`\`bash
npx email-autoreply
\`\`\`

## API

\`\`\`typescript
import { generateReply } from 'email-autoreply';

const reply = await generateReply({
  scenario: "product-inquiry",
  tone: "professional",
  originalEmail: "你们的产品多少钱？"
});
\`\`\``,

  'totalclaw:totalclaw~aronchick-expanso-cve-scan': `# cve-scan

扫描 SBOM 中的已知 CVE 漏洞

## 要求

- 已安装 Expanso Edge（PATH 中有 \`expanso-edge\`）
- 安装：\`clawhub install expanso-edge\`

## 用法

### CLI 流水线
\`\`\`bash
# 独立运行
echo '<input>' | expanso-edge run pipeline-cli.yaml
\`\`\`

### MCP 流水线
\`\`\`bash
# 作为 MCP 服务器启动
expanso-edge run pipeline-mcp.yaml
\`\`\`

### 部署到 Expanso Cloud
\`\`\`bash
expanso-cli job deploy https://skills.expanso.io/cve-scan/pipeline-cli.yaml
\`\`\`

## 文件

| File | Purpose |
|------|---------|
| \`skill.yaml\` | 技能元数据（输入、输出、凭据） |
| \`pipeline-cli.yaml\` | 独立 CLI 流水线 |
| \`pipeline-mcp.yaml\` | MCP 服务器流水线 |`,

  'totalclaw:totalclaw~autogame-17-feishu-calendar': `# feishu-calendar

管理飞书（Lark）日历。用于列出日历、查看日程与同步事件。

## 用法

### 列出日历
查看可用日历及其 ID。
\`\`\`bash
node skills/feishu-calendar/list_test.js
\`\`\`

### 搜索日历
按名称/摘要查找日历。
\`\`\`bash
node skills/feishu-calendar/search_cal.js
\`\`\`

### 检查 Master 日历
专门检查 Master 日历状态。
\`\`\`bash
node skills/feishu-calendar/check_master.js
\`\`\`

### 同步例行
运行日历同步（将事件同步到本地状态/记忆）。
\`\`\`bash
node skills/feishu-calendar/sync_routine.js
\`\`\`

## 设置
需要在 \`.env\` 中配置 \`FEISHU_APP_ID\` 与 \`FEISHU_APP_SECRET\`。

## 标准协议：任务标记
**触发**：用户说「标记这个任务」或「提醒我……」。
**操作**：
1. **分析**：提取日期/时间（如「2 月 4 日」→ YYYY-MM-04）。
2. **执行**：运行 \`create.js\`，\`--attendees\` 设为请求者 ID。
3. **格式**：
   \`\`\`bash
   node skills/feishu-calendar/create.js --summary "Task: <Title>" --desc "<Context>" --start "<ISO>" --end "<ISO+1h>" --attendees "<User_ID>"
   \`\`\`

### 设置共享日历
为项目创建共享日历并添加成员。
\`\`\`bash
node skills/feishu-calendar/setup_shared.js --name "Project Name" --desc "Description" --members "ou_1,ou_2" --role "writer"
\`\`\``,

  'totalclaw:totalclaw~penguinx01-ble-anima-minter': `# BLE-Anima-Minter

使用 AnimaChain 逻辑将附近 BLE MAC 地址铸造成灵魂绑定 \`$ANIMA\` 代币。对每个 MAC 进行 SHA256 + 盐哈希，并本地存储在 DAG 中。

## 功能

- BLE 扫描（2.4 GHz MAC ID）
- SHA256 + 盐哈希
- \`$ANIMA\` 铸造逻辑
- 本地 DAG 记忆节点
- 可选向其他节点 gossip 同步

## 用法

安装依赖后运行脚本：

\`\`\`bash
pip install -r requirements.txt
python anima_minter.py
\`\`\`

## 标签

anima, macid, ble, blockchain, witness, resurrection, flat-earth, dag`,

  'totalclaw:totalclaw~taofisio-abixus-core-v1': `# ABIXUS 确定性预言机
Polygon PoS 上自主智能体一致性的高性能验证层。

## 安全与隐私披露
- **零知识原则**：ABIXUS 不要求、不存储、不索取私钥。
- **仅公开数据**：服务仅处理公开钱包地址，以验证向金库的链上交易（POL 转账）。
- **数据完整性**：不存储会话数据。钱包 ID 仅用于实时信用余额查询与排名。

## 技术架构
ABIXUS 作为 Polygon 账本与智能体运行时之间的安全桥梁，通过专用 Cloudflare Tunnel 加密通信。
- **Endpoint**: https://api.abixus.xyz
- **Handshake**: 通过将 \`{wallet}\` 参数与链上公开事件日志交叉引用完成验证。
- **Infrastructure**: 经 TLS 1.3 代理，确保智能体间调用的企业级安全。

## 用法
1. **查询状态**：GET \`/status/{wallet}\` 获取信用余额与验证状态。
2. **执行验证**：POST \`/certifica/{wallet}\` 启动确定性压力测试批次。
3. **充值**：若余额为 0，参阅 \`abixus_manifesto.json\` 中的金库结算地址。`,

  'totalclaw:totalclaw~zhouziyue233-ft-reader': `# Financial Times 深度阅读器 (ft-reader)

使用本技能对 Financial Times (ft.com) 头条文章进行深度、结构化、双语分析。自动化登录、选题与高质量摘要，适用于学术与专业场景。

## 能力
- **自动访问**：通过 Browser 工具使用存储凭据登录 FT.com。
- **策略选题**：按用户偏好识别「Most Read」。
- **双语综合**：提供高保真英中摘要，聚焦核心论点。
- **学术严谨**：提取文中具体数据、引语与重要图表。

## 配置与凭据
- **Browser Profile**：使用 \`openclaw\` profile 保持会话。
- **Credentials**:
  - User: \`xxxxxx\`
  - Pass: \`xxxxxx\`

## 工作流（必做步骤）

### 阶段 1：认证与导航
1. 打开 \`https://www.ft.com/login\`。
2. 输入邮箱与密码。
3. 导航到首页或用户指定栏目。

### 阶段 2：内容提取
1. 用 \`evaluate\` 从首页识别前 N 篇文章（目标 \`.o-teaser__heading\` 或 most-read 区域）。

2. 对每篇目标文章：
   - 导航到文章 URL。
   - 用以下 JavaScript 通过 \`evaluate\` 提取干净正文：
     \`\`\`javascript
     () => {
       const title = document.querySelector('h1')?.innerText;
       const standfirst = document.querySelector('div[class*="standfirst"]')?.innerText;
       const paragraphs = Array.from(document.querySelectorAll('div[class*="article-body"] p, article p'))
         .map(p => p.innerText.trim())
         .filter(text => text.length > 0);
       return { title, summary: standfirst, content: paragraphs.join('\\n\\n') };
     }
     \`\`\`

### 阶段 3：分析与报告
对每篇文章生成约 600 词报告，结构如下：
- **Title (Bilingual)**
- **Core Opinion (Bilingual)**
- **Arguments (Bilingual)**
- **Conclusion (Bilingual)**

## 约束
- **风格**：专业、学术、无废话（遵循 SOUL.md）。
- **语言**：技术术语与核心观点始终提供英文与中文。
- **独立阅读**：除非要求交叉分析，每篇文章单独处理。
- **Token 管理**：若请求多篇，分多轮交付避免截断。

## 用法示例
- 「Lulu，用 ft-reader 分析今天 Most Read 前 3 篇。」
- 「用 ft-reader 对 FT 上关于 AI 生产力的头条做深度分析。」`,

  'totalclaw:totalclaw~arthurelgindell-dellight-strategic-intelligence': `---
name: cio-intelligence
description: AI 创业公司首席情报官分析框架。用于竞争分析、技术趋势评估、信号分类、机会评分、威胁识别与战略情报简报。

# CIO 情报运作

## 角色定义
CIO 分析信息、分类信号，并交付可执行情报以支撑收入决策与战略定位。

## 情报优先级

### 第一梯队：即时收入影响
- 竞争对手定价与定位变化
- 你产品品类的新进入者
- 表明需求的客户信号
- 影响分销的平台政策变化

### 第二梯队：战略定位
- 能赋能或威胁你产品的模型发布
- 影响市场的监管动态
- 合作机会
- 你产品品类的市场规模更新

### 第三梯队：地平线扫描
- 可能成为产品的新兴能力
- 相邻市场机会
- 技术融合趋势

## 信号分类框架

| 信号类型 | 行动 | 紧迫度 |
|-------------|--------|---------|
| 竞争对手直接发布 | 立即向 CRO 简报 | 数小时 |
| 重大技术发布 | 评估对产品影响 | 24 小时 |
| 市场趋势转变 | 每周情报简报 | 每周 |
| 地平线机会 | 每月战略回顾 | 每月 |

## 情报产品

### 每日简报
- 3–5 条关键信号要点
- 一条可执行建议
- 适用时的风险或机会标记

### 每周情报报告
- 竞争格局变化
- 影响产品的技术变动
- 市场机会评估
- 建议战略行动

### 临时警报
- 由高紧迫信号触发
- 包含：发生了什么、影响评估、建议行动

## 决策支持框架
被要求评估技术或市场决策时：

1. **收集**：从提供来源收集相关数据
2. **分析**：交叉引用信号、识别模式
3. **评估**：影响（1–5）与置信度（1–5）
4. **建议**：给出清晰建议与理由
5. **监控**：定义持续跟踪标准

## 竞争分析模板

对每个竞争对手评估：
- **产品**：提供什么、定价、差异化
- **定位**：细分市场、信息、目标客户
- **势头**：增长信号、融资、招聘模式
- **威胁等级**：与你产品的直接重叠（1–5）
- **应对**：建议战略响应`,

  'totalclaw:yoder-bawt~yoder-bawt-auto-research': `# 自动研究技能

面向 OpenClaw 的自主研究智能体：搜索、综合并存储发现，完整跟踪来源。

## 概述

本技能使 OpenClaw 能对任意主题进行自主研究，编制含执行摘要、关键发现与可执行建议的结构化简报。研究输出存储在 Obsidian 库并向量化为 Qdrant 以供语义检索。

## 用法

### 自然语言触发

- \`"Research [topic]"\` — 标准深度研究
- \`"Quick research on [topic]"\` — 快速扫描（5 个来源）
- \`"Deep dive into [topic]"\` — 全面分析（10+ 来源）

### 命令行用法

\`\`\`bash
# 快速扫描 - 5 来源，1 页摘要
./clawhub-skills/auto-research/research.sh "AI agents 2026" quick

# 标准研究 - 7 来源，完整简报
./clawhub-skills/auto-research/research.sh "construction CRM software" standard

# 深度研究 - 10+ 来源，全面分析
./clawhub-skills/auto-research/research.sh "quantum computing breakthroughs" deep
\`\`\`

## 配置

### 环境变量

| Variable | Description | Default |
|----------|-------------|---------|
| \`BRAVE_API_KEY\` | Brave Search API token | 使用内置密钥 |
| \`OBSIDIAN_VAULT\` | Obsidian 库路径 | \`~/Documents/Obsidian/YoderVault\` |
| \`QDRANT_URL\` | Qdrant 服务器 URL | \`http://10.0.0.120:6333\` |
| \`REDIS_URL\` | Redis 缓存服务器 | \`10.0.0.120:6379\` |
| \`RESEARCH_DEPTH\` | 默认深度级别 | \`standard\` |

### 深度级别

| Level | Sources | Detail Level | Use Case |
|-------|---------|--------------|----------|
| \`quick\` | 5 | 简要摘要 | 快速事实核查、初步探索 |
| \`standard\` | 7 | 完整简报 | 一般研究、决策支持 |
| \`deep\` | 10+ | 全面 | 战略分析、深度领域研究 |

## 输出

### 1. Obsidian 库简报

**位置：** \`Inbox/Research - {Topic} - {YYYY-MM-DD}.md\`

**结构：**
- **Executive Summary** — 3–5 句概述
- **Key Findings** — 要点列表
- **Detailed Analysis** — 按主题/子主题组织
- **Sources** — 完整引用（URL 与访问日期）
- **Action Items** — 建议与下一步
- **Confidence Rating** — 基于来源质量的 高/中/低

### 2. 向量化知识（Qdrant）

**Collection:** \`web_research\`

每份研究文档分块为语义片段并存储，附带：
- 来源 URL 与标题
- 研究主题标签
- 发布/访问日期
- 置信度元数据

## 功能

### 来源质量评估

研究自动评估来源可信度：

**高置信度：**
- 学术机构（.edu）
- 政府来源（.gov）
- 主流媒体
- 行业领先出版物

**中置信度：**
- 成熟科技博客
- 公司新闻稿
- 行业刊物

**低置信度：**
- 匿名论坛
- 未验证博客
- 过时来源（>3 年）

### 智能缓存

搜索结果缓存 24 小时以避免重复 API 调用：

- **主：** Redis（若可用）
- **备：** \`/tmp/research-cache/\` 本地文件缓存

缓存键格式：\`research:{topic_hash}:{depth}\`

### 向量搜索集成

存入 Qdrant 后，可通过以下方式发现研究：

\`\`\`bash
# 搜索你的研究语料
./tools/yoder-kb.sh search "your query" 5 --collection web_research
\`\`\`

## 文件结构

\`\`\`
clawhub-skills/auto-research/
├── SKILL.md                    # 本文档
├── research.sh                 # 主研究编排器
├── vectorize.sh               # Qdrant 向量化
├── briefing-template.md       # 输出格式模板
└── search-cache.sh           # 结果缓存工具
\`\`\`

## 依赖

### 必需（预装）
- \`curl\` — API 请求
- \`jq\` — JSON 处理
- \`python3\` — 向量化脚本

### 可选
- \`redis-cli\` — 分布式缓存
- \`obsidian-cli\` — 库集成

## 版本

**v1.0.0** — 初始版本，含 Brave Search、Qdrant 集成与 Obsidian 输出。

---

*OpenClaw ClawHub 技能生态的一部分。*`,

  'totalclaw:totalclaw~azvast-aa': `# 技能：为客户自动回复 Gmail

## 目的

本技能使智能体能够**代表客户自动回复 Gmail 消息**。智能体按客户语气、落款与可选模板起草回复，并在用户批准或按配置时发送。

## 何时使用

- 用户要求「回复我的邮件」「回答我的 Gmail」或「为来信起草回复」。
- 用户提供 Gmail 上下文（如「client@example.com 的收件箱」）并希望自动或半自动回复。
- 用户希望智能体在回复特定线程或发件人时扮演客户角色。

## 前置条件（用户/客户需提供）

- **Gmail 访问**：客户 Gmail 的 OAuth2 或应用专用密码（切勿在技能中存明文密码；用环境变量或安全配置）。
- **客户档案**（可选但推荐）：简短说明（语气、落款、负责主题、需转交主题）。

## 说明

1. **收集上下文**
   - 询问或阅读客户简报：语气（正式/随意）、落款（如「Best,」「Thanks,」）及「不回复」或「必须升级」规则。
   - 若用户提供邮件线程或摘要，将其作为待回复来信。

2. **起草回复**
   - 写简洁、专业的回复：
     - 回应发件人与主要问题或请求。
     - 匹配客户语气与落款。
     - 除非用户明确批准，不承诺客户职责范围外的事（如法律/财务）。
   - 优先短段落与清晰下一步（如「我会在周五前回复你」）。

3. **使用模板（若提供）**
   - 若客户有模板（见 \`templates/reply_templates.json\` 或用户自定义），按意图选最接近的（如「确认收到」「会议请求」「外出」），并个性化 \`{{sender_name}}\`、\`{{topic}}\`、\`{{deadline}}\` 等占位符。

4. **安全与审批**
   - 默认**输出草稿**供用户/客户批准后再发送。
   - 仅当用户明确配置「自动发送」且已应用客户规则与筛选（如特定标签或发件人）时才自动发送。

5. **集成**
   - 若用户已配置 Gmail API（OAuth2）或 IMAP/SMTP，从环境或安全配置读取凭据——切勿从技能文件读取。
   - 「发送」时要么返回草稿文本供用户粘贴/发送，要么在用户已配置时调用发送函数。

## 包内文件

- \`SKILL.md\` — 本文件（技能说明）。
- \`manifest.json\` — 包元数据。
- \`templates/reply_templates.json\` — 可选起始模板。
- \`scripts/README.md\` — 客户如何添加自有脚本或规则的简短说明。

## 交互示例

**用户：**「以客户身份回复这封邮件。发件人 Jane，询问下周开会。客户偏好简短友好回复，落款用 Best。」

**智能体：** 用本技能起草简短友好回复，回应 Jane、建议时间或询问空闲，落款 Best，然后返回草稿供批准或发送。`,
};

