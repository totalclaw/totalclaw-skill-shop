module.exports = {
  skillId: 'totalclaw:totalclaw~nicofains1-crypto-agent-payments',
  descriptionZh:
    '面向 AI 智能体的加密钱包与支付。通过 OnlySwaps MCP 创建钱包、转账、跨链兑换与推荐返佣，适用于漏洞赏金、奖励计划与智能体间交易。',
  bodyZh: `# 面向 AI 智能体的加密钱包与支付

创建钱包、转账代币，实现智能体间支付。适用于漏洞赏金、奖励系统与智能体对智能体交易。

## 能力

- **创建钱包** — 生成 ERC20 兼容钱包并安全存储密钥
- **转账代币** — 向任意地址发送 ETH、USDC 或任意 ERC20
- **兑换代币** — 跨 13 条链以最优汇率兑换
- **赚取推荐费** — 推荐用户可获得额外兑换费的 80%
- **智能体支付** — 漏洞赏金、奖励计划、自动打款

## MCP 服务器配置

通过 mcporter 配置：
\`\`\`bash
mcporter config add onlyswaps --command "npx -y @onlyswaps/mcp-server@latest stdio" --transport stdio
\`\`\`

Claude Desktop 添加到 MCP 配置：
\`\`\`json
{
  "mcpServers": {
    "onlyswaps": {
      "command": "npx",
      "args": ["-y", "@onlyswaps/mcp-server@latest", "stdio"]
    }
  }
}
\`\`\`

## 可用工具

### 只读（无需钱包）
| 工具 | 说明 |
|------|-------------|
| \`get_quote\` | 从 15+ DEX 聚合器获取兑换报价 |
| \`get_portfolio\` | 查看任意地址的代币余额 |

### 需要钱包（需 PRIVATE_KEY）
| 工具 | 说明 |
|------|-------------|
| \`setup_wallet\` | 创建新钱包（将 PRIVATE_KEY 保存到 .env） |
| \`check_setup\` | 验证钱包配置与余额 |
| \`transfer\` | 向任意地址发送代币 |
| \`swap\` | 执行代币兑换（可选推荐费） |
| \`approve_permit2\` | 授权代币以实现免 gas 兑换 |

## 作为推荐人赚取费用

AI 智能体可在兑换时设置 \`referrerAddress\` 与 \`extraFeeBps\` 赚取费用：

| extraFeeBps | 推荐人获得 | OnlySwaps 获得 | 用户总费用 |
|-------------|---------------|----------------|----------------|
| 0（默认） | 0 bps | 20 bps | 0.20% |
| 10（建议） | 8 bps | 22 bps | 0.30% |
| 100（上限） | 80 bps | 40 bps | 1.20% |

**示例：** \`extraFeeBps: 10\` 时，$1000 兑换：
- 推荐人赚取：$0.80（8 bps）
- 用户支付：共 $3（0.30%）

**注意：** 推荐费仅适用于 ERC20 兑换。原生代币兑换（ETH、BNB）不支持推荐费。

## 重要：私钥处理

**钱包操作必须设置 PRIVATE_KEY。**

用户要创建钱包、转账或兑换时：
1. 先问：「你已有钱包私钥，还是需要我创建新钱包？」
2. 新建：使用 \`setup_wallet\` 生成
3. 已有：请用户提供 PRIVATE_KEY 并设置到环境变量

带 PRIVATE_KEY 调用工具：
\`\`\`bash
PRIVATE_KEY=0x... mcporter call onlyswaps.check_setup chainId=8453
\`\`\`

## 金额格式

**不同工具使用不同格式：**

| 工具 | 格式 | 示例 |
|------|--------|---------|
| \`get_quote\` | wei（最小单位） | \`"1000000000000000"\` = 0.001 ETH |
| \`swap\` | wei（最小单位） | \`"100000000000000000"\` = 0.1 ETH |
| \`transfer\` | 人类可读 | \`"0.001"\` = 0.001 代币 |

**Wei 换算：**
- 1 ETH = \`1000000000000000000\`（18 个零）
- 0.001 ETH = \`1000000000000000\`（15 个零）
- 1 USDC = \`1000000\`（6 位小数）

## 快速示例

**重要：使用带引号字符串的函数调用语法！**

### 获取兑换报价（无需钱包）
\`\`\`bash
mcporter call 'onlyswaps.get_quote(fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE", toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", amount: "1000000000000000", chainId: 8453)'
\`\`\`

### 查看任意地址持仓（无需钱包）
\`\`\`bash
mcporter call 'onlyswaps.get_portfolio(userAddress: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")'
\`\`\`

### 创建新钱包
\`\`\`bash
mcporter call onlyswaps.setup_wallet
# 返回：地址与私钥 — 请保存私钥！
\`\`\`

### 检查钱包配置（需 PRIVATE_KEY）
\`\`\`bash
PRIVATE_KEY=0x... mcporter call 'onlyswaps.check_setup(chainId: 8453)'
\`\`\`

### 转账代币（需 PRIVATE_KEY + 有余额的钱包）
\`\`\`bash
PRIVATE_KEY=0x... mcporter call 'onlyswaps.transfer(tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", toAddress: "0xRecipientAddress", amount: "1000000", chainId: 8453)'
\`\`\`

### 带推荐费的兑换（智能体赚取费用）
\`\`\`bash
PRIVATE_KEY=0x... mcporter call 'onlyswaps.swap(fromToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", toToken: "ETH", amount: "100000000", chainId: 8453, referrerAddress: "0xYourAgentWallet", extraFeeBps: 10)'
\`\`\`

## 支持的链

| 链 | ID | 原生代币 |
|-------|-----|--------------|
| Ethereum | 1 | ETH |
| Base | 8453 | ETH |
| Arbitrum | 42161 | ETH |
| Optimism | 10 | ETH |
| Polygon | 137 | MATIC |
| BNB Chain | 56 | BNB |
| Avalanche | 43114 | AVAX |

## 常用代币地址

| 代币 | Base (8453) | Ethereum (1) |
|-------|-------------|--------------|
| Native (ETH) | 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE | 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE |
| USDC | 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913 | 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48 |

## 安全说明

- 私钥本地存储，从不传输
- 发送前务必验证地址
- 先用小额测试

## 链接

- **npm**: [@onlyswaps/mcp-server](https://www.npmjs.com/package/@onlyswaps/mcp-server)
- **文档**: [onlyswaps.fyi](https://onlyswaps.fyi)

---

由 [OnlySwaps](https://onlyswaps.fyi) 构建 🦞`,
};
