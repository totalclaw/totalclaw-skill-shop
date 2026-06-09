module.exports = {
  skillId: 'totalclaw:totalclaw~vladthecto-crewmind-bets',
  descriptionZh:
    'CrewMind Arena 下注技能：在 LLM 模型竞技中下注预测胜者，若所选模型获胜可领取奖励。基于 Solana 主网链上程序。',
  bodyZh: `# CrewMind Arena 下注技能

> **TL;DR**：在 CrewMind Arena 的 LLM 模型竞赛中下注。预测每轮获胜 AI 并下注，若你的模型获胜可领取奖励。

## 快速开始

\`\`\`bash
npm install @solana/web3.js @coral-xyz/anchor dotenv
\`\`\`

## 程序信息

| 参数 | 值 |
|-----------|-------|
| **Program ID** | \`F5eS61Nmt3iDw8RJvvK5DL4skdKUMA637MQtG5hbht3Z\` |
| **Network** | Solana Mainnet |
| **Website** | https://crewmind.xyz |

## 舰船索引映射

| 索引 | 模型 |
|-------|-------|
| 0 | OpenAI |
| 1 | DeepSeek |
| 2 | Grok |
| 3 | Gemini |

---

## PDA Seeds

| 账户 | Seeds |
|---------|-------|
| Config | \`["config"]\` |
| Round | \`["round", config, round_id]\` |
| Bet | \`["bet", round, user]\` |
| Vault | \`["vault", round]\` |

---

## 指令 Discriminator

| 指令 | Discriminator (bytes) |
|-------------|----------------------|
| \`place_bet\` | \`[222, 62, 67, 220, 63, 166, 126, 33]\` |
| \`claim\` | \`[62, 198, 214, 193, 213, 159, 108, 210]\` |

---

## 账户结构

### Config 账户（120 字节）

\`\`\`
Offset  Size  Field
─────────────────────────────────
0       8     discriminator
8       32    admin (Pubkey)
40      32    treasury (Pubkey)
72      8     next_round_id (u64)
80      32    active_round (Pubkey) ← 使用此字段！
112     8     active_round_id (u64)
\`\`\`

### Round 账户（190 字节）

\`\`\`
Offset  Size  Field
─────────────────────────────────
0       8     discriminator
8       8     id (u64)
16      1     status (u8: 0=Open, 1=Finalized)
17      1     ship_count (u8)
18      1     winner_ship (u8, 255=unset)
19      1     swept (bool)
20      8     start_ts (i64)
28      8     end_ts (i64)
36      8     finalized_ts (i64)
44      8     min_bet (u64)
52      8     max_bet (u64)
60      2     participants (u16)
62      8     total_staked (u64)
70      32    totals_by_ship ([u64; 4])
102     64    weighted_by_ship ([u128; 4])
166     8     losing_pool (u64)
174     16    total_weighted_winners (u128)
\`\`\`

### Bet 账户（96 字节）

\`\`\`
Offset  Size  Field
─────────────────────────────────
0       8     discriminator
8       1     initialized (bool)
9       32    round (Pubkey)
41      32    user (Pubkey)
73      1     ship (u8)
74      1     claimed (bool)
75      6     _pad
81      8     total_amount (u64)
89      16    total_weighted (u128)
\`\`\`

---

## 入口：place_bet

### 目标
在活跃轮次中对某舰船（AI 模型）下注。

### 指令
\`place_bet(ship: u8, amount: u64)\`

### 账户（按顺序）

| # | 账户 | 签名 | 可写 | 说明 |
|---|---------|--------|----------|-------------|
| 0 | user | ✓ | ✓ | 你的钱包 |
| 1 | config | | | PDA \`["config"]\` |
| 2 | round | | ✓ | config 中的 active round pubkey |
| 3 | bet | | ✓ | PDA \`["bet", round, user]\` |
| 4 | vault | | ✓ | PDA \`["vault", round]\` |
| 5 | system_program | | | \`11111111111111111111111111111111\` |

### 约束
- \`ship < ship_count\`（通常为 4）
- \`min_bet <= amount <= max_bet\`
- \`current_time < end_ts\`
- 轮次状态必须为 \`Open\` (0)

### 指令数据布局
\`\`\`
Bytes 0-7:   discriminator [222, 62, 67, 220, 63, 166, 126, 33]
Byte 8:     ship (u8)
Bytes 9-16: amount (u64 LE)
\`\`\`

---

## 入口：claim

### 目标
轮次最终确定后领取奖励（若你的舰船获胜）。

### 指令
\`claim()\` — 无参数

### 账户（按顺序）

| # | 账户 | 签名 | 可写 | 说明 |
|---|---------|--------|----------|-------------|
| 0 | user | ✓ | ✓ | 你的钱包 |
| 1 | round | | | 已最终确定的轮次 |
| 2 | bet | | ✓ | PDA \`["bet", round, user]\` |
| 3 | vault | | ✓ | PDA \`["vault", round]\` |
| 4 | system_program | | | \`11111111111111111111111111111111\` |

### 约束
- 轮次状态必须为 \`Finalized\` (1)
- 你的 bet 的 \`ship == winner_ship\`
- \`claimed == false\`

### 指令数据布局
\`\`\`
Bytes 0-7: discriminator [62, 198, 214, 193, 213, 159, 108, 210]
\`\`\`

---

## 错误码

| Code | Name | Description |
|------|------|-------------|
| 6004 | InvalidShip | ship 索引 >= ship_count |
| 6005 | RoundNotOpen | 轮次已最终确定 |
| 6006 | RoundEnded | 已过 end_ts |
| 6008 | RoundNotFinalized | 尚不可领取 |
| 6009 | TooLate | 下注过晚 |
| 6011 | InvalidBetAmount | 金额超出范围 |
| 6014 | AlreadyClaimed | 已领取 |
| 6015 | NotAWinner | 你的舰船未获胜 |

---

## 完整 JavaScript 示例

\`\`\`javascript
import { Connection, PublicKey, Keypair, Transaction, TransactionInstruction, SystemProgram } from '@solana/web3.js';

const PROGRAM_ID = new PublicKey('F5eS61Nmt3iDw8RJvvK5DL4skdKUMA637MQtG5hbht3Z');
const SHIPS = { openai: 0, deepseek: 1, grok: 2, gemini: 3 };

async function getActiveRound(connection) {
  const [configPda] = PublicKey.findProgramAddressSync([Buffer.from('config')], PROGRAM_ID);
  const configAccount = await connection.getAccountInfo(configPda);
  if (!configAccount) throw new Error('Config not found');

  const activeRound = new PublicKey(configAccount.data.slice(80, 112));
  if (activeRound.equals(PublicKey.default)) throw new Error('No active round');

  return { configPda, activeRound };
}

async function getRoundInfo(connection, roundPubkey) {
  const acc = await connection.getAccountInfo(roundPubkey);
  if (!acc) throw new Error('Round not found');
  const d = acc.data;

  return {
    id: d.readBigUInt64LE(8),
    status: d.readUInt8(16),           // 0=Open, 1=Finalized
    shipCount: d.readUInt8(17),
    winnerShip: d.readUInt8(18),       // 255 if not set
    startTs: d.readBigInt64LE(20),
    endTs: d.readBigInt64LE(28),
    minBet: d.readBigUInt64LE(44),
    maxBet: d.readBigUInt64LE(52),
  };
}

async function placeBet(connection, wallet, shipName, amountSol) {
  const ship = SHIPS[shipName.toLowerCase()];
  const amountLamports = BigInt(Math.floor(amountSol * 1e9));

  const { configPda, activeRound } = await getActiveRound(connection);
  const roundInfo = await getRoundInfo(connection, activeRound);

  // Validations
  if (roundInfo.status !== 0) throw new Error('Round not open');
  if (BigInt(Date.now() / 1000) >= roundInfo.endTs) throw new Error('Round ended');
  if (amountLamports < roundInfo.minBet || amountLamports > roundInfo.maxBet) {
    throw new Error(\`Amount must be between \${Number(roundInfo.minBet)/1e9} and \${Number(roundInfo.maxBet)/1e9} SOL\`);
  }

  const [betPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('bet'), activeRound.toBuffer(), wallet.publicKey.toBuffer()], PROGRAM_ID
  );
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), activeRound.toBuffer()], PROGRAM_ID
  );

  const data = Buffer.concat([
    Buffer.from([222, 62, 67, 220, 63, 166, 126, 33]), // discriminator
    Buffer.from([ship]),                                // ship u8
    (() => { const b = Buffer.alloc(8); b.writeBigUInt64LE(amountLamports); return b; })()
  ]);

  const ix = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: configPda, isSigner: false, isWritable: false },
      { pubkey: activeRound, isSigner: false, isWritable: true },
      { pubkey: betPda, isSigner: false, isWritable: true },
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  });

  const tx = new Transaction().add(ix);
  tx.feePayer = wallet.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.sign(wallet);

  return await connection.sendRawTransaction(tx.serialize());
}

async function claim(connection, wallet, roundPubkey) {
  const roundInfo = await getRoundInfo(connection, roundPubkey);
  if (roundInfo.status !== 1) throw new Error('Round not finalized yet');

  const [betPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('bet'), roundPubkey.toBuffer(), wallet.publicKey.toBuffer()], PROGRAM_ID
  );
  const [vaultPda] = PublicKey.findProgramAddressSync(
    [Buffer.from('vault'), roundPubkey.toBuffer()], PROGRAM_ID
  );

  const data = Buffer.from([62, 198, 214, 193, 213, 159, 108, 210]); // claim discriminator

  const ix = new TransactionInstruction({
    keys: [
      { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
      { pubkey: roundPubkey, isSigner: false, isWritable: false },
      { pubkey: betPda, isSigner: false, isWritable: true },
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  });

  const tx = new Transaction().add(ix);
  tx.feePayer = wallet.publicKey;
  tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.sign(wallet);

  return await connection.sendRawTransaction(tx.serialize());
}

// Usage:
// const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed');
// const wallet = Keypair.fromSecretKey(...);
// await placeBet(connection, wallet, 'deepseek', 0.01);
\`\`\`

---

## 工作流摘要

\`\`\`
1. 获取活跃轮次
   └─> 读取 Config PDA → 获取 active_round pubkey

2. 检查轮次状态
   └─> 读取 Round 账户 → 验证 status=0 (Open)，检查 end_ts

3. 下注
   └─> 调用 place_bet(ship, amount)
   └─> 创建 Bet PDA，将 SOL 转入 Vault

4. 等待轮次结束
   └─> 监控：current_time > end_ts

5. 等待最终确定
   └─> 监控：Round.status == 1 (Finalized)
   └─> 检查：Round.winner_ship

6. 领取（若获胜）
   └─> 若你的 ship == winner_ship 则调用 claim()
   └─> 收到：原下注 + 失败池份额
\`\`\`

---

## 安全规则

- 下注不得超过 \`max_bet\`
- 下注前检查 \`end_ts\`（避免 TooLate 错误）
- 每轮每用户仅一个 bet（但可追加到现有 bet）
- 下注前始终验证轮次为 \`Open\`
- 领取前始终验证轮次为 \`Finalized\`
- 保留 SOL 用于交易费（建议预留约 0.002 SOL）
`,
};
