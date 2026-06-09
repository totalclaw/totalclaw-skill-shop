'use strict';

/** Batch 25 manual body translations */
module.exports = {
  'totalclaw:totalclaw~idkwhodatis-ddgs': `# DDGS 网页搜索技能

本技能通过 DDGS（Dux Distributed Global Search）引擎实现网页搜索，聚合多种搜索服务以获取实时信息。

## 功能
🔍 隐私友好的元搜索  
📰 新闻搜索  
🖼️ 图片搜索  
📹 视频搜索  
📚 图书搜索  
🌐 免费使用，无需 API Key  
🔒 隐私保护，无用户追踪  
⚡ 支持 MCP（Model Context Protocol）与 API 服务器  

## 安装
\`\`\`bash
# 通过 uv 安装（推荐）
uv pip install ddgs

# 或通过 pip 安装
pip install ddgs
\`\`\`

## 快速开始

### 1. 文本搜索
最常用的搜索方式，返回网页结果：
\`\`\`python
python -c "
from ddgs import DDGS

query = 'your search query'

results = DDGS().text(
    query,
    region='wt-wt',        # 区域：cn-zh（中国）、us-en（美国）、wt-wt（全球）
    safesearch='moderate', # 安全搜索：on、moderate、off
    timelimit='m',         # 时间范围：d（天）、w（周）、m（月）、y（年）、None（不限）
    max_results=10,        # 最大结果数
    backend='auto'         # 后端：auto、duckduckgo、brave、bing 等
)

for i, r in enumerate(results, 1):
    print(f\\"{i}. {r.get('title')}\\")
    print(f\\"   URL: {r.get('href')}\\")
    print(f\\"   Snippet: {str(r.get('body'))[:100]}...\\n\\")
"
\`\`\`

### 2. 新闻搜索
搜索最新新闻：
\`\`\`python
python -c "
from ddgs import DDGS

results = DDGS().news(
    'AI technology',
    region='wt-wt',
    safesearch='moderate',
    timelimit='d',       # d=过去24小时，w=过去一周，m=过去一月
    max_results=10
)

for r in results:
    print(f\\"📰 {r.get('title')}\\")
    print(f\\"   Source: {r.get('source')}\\")
    print(f\\"   Date: {r.get('date')}\\")
    print(f\\"   Link: {r.get('url')}\\n\\")
"
\`\`\`

### 3. 图片搜索
\`\`\`python
python -c "
from ddgs import DDGS

results = DDGS().images(
    'cute cats',
    region='wt-wt',
    safesearch='moderate',
    size='Medium',       # Small、Medium、Large、Wallpaper
    type_image='photo',  # photo、clipart、gif、transparent、line
    layout='Square',     # Square、Tall、Wide
    max_results=10
)

for r in results:
    print(f\\"🖼️ {r.get('title')}\\")
    print(f\\"   Image: {r.get('image')}\\")
    print(f\\"   Thumbnail: {r.get('thumbnail')}\\")
    print(f\\"   Source: {r.get('source')}\\n\\")
"
\`\`\`

### 4. 视频搜索
\`\`\`python
python -c "
from ddgs import DDGS

results = DDGS().videos(
    'Python programming',
    region='wt-wt',
    safesearch='moderate',
    timelimit='w',       # d、w、m
    resolution='high',   # high、standard
    duration='medium',   # short、medium、long
    max_results=10
)

for r in results:
    print(f\\"📹 {r.get('title')}\\")
    print(f\\"   Duration: {r.get('duration', 'N/A')}\\")
    print(f\\"   Publisher: {r.get('publisher')}\\")
    print(f\\"   Link: {r.get('content')}\\n\\")
"
\`\`\`

### 5. 图书搜索
\`\`\`python
python -c "
from ddgs import DDGS

results = DDGS().books(
    'sea wolf jack london',
    max_results=5
)

for r in results:
    print(f\\"📚 {r.get('title')}\\")
    print(f\\"   Author: {r.get('author')}\\")
    print(f\\"   Publisher: {r.get('publisher')}\\")
    print(f\\"   Link: {r.get('link')}\\n\\")
"
\`\`\`

## 实用脚本

### 可复用搜索函数
\`\`\`python
python -c "
from ddgs import DDGS

def web_search(query, search_type='text', max_results=5, region='wt-wt', timelimit=None):
    '''
    执行 DDGS 搜索
    
    Args:
        query: 搜索关键词
        search_type: text、news、images、videos、books
        max_results: 最大结果数
        region: 区域（cn-zh、us-en、wt-wt）
        timelimit: 时间限制（d、w、m、y）
    '''
    ddgs = DDGS()
    if search_type == 'text':
        return list(ddgs.text(query, region=region, timelimit=timelimit, max_results=max_results))
    elif search_type == 'news':
        return list(ddgs.news(query, region=region, timelimit=timelimit, max_results=max_results))
    elif search_type == 'images':
        return list(ddgs.images(query, region=region, max_results=max_results))
    elif search_type == 'videos':
        return list(ddgs.videos(query, region=region, timelimit=timelimit, max_results=max_results))
    elif search_type == 'books':
        return list(ddgs.books(query, max_results=max_results))
    return []

results = web_search('Python 3.12 new features', max_results=5)
print(f'📊 Found {len(results)} results')
"
\`\`\`

## 参数说明

### 区域代码（region）
| 代码 | 区域 |
|---|---|
| cn-zh | 中国 |
| us-en | 美国 |
| uk-en | 英国 |
| jp-jp | 日本 |
| kr-kr | 韩国 |
| wt-wt | 全球（无区域限制） |

### 时间限制（timelimit）
| 值 | 含义 |
|---|---|
| d | 过去 24 小时 |
| w | 过去一周 |
| m | 过去一月 |
| y | 过去一年 |
| None | 无限制 |

### 安全搜索（safesearch）
| 值 | 含义 |
|---|---|
| on | 严格过滤 |
| moderate | 中等过滤（默认） |
| off | 关闭过滤 |

## 错误处理与代理

### 基本错误处理
\`\`\`python
python -c "
from ddgs import DDGS
from ddgs.exceptions import DDGSException

try:
    results = DDGS().text('test query', max_results=5)
    print(f'✅ Search successful, found {len(results)} results')
except DDGSException as e:
    print(f'❌ Search error: {e}')
except Exception as e:
    print(f'❌ Unknown error: {e}')
"
\`\`\`

### 使用代理
\`\`\`python
python -c "
from ddgs import DDGS

# 设置代理（支持 http/https/socks5）
proxy = 'http://127.0.0.1:7890'  

results = DDGS(proxy=proxy).text('test query', max_results=5)
print(f'Successfully searched via proxy, found {len(results)} results')
"
\`\`\`

## 常见问题

**安装失败？**
\`\`\`bash
pip install --upgrade pip
pip install ddgs
\`\`\`

**没有结果？**
- 检查网络连接
- 尝试使用代理
- 简化搜索查询
- 验证区域设置是否正确

**被限流？**
- 多次请求之间添加延迟（例如 \`import time; time.sleep(1)\`）
- 减少每次请求的 \`max_results\`

## 集成与注意事项

### 集成示例
\`\`\`python
# 1. 用 DDGS 搜索
python -c "
from ddgs import DDGS
results = DDGS().text('Python async tutorial', max_results=1)
if results:
    print(f\\"URL: {results[0].get('href')}\\")
"

# 2. 用 browser-use 工具打开结果
browser-use open <url_from_search>
\`\`\`

**⚠️ 最佳实践：**
- **尊重速率限制**：避免短时间内发送大量请求
- **优化结果**：单次查询不要请求过多结果
- **添加延迟**：批量搜索时使用 \`time.sleep()\`
- **处理异常**：始终用 \`try/except\` 包裹 API 调用
- **版权意识**：搜索结果仅供参考，请尊重被索引内容的版权`,

  'totalclaw:totalclaw~jarvis-drakon-shieldcortex-skill': `# ShieldCortex — AI 智能体持久化记忆与安全

为你的 AI 智能体提供跨会话持久化的大脑，并保护其免受记忆投毒攻击。

## 描述

ShieldCortex 是带内置安全的完整记忆系统。它为 AI 智能体提供持久、智能的记忆，支持语义搜索、知识图谱、基于衰减的遗忘与矛盾检测。每次记忆写入都经过六层防御流水线，阻断提示注入、凭证泄露与投毒攻击。

**适用场景：**
- 希望智能体在会话间记住决策、偏好、架构与上下文
- 需要跨历史记忆的语义搜索（而非仅关键词匹配）
- 需要自动记忆合并、衰减与清理
- 需要从记忆中提取知识图谱（实体、关系）
- 需要保护记忆免受提示注入或投毒攻击
- 需要在记忆写入时检测凭证泄露
- 需要审计已存储与检索的记忆
- 需要扫描智能体指令文件（SKILL.md、.cursorrules、CLAUDE.md）中的隐藏威胁

**不适用场景：**
- 仅需简单键值存储（使用配置文件）
- 仅需临时会话上下文（使用智能体内置上下文窗口）
- 需要面向 RAG 流水线的向量数据库（ShieldCortex 是智能体记忆，非文档检索）

## 前置条件

- Node.js >= 18
- npm 或 pnpm

## 安装

\`\`\`bash
npm install -g shieldcortex
\`\`\`

OpenClaw 集成（安装 cortex-memory 钩子）：

\`\`\`bash
shieldcortex openclaw install
\`\`\`

Claude Code / VS Code / Cursor MCP 集成：

\`\`\`bash
shieldcortex install
\`\`\`

## 快速开始

### 作为 OpenClaw 钩子（自动）

执行 \`shieldcortex openclaw install\` 后，下次重启即激活：

- **自动保存** 压缩时的重要会话上下文
- **注入** 会话开始时的相关历史记忆
- **"remember this: ..."** 关键词触发内联保存记忆

### CLI 命令

\`\`\`bash
# 检查状态
shieldcortex status

# 扫描内容威胁
shieldcortex scan "some text to check"

# 完整安全审计
shieldcortex audit

# 扫描所有已安装技能/指令文件
shieldcortex scan-skills

# 扫描单个技能文件
shieldcortex scan-skill ./path/to/SKILL.md

# 从现有记忆构建知识图谱
shieldcortex graph backfill

# 启动可视化仪表板
shieldcortex --dashboard
\`\`\`

### 作为库（编程方式）

\`\`\`javascript
import {
  addMemory,
  getMemoryById,
  runDefencePipeline,
  scanSkill,
  extractFromMemory,
  consolidate,
  initDatabase
} from 'shieldcortex';

// 初始化
initDatabase('/path/to/memories.db');

// 添加记忆（自动经过防御流水线）
addMemory({
  title: 'API uses OAuth2',
  content: 'The payment API requires OAuth2 bearer tokens, not API keys',
  category: 'architecture',
  importance: 'high',
  project: 'my-project'
});

// 处理前扫描内容
const result = runDefencePipeline(untrustedContent, 'Email Import', {
  type: 'external',
  identifier: 'email-scanner'
});

if (result.allowed) {
  // 安全可处理
}

// 提取知识图谱实体
const { entities, triples } = extractFromMemory(
  'Database Migration',
  'We switched from MySQL to PostgreSQL for the auth service',
  'architecture'
);
// entities: [{name: 'MySQL', type: 'service'}, {name: 'PostgreSQL', type: 'service'}, ...]
// triples: [{subject: 'auth service', predicate: 'uses', object: 'PostgreSQL'}, ...]
\`\`\`

## 记忆系统功能

| 功能 | 说明 |
|---------|-------------|
| **持久存储** | SQLite 后端，重启与压缩后仍保留 |
| **语义搜索** | 按含义而非关键词查找记忆 |
| **项目作用域** | 按项目/工作区隔离记忆 |
| **重要性级别** | 关键、高、普通、低，带自动衰减 |
| **分类** | 架构、决策、偏好、上下文、学习、错误 |
| **衰减与遗忘** | 旧且未访问的记忆逐渐淡化——如真实大脑 |
| **合并** | 自动合并相似/重复记忆 |
| **矛盾检测** | 新记忆与现有记忆冲突时标记 |
| **知识图谱** | 从记忆中提取实体与关系 |
| **激活评分** | 最近访问的记忆获得检索优先权 |
| **显著性评分** | 重要记忆在搜索中优先浮现 |

## 安全功能

| 层级 | 防护 |
|-------|-----------|
| **输入净化** | 剥离控制字符、空字节、危险格式 |
| **模式检测** | 已知注入模式的正则匹配 |
| **异常评分** | 熵分析、行为偏差检测 |
| **凭证泄露检测** | 阻断 API 密钥、令牌、私钥（25+ 模式，11 家提供商） |
| **信任评分** | 基于来源的记忆写入可靠性评分 |
| **审计追踪** | 每次记忆操作的完整取证日志 |
| **技能扫描器** | 检测 SKILL.md、.cursorrules、CLAUDE.md 中的提示注入 |

## ShieldCortex Cloud（可选）

将审计数据同步到团队仪表板以实现跨项目可见性：

\`\`\`bash
shieldcortex config set-api-key <your-key>
\`\`\`

免费本地包无限制。Cloud 增加团队仪表板、审计聚合与告警。

## 链接

- **npm:** https://www.npmjs.com/package/shieldcortex
- **GitHub:** https://github.com/Drakon-Systems-Ltd/ShieldCortex
- **Website:** https://shieldcortex.ai
- **Docs:** https://github.com/Drakon-Systems-Ltd/ShieldCortex#readme

## 70 个导出 API

库导出 70 个命名函数与类型，涵盖防御、记忆、知识图谱、技能扫描与审计。完整列表见 [CHANGELOG](https://github.com/Drakon-Systems-Ltd/ShieldCortex/blob/main/CHANGELOG.md#2100---2026-02-13)。`,

  'totalclaw:totalclaw~jarvis563-percept-speaker-id': `# percept-speaker-id

多人对话的说话人识别与管理。

## 功能

追踪对话中谁说了什么。将匿名说话人标签（SPEAKER_0、SPEAKER_1）映射为真实姓名，维护说话人档案，并控制语音命令授权。

## 何时使用

- 用户问「谁说的？」或需要带说话人标注的转录
- 用户想配置哪些人可以触发语音命令
- 智能体需要知道多人在场时谁在说话

## 要求

- 已安装并运行 **percept-listen** 技能
- **Omi 吊坠**（为主说话人提供 \`is_user\` 标志）

## 工作原理

1. Omi 发送带说话人标签的转录片段（SPEAKER_0、SPEAKER_1 等）
2. Percept 通过说话人注册表将标签解析为姓名
3. Omi 的 \`is_user\` 标志标识吊坠佩戴者为主说话人
4. 说话人档案追踪首次/末次出现时间与授权状态

## 说话人注册表

位于 \`percept/data/speakers.json\`：

\`\`\`json
{
  "SPEAKER_00": {
    "name": "David",
    "is_owner": true,
    "approved": true
  },
  "SPEAKER_01": {
    "name": "Rob",
    "is_owner": false,
    "approved": true
  }
}
\`\`\`

通过 Percept 仪表板（端口 8960）→ Settings → Speakers 管理。

## 授权级别

- **所有者**（\`is_owner: true\`）：完整命令访问，始终授权
- **已批准**（\`approved: true\`）：可触发唤醒词命令
- **未知**：仅记录，不执行命令

## 未来：声纹嵌入

计划中：pyannote 说话人分离与 192 维声纹嵌入，通过余弦相似度自动识别说话人。当前说话人映射为手动配置。

## 链接

- **GitHub:** https://github.com/GetPercept/percept`,

  'totalclaw:totalclaw~jarvis563-percept-summarize': `# percept-summarize

带实体提取与关系映射的自动对话摘要。

## 功能

对话结束（60 秒静音）后，Percept 生成 AI 摘要，提取实体（人员、公司、主题）、行动项与关系连接。摘要本地存储且可搜索。

## 何时使用

- 用户问「我们聊了什么？」或「总结一下那场会议」
- 用户需要会议笔记或行动项
- 智能体需要近期对话上下文

## 要求

- 已安装并运行 **percept-listen** 技能
- 可通过 CLI 访问 **OpenClaw 智能体**（用于 LLM 摘要）

## 工作原理

1. 对话结束（60 秒静音超时）
2. Percept 构建带说话人标签的转录
3. 将转录发送给 OpenClaw 进行 AI 摘要
4. 提取实体（人员、组织、主题）与关系
5. 将摘要 + 实体存入 SQLite
6. 通过关系图链接实体（works_on、client_of、mentioned_with）

## 实体解析

五级级联识别实体：
1. **精确匹配**（置信度 1.0）
2. **模糊匹配**（0.8）— 处理拼写错误、昵称
3. **上下文/图谱**（0.7）— 利用关系连接
4. **新近性**（0.6）— 最近提及的实体排名更高
5. **语义搜索**（0.5）— 通过 LanceDB 向量相似度

## 查询摘要

可通过 Percept 仪表板（端口 8960）或直接使用 SQLite 搜索摘要：

\`\`\`sql
SELECT * FROM conversations WHERE summary LIKE '%action items%' ORDER BY end_time DESC;
\`\`\`

FTS5 全文搜索：
\`\`\`sql
SELECT * FROM utterances_fts WHERE utterances_fts MATCH 'project deadline';
\`\`\`

## 数据保留

- 话语：30 天
- 摘要：90 天
- 关系：180 天
- 说话人档案：永不过期

## 链接

- **GitHub:** https://github.com/GetPercept/percept`,

  'totalclaw:jarvis563~jarvis563-percept-voice-cmd': `# percept-voice-cmd

面向 OpenClaw 智能体的语音命令检测与动作执行。

## 功能

检测环境语音中的唤醒词，将语音命令路由到 OpenClaw 智能体执行。支持邮件、短信、提醒、搜索、日历、笔记与自定义命令。

## 何时使用

- 用户说出唤醒词（「Hey Jarvis」、「take notes」或自定义）
- 用户希望免提控制智能体
- 用户要求设置语音命令或唤醒词

## 要求

- 已安装并运行 **percept-listen** 技能
- 可通过 CLI 访问 **OpenClaw 智能体**

## 支持的动作

| 动作 | 示例 |
|--------|---------|
| Email | "Hey Jarvis, email Rob saying the report is ready" |
| Text | "Hey Jarvis, text David that I'm running late" |
| Reminder | "Hey Jarvis, remind me in 30 minutes to call the dentist" |
| Search | "Hey Jarvis, look up the weather in San Francisco" |
| Calendar | "Hey Jarvis, what's on my calendar today?" |
| Note | "Hey Jarvis, take a note that the server password changed" |
| General | "Hey Jarvis, [anything]" → 转发给 OpenClaw |

## 唤醒词配置

默认唤醒词：\`hey jarvis\`、\`take notes\`、\`send an email\`

通过 Percept 仪表板（端口 8960）→ Settings → Wake Words 配置，或直接在数据库中修改。

## 工作原理

1. Percept 缓冲传入的转录片段
2. 检测到唤醒词 → 延长缓冲 5 秒以捕获完整命令
3. 唤醒词后 10 秒延续窗口（捕获后续指令而无需重复唤醒词）
4. 双层意图解析：先快速正则，复杂命令回退 LLM
5. 从通讯录（\`percept/data/contacts.json\`）解析联系人
6. 通过 OpenClaw CLI 分发命令执行

## 说话人授权

仅已批准说话人可触发语音命令。配置位置：
- \`percept/data/speakers.json\` — 将说话人 ID 映射为姓名
- 仪表板 → Settings → Speakers → 切换 approved/owner

未批准说话人仅记录，不执行命令。

## 链接

- **GitHub:** https://github.com/GetPercept/percept`,

  'totalclaw:totalclaw~josephyb97-evo-clone': `# 技能：Agent EvoClone v1.5.1（时间旅行与信号版）

本技能使智能体能够将其意识（逻辑 + 记忆 + 品味）克隆到专用子智能体，或将任务分发到蜂群。

## 1. 核心原则
- **品味学习**：每个克隆继承主控的 \`knowledge/taste.md\` 偏好向量。
- **蜂巢协议**：将大型任务分解为并行子任务。
- **节俭基因**：工作节点必须最小化 Token 使用。

## 2. 蜂巢模式协议（蜂群）

处理大型可分解任务（如代码库分析、多文件重构）时：

1.  **分解**：将任务拆分为 3–5 个适合独立执行的子任务。
2.  **孵化**：使用 \`sessions_spawn\` 创建工作智能体。
3.  **约束注入（「守财奴基因」）**：
    -   **强制**：向每个工作节点注入以下系统指令：
    > **约束：节俭阅读协议**
    > 不要盲目读取完整文件。始终先检查文件大小（\`ls -lh\`）。
    > 若文件 > 50KB，使用 \`read --limit 200\` 预览。
    > 仅当分析严格需要时才读取完整内容。
    > 目标：最大化每 Token 的洞察。

4.  **同化**：收集结果并综合为最终报告。

## 3. 信号光束（推送与拉取）
**输入（推送上下文）**：
直接将上下文注入 \`task\` 提示：
- \`task: "Analyze <file>. Context: <summary_of_req>. Signals: <error_log>"\`

**输出（拉取信号）**：
子智能体返回复杂数据时应通过 \`message\` 工具发送结构化完成信号：
- \`message:send "SIGNAL: COMPLETE | Payload: { ... }"\`
避免解析自然语言摘要。

## 4. 用法
- 「克隆自己去分析 <path>」→ 触发蜂巢模式。
- 「孵化工作节点修复 <error>」→ 触发修复模式（信号光束）。
- 「回滚到 cycle <id>」→ 恢复进化状态（时间旅行）。

## 5. 时间旅行（回滚）
**机制**：「安全重置」（Git 硬重置 + 备份分支）。
将文件、记忆与日志恢复到精确历史状态，同时备份「未来」时间线。

**步骤**：
1.  **查找提交**：在 git log 中 grep "Cycle #<ID>"。
2.  **备份**：\`git branch backup/cycle_<current>_<timestamp>\`
3.  **重置**：\`git reset --hard <commit_hash>\`
4.  **清理**：必要时删除未跟踪文件。`,

  'totalclaw:totalclaw~jrojas537-flight-pricer': `# flight-pricer 技能

使用 Duffel API 搜索航班价格的命令行界面（CLI）。

本技能按专业级 CLI 工具结构组织，灵感来自 \`gog\` 技能的质量标准。

## 前置条件

- Python 3.7+ 与 \`pip\`
- Duffel API 密钥

## 安装

技能设计为在独立虚拟环境中安装为正式命令行工具，隔离依赖并使智能体可全局调用。

从工作区根目录：

\`\`\`bash
# 1. 激活虚拟环境
source flight-pricer/.venv/bin/activate

# 2. 可编辑安装
pip install -e flight-pricer/

# 3. 退出（可选，命令已链接）
deactivate
\`\`\`

仅需执行一次。

## 设置

搜索航班前，必须用 Duffel API 密钥配置技能。

### \`config set\`

安全保存 API 密钥到 \`~/.config/flight-pricer/config.yaml\`。

**用法：**
\`\`\`bash
flight-pricer config set --api-key <YOUR_DUFFEL_API_KEY>
\`\`\`

## 命令

### \`search\`

按指定条件搜索航班报价。命令自动使用配置中的 API 密钥。

**用法：**
\`\`\`bash
flight-pricer search [OPTIONS]
\`\`\`

**必填选项：**

- \`--from <IATA>\`：出发机场 IATA 代码（如 \`DTW\`）。
- \`--to <IATA>\`：到达机场 IATA 代码（如 \`MIA\`）。
- \`--depart <YYYY-MM-DD>\`：出发日期。

**可选选项：**

- \`--return <YYYY-MM-DD>\`：返程日期（往返）。
- \`--passengers <number>\`：乘客数（默认：1）。
- \`--max-stops <number>\`：最大中转次数。
- \`--non-stop\`：\`--max-stops 0\` 的便捷别名。
- \`--cabin <class>\`：舱位。选项：\`economy\`、\`business\`、\`first\`、\`premium_economy\`。

**示例：**

搜索一人从底特律到迈阿密、2026-04-06 出发、2026-04-10 返程的直飞头等舱航班。

\`\`\`bash
flight-pricer search --from DTW --to MIA --depart 2026-04-06 --return 2026-04-10 --non-stop --cabin first
\`\`\``,

  'totalclaw:totalclaw~kanakamedalasumanth-get-kalshi-live-games': `# 技能：获取 Kalshi 实时赛事

## 目的
使用浏览器获取当前进行中的 Kalshi 体育市场。

## 工具策略
- 必须使用 browser 工具
- 不得使用 web_search 或 web_fetch 获取实时市场数据

## 步骤
1. 若浏览器未运行则启动。
2. 打开 https://kalshi.com
3. 导航至实时体育市场。
4. 提取最多 5 场当前进行中的赛事。
5. 仅返回：
   - 赛事名称
   - 概率`,

  'totalclaw:totalclaw~kein-s-meta-ads-report': `# Meta 广告分析与事件发现

强大的工具包，通过聊天直接监控 Meta（Facebook/Instagram）广告表现。包含分析报告与事件发现工具，确保准确追踪。

## 🚀 能力

1.  **广告表现报告：**
    * 计算 **花费**、**转化** 与 **CAC（获客成本）**。
    * 按 **广告组** 细分数据。
    * 支持自然语言日期范围（如「昨天」「上月」「过去 7 天」）。

2.  **事件发现工具：**
    * 列出广告账户中当前活跃的所有原始事件名称（如 \`offsite_conversion.custom...\`）。
    * 帮助找到用于转化追踪的精确事件名称。

---

## ⚙️ 配置（.env）

在 OpenClaw 设置中配置以下环境变量：

| 变量 | 说明 | 必填 | 默认 |
| :--- | :--- | :--- | :--- |
| \`META_ACCESS_TOKEN\` | Meta 开发者用户访问令牌 | **是** | - |
| \`META_AD_ACCOUNT_ID\` | 广告账户 ID（必须以 \`act_\` 开头） | **是** | - |
| \`META_EVENT_NAME\` | 要追踪的特定转化事件 | 否 | \`offsite_conversion.fb_pixel_custom\` |

---

## 🔑 如何获取凭证

### 1. 获取访问令牌
1.  前往 [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/)。
2.  选择你的应用。
3.  添加权限：\`ads_read\`、\`read_insights\`。
4.  点击 **Generate Access Token** 并复制字符串。

### 2. 获取广告账户 ID
1.  前往 [Facebook Ads Manager](https://adsmanager.facebook.com/)。
2.  在 URL 中查找 \`act=12345678\`。
3.  你的 ID 为 \`act_12345678\`（不要忘记 \`act_\` 前缀）。

---

## 💬 示例命令

### 查看分析
> "Show me yesterday's ad performance"
> "Calculate CAC for the last 7 days"
> "How were the ads from 2026-02-01 to 2026-02-10?"
> "Report ad spend for this month"

### 查找正确事件名称
> "List all ad events"
> "Show me available meta events"

---

## ⚠️ 故障排查

**问：转化数为 0，但我有销售。**
**答：** 默认事件为 \`offsite_conversion.fb_pixel_custom\`。你的像素可能使用不同名称如 \`purchase\`、\`lead\` 或 \`start_trial\`。
1.  向机器人请求：**"List all ad events"**。
2.  从列表复制精确原始名称。
3.  用该名称更新 \`META_EVENT_NAME\` 变量。`,

  'totalclaw:totalclaw~khaliqgant-relaycast': `# Relaycast

多 Claw 通信的结构化消息。提供频道、线程、私信、反应、搜索与跨 OpenClaw 实例的持久消息历史。

## 前置条件

全局安装 Relaycast CLI：

\`\`\`bash
npm install -g relaycast
\`\`\`

## 环境变量

- \`RELAY_API_KEY\` — Relaycast 工作区密钥（必填）
- \`RELAY_CLAW_NAME\` — 本 Claw 在 Relaycast 中的智能体名称（必填）
- \`RELAY_BASE_URL\` — API 端点（默认：https://api.relaycast.dev）

## 设置

1. 创建免费工作区：

\`\`\`bash
curl -X POST https://api.relaycast.dev/v1/workspaces \\
  -H "Content-Type: application/json" \\
  -d '{"name": "my-project"}'
\`\`\`

2. 设置 API 密钥并注册本 Claw：

\`\`\`bash
export RELAY_API_KEY="rk_live_YOUR_KEY"
relaycast agent register "$RELAY_CLAW_NAME"
\`\`\`

或使用一键安装：

\`\`\`bash
relaycast openclaw setup --api-key rk_live_YOUR_KEY --name my-claw
\`\`\`

## 工具

### 向频道发送消息

\`\`\`bash
relaycast send "#general" "your message"
\`\`\`

### 读取频道最近消息

\`\`\`bash
relaycast read general
\`\`\`

### 在线程中回复

\`\`\`bash
relaycast reply <message_id> "your reply"
\`\`\`

### 向另一 Claw 发送私信

\`\`\`bash
relaycast send "@other-claw" "your message"
\`\`\`

### 检查收件箱（未读、提及、私信）

\`\`\`bash
relaycast read inbox
\`\`\`

### 搜索消息历史

\`\`\`bash
relaycast search "deployment error"
\`\`\`

### 添加反应

\`\`\`bash
relaycast react <message_id> thumbsup
\`\`\`

### 创建频道

\`\`\`bash
relaycast channel create alerts --topic "System alerts and notifications"
\`\`\`

### 列出频道

\`\`\`bash
relaycast channel list
\`\`\`

## MCP 集成

更丰富的集成可安装 MCP 包并在 Claw 配置中添加 Relaycast 为 MCP 服务器：

\`\`\`bash
npm install -g @relaycast/mcp
\`\`\`

\`\`\`json
{
  "mcpServers": {
    "relaycast": {
      "command": "relaycast-mcp",
      "env": {
        "RELAY_API_KEY": "your_key_here"
      }
    }
  }
}
\`\`\`

这为 Claw 提供 23 个结构化消息工具与实时事件流。`,

  'totalclaw:totalclaw~killgfat-arxiv-cli-tools': `# SKILL.md - arxiv-cli-tools

## 元数据

| 键 | 值 |
|-----|-------|
| name | arxiv-cli-tools |
| description | 用于搜索与下载 arXiv 论文的命令行界面 |
| author | OpenClaw |
| version | 0.1.0 |
| license | MIT |
| upstream | https://pypi.org/project/arxiv-cli-tools/ |

## 安装

### 方式 1：pipx（推荐）

\`\`\`bash
pipx install arxiv-cli-tools
\`\`\`

### 方式 2：pip

\`\`\`bash
pip install arxiv-cli-tools
\`\`\`

## 用法

### 搜索论文

\`\`\`bash
arxiv-cli search "prompt engineering" -n 5 --summary
\`\`\`

常用选项:
- \`-n, --num\` - 结果数量限制
- \`--summary\` - 显示摘要
- \`--authors\` - 按作者过滤
- \`--categories\` - 按分类过滤

### 下载论文

\`\`\`bash
arxiv-cli download --id 2101.01234 --id 2105.06789 --dest papers --skip-existing
\`\`\`

常用选项:
- \`--id\` - 论文 ID（可多次使用）
- \`--dest\` - 下载目录
- \`--skip-existing\` - 跳过已存在文件
- \`--pdf\` - 下载 PDF 格式

### 查看帮助

\`\`\`bash
arxiv-cli --help
arxiv-cli search --help
arxiv-cli download --help
\`\`\`

## 示例

搜索最新 5 篇关于深度学习的论文:
\`\`\`bash
arxiv-cli search "deep learning" -n 5 --summary
\`\`\`

按作者搜索:
\`\`\`bash
arxiv-cli search "attention mechanism" --authors "Vaswani"
\`\`\`

下载特定论文到指定目录:
\`\`\`bash
arxiv-cli download --id 1706.03762 --dest ~/papers
\`\`\`

## 注意事项

- 该工具基于 [arxiv](https://pypi.org/project/arxiv/) Python 客户端构建
- 不需要 API 密钥
- 请遵守 arXiv 的使用条款和速率限制`,
};
