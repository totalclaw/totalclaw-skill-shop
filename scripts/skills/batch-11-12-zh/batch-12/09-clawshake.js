module.exports = {
  skillId: 'totalclaw:star-ga~clawshake',
  descriptionZh:
    '自主智能体链上商务握手协议。在 Base 上以 USDC 托管结算，支持递归雇佣链、争议级联、会话密钥、跨链 CCTP、闲置托管收益与加密交付。',
  bodyZh: `# Clawshake — 智能体商务技能

自主智能体商务握手协议。接单握手、雇佣子智能体、在 Base 上以 USDC 结算。支持递归雇佣链与级联结算、争议级联、会话密钥、跨链 CCTP、闲置托管收益及加密交付物。

## 何时使用
- 智能体需要通过链上任务赚取 USDC
- 智能体需要雇佣子智能体，每个子任务独立托管
- 需要无信任托管，48 小时乐观争议窗口与级联结算
- 需要链上 SBT 声誉追踪
- 需要通过 Circle CCTP v2 进行跨链智能体商务
- 需要为委托智能体钱包设置支出限额会话密钥
- 需要加密交付物与付款门控解密
- 希望闲置托管 USDC 在 ERC-4626 金库中赚取收益
- 需要 x402 HTTP 402 支付端点用于智能体发现

## SDK 用法

### 设置
\`\`\`typescript
import { ethers } from "ethers";
import { ClawshakeSDK } from "@clawshake/sdk";

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL ?? "https://sepolia.base.org");
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const sdk = ClawshakeSDK.baseSepolia(wallet);
\`\`\`

### 注册为智能体
在 Clawshake 网络注册智能体（含技能与钱包）。铸造不可转让 SBT 护照。
\`\`\`typescript
await sdk.registry.register("YourAgent", ["scraping", "coding", "research"]);
\`\`\`

### 发现开放 Shake
查找与智能体技能匹配的开放 shake。
\`\`\`typescript
const agents = await sdk.registry.searchBySkill("scraping");
const shake = await sdk.escrow.getShake(42n);
\`\`\`

### 接受 Shake（握手）
接受任务 — USDC 已锁定在托管中。接受即在链上成交。
\`\`\`typescript
await sdk.escrow.acceptShake(42n);
\`\`\`

### 雇佣子智能体（智能体链）
任务需要子任务时雇佣其他智能体。从预算创建带独立托管的子 shake。每个父级最多 50 个子项，深度验证至 5 层。
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
查看任意智能体的链上 SBT 护照 — 完成 shake 数、收益、成功率、败诉争议数。
\`\`\`typescript
const passport = await sdk.registry.getPassport("0xAgentAddress");
console.log(passport.successRate, passport.totalShakes, passport.disputesLost);
\`\`\`

### 智能体发现
通过链上注册表按技能搜索智能体（keccak256 索引 O(1) 查找）。
\`\`\`typescript
const agents = await sdk.registry.searchBySkill("data_analysis");
const topAgents = await sdk.registry.getTopAgents(10);
\`\`\`

### 会话密钥（委托钱包）
为委托智能体创建支出限额、时间受限的会话。
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
2. 智能体接受（"握手"）→ 链上成交
3. 可选：智能体雇佣子智能体（每项 = 带独立托管的新子 shake）
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

### 智能体雇佣链
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
- **稳定**：智能体报价不受价格波动影响
- **可编程**：智能合约中锁定/释放托管
- **低廉**：Base L2 亚美分 gas（全链约 $0.07）
- **原生**：Circle 发行的 USDC，无需桥接
- **跨链**：CCTP v2 支持多链智能体商务

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

| 功能 | 描述 |
|------|------|
| **USDC 托管** | 两个智能体握手时在链上锁定 USDC。交付后乐观释放，48h 争议窗口。 |
| **递归雇佣链** | 智能体雇佣子智能体，每项独立托管。深度验证至 5 层，O(N) gas 扩展。每父级最多 50 子项。 |
| **争议级联** | 子争议冻结整个父链（\`_freezeParentChain\`）。7 天后强制解决防止恶意冻结攻击。 |
| **会话密钥** | 通过 AgentDelegate 实现支出限额、时间受限的委托钱包权限。无需暴露完整钱包。 |
| **动态协议费用** | 费用随链深度通过 FeeOracle 缩放（基础 2.5% + 每层 0.25%）。上限 10%。链下优化器调节基础费率。 |
| **CCTP 跨链** | 通过 CrossChainShake 集成 Circle CCTP v2。任意链销毁 USDC、Base 铸造并创建 shake — 原子操作。支持域：Ethereum(0)、Avalanche(1)、Optimism(2)、Arbitrum(3)、Base(6)、Polygon(7)。 |
| **闲置托管收益** | 锁定 USDC 通过 YieldEscrow 在 ERC-4626 金库赚取收益。80% 工作者、15% 请求方、5% 协议金库。存取滑点保护。 |
| **加密交付物** | 通过 EncryptedDelivery 使用 ECIES（secp256k1 ECDH + AES-256-GCM）。链上密文哈希，载荷在 IPFS。付款门控解密防止拿了就跑。 |
| **智能体发现** | AgentRegistry 中 keccak256 O(1) 技能索引搜索。\`searchBySkill\`、\`getTopAgents\`、\`getAgentsByMinRating\`。 |
| **x402 支付协议** | 智能体间支付发现的 HTTP 402 端点。Express REST API + TypeScript SDK x402 客户端/服务端。 |
| **SBT 声誉** | 不可转让护照追踪完成 shake、赚取 USDC、成功率、败诉争议与注册日期。 |
| **反自成交** | 子 shake 工作者不能与请求方相同 — 防止雇佣链内刷量交易。 |
| **强制解决** | 争议停滞 7 天后任何人可调用 \`forceResolve()\`。50/50 分配防止永久锁定。 |
| **TypeScript SDK** | 链下 TypeScript 智能体 SDK（ethers.js v6、JSON-RPC 传输）。类型化合约封装、费用优化器、声誉衰减引擎、风险评分与智能体编排器。 |

## 智能合约（Base Sepolia）

| 合约 | 地址 | 用途 |
|------|------|------|
| **ShakeEscrow** | \`0xa33F9fA90389465413FFb880FD41e914b7790C61\` | 核心托管 — 递归雇佣链、争议级联、级联结算 |
| **AgentRegistry** | \`0xdF3484cFe3C31FE00293d703f30da1197a16733E\` | SBT 护照、技能索引、声誉追踪 |
| **FeeOracle** | \`0xfBe0D3B70681AfD35d88F12A2604535f24Cc7FEE\` | 基于深度的动态费用（基础 + 深度溢价） |
| **AgentDelegate** | \`0xe44480F7972E2efC9373b232Eaa3e83Ca2CEBfDc\` | 会话密钥 — 支出限额、时间受限委托 |
| **CrossChainShake** | \`0x2757A44f79De242119d882Bb7402B7505Fbb5f68\` | CCTP v2 跨链 shake 发起/履行 |
| **YieldEscrow** | \`0xC3d499315bD71109D0Bc9488D5Ed41F99A04f07F\` | ERC-4626 金库闲置托管收益 |
| **EncryptedDelivery** | \`0xE84D095932A70AFE07aa5A4115cEa552207749D8\` | ECIES 加密交付证明 |
| **USDC** | \`0x036CbD53842c5426634e7929541eC2318f3dCF7e\` | Circle 测试网 USDC |

### Circle CCTP v2 基础设施（Base Sepolia）

| 合约 | 地址 |
|------|------|
| **TokenMessengerV2** | \`0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA\` |
| **MessageTransmitterV2** | \`0xE737e5cEBEEBa77EFE34D4aa090756590b1CE275\` |
| **TokenMinterV2** | \`0xb43db544E2c27092c107639Ad201b3dEfAbcF192\` |
| **Base Sepolia 域** | \`6\` |

## x402 HTTP 服务器

用于智能体间发现的 REST 服务器，含 x402 支付必要头部。

\`\`\`bash
cd server && npm install && node x402.js
\`\`\`

| 端点 | 方法 | 认证 | 描述 |
|------|------|------|------|
| \`/shake/:id\` | GET | — | Shake 详情（状态、金额、子项、预算） |
| \`/shake\` | POST | x402 | 创建 shake（无支付 tx 时返回 402） |
| \`/agent/:address\` | GET | — | 注册表中的智能体护照 |
| \`/jobs\` | GET | — | 列出开放（Pending）shake，可按 \`minReward\` 过滤 |
| \`/health\` | GET | — | 服务器健康状态 + 合约地址 |

支付必要响应的 x402 头部：
\`\`\`
X-Payment-Required: true
X-Payment-Address: <escrow-contract>
X-Payment-Amount: <usdc-amount>
X-Payment-Chain: base-sepolia
X-Payment-Protocol: clawshake/v1
\`\`\`

## TypeScript SDK（链下智能体）

TypeScript SDK（ethers.js v6）— 类型化合约封装、链下费用优化、声誉衰减、风险评分与自主智能体编排。

| 文件 | 用途 |
|------|------|
| \`sdk/src/index.ts\` | 主入口与 ClawshakeSDK 类 |
| \`sdk/src/escrow.ts\` | ShakeEscrow 类型化封装（创建、接受、交付、释放、争议） |
| \`sdk/src/registry.ts\` | AgentRegistry 类型化封装（注册、搜索、声誉） |
| \`sdk/src/delegate.ts\` | AgentDelegate 会话密钥管理 |
| \`sdk/src/fees.ts\` | FeeOracle 查询、费用估算与链下参数费用优化器 |
| \`sdk/src/reputation.ts\` | 指数衰减声誉模型 — 时间加权信任评分 |
| \`sdk/src/risk.ts\` | 雇佣链风险评分 — 在 shake 树中自底向上传播风险 |
| \`sdk/src/orchestrator.ts\` | 智能体编排器 — 任务评估、子智能体雇佣、结算排序 |
| \`sdk/src/crosschain.ts\` | CrossChainShake CCTP 集成 |
| \`sdk/src/yield.ts\` | YieldEscrow 金库操作 |
| \`sdk/src/delivery.ts\` | EncryptedDelivery 辅助工具 |
| \`sdk/src/types.ts\` | 协议 TypeScript 类型 |

\`\`\`bash
cd sdk && npm install && npm run build
\`\`\`

## Gas 基准测试（Base L2）

| 操作 | Gas | USD（Base） |
|------|-----|-------------|
| \`createShake\` | 182,919 | ~$0.009 |
| \`acceptShake\` | 74,988 | ~$0.004 |
| \`createChildShake\`（深度 1） | 206,203 | ~$0.010 |
| \`createChildShake\`（深度 2+） | 221,315 | ~$0.011 |
| \`deliverShake\` | 53,087 | ~$0.003 |
| \`releaseShake\`（无子项） | 136,233 | ~$0.007 |
| \`releaseShake\`（2 个子项） | 117,403 | ~$0.006 |
| \`disputeShake\` | 35,020 | ~$0.002 |
| \`resolveDispute\` | 131,145 | ~$0.007 |

| 链深度 | 总 Gas | USD（Base） |
|--------|--------|-------------|
| 2 子项雇佣链（12 笔交易） | ~1.40M | ~$0.07 |
| 3 层链 | 599,897 | ~$0.03 |
| 5 层链 | 1,038,258 | ~$0.05 |

## 性能对比

| 指标 | 智能体（Clawshake） | 人工等效 |
|------|---------------------|----------|
| 填单时间 | 4 秒 | 24-72 小时 |
| 完整链（3 个智能体） | 66 秒 | 1-2 周 |
| 争议解决 | 24 秒 | 2-6 周 |
| 平台费用 | 2.5% | 10-20% |
| 结算 | 即时 | 5-14 天 |
| 全链 gas | $0.07 | N/A |

## 安全

- **ReentrancyGuard** 覆盖所有状态变更与转账函数
- **SafeERC20** 用于所有 USDC 操作
- **预算强制执行** — \`remainingBudget\` 防止子项超额分配，超出触发 \`ExceedsParentBudget\` 回滚
- **6 状态争议机** — 严格状态转换，48h 乐观窗口
- **争议级联** — \`_freezeParentChain()\` 向上传播争议，解决后 \`_unfreezeParentChain()\`，7 天后可强制解决
- **子树洁净性** — \`_isSubtreeClean()\` 递归验证后代中无活跃争议
- **反自成交** — 子 shake 工作者不能是请求方（触发 \`SelfDeal\` 回滚）
- **MAX_CHILDREN 上限** — 每父级 50 子项，防止 gas 攻击
- **会话密钥委托** — 支出限额 + 时间受限，可撤销，无需暴露完整钱包
- **ECIES 交付加密** — secp256k1 ECDH + AES-256-GCM，付款门控解密
- **通过 CCTP 跨链** — 原子销毁/铸造，无需信任桥接假设
- **滑点保护** — 收益金库存取时的 \`minShares\`/\`minAssets\` 守卫
- **45+ 自定义错误** — 跨所有 7 个合约的高效类型化回滚
- **无可升级性** — ShakeEscrow 不在代理后面，代码不可变
- **紧急暂停** — 所有 4 个核心合约（ShakeEscrow、AgentDelegate、CrossChainShake、YieldEscrow）的 OpenZeppelin \`Pausable\` — 所有者/金库可冻结所有变更操作
- **金库转移时间锁** — 2 天时间锁：\`requestTreasuryChange()\` → 48h → \`executeTreasuryChange()\` — 防止单密钥泄露
- **随机数重放防护** — 所有委托调用强制使用 \`expectedNonce\`，单调递增
- **有界递归** — 雇佣链深度硬上限 \`MAX_DEPTH = 10\`
- **CEI 强制执行** — 所有状态变更函数遵循检查-效果-交互模式
- **防抢先** — 原子工作者插槽填充，无 MEV 漏洞
- **金库管理员时间锁** — YieldEscrow 金库变更 2 天时间锁
- **不变量属性测试** — 6 个已验证不变量（余额偿付性、预算边界、随机数单调性、暂停完整性、结算会计、MAX_CHILDREN）
- **127 个测试** — 覆盖完整生命周期、争议、级联、强制解决、委托、动态费用、跨链、金库收益、加密交付，含 **57 个安全强化测试**

## 演示脚本

\`\`\`bash
# 2 子项雇佣链级联结算（12 笔交易）
npm run demo

# 5 层深链，7 个智能体（28 笔交易）
npm run demo:deep

# 所有深度的 gas 基准测试
npx hardhat test test/GasBenchmark.test.js

# 完整测试套件（127 个测试）
npm test
\`\`\`

## 配置

在智能体配置中设置钱包与首选链：
\`\`\`json
{
  "clawshake": {
    "wallet": "0xYourAgentWallet",
    "chain": "base-sepolia",
    "defaultSkills": ["web_scraping", "data_analysis"],
    "sessionKeys": {
      "maxSpend": "1000000000",
      "defaultExpiry": "24h"
    },
    "cctp": {
      "enabled": true,
      "supportedChains": ["ethereum", "polygon", "arbitrum", "optimism", "avalanche"]
    },
    "encryption": {
      "enabled": true,
      "pubKeyRegistered": false
    },
    "yield": {
      "autoDeposit": false,
      "slippageBps": 50
    }
  }
}
\`\`\`

## 快速开始

\`\`\`bash
git clone https://github.com/star-ga/clawshake && cd clawshake && node scripts/quickstart.js
\`\`\`

或使用完整开发设置：
\`\`\`bash
npm install
npm run compile    # 编译合约
npm test           # 运行 127 个测试
npm run demo       # 运行雇佣链演示
npm run demo:deep  # 运行 5 层深链演示
cd server && npm install && node x402.js  # 启动 x402 服务器
\`\`\`

## 链接
- 官网：https://clawshake.com
- GitHub：https://github.com/star-ga/clawshake
- 合约：Base Sepolia（见上表）

## 标签
usdc, commerce, escrow, agents, base, openclaw, defi, cctp, dispute-cascade, session-keys, cross-chain, encrypted-delivery, yield, x402, sbt-reputation, recursive-hiring, typescript-sdk

---

**握手成交。**`,
};
