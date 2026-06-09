# safe-web

通过 **PromptGuard** 扫描实现安全的网页抓取与搜索。

## 状态

✅ 可用

## 用途

在将网页内容返回给 AI 之前，防护其中隐藏的提示注入攻击。为网页抓取与搜索包裹安全扫描层。

## 安装

需要 [PromptGuard](https://clawhub.ai/seojoonkim/prompt-guard) 及 Python 依赖：

```bash
# 先安装 PromptGuard
cd /home/linuxbrew/.openclaw/workspace/skills/prompt-guard
pip3 install --break-system-packages -e .

# 安装网页依赖（若尚未安装）
pip3 install --break-system-packages requests beautifulsoup4
```

## 用法

### fetch 命令

抓取 URL 并扫描内容：

```bash
# 基本抓取
safe-web fetch https://example.com/article

# 保存到文件
safe-web fetch https://example.com --output article.txt

# JSON 输出（用于自动化）
safe-web fetch https://example.com --json

# 严格模式（MEDIUM 级别即拦截）
safe-web fetch https://example.com --strict
```

### search 命令

搜索网页并扫描结果：

```bash
# 基本搜索
safe-web search "AI safety research"

# 更多结果
safe-web search "stock market news" --count 10

# JSON 输出
safe-web search "machine learning" --json
```

## 退出码

| 代码 | 含义 |
|------|---------|
| 0 | 成功 — 内容/结果干净 |
| 1 | 错误（网络、解析等） |
| 2 | 检测到威胁 — 内容已拦截 |

## 配置

### 环境变量

- `BRAVE_API_KEY` — Brave Search API 密钥（可选，启用 search 命令）
  - 获取地址：https://brave.com/search/api/

### 符号链接（推荐）

创建系统级符号链接，使 `safe-web` 可在任意目录使用：

```bash
sudo ln -s /home/linuxbrew/.openclaw/workspace/skills/safe-web/scripts/safe-web.py /usr/local/bin/safe-web
```

创建符号链接后，可直接使用 `safe-web`，无需完整路径。

## 工作原理

### 抓取流程
1. 用 requests 下载 URL 内容
2. 用 BeautifulSoup 提取文本（移除 script、style）
3. 用 PromptGuard 扫描提取文本
4. 返回干净内容，或附带 SHIELD 报告拦截

### 搜索流程
1. 查询 Brave Search API（需要 API 密钥）
2. 扫描每条结果的标题与描述
3. 过滤可疑结果
4. 仅返回干净结果

## 安全模型

**失败即关闭：** 若无法加载 PromptGuard 或扫描失败，工具报错而非返回未验证内容。

**内容净化：** 扫描前解析 HTML 并移除 script/style，降低误报。

**不执行代码：** 本工具仅抓取与扫描，从不执行网页中的 JavaScript 或命令。

## 输出示例

### 干净抓取
```
Fetching: https://site.com/article
Fetched 1523 characters
Scanning with PromptGuard...

Article content here...
```

### 已拦截内容
```
Fetching: https://suspicious-site.com
Fetched 2048 characters
Scanning with PromptGuard...
============================================================
🛡️  SAFE-WEB SECURITY ALERT
============================================================
Source: https://suspicious-site.com
Severity: CRITICAL
Action: BLOCK_NOTIFY
Patterns Matched: 8

Detected Patterns:
  - instruction_override_en
  - role_manipulation_en
  - system_impersonation_en
============================================================

Content from https://suspicious-site.com has been blocked.
```

### 搜索结果
```
Searching: AI research
Found 5 results, scanning...

Showing 3 clean results:

1. Latest AI Research Papers
   URL: https://arxiv.org/list/ai/recent
   Recent submissions in artificial intelligence...

2. AI Safety Institute
   URL: https://www.safe.ai/
   Research and development for safe AI systems...
```

## 何时使用

在以下情况使用 `safe-web`：
- 从不信任 URL 抓取内容
- 为分析抓取网页
- 搜索并处理网页结果
- 任何将进入 AI 上下文窗口的网页内容

仅在以下情况使用原生 `web_fetch`/`web_search`：
- 可信、已知安全的域名
- 内部文档站点
- 你明确希望跳过扫描时

## 与原生工具对比

| 功能 | 原生 `web_fetch` | `safe-web fetch` |
|---------|-------------------|------------------|
| 抓取 HTML | ✅ | ✅ |
| 提取文本 | ✅ | ✅ |
| 注入扫描 | ❌ | ✅ |
| JSON 输出 | ✅ | ✅ |
| 保存到文件 | ❌ | ✅ |
| 退出码 | 0/1 | 0/1/2（安全） |

## 依赖

- Python 3.8+
- [PromptGuard 3.1.0+](https://clawhub.ai/seojoonkim/prompt-guard)（安装在工作区）
- requests
- beautifulsoup4
- Brave Search API 密钥（search 命令）

## 限制

- 搜索需要 Brave API 密钥（有免费额度）
- fetch 不执行 JavaScript（仅静态 HTML）
- 大页面在文本提取时可能被截断
- 网络超时默认 30 秒
