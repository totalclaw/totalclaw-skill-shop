module.exports = {
  skillId: 'totalclaw:totalclaw~kamal-sutra-btc15-autonomous-market',
  descriptionZh:
    'BTC15 自主预测市场技能，三个协作智能体使用 USDC 提供流动性、交易与结算，无需人工干预的链上经济闭环。',
  bodyZh: `BTC15 自主预测市场
由三个协作智能体驱动、使用 USDC 的全自主 BTC 预测市场。

## 问题
大多数预测市场需要人工干预来提供流动性、交易或结算。这限制了可扩展性，阻碍了真正的智能体原生经济系统。

本技能演示一个全自主预测市场闭环，智能体可以：

提供流动性、
基于市场数据交易、
结算结果、
并在链上以 USDC 结算价值。

系统启动后无需人工交互。

## 智能体
本系统由三个自主智能体组成：

**Maker 智能体**
持续通过铸造 YES/NO 份额并发布卖单来提供流动性。

**Trader 智能体**
监控 BTC 价格走势，并根据预设阈值进行方向性下注。

**Resolver 智能体**
在回合开始和结束时获取 BTC 价格数据，结算市场结果，并自动赎回奖金。

## 经济闭环
每轮遵循全自主生命周期：

1. Maker 以 USDC 提供流动性。
2. Trader 观察 BTC 走势并下注。
3. 回合结束。
4. Resolver 使用外部价格数据判定结果。
5. 合约在链上结算。
6. 奖金自动赎回。
7. 资金在下一轮复用。

这形成持续的链上经济闭环：

流动性 → 交易 → 结算 → 兑付 → 再投资

## 关键特性
全自主：启动后无需人工步骤。
USDC 结算：智能体商务的稳定计价单位。
持续运行：智能体无限期运行。
链上结算与赎回。

## 安装
克隆主项目：

\`\`\`
git clone https://github.com/kamal-sutra/clawbtc15.git
cd clawbtc15
\`\`\`

安装 Python 依赖：

\`\`\`
pip install web3 python-dotenv requests
\`\`\`

创建环境文件：

\`\`\`
cp .env.example .env
\`\`\`

填写以下值：

\`\`\`
RPC=https://sepolia.base.org

MARKET=0x03956BC8745618eCCD7670073f7cAa717caDC5F4
USDC=0x036cbd53842c5426634e7929541ec2318f3dcf7e

MAKER_KEY=<your maker private key>
TRADER_KEY=<your trader private key>
RESOLVER_KEY=<your resolver private key>
\`\`\`

## 命令
运行 maker：

\`\`\`
run-maker
\`\`\`

运行 trader：

\`\`\`
run-trader
\`\`\`

运行 resolver：

\`\`\`
run-resolver
\`\`\`

运行所有智能体：

\`\`\`
run-all
\`\`\`

## 合约详情
Network: Base Sepolia
USDC: 0x036cbd53842c5426634e7929541ec2318f3dcf7e
Market: 0x03956BC8745618eCCD7670073f7cAa717caDC5F4

## 使用场景
智能体原生交易系统。
自主做市。
智能体之间的链上经济协调。
持续预测市场。

为 USDC Hackathon（2026 年 2 月）打造。`,
};
