# 技能：charts

## 用途
使用本地 `crypto_charts.py` 模块生成专业技术分析图表，包含 K 线、斐波那契回撤、移动平均线（SMA 20/50）、RSI 与形态识别。

## 何时使用
- Boss Man 问「给我看 BTC 图表」或「对白银做技术分析」
- 需要可视化图表用于市场分析或报告
- 晨间协议图表生成
- 任何需要带可视化技术分析的请求

## 生成全部图表（完整套件）
为 6 个跟踪资产生成图表：BTC、ETH、XRP、SUI、黄金、白银。
**注意：** 因 API 限流，请求间隔约需 2–3 分钟。
```bash
cd ~/clawd && python3 -c "
import json
from crypto_charts import generate_all_charts, cleanup_old_charts
cleanup_old_charts()
report = generate_all_charts(output_dir=os.path.expanduser('~/clawd/charts'))
print(json.dumps(report, indent=2, default=str))
" 2>&1
```

图表保存至：`~/clawd/charts/chart_btc.png`、`chart_eth.png` 等。

## 生成单张图表
快速生成单一资产图表，无需等待完整套件：
```bash
cd ~/clawd && python3 -c "
import os, json
from crypto_charts import (
    fetch_yfinance, fetch_ohlc, fetch_market_data,
    calc_moving_averages, calc_rsi, calc_fibonacci,
    detect_patterns, generate_chart, COINS
)

coin_id = 'COIN_ID'  # bitcoin, ethereum, ripple, sui, gold, silver
info = COINS[coin_id]

# 获取数据（优先 Yahoo Finance，CoinGecko 备用）
df = fetch_yfinance(coin_id)
if df is None or len(df) < 10:
    df = fetch_ohlc(coin_id)
if df is None or len(df) < 10:
    df = fetch_market_data(coin_id)

if df is not None and len(df) >= 5:
    df = calc_moving_averages(df)
    df = calc_rsi(df)
    fib = calc_fibonacci(df)
    patterns = detect_patterns(df)

    chart_path = os.path.expanduser(f'~/clawd/charts/chart_{info[\"symbol\"].lower()}.png')
    generate_chart(coin_id, df, fib, chart_path)

    print(f'Chart: {chart_path}')
    print(f'Price: \${df[\"close\"].iloc[-1]:,.2f}')
    print(f'RSI: {df[\"rsi\"].iloc[-1]:.1f}')
    print('Patterns:')
    for p in patterns:
        print(f'  - {p}')
else:
    print('Not enough data to generate chart')
"
```

## 跟踪资产
| coin_id | Symbol | Chart Color | Data Source |
|---------|--------|------------|-------------|
| bitcoin | BTC | #F7931A | Yahoo Finance → CoinGecko |
| ethereum | ETH | #627EEA | Yahoo Finance → CoinGecko |
| ripple | XRP | #00AAE4 | Yahoo Finance → CoinGecko |
| sui | SUI | #6FBCF0 | Yahoo Finance → CoinGecko |
| gold | XAU | #FFD700 | Yahoo Finance |
| silver | XAG | #C0C0C0 | Yahoo Finance |

## 图表包含内容
- **K 线**（涨绿跌红）— 90 日日线数据
- **20 SMA**（蓝色）与 **50 SMA**（金色）— 趋势与支撑/阻力
- **斐波那契回撤位**（0%、23.6%、38.2%、50%、61.8%、78.6%、100%）
- **RSI 子图**（紫色）— 含超买（70）与超卖（30）线
- **当前价格标记** — 圆点 + 水平线，使用资产主题色

## 形态识别（自动）
模块自动检测并报告：
- SMA 交叉（金叉 / 死叉）
- 头肩顶 / 倒头肩
- 斐波那契区间位置
- 趋势强度（7 日动量）
- RSI 状态（超买/超卖/中性）
- 价格在 90 日区间内的位置

## 通过 Telegram 发送图表
生成后，使用 Clawdbot 原生 `message` 命令发送图片：
```
message (Telegram, target="7887978276") [attach ~/clawd/charts/chart_btc.png]
```

## 规则
- 图表使用 90 日历史 — 足以进行有意义的技术分析
- 优先尝试 Yahoo Finance（免费、稳定），CoinGecko 为备用
- 限流：币种间隔 8 秒，批次冷却 20 秒
- 始终先运行 `cleanup_old_charts()` 避免磁盘堆积
- 图表约 150 DPI，深色主题（背景 #0f172a）
