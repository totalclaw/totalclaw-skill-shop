module.exports = {
  skillId: 'totalclaw:totalclaw~kuns9-upbit-market-data-skill',
  descriptionZh:
    '基于 CLI 的技能，从 Upbit Open API 获取行情与市场数据，支持交易对、K 线、成交、行情与订单簿查询。',
  bodyZh: `# Upbit Market Data 技能

基于 CLI 的技能，从 Upbit Open API 获取行情/市场数据。

本技能设计为通过 **OpenClaw \`exec\`**（一次性运行）执行。支持：
- 交易对（市场）列表
- K 线（秒/分钟/日/周/月/年）
- 最近成交
- 行情（按交易对 / 按计价货币）
- 订单簿
- 关注列表行情（来自配置）

所有响应均为 JSON：
- 成功 → stdout：\`{ "ok": true, "result": ... }\`
- 错误 → stderr：\`{ "ok": false, "error": { ... } }\`，退出码 \`1\`

---

## 要求

- Node.js **18+**（使用内置 \`fetch\`）
- NPM

---

## 安装

\`\`\`bash
npm install
\`\`\`

---

## 配置（JSON）

创建 \`config/config.json\`。

示例：

\`\`\`json
{
  "upbit": {
    "baseUrl": "https://api.upbit.com",
    "accessKey": "",
    "secretKey": ""
  },
  "watchlist": ["KRW-BTC", "KRW-ETH", "KRW-SOL"]
}
\`\`\`

### 配置路径覆盖

默认路径：
- \`config/config.json\`

运行时覆盖：

\`\`\`bash
node skill.js tickers --markets=KRW-BTC --config=./config/config.json
\`\`\`

---

## CLI 语法

通用格式：

\`\`\`bash
node skill.js <command> [subcommand] [--option=value]
\`\`\`

规则：
1. \`<command>\` 是必需的。
2. \`[subcommand]\` 是可选的，且**不得**以 \`--\` 开头。
3. 选项必须以 \`--key=value\` 或 \`--key value\` 的形式提供。
4. 输出始终为 JSON。

---

## 严格模式（推荐用于 OpenClaw）

OpenClaw/LLM 代理在生成 CLI 调用时可能会重新排列参数。为避免混淆，请启用**严格模式（strict mode）**。

### 启用严格模式

在命令中添加 \`--strict=true\`：

\`\`\`bash
node skill.js tickers --markets=KRW-BTC,KRW-ETH --strict=true
\`\`\`

### 严格模式规则（硬性要求）

当 \`--strict=true\` 时：

1. K 线类型**必须**紧跟在 \`candles\` 之后：
   - ✅ \`node skill.js candles minutes --market=KRW-ETH --unit=5 --strict=true\`
   - ❌ \`node skill.js candles --market=KRW-ETH minutes --unit=5 --strict=true\`
2. K 线类型**不得**作为选项传递（严格模式下不要使用 \`--type=\`）。
3. 对于非 candles 命令，必须省略 \`subcommand\`。
4. 任何意外的位置参数（不以 \`--\` 开头的额外单词）都会导致错误。

严格模式的好处：
- 它强制使用单一规范的命令形式，使 OpenClaw/LLM 更难生成含糊或顺序错乱的调用。

---

## 命令

### 1) 列出交易对（markets）

\`\`\`bash
node skill.js pairs --details=true --strict=true
\`\`\`

---

### 2) K 线（关键结构）

K 线要求**在 \`candles\` 之后紧跟 K 线类型**。

#### 规范结构

\`\`\`bash
node skill.js candles <type> --market=<MARKET> [options]
\`\`\`

其中 \`<type>\` 必须是以下之一：
- \`seconds\`
- \`minutes\`
- \`days\`
- \`weeks\`
- \`months\`
- \`years\`

⚠️ \`<type>\` 不作为 \`--unit\` 传递。  
⚠️ \`<type>\` 必须紧跟在 \`candles\` 之后。

#### 分钟 K 线（5 分钟示例）

\`\`\`bash
node skill.js candles minutes --market=KRW-ETH --unit=5 --count=100 --strict=true
\`\`\`

允许的分钟单位：
\`1, 3, 5, 10, 15, 30, 60, 240\`

#### 其他 K 线

\`\`\`bash
node skill.js candles seconds --market=KRW-BTC --count=200 --strict=true
node skill.js candles days    --market=KRW-BTC --count=50  --strict=true
node skill.js candles weeks   --market=KRW-BTC --count=30  --strict=true
node skill.js candles months  --market=KRW-BTC --count=12  --strict=true
node skill.js candles years   --market=KRW-BTC --count=5   --strict=true
\`\`\`

#### 错误示例（请勿使用）

\`\`\`bash
# ❌ 类型作为选项传递
node skill.js candles --unit=minutes --market=KRW-ETH

# ❌ 类型在选项之后
node skill.js candles --market=KRW-ETH minutes --unit=5
\`\`\`

---

### 3) 最近成交

\`\`\`bash
node skill.js trades --market=KRW-BTC --count=50 --strict=true
\`\`\`

---

### 4) 按交易对查询行情

\`\`\`bash
node skill.js tickers --markets=KRW-BTC,KRW-ETH,KRW-SOL --strict=true
\`\`\`

---

### 5) 按计价货币查询行情

\`\`\`bash
node skill.js quote-tickers --quote=KRW,BTC --strict=true
\`\`\`

---

### 6) 订单簿

\`\`\`bash
node skill.js orderbook --markets=KRW-BTC --level=100000 --count=15 --strict=true
\`\`\`

---

### 7) 关注列表行情（来自配置）

\`\`\`bash
node skill.js watchlist --strict=true
\`\`\`

---

## 错误处理与速率限制

Upbit 可能返回：
- 429：请求过多（Too Many Requests）
- 418：请求被阻止（Request blocked）
- 400：错误请求（Bad request）

该技能会在 \`error.upbit\` 下传递 Upbit 的错误负载（如果存在）。

参考：
https://docs.upbit.com/kr/reference/rest-api-guide`,
};
