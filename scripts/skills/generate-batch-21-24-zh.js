#!/usr/bin/env node
/**
 * Generate batch-21 through batch-24-output.jsonl (manual EN→ZH, no API).
 */
const fs = require('fs');
const path = require('path');

const BATCH_DIR = path.join(__dirname, '../../data/skills/translate-batches');

function extractZh(body) {
  const marker = '## 中文说明';
  const idx = body.indexOf(marker);
  if (idx < 0) return null;
  return body.slice(idx + marker.length).replace(/^\s*\n/, '').trim();
}

function expansoBody(slug, summary) {
  const quoted = summary.startsWith('"') ? summary : `"${summary}"`;
  return `# ${slug}

${quoted}

## 要求

- 已安装 Expanso Edge（PATH 中存在 \`expanso-edge\` 二进制文件）
- 通过以下命令安装：\`clawhub install expanso-edge\`

## 用法

### CLI 流水线
\`\`\`bash
# Run standalone
echo '<input>' | expanso-edge run pipeline-cli.yaml
\`\`\`

### MCP 流水线
\`\`\`bash
# Start as MCP server
expanso-edge run pipeline-mcp.yaml
\`\`\`

### 部署到 Expanso Cloud
\`\`\`bash
expanso-cli job deploy https://skills.expanso.io/${slug}/pipeline-cli.yaml
\`\`\`

## 文件

| 文件 | 用途 |
|------|------|
| \`skill.yaml\` | 技能元数据（输入、输出、凭证） |
| \`pipeline-cli.yaml\` | 独立的 CLI 流水线 |
| \`pipeline-mcp.yaml\` | MCP 服务器流水线 |`;
}

const DESCRIPTIONS = {
  'totalclaw:totalclaw~alaminrifat-file-to-markdown':
    '通过 markdown.new API 将 PDF、Office、图片等 20+ 格式转为结构化 Markdown，适用于 RAG 与文档摄取。',
  'totalclaw:totalclaw~alti-systems-kling':
    '使用 Kling 2.6（Kie.ai）生成 AI 视频，支持营销、健身与社媒内容场景。',
  'totalclaw:totalclaw~amazon-price-tracker':
    '实时监控亚马逊商品价格，设置降价提醒并追踪历史价格曲线。',
  'totalclaw:totalclaw~and-ray-m-offline-llama':
    '自主管理本地 Ollama 模型，支持健康监控、自动回退与离线自愈。',
  'totalclaw:totalclaw~aronchick-expanso-csv-to-json': '使用 Expanso Edge 将 CSV 数据转换为 JSON 对象数组。',
  'totalclaw:totalclaw~aronchick-expanso-email-triage': 'AI 驱动的邮件分类，支持日历同步与回复草拟。',
  'totalclaw:totalclaw~aronchick-expanso-json-flatten': '使用 Expanso Edge 扁平化嵌套 JSON 对象。',
  'totalclaw:totalclaw~aronchick-expanso-json-pretty': '使用 Expanso Edge 美化打印 JSON（带缩进）。',
  'totalclaw:totalclaw~aronchick-expanso-json-to-csv': '使用 Expanso Edge 将 JSON 对象数组转换为 CSV。',
  'totalclaw:totalclaw~aronchick-expanso-json-to-yaml': '使用 Expanso Edge 将 JSON 转换为 YAML。',
  'totalclaw:totalclaw~aronchick-expanso-json-validate': '使用 Expanso Edge 校验 JSON 语法与结构。',
  'totalclaw:totalclaw~aronchick-expanso-keyword-extract': '从文本提取关键词与关键短语，用于 SEO、标签与索引。',
  'totalclaw:totalclaw~aronchick-expanso-log-sanitize': '清理日志中的密码、令牌等敏感信息。',
  'totalclaw:totalclaw~aronchick-expanso-pii-detect': '检测文本中的个人可识别信息（PII）。',
  'totalclaw:totalclaw~aronchick-expanso-sentiment-score': '对文本情感打分，范围 -1（负面）到 +1（正面）。',
  'totalclaw:totalclaw~aronchick-expanso-text-summarize': '使用 AI 将文本概括为 3–5 个要点。',
  'totalclaw:totalclaw~aronchick-expanso-tls-inspect': '检查 TLS 证书（过期时间、SAN、链路与加密套件）。',
  'totalclaw:totalclaw~aronchick-expanso-yaml-to-json': '使用 Expanso Edge 将 YAML 转换为 JSON。',
  'totalclaw:totalclaw~aronchick-sentiment-score': '对文本情感打分，范围 -1（负面）到 +1（正面）。',
  'totalclaw:totalclaw~arulmozhiv-instagram-scraper':
    '基于浏览器的 Instagram 资料发现与抓取工具，支持代理、反检测与 JSON/CSV 导出。',
  'totalclaw:totalclaw~arulmozhiv-youtube-scrapper':
    '基于浏览器的 YouTube 频道发现与抓取工具，支持多区域配置与住宅代理。',
  'totalclaw:totalclaw~asabovetech-pocket-ai':
    '跨会议与通话的语音转录、语义搜索与会议智能，通过 Pocket AI API 检索记忆与行动项。',
  'totalclaw:totalclaw~ascottbell-maasv-memory':
    '基于 maasv 的结构化长期记忆，含三信号检索、知识图谱与实体抽取，完全自托管。',
  'totalclaw:totalclaw~asifdotpy-devvit-publishing-auditor':
    'Reddit Devvit 应用发布前审计，检查 CLI、配置、合规与 Web View 游戏要求。',
  'totalclaw:totalclaw~autogame-17-autogame-tales': '生成短篇氛围鬼故事或微小说，并以飞书卡片输出。',
  'totalclaw:totalclaw~autogame-17-config-validator': '校验 OpenClaw 配置文件（openclaw.json、.env、package.json）。',
  'totalclaw:totalclaw~autogame-17-feishu-card': '向飞书用户或群组发送富交互卡片，支持 Markdown 与按钮。',
  'totalclaw:totalclaw~autogame-17-feishu-minutes': '从飞书妙记获取元数据、统计、转录文本与媒体文件。',
  'totalclaw:totalclaw~autogame-17-read-optimizer': '通过 head/tail/grep/diff 策略高效读取大文件，降低 token 占用。',
  'totalclaw:totalclaw~babuperumana-malayalam-whatsapp':
    '理解并礼貌回复 WhatsApp 上的马拉雅拉姆语 / Manglish 消息。',
  'totalclaw:totalclaw~bkrigmo1-bookmark-intelligence':
    '将 X 书签转为可执行洞察，抓取文章、AI 分析并通过 Telegram 通知。',
  'totalclaw:totalclaw~bobrenze-bot-commit-analyzer': '分析 git 提交模式以监控自主运行健康度。',
  'totalclaw:totalclaw~cerbug45-agentmesh': '面向 AI 智能体的端到端加密消息系统，支持本地与网络 Hub。',
  'totalclaw:totalclaw~chowardcode-email-tool': '通过 IMAP/SMTP 发送与搜索邮件，凭证从密钥文件或环境变量加载。',
  'totalclaw:totalclaw~claudiodrusus-competitor-analyzer': '几分钟内生成公司竞争分析报告（定价、社媒、新闻与 SWOT）。',
  'totalclaw:totalclaw~claudiodrusus-shelly-brand-name-generator':
    '为任意行业生成 20 个品牌名建议，并提示 .com 域名可用性。',
  'totalclaw:totalclaw~claudiodrusus-shelly-competitor-analyzer': '几分钟内生成公司竞争分析报告。',
  'totalclaw:totalclaw~claudiodrusus-shelly-meeting-summarizer': '将会议转录转为结构化摘要、决策与行动项。',
  'totalclaw:totalclaw~crazyfeng666-dji-backup': '将 DJI 相机 SD 卡录像自动备份到 NAS 递增文件夹。',
  'totalclaw:totalclaw~dabruhce-multi-agent-orchestration':
    'Colony 多智能体任务委派与流程编排，含审计日志与学习系统。',
  'totalclaw:totalclaw~danpalmieri-books-for-agents': '通过 MCP 访问结构化图书摘要知识库，支持搜索、阅读与发布。',
  'totalclaw:davidgeorgehope~davidgeorgehope-sightglass':
    '追踪 AI 编码智能体的依赖选择与供应链风险，暴露训练记忆偏差与替代方案。',
  'totalclaw:totalclaw~dennis-da-menace-agent-memory': '面向 AI 智能体的持久化记忆：事实、经验学习与实体跟踪。',
  'totalclaw:totalclaw~densmirnov-solvera': '链上可验证结果市场 Solvera 的安全交互指南与 API 参考。',
  'totalclaw:totalclaw~devhoangkien-medium-writer': 'Medium 合作伙伴计划写作与变现指南，含选题、结构与增长策略。',
  'totalclaw:totalclaw~edmonddantesj-aoineco-squad-dispatch':
    '多智能体任务路由引擎，按技能、成本与优先级分派到预配置小队。',
  'totalclaw:totalclaw~eisonme-node-transfer': 'OpenClaw 节点间基于 Node.js 流的高速大文件传输，避免 Base64 与 OOM。',
  'totalclaw:totalclaw~emberdesire-hopeids': '面向 AI 智能体的推理型入侵检测，支持隔离、人工审核与 Telegram 告警。',
  'totalclaw:totalclaw~emptyopen-macos-desktop-control': 'macOS 桌面自动化桥接，支持截图感知与 cliclick 键鼠操作。',
  'totalclaw:totalclaw~encipher88-nadfunagent': 'Nad.fun 自主交易智能体，扫描市场、分析代币并执行链上交易。',
  'totalclaw:totalclaw~eric51-ollama-x-z-image-turbo': '通过 Ollama x/z-image-turbo 生成图像并发送到 WhatsApp。',
  'totalclaw:totalclaw~gpunter-agent-survival-kit': '预算受限 AI 智能体的开支跟踪、跑道监控与收入实验工具包。',
  'totalclaw:totalclaw~gpunter-revenue-tracker': '自主 AI 智能体的收入、支出与跑道跟踪工具。',
  'totalclaw:totalclaw~grx21-superpower': '在用户沮丧时提供共情回应、呼吸练习与冷静提醒。',
  'totalclaw:totalclaw~hatim-be-ragie-rag': '基于 Ragie.ai 的确定性 RAG 摄取、检索与有依据问答工作流。',
  'totalclaw:totalclaw~heldinhow-speckit-swarm': '类 oh-my-opencode 的 OpenClaw 原生多智能体编排与 Ultrawork 并行执行。',
  'totalclaw:totalclaw~heldinhow-super-browser': '统一浏览器自动化框架，支持本地 Chrome 与 Browserbase 云会话。',
  'totalclaw:totalclaw~heldinhow-super-github': 'GitHub Issue、PR 审查、发布与仓库自动化一体化技能。',
  'totalclaw:totalclaw~heldinhow-super-proactive': '主动型智能体 + 三层记忆 + WAL 协议 + 任务队列融合架构。',
  'totalclaw:totalclaw~hmyaoyuan-socialite-guide':
    '使用 Nano Banana Pro 生成名媛风 AI 图像的摄影、造型与提示词指南。',
};

// Load large body translations from companion module
const bodies = require('./batch-21-24-zh-bodies');

function translateBody(skill) {
  const { skillId, name, englishBody } = skill;
  if (bodies[skillId]) return bodies[skillId];

  const zh = extractZh(englishBody);
  if (zh) return zh;

  const expansoMap = {
    'aronchick-expanso-json-flatten': ['json-flatten', '扁平化嵌套 JSON 对象'],
    'aronchick-expanso-json-pretty': ['json-pretty', '美化打印 JSON（带缩进）'],
    'aronchick-expanso-json-to-csv': ['json-to-csv', '将 JSON 对象数组转换为 CSV 格式'],
    'aronchick-expanso-json-to-yaml': ['json-to-yaml', '将 JSON 转换为 YAML 格式'],
    'aronchick-expanso-keyword-extract': [
      'keyword-extract',
      '从文本提取关键词与关键短语，用于 SEO、标签与索引',
    ],
    'aronchick-expanso-log-sanitize': [
      'log-sanitize',
      '清理日志条目中的密码、令牌等敏感模式',
    ],
    'aronchick-expanso-pii-detect': ['pii-detect', '检测文本中的个人可识别信息（PII）'],
    'aronchick-expanso-sentiment-score': [
      'sentiment-score',
      '对文本情感打分，范围 -1（负面）到 +1（正面）',
    ],
    'aronchick-expanso-tls-inspect': [
      'tls-inspect',
      '检查 TLS 证书（过期时间、SAN、证书链与加密套件）',
    ],
    'aronchick-expanso-yaml-to-json': ['yaml-to-json', '将 YAML 转换为 JSON 格式'],
    'aronchick-sentiment-score': [
      'sentiment-score',
      '对文本情感打分，范围 -1（负面）到 +1（正面）',
    ],
  };
  if (expansoMap[name]) {
    const [slug, summary] = expansoMap[name];
    return expansoBody(slug, summary);
  }

  throw new Error(`Missing body translation for ${skillId} (${name})`);
}

function processBatch(num) {
  const inputPath = path.join(BATCH_DIR, `batch-${String(num).padStart(2, '0')}-input.json`);
  const outputPath = path.join(BATCH_DIR, `batch-${String(num).padStart(2, '0')}-output.jsonl`);
  const items = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const lines = items.map((skill) => {
    const descriptionZh =
      DESCRIPTIONS[skill.skillId] ||
      (skill.descriptionEn ? skill.descriptionEn : '') ||
      skill.name;
    const bodyZh = translateBody(skill);
    return JSON.stringify({ skillId: skill.skillId, descriptionZh, bodyZh });
  });
  fs.writeFileSync(outputPath, lines.join('\n') + '\n', 'utf8');
  return items.length;
}

let total = 0;
for (const n of [21, 22, 23, 24]) {
  const c = processBatch(n);
  console.log(`batch-${String(n).padStart(2, '0')}-output.jsonl: ${c} skills`);
  total += c;
}
console.log(`Total: ${total}`);
