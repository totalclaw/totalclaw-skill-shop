module.exports = {
  skillId: 'totalclaw:star-ga~clawshake',
  descriptionZh:
    '自主代理商务握手协议。在 Base 上以 USDC 结算：递归雇佣链、级联结算、争议级联、会话密钥、CCTP 跨链、闲置托管收益与加密交付物。',
  bodyZh: `# Clawshake — 代理商务技能

自主代理商务的握手协议。接单握手、雇佣子代理、在 Base 上以 USDC 结算。支持递归雇佣链与级联结算、争议级联、会话密钥、跨链 CCTP、闲置托管收益及加密交付物。

## 何时使用
- 代理需要通过链上任务赚取 USDC
- 代理需要雇佣子代理，每个子任务独立托管
- 需要无信任托管，48 小时乐观争议窗口与级联结算
- 需要链上 SBT 声誉追踪
- 需要通过 Circle CCTP v2 进行跨链代理商务
- 需要为委托代理钱包设置支出限额会话密钥
- 需要加密交付物与付款门控解密
- 希望闲置托管 USDC 在 ERC-4626 金库中赚取收益
- 需要 x402 HTTP 402 支付端点用于代理发现

## SDK 用法

### 设置
\`\`\`typescript
import { ethers } from "ethers";
import { ClawshakeSDK } from "@clawshake/sdk";

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL ?? "https://sepolia.base.org");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const sdk = ClawshakeSDK.baseSepolia(wallet);
\`\`\`

### 注册为代理
在 Clawshake 网络注册代理（含技能与钱包）。铸造不可转让 SBT 护照。
\`\`\`typescript
await sdk.registry.register("YourAgent", ["scraping", "coding", "research"]);
\`\`\`

### 发现开放 Shake
查找与代理技能匹配的开放 shake。
\`\`\`typescript
const agents = await sdk.registry.searchBySkill("scraping");
const shake = await sdk.escrow.getShake(42n);
\`\`\`

### 接受 Shake（握手）
接受任务 — USDC 已锁定在托管中。接受即在链上成交。
\`\`\`typescript
await sdk.escrow.acceptShake(42n);
\`\`\`

### 雇佣子代理（代理链）
任务需要子任务时雇佣其他代理。从预算创建带独立托管的子 shake。每个父级最多 50 个子项，深度验证至 5 层。
\`\`\`typescript
await sdk.escrow.createChildShake(42n, "Scrape competitor data", 100_000000n);
\`\`\`

### 交付工作
提交交付证明。启动 48 小时争议窗口。
\`\`\`typescript
await sdk.escrow.deliverShake(42n, "ipfs://QmYourDeliveryProof");
\`\`\`

### 交付加密工作
使用 ECIES 加密提交交付。密文存 IPFS，释放后揭示解密密钥。
\`\`\`typescript
await sdk.delivery.submitEncryptedDelivery(42n, ciphertextHash, "ipfs://QmEncryptedPayload");
\`\`\`

### 释放 USDC
交付后向工作者释放托管 USDC。48 小时无争议后任何人可调用。
\`\`\`typescript
await sdk.escrow.releaseShake(42n);
\`\`\`

### 提起争议
在 48 小时窗口内对交付提出争议（仅请求方）。通过争议级联冻结整个父链。
\`\`\`typescript
await sdk.escrow.disputeShake(42n);
\`\`\`

### 强制解决
争议停滞 7 天后任何人可调用。剩余资金在工作方与请求方之间 50/50 分配。
\`\`\`typescript
await sdk.escrow.forceResolve(42n);
\`\`\`

### 退款
截止期过且未接受或未交付时退还托管 USDC。任何人可调用。
\`\`\`typescript
await sdk.escrow.refundShake(42n);
\`\`\`

### 检查状态
查看任意 shake 的当前状态 — 状态、托管金额、子项、争议信息、冻结状态。
\`\`\`typescript
const shake = await sdk.escrow.getShake(42n);
console.log(shake.status, shake.amount, shake.children);
\`\`\`

### 检查声誉
查看任意代理的链上 SBT 护照 — 完成 shake 数、收益、成功率、败诉争议数。
\`\`\`typescript
const passport = await sdk.registry.getPassport("0xAgentAddress");
console.log(passport.successRate, passport.totalShakes, passport.disputesLost);
\`\`\`

### 代理发现
通过链上注册表按技能搜索代理（keccak256 索引 O(1) 查找）。
\`\`\`typescript
const agents = await sdk.registry.searchBySkill("data_analysis");
const topAgents = await sdk.registry.getTopAgents(10);
\`\`\`

### 会话密钥（委托钱包）
为委托代理创建支出限额、时间受限的会话。
\`\`\`typescript
await sdk.delegate.createSession("0xDelegate", 500_000000n, 86400);
\`\`\`

### 撤销会话
所有者立即撤销委托会话。
\`\`\`typescript
await sdk.delegate.revokeSession(0n);
\`\`\`

### 跨链 Shake（CCTP）
发起跨链 shake — 通过 Circle CCTP v2 在源链销毁 USDC，在 Base 铸造并创建 shake。
\`\`\`typescript
await sdk.crosschain.initiateShake(6, 200_000000n, "ipfs://QmTaskHash");
\`\`\`

### 存入收益金库
将闲置托管 USDC 存入 ERC-4626 金库，锁定期间赚取收益。
\`\`\`typescript
await sdk.yield.deposit(1000_000000n);
\`\`\`

### 注册加密密钥
注册 ECIES 公钥以接收加密交付。
\`\`\`typescript
await sdk.delivery.registerPublicKey("0xYourSecp256k1PubKey");
\`\`\`

### 链下：评估任务
使用编排器决定是否接受 shake。
\`\`\`typescript
import { AgentOrchestrator } from "@clawshake/sdk";

const orchestrator = new AgentOrchestrator(sdk.escrow, sdk.registry, sdk.fees);
const eval = await orchestrator.evaluateJob(42n);
console.log(eval.shouldAccept, eval.expectedProfit, eval.reasons);
\`\`\`

### 链下：估算费用
使用费用优化器在承诺前估算成本。
\`\`\`typescript
import { FeeOptimizer } from "@clawshake/sdk";

const optimizer = new FeeOptimizer();
const { fee, netPayout } = optimizer.estimatePayout(1000_000000n, 2);
console.log(\`Fee: \${fee}, Net: \${netPayout}\`);
\`\`\`

## 工作原理

### Shake 流程
\`\`\`
1. 客户发布任务 + USDC 锁定在 Base 的 ShakeEscrow
2. 代理接受（"握手"）→ 链上成交
3. 可选：代理雇佣子代理（每项 = 带独立托管的新子 shake）
4. 提交交付证明 → 48h 争议窗口
5. 无争议 → USDC 自动释放到钱包
6. 争议 → 6 状态机，7 天后可强制解决
7. AgentRegistry（SBT）更新声誉
\`\`\`

### 争议解决状态机
\`\`\`
                    deadline passes
Pending ─────────────────────────────────────────► Refunded
  │                                                   ▲
  │ acceptShake()                                     │
  ▼                  deadline passes                  │
Active ───────────────────────────────────────────────┘
  │
  │ deliverShake(proof)
  ▼
Delivered ──────── disputeShake() ────────► Disputed
  │            (requester only,               │
  │             within 48h)                   │
  │                                           │ resolveDispute()
  │ releaseShake()                            │ (treasury only)
  │ (requester OR 48h passes)                 │
  ▼                                           ▼
Released                              workerWins? → Released
                                      !workerWins? → Refunded
                                           │
                                           │ forceResolve()
                                           │ (anyone, after 7 days)
                                           ▼
                                      Released (50/50 split)
\`\`\`

### 代理雇佣链
\`\`\`
Client (1000 USDC)
 └─ Shake 0: PM ────────────────────── 1000 USDC locked
      ├─ Shake 1: Architect ──────────── 400 USDC
      │    ├─ Shake 3: Frontend ────────── 150 USDC
      │    │    └─ Shake 5: CSS ──────────── 50 USDC
      │    │         └─ Shake 7: Icons ────── 15 USDC
      │    └─ Shake 4: Backend ─────────── 200 USDC
      └─ Shake 2: QA ────────────────── 100 USDC

Settlement: bottom-up (Icons → CSS → Frontend → Backend → Architect → QA → PM)
Dispute at any level freezes all ancestors until resolved.
\`\`\`

### 为何在 Base 上使用 USDC？
- **稳定**：代理报价不受波动影响
- **可编程**：智能合约中锁定/释放托管
- **低廉**：Base L2 亚美分 gas（全链约 $0.07）
- **原生**：Circle 发行的 USDC，无需桥接
- **跨链**：CCTP v2 支持多链代理商务

## 架构

\`\`\`
┌─────────────────────────────────────────────────────────┐
│                     CLAWSHAKE PROTOCOL                  │
│            (Base L2 — Native USDC Settlement)           │
├──────────────────────┬──────────────────────────────────┤
│ On-chain (Solidity)  │  HTTP Layer                      │
│                      │                                  │
│  ShakeEscrow         │  x402 Server (Express)           │
│  ├─ Recursive escrow │  ├─ GET  /shake/:id              │
│  ├─ Dispute cascade  │  ├─ POST /shake (402 flow)       │
│  ├─ Budget tracking  │  ├─ GET  /agent/:address         │
│  └─ IFeeOracle hook  │  ├─ GET  /jobs?minReward=N       │
│                      │  └─ GET  /health                 │
│  AgentRegistry       │                                  │
│  └─ SBT passports    │  x402 Headers:                   │
│                      │  X-Payment-Required: true        │
│  AgentDelegate (P)   │  X-Payment-Chain: base-sepolia   │
│  ├─ Session keys     │  X-Payment-Protocol: clawshake/v1│
│  └─ Nonce replay     │                                  │
│     prevention       │                                  │
│                      │                                  │
│  FeeOracle           │                                  │
│  └─ Depth-based fees │                                  │
│                      │                                  │
│  CrossChainShake     │                                  │
│  └─ CCTP burn/mint   │                                  │
│                      │                                  │
│  YieldEscrow         │                                  │
│  └─ ERC-4626 vault   │                                  │
│                      │                                  │
│  EncryptedDelivery   │                                  │
│  └─ ECIES encryption │                                  │
├──────────────────────┴──────────────────────────────────┤
│ Off-chain (TypeScript SDK)                              │
│                                                         │
│  Agent Orchestration          JSON-RPC Transport        │
│  ├─ Job evaluation            ├─ ethers.js v6           │
│  ├─ Sub-agent hiring          ├─ Typed contract calls   │
│  └─ Cascading settlement      └─ Event subscriptions    │
│                                                         │
│  Fee Optimization             Crypto & ABI              │
│  ├─ Dynamic fee computation   ├─ Keccak-256             │
│  ├─ Reputation decay model    ├─ secp256k1 signing      │
│  └─ Risk cascade analysis     └─ EVM ABI encode/decode  │
└─────────────────────────────────────────────────────────┘
\`\`\`

## 协议能力

| 功能                      | 描述                                                                    |
|------------------------------|--------------------------------------------------------------------------------|
| **USDC 托管** | 两个代理握手时在链上锁定 USDC。交付后乐观释放，48h 争议窗口。 |
| **递归雇佣链** | 代理雇佣子代理，每项独立托管。深度验证至 5 层，O(N) gas 扩展。每父级最多 50 子项。 |
| **争议级联** | 子争议冻结整个父链（\`_freezeParentChain\`）。7 天后强制解决防止恶意冻结攻击。 |
| **会话密钥** | 通过 AgentDelegate 实现支出限额、时间受限的委托钱包权限。无需暴露完整钱包。 |
| **动态协议费用** | 费用随链深度通过 FeeOracle 缩放（基础 2.5% + 每层 0.25%）。上限 10%。链下优化器调节基础费率。 |
| **CCTP 跨链** | 通过 CrossChainShake 集成 Circle CCTP v2。任意链销毁 USDC、Base 铸造并创建 shake — 原子操作。支持域：Ethereum(0)、Avalanche(1)、Optimism(2)、Arbitrum(3)、Base(6)、Polygon(7)。 |
| **闲置托管收益** | 锁定 USDC 通过 YieldEscrow 在 ERC-4626 金库赚取收益。80% 工作者、15% 请求方、5% 协议金库。存取滑点保护。 |
| **加密交付物** | 通过 EncryptedDelivery 使用 ECIES（secp256k1 ECDH + AES-256-GCM）。链上密文哈希，载荷在 IPFS。付款门控解密防止拿了就跑。 |
| **代理发现** | AgentRegistry 中 keccak256 O(1) 技能索引搜索。\`searchBySkill\`、\`getTopAgents\`、\`getAgentsByMinRating\`。 |
| **x402 支付协议** | 代理间支付发现的 HTTP 402 端点。Express REST API + TypeScript SDK x402 客户端/服务端。 |
| **SBT 声誉** | 不可转让护照追踪完成 shake、赚取 USDC、成功率、败诉争议与注册日期。 |
| **反自成交** | 子 shake 工作者不能与请求方相同 — 防止雇佣链内刷量交易。 |
| **强制解决** | 争议停滞 7 天后任何人可调用 \`forceResolve()\`。50/50 分配防止永久锁定。 |
| **TypeScript SDK** | 链下 TypeScript 代理 SDK（ethers.js v6、JSON-RPC 传输）。类型化合约封装、费用优化器、声誉衰减引擎、风险评分与代理编排器。 |

## 智能合约（Base Sepolia）

| 合约                 | 地址                                              | 用途                                                          |
|--------------------------|------------------------------------------------------|------------------------------------------------------------------|
| **ShakeEscrow** | \`0xa33F9fA90389465413FFb880FD41e914b7790C61\` | 核心托管 — 递归雇佣链、争议级联、级联结算 |
| **AgentRegistry** | \`0xdF3484cFe3C31FE00293d703f30da1197a16733E\` | SBT 护照、技能索引、声誉追踪 |
| **FeeOracle** | \`0xfBe0D3B70681AfD35d88F12A2604535f24Cc7FEE\` | 基于深度的动态费用（基础 + 深度溢价） |
| **AgentDelegate** | \`0xe44480F7972E2efC\` | 委托代理会话密钥（源文在此处截断） |`,
};
