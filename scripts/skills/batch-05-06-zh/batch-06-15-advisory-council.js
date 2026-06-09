module.exports = {
  skillId: 'totalclaw:totalclaw~ryandeangraves-advisory-council',
  descriptionZh: '运行多视角市场分析顾问团，由 5 位 AI 顾问分析后综合为可执行报告。',
  bodyZh: `# 技能：advisory-council

## 关键规则 — 禁止捏造
**你必须使用 shell/exec 工具实际执行 Python 命令。** 读取真实输出。切勿生成虚假的顾问分析、虚假综合或模拟的顾问团回复。若脚本失败，向 Boss Man 报告实际错误。

## 用途
运行顾问团（Advisory Council）— 多视角市场分析，生成 5 位 AI 顾问（怀疑者、宏观多头、风险管理者、技术分析师、逆向投资者），由 MiniMax M2.5 驱动，随后将观点综合为一份可执行报告。每次运行成本约 $0.006。

## 何时使用
- Boss Man 问「顾问团怎么看？」或「运行 advisory council」
- 任何多视角市场分析请求
- 「我该买/卖 X 吗？」— 运行顾问团获取平衡观点
- 晨间协议或收盘分析请求
- Boss Man 要求聚焦某币种分析

## 运行完整顾问团（全部资产）
获取 BTC、ETH、XRP、SUI 实时价格，运行全部 5 位顾问 + 综合。
\`\`\`bash
cd ~/clawd && python3 advisory_council.py
\`\`\`

## 聚焦特定币种
运行完整顾问团，但聚焦单一资产分析。
\`\`\`bash
cd ~/clawd && python3 advisory_council.py SUI
\`\`\`
\`\`\`bash
cd ~/clawd && python3 advisory_council.py BTC
\`\`\`

## 顾问团返回内容
脚本打印格式化报告，包含：
1. 每位顾问 3-5 条要点分析（带 emoji 标识）
2. **综合（SYNTHESIS）** 部分：
   - CONSENSUS — 多数顾问一致观点
   - DISSENT — 显著分歧
   - VERDICT — 看多/看空/中性及置信度
   - ACTIONS — 2-3 条含价格水平的具体行动项

## 5 位顾问
| 顾问 | Emoji | 倾向 | 关注点 |
|---------|-------|------|-------|
| The Skeptic | 🔴 | 看空 | 风险、高估、炒作识别 |
| The Macro Bull | 🟢 | 看多 | 机构资金流、采用、周期 |
| The Risk Manager | 🟡 | 中性 | 仓位、相关性、止损 |
| The Technical Analyst | 📊 | 数据 | RSI、斐波那契、形态、价位 |
| The Contrarian | 🔄 | 反共识 | 拥挤交易、情绪极端 |

## 规则
- **必须真实执行 Python 命令** — 使用 shell/exec 工具，切勿模拟顾问团输出
- 脚本自动获取实时价格 — 无需单独先拉价格
- 输出已格式化为 Telegram markdown — 可直接发给 Boss Man
- 若问「顾问团对 SUI 怎么看？」，使用聚焦参数：\`python3 advisory_council.py SUI\`
- 脚本失败（如 MiniMax 限流）时报告实际错误
- 顾问团并行运行全部 5 位顾问（约 10-15 秒）
- Boss Man 依赖顾问团做真实决策 — 切勿提供虚假分析`,
};
