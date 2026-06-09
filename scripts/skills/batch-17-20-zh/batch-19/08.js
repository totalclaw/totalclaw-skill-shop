module.exports = {
  skillId: 'totalclaw:totalclaw~xj577-market-data',
  descriptionZh:
    '提供股票、加密货币、经济日历与财经新闻等金融市场数据访问。',
  bodyZh: `# 市场数据技能

本技能提供金融市场数据访问能力。

## 工具

### \`get_stock_price\`

获取指定标的的 OHLCV（开盘、最高、最低、收盘、成交量）数据。

**参数：**

- \`ticker\`（string）：股票代码（如 "AAPL"、"BTC-USD"）。
- \`timeframe\`（string）：数据间隔。支持：'1d'、'1wk'、'1mo'。默认：'1d'。
- \`period1\`（string，可选）：开始日期，格式 YYYY-MM-DD。默认 30 天前。
- \`period2\`（string，可选）：结束日期，格式 YYYY-MM-DD。默认今天。

**用法：**

当用户询问股价、历史数据、图表数据或某资产的近期表现时使用。

**示例：**

- "Get daily data for Apple." -> \`get_stock_price({ ticker: 'AAPL', timeframe: '1d' })\`
- "Show me Bitcoin's weekly chart for the last year." -> \`get_stock_price({ ticker: 'BTC-USD', timeframe: '1wk', period1: '2023-01-01' })\`

### \`get_crypto_price\`

获取加密货币代币的当前价格与 24 小时波动数据。

**参数：**

- \`token\`（string）：代币名称或 ID（如 "bitcoin"、"solana"、"ethereum"）。
- \`currency\`（string，可选）：目标货币。默认："usd"。

**用法：**

用于查询加密货币价格、波动率与 24 小时涨跌。

**示例：**

- "Price of Solana?" -> \`get_crypto_price({ token: 'solana' })\`
- "How is Bitcoin doing?" -> \`get_crypto_price({ token: 'bitcoin' })\`

### \`fetch_economic_calendar\`

获取即将发生的高影响经济事件（如 CPI、FOMC、GDP）。

**参数：**

- \`importance\`（string，可选）：影响级别筛选。'High'、'Medium'、'Low'、'All'。默认：'High'。
- \`currencies\`（string，可选）：逗号分隔的货币代码（如 'USD,EUR'）。默认：全部。

**用法：**

用于查看可能引发市场波动的新闻或安排风险。

**示例：**

- "Any high impact news this week?" -> \`fetch_economic_calendar({ importance: 'High' })\`
- "Check USD and EUR calendar." -> \`fetch_economic_calendar({ currencies: 'USD,EUR' })\`

### \`get_news_headlines\`

获取特定资产或主题的最新 50 条新闻标题。

**参数：**

- \`query\`（string）：搜索主题（如 "Apple Stock"、"Bitcoin Regulation"、"Nvidia Earnings"）。

**用法：**

用于情绪分析与跟踪市场叙事。

**示例：**

- "Any news on Tesla?" -> \`get_news_headlines({ query: 'Tesla Stock' })\`
- "Latest crypto regulation updates?" -> \`get_news_headlines({ query: 'Crypto Regulation' })\``,
};
