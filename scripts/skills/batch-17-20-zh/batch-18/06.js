module.exports = {
  skillId: 'totalclaw:totalclaw~bowen-dotcom-aisa-market-skill',
  descriptionZh:
    '查询股票与加密货币的实时及历史金融数据——价格、市场动态、指标与趋势，用于分析、预警与报告。由 AIsa 驱动。',
  bodyZh: `# OpenClaw Market 📊

**面向自主智能体的完整市场数据。由 AIsa 驱动。**

一个 API Key。股票 + 加密货币 + 财务数据。应有尽有。

## 🔥 你能做什么？

### 跨资产组合
\`\`\`
"获取我的组合中 BTC、ETH 价格以及 AAPL、NVDA 股票数据"
\`\`\`

### 投资研究
\`\`\`
"完整分析：NVDA 价格趋势、内幕交易、分析师预测、SEC 申报"
\`\`\`

### 加密货币跟踪
\`\`\`
"BTC、ETH、SOL 实时价格及 30 天历史图表"
\`\`\`

### 财报分析
\`\`\`
"获取 Tesla 财报、分析师预测及价格反应"
\`\`\`

### 市场筛选
\`\`\`
"找出 P/E < 15 且收入增长 > 20% 的股票"
\`\`\`

### 大户动向
\`\`\`
"跟踪 Apple 内幕交易并与价格走势关联"
\`\`\`

## 快速开始

\`\`\`bash
export AISA_API_KEY="your-key"
\`\`\`

---

## 🏦 传统金融

### 股票价格

\`\`\`bash
# 历史价格数据（日线）
curl "https://api.aisa.one/apis/v1/financial/prices?ticker=AAPL&interval=day&interval_multiplier=1&start_date=2025-01-01&end_date=2025-12-31" \\
  -H "Authorization: Bearer $AISA_API_KEY"

# 周线价格数据
curl "https://api.aisa.one/apis/v1/financial/prices?ticker=AAPL&interval=week&interval_multiplier=1&start_date=2025-01-01&end_date=2025-12-31" \\
  -H "Authorization: Bearer $AISA_API_KEY"

# 分钟级数据（日内）
curl "https://api.aisa.one/apis/v1/financial/prices?ticker=AAPL&interval=minute&interval_multiplier=5&start_date=2025-01-15&end_date=2025-01-15" \\
  -H "Authorization: Bearer $AISA_API_KEY"
\`\`\`

**参数：**
- \`ticker\`：股票代码（必填）
- \`interval\`：\`second\`、\`minute\`、\`day\`、\`week\`、\`month\`、\`year\`（必填）
- \`interval_multiplier\`：间隔倍数，如 5 表示 5 分钟 K 线（必填）
- \`start_date\`：开始日期 YYYY-MM-DD（必填）
- \`end_date\`：结束日期 YYYY-MM-DD（必填）

### 公司新闻

\`\`\`bash
# 按代码获取新闻
curl "https://api.aisa.one/apis/v1/financial/news?ticker=AAPL&limit=10" \\
  -H "Authorization: Bearer $AISA_API_KEY"
\`\`\`

### 财务报表

\`\`\`bash
# 全部财务报表
curl "https://api.aisa.one/apis/v1/financial/financial_statements/all?ticker=AAPL" \\
  -H "Authorization: Bearer $AISA_API_KEY"

# 利润表
curl "https://api.aisa.one/apis/v1/financial/financial_statements/income?ticker=AAPL" \\
  -H "Authorization: Bearer $AISA_API_KEY"

# 资产负债表
curl "https://api.aisa.one/apis/v1/financial/financial_statements/balance?ticker=AAPL" \\
  -H "Authorization: Bearer $AISA_API_KEY"

# 现金流量表
curl "https://api.aisa.one/apis/v1/financial/financial_statements/cash?ticker=AAPL" \\
  -H "Authorization: Bearer $AISA_API_KEY"
\`\`\`

### 财务指标

\`\`\`bash
# 实时财务指标快照
curl "https://api.aisa.one/apis/v1/financial/financial-metrics/snapshot?ticker=AAPL" \\
  -H "Authorization: Bearer $AISA_API_KEY"

# 历史财务指标
curl "https://api.aisa.one/apis/v1/financial/financial-metrics?ticker=AAPL" \\
  -H "Authorization: Bearer $AISA_API_KEY"
\`\`\`

### 分析师预测

\`\`\`bash
# 每股收益预测
curl "https://api.aisa.one/apis/v1/financial/analyst/eps?ticker=AAPL&period=annual" \\
  -H "Authorization: Bearer $AISA_API_KEY"
\`\`\`

### 内幕交易

\`\`\`bash
# 获取内幕交易
curl "https://api.aisa.one/apis/v1/financial/insider/trades?ticker=AAPL" \\
  -H "Authorization: Bearer $AISA_API_KEY"
\`\`\`

### 机构持股

\`\`\`bash
# 获取机构持股
curl "https://api.aisa.one/apis/v1/financial/institutional/ownership?ticker=AAPL" \\
  -H "Authorization: Bearer $AISA_API_KEY"
\`\`\`

### SEC 申报

\`\`\`bash
# 获取 SEC 申报
curl "https://api.aisa.one/apis/v1/financial/sec/filings?ticker=AAPL" \\
  -H "Authorization: Bearer $AISA_API_KEY"

# 获取 SEC 申报条目
curl "https://api.aisa.one/apis/v1/financial/sec/items?ticker=AAPL" \\
  -H "Authorization: Bearer $AISA_API_KEY"
\`\`\`

### 公司事实

\`\`\`bash
# 按 CIK 获取公司事实
curl "https://api.aisa.one/apis/v1/financial/company/facts?ticker=AAPL" \\
  -H "Authorization: Bearer $AISA_API_KEY"
\`\`\`

### 股票筛选器

\`\`\`bash
# 筛选符合条件的股票
curl -X POST "https://api.aisa.one/apis/v1/financial/search/stock" \\
  -H "Authorization: Bearer $AISA_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"filters":{"pe_ratio":{"max":15},"revenue_growth":{"min":0.2}}}'
\`\`\`

### 利率

\`\`\`bash
# 当前利率
curl "https://api.aisa.one/apis/v1/financial/interest_rates/snapshot" \\
  -H "Authorization: Bearer $AISA_API_KEY"

# 历史利率
curl "https://api.aisa.one/apis/v1/financial/interest_rates/historical?bank=fed" \\
  -H "Authorization: Bearer $AISA_API_KEY"
\`\`\`

---

## ₿ 加密货币

### 实时价格快照

\`\`\`bash
# 获取当前 BTC 价格（代码格式：SYMBOL-USD）
curl "https://api.aisa.one/apis/v1/financial/crypto/prices/snapshot?ticker=BTC-USD" \\
  -H "Authorization: Bearer $AISA_API_KEY"

# 获取当前 ETH 价格
curl "https://api.aisa.one/apis/v1/financial/crypto/prices/snapshot?ticker=ETH-USD" \\
  -H "Authorization: Bearer $AISA_API_KEY"

# 获取当前 SOL 价格
curl "https://api.aisa.one/apis/v1/financial/crypto/prices/snapshot?ticker=SOL-USD" \\
  -H "Authorization: Bearer $AISA_API_KEY"

# 获取 TRUMP 代币价格
curl "https://api.aisa.one/apis/v1/financial/crypto/prices/snapshot?ticker=TRUMP-USD" \\
  -H "Authorization: Bearer $AISA_API_KEY"
\`\`\`

**注意：** 加密货币代码使用 \`SYMBOL-USD\` 格式（如 \`BTC-USD\`、\`ETH-USD\`）。

### 历史价格数据

\`\`\`bash
# 获取 BTC 历史价格（日线）
curl "https://api.aisa.one/apis/v1/financial/crypto/prices?ticker=BTC-USD&interval=day&interval_multiplier=1&start_date=2025-01-01&end_date=2025-01-31" \\
  -H "Authorization: Bearer $AISA_API_KEY"

# 获取 ETH 小时数据
curl "https://api.aisa.one/apis/v1/financial/crypto/prices?ticker=ETH-USD&interval=minute&interval_multiplier=60&start_date=2025-01-15&end_date=2025-01-16" \\
  -H "Authorization: Bearer $AISA_API_KEY"
\`\`\`

### 支持的加密货币

| Ticker | Name |
|--------|------|
| BTC-USD | Bitcoin |
| ETH-USD | Ethereum |
| SOL-USD | Solana |
| BNB-USD | Binance Coin |
| XRP-USD | Ripple |
| DOGE-USD | Dogecoin |
| ADA-USD | Cardano |
| AVAX-USD | Avalanche |
| DOT-USD | Polkadot |
| MATIC-USD | Polygon |
| LINK-USD | Chainlink |
| UNI-USD | Uniswap |
| ATOM-USD | Cosmos |
| LTC-USD | Litecoin |
| TRUMP-USD | Trump Token |
| ... | And many more |

---

## Python 客户端

\`\`\`bash
# ==================== 股票数据 ====================
# 注意：prices 必须提供 start_date 和 end_date
python3 {baseDir}/scripts/market_client.py stock prices --ticker AAPL --start 2025-01-01 --end 2025-01-31
python3 {baseDir}/scripts/market_client.py stock prices --ticker AAPL --start 2025-01-01 --end 2025-01-31 --interval week
python3 {baseDir}/scripts/market_client.py stock news --ticker AAPL --count 10

# ==================== 财务报表 ====================
python3 {baseDir}/scripts/market_client.py stock statements --ticker AAPL --type all
python3 {baseDir}/scripts/market_client.py stock statements --ticker AAPL --type income
python3 {baseDir}/scripts/market_client.py stock statements --ticker AAPL --type balance
python3 {baseDir}/scripts/market_client.py stock statements --ticker AAPL --type cash

# ==================== 指标与分析 ====================
python3 {baseDir}/scripts/market_client.py stock metrics --ticker AAPL
python3 {baseDir}/scripts/market_client.py stock analyst --ticker AAPL

# ==================== 内幕与机构 ====================
python3 {baseDir}/scripts/market_client.py stock insider --ticker AAPL
python3 {baseDir}/scripts/market_client.py stock ownership --ticker AAPL

# ==================== SEC 申报 ====================
python3 {baseDir}/scripts/market_client.py stock filings --ticker AAPL

# ==================== 股票筛选器 ====================
python3 {baseDir}/scripts/market_client.py stock screen --pe-max 15 --growth-min 0.2

# ==================== 利率 ====================
python3 {baseDir}/scripts/market_client.py stock rates
python3 {baseDir}/scripts/market_client.py stock rates --historical

# ==================== 加密货币数据 ====================
# 注意：使用 SYMBOL-USD 格式（或仅 SYMBOL，自动转换）
python3 {baseDir}/scripts/market_client.py crypto snapshot --ticker BTC-USD
python3 {baseDir}/scripts/market_client.py crypto snapshot --ticker ETH  # 自动转换为 ETH-USD
python3 {baseDir}/scripts/market_client.py crypto historical --ticker BTC-USD --start 2025-01-01 --end 2025-01-31
python3 {baseDir}/scripts/market_client.py crypto portfolio --tickers BTC-USD,ETH-USD,SOL-USD
\`\`\`

---

## API 端点参考

### 传统金融

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`/financial/prices\` | GET | 历史股票价格（需要 interval 参数） |
| \`/financial/news\` | GET | 按代码获取公司新闻 |
| \`/financial/financial_statements/all\` | GET | 全部财务报表 |
| \`/financial/financial_statements/income\` | GET | 利润表 |
| \`/financial/financial_statements/balance\` | GET | 资产负债表 |
| \`/financial/financial_statements/cash\` | GET | 现金流量表 |
| \`/financial/financial-metrics/snapshot\` | GET | 实时财务指标 |
| \`/financial/financial-metrics\` | GET | 历史指标 |
| \`/financial/analyst/eps\` | GET | EPS 预测 |
| \`/financial/insider/trades\` | GET | 内幕交易 |
| \`/financial/institutional/ownership\` | GET | 机构持股 |
| \`/financial/sec/filings\` | GET | SEC 申报 |
| \`/financial/sec/items\` | GET | SEC 申报条目 |
| \`/financial/company/facts\` | GET | 公司事实 |
| \`/financial/search/stock\` | POST | 股票筛选器 |
| \`/financial/interest_rates/snapshot\` | GET | 当前利率 |
| \`/financial/interest_rates/historical\` | GET | 历史利率 |

### 加密货币

| Endpoint | Method | Description |
|----------|--------|-------------|
| \`/financial/crypto/prices/snapshot\` | GET | 实时价格快照 |
| \`/financial/crypto/prices\` | GET | 历史 OHLCV 数据 |

---

## 定价

| API | Cost |
|-----|------|
| Stock prices | ~$0.001 |
| Company news | ~$0.001 |
| Financial statements | ~$0.002 |
| Analyst estimates | ~$0.002 |
| SEC filings | ~$0.001 |
| Crypto snapshot | ~$0.0005 |
| Crypto historical | ~$0.001 |

每次响应包含 \`usage.cost\` 和 \`usage.credits_remaining\`。

---

## 开始使用

1. 在 [aisa.one](https://aisa.one) 注册
2. 获取 API Key
3. 充值（按量付费）
4. 设置环境变量：\`export AISA_API_KEY="your-key"\`

## 完整 API 参考

完整端点文档见 [API Reference](https://docs.aisa.one/reference/)。`,
};
