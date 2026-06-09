module.exports = {
  skillId: 'totalclaw:totalclaw~obcraft-apiosk',
  descriptionZh:
    '通过 x402 协议和 Base 区块链 USDC 微支付实现无密钥 API 访问，按请求付费，无需 API 密钥或账户。',
  bodyZh: `# Apiosk - 使用 USDC 微支付的无密钥 API 访问

**面向 agent 的按请求付费 API 访问。无需 API 密钥。无需账户。付费即可调用。**

Apiosk 让 agent 能够使用 x402 协议访问生产环境 API——基于 Base 区块链的 USDC 微支付。停止管理 API 密钥，开始按请求付费。

---

## 🎯 此技能的功能

- **发现 API** - 浏览 9+ 个生产环境 API（天气、价格、新闻、地理编码等）
- **按请求付费** - 自动 USDC 微支付（每次调用 $0.001-0.10）
- **无需设置** - 无需 API 密钥、无需账户、无需订阅
- **即时访问** - 通过 x402 支付立即调用 API

---

## 📦 安装

\`\`\`bash
# Via ClawHub
clawhub install apiosk

# Or clone manually
git clone https://github.com/apiosk/apiosk-skill
\`\`\`

---

## ⚙️ 配置

### 1. 设置钱包（一次性）

\`\`\`bash
# Generate new wallet (or import existing)
./setup-wallet.sh

# This creates ~/.apiosk/wallet.json with:
# - Private key (stored locally, chmod 600 for security)
# - Public address
# - Base mainnet RPC

**IMPORTANT:** The private key is stored in plaintext in \`~/.apiosk/wallet.json\` (with restrictive file permissions). Only fund this wallet with small amounts for testing. For production, use a hardware wallet or external key management.
\`\`\`

**重要：** 在 Base 主网上为你的钱包充值 USDC（建议至少 $1-10）。

**如何充值：**
1. 通过 https://bridge.base.org 将 USDC 跨链至 Base
2. 或在 Coinbase 上购买 USDC → 提现至 Base
3. 发送至你的 Apiosk 钱包地址

### 2. 发现可用的 API

\`\`\`bash
# List all APIs
./list-apis.sh

# Output:
# weather       $0.001/req   Get current weather and forecasts
# prices        $0.002/req   Crypto/stock/forex prices  
# news          $0.005/req   Global news by topic/country
# company       $0.01/req    Company info, financials, news
# geocode       $0.001/req   Address → Coordinates
# ...
\`\`\`

---

## 🚀 用法

### 基本 API 调用

\`\`\`bash
# Call weather API
./call-api.sh weather --params '{"city": "Amsterdam"}'

# Output:
# {
#   "temperature": 12,
#   "condition": "Cloudy",
#   "forecast": [...]
# }
# 
# ✅ Paid: $0.001 USDC
\`\`\`

### 从 Agent 代码调用（Node.js）

\`\`\`javascript
const { callApiosk } = require('./apiosk-client');

// Call weather API
const weather = await callApiosk('weather', {
  city: 'Amsterdam'
});

console.log(\`Temperature: \${weather.temperature}°C\`);
// ✅ Automatically paid $0.001 USDC
\`\`\`

### 从 Agent 代码调用（Python）

\`\`\`python
from apiosk_client import call_apiosk

# Call prices API
prices = call_apiosk('prices', {
    'symbols': ['BTC', 'ETH']
})

print(f"BTC: \${prices['BTC']}")
# ✅ Automatically paid $0.002 USDC
\`\`\`

---

## 📚 可用的 API

| API | 每次请求费用 | 说明 | 示例 |
|-----|----------|-------------|---------|
| **weather** | $0.001 | 天气预报 | \`{"city": "NYC"}\` |
| **prices** | $0.002 | 加密货币/股票价格 | \`{"symbols": ["BTC"]}\` |
| **news** | $0.005 | 全球新闻文章 | \`{"topic": "AI"}\` |
| **company** | $0.01 | 公司数据 | \`{"domain": "apple.com"}\` |
| **geocode** | $0.001 | 地址 → 坐标 | \`{"address": "Amsterdam"}\` |
| **code-runner** | $0.05 | 执行代码沙箱 | \`{"lang": "python", "code": "..."}\` |
| **pdf-generator** | $0.02 | HTML → PDF | \`{"html": "<h1>Hi</h1>"}\` |
| **web-screenshot** | $0.03 | URL → 截图 | \`{"url": "example.com"}\` |
| **file-converter** | $0.01 | 转换文件格式 | \`{"from": "docx", "to": "pdf"}\` |

**完整文档：** https://apiosk.com/#docs

---

## 🔧 辅助脚本

### \`list-apis.sh\`
\`\`\`bash
#!/bin/bash
# List all available APIs with pricing

curl -s https://gateway.apiosk.com/v1/apis | jq -r '.apis[] | "\\(.id)\\t$\\(.price_usd)/req\\t\\(.description)"'
\`\`\`

### \`call-api.sh\`
\`\`\`bash
#!/bin/bash
# Call any Apiosk API with automatic payment
# Usage: ./call-api.sh <api-id> --params '{"key":"value"}'

API_ID=$1
PARAMS=$3

# Load wallet
WALLET_ADDRESS=$(jq -r '.address' ~/.apiosk/wallet.json)

# Make request (x402 payment happens via on-chain verification)
# The gateway validates payment on-chain, no client-side signature needed
curl -X POST "https://gateway.apiosk.com/$API_ID" \\
  -H "Content-Type: application/json" \\
  -H "X-Wallet-Address: $WALLET_ADDRESS" \\
  -d "$PARAMS"
\`\`\`

### \`check-balance.sh\`
\`\`\`bash
#!/bin/bash
# Check USDC balance in your Apiosk walle`,
};
