module.exports = {
  skillId: 'totalclaw:totalclaw~ryandeangraves-crypto-prices',
  descriptionZh:
    '使用本地 crypto_prices.py 模块获取加密货币与大宗商品实时价格。作为唯一价格数据源，禁止用网页搜索报价。',
  bodyZh: `# 技能：crypto-prices

## 用途
使用本地 \`crypto_prices.py\` 模块获取加密货币与大宗商品实时价格。这是所有价格数据的**唯一真实来源** — 切勿用网页搜索查价。

## 何时使用
- 用户问「BTC 多少？」「金价多少？」或任何价格查询
- 市场分析、晨间简报或任何报告需要当前价格
- 对话中即将引用价格时

## 如何执行

### 单个价格查询
\`\`\`bash
cd ~/clawd && python3 -c "
from crypto_prices import fetch_live_price, format_price_text
data = fetch_live_price('COIN_NAME')
if data:
    print(format_price_text(data))
    # data 字典含完整详情：
    # data['price'], data['change_24h'], data['change_7d'], data['change_30d']
    # data['market_cap'], data['volume_24h'], data['high_24h'], data['low_24h']
    # data['ath'], data['ath_change_pct'], data['source']
else:
    print('Price unavailable — all providers failed')
"
\`\`\`

### 批量价格查询
\`\`\`bash
cd ~/clawd && python3 -c "
from crypto_prices import fetch_multiple_prices, format_prices_block
prices = fetch_multiple_prices(['bitcoin', 'ethereum', 'xrp', 'sui', 'gold', 'silver'])
print(format_prices_block(prices))
"
\`\`\`

### 快速价格（最小输出）
\`\`\`bash
cd ~/clawd && python3 -c "
from crypto_prices import fetch_live_price
d = fetch_live_price('COIN_NAME')
if d: print(f\\"\{d['symbol']}: \\$\{d['price']:,.6g\} (\{d['change_24h']:+.2f\}%)\\")
"
\`\`\`

## 支持的资产
| 输入 | 解析为 | 来源 |
|-------|-------------|--------|
| btc, bitcoin | bitcoin | CoinGecko |
| eth, ethereum | ethereum | DexScreener → CoinGecko |
| xrp, ripple | ripple | DexScreener → CoinGecko |
| sui | sui | CoinGecko |
| sol, solana | solana | CoinGecko |
| gold, xau | gold | Yahoo Finance → CoinGecko |
| silver, xag | silver | Yahoo Finance → CoinGecko |
| doge, ada, dot, avax, link, matic | various | CoinGecko |

## 提供商链
1. **缓存**（60 秒 TTL）— 新鲜时即时返回
2. **Yahoo Finance** — 仅金属（金/银），大宗商品最可靠
3. **CoinGecko full** — 完整数据（价格、24h/7d/30d 涨跌、ATH/ATL、市值）
4. **CoinGecko simple** — 完整接口被限流时的轻量端点
5. **DexScreener** — 加密 DEX 故障转移（ETH、XRP 优先尝试）

## 规则
- **切勿**用 Brave Search 查价 — 返回过时文章片段，非实时数据
- **切勿**猜测或编造价格 — 所有提供商失败时说「价格不可用」
- 缓存 60 秒 — 一分钟内重复调用免费
- 速率限制：CoinGecko ~10 次/分钟，DexScreener ~60 次/分钟
- 批量查询时模块自动处理延迟`,
};
