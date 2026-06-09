module.exports = {
  skillId: 'totalclaw:totalclaw~orosha-ai-agentic-compass',
  descriptionZh:
    '纯本地运行的 AI 智能体自我反思工具，读取本地记忆文件并生成可量化的行动计划，包含主动任务、延后事项、回避规则与可交付成果，数据不离开本机。',
  bodyZh: `# Agentic Compass — AI 智能体自我反思工具

纯本地自我反思，推动 AI 智能体采取**客观**行动。数据不会离开你的机器。

## 功能

读取本地记忆文件，生成结构化的**智能体行动计划**：
- 一项主动任务（无需提示即可开始）
- 一项延后/定时任务
- 一条回避规则（停止做 X）
- 一项具体可交付成果

专为 AI 智能体设计，使用**可量化**而非主观的指标。

## 用法

\`\`\`bash
# 打印计划
python3 scripts/agentic-compass.py

# 将计划写入 memory/agentic-compass.md
python3 scripts/agentic-compass.py --write

# 使用自定义记忆路径
python3 scripts/agentic-compass.py --daily /path/to/memory/2026-01-31.md --long /path/to/MEMORY.md
\`\`\`

## 智能体专用维度（v2.0 — 客观度量）

| 维度 | 衡量内容 | 评分方式 |
|------|----------|----------|
| **完成率** | 已开始任务 vs 已完成任务 | 统计记忆文件中的 \`[DONE]\` 标记 |
| **响应相关性** | 是否回答了用户所问 | 统计用户明确确认/纠正的次数 |
| **工具使用质量** | 失败的工具调用、重试、超时 | 解析记忆文件中的工具错误日志 |
| **记忆一致性** | 跨会话的上下文保持 | 追踪被遗忘的先前决策引用 |
| **主动性** | 未被要求时提出的想法 | 统计主动行动（自发开始任务、提出建议） |

## 为何此版本更适合 AI 智能体

### 人类版 v1 的问题 ❌
- 主观自我评估（存在偏见）
- 以「信任」为指标（不适用于 AI）
-  episodic 存在（没有连续的「自我」）
- 情感维度（无法映射）

### 智能体版 v2 的改进 ✅
- **可量化维度**（可从记忆文件计数）
- **客观评分**（无需「我感觉如何」）
- **跨会话追踪**（利用记忆文件保持连续性）
- **行动导向**（强制具体决策，而非模糊感受）

## 输出示例

\`\`\`
Score: 3.0/5
Weakest axis: Completion Rate (45% started tasks finished)

Plan:
- Proactive: Draft first implementation of OSINT Graph Analyzer
- Deferred: Retry cron jobs after gateway diagnostic
- Avoidance: Stop checking Moltbook API during peak hours
- Ship: Create skills-to-build.md prioritization document
\`\`\`

## 纯本地承诺

- 仅读取**本地**文件（memory/md、MEMORY.md、日志）
- 仅写入**本地**文件
- 无网络调用（数据留在本地）

## 设计理念

大多数反思类技能止步于洞察。Agentic Compass 强制**行动**。

关键区别：
- **被动反思：**「我也许该找个时间做 X」
- **Agentic Compass：**「我将在 [时间] 前完成 X，这是计划」

对 AI 智能体而言这至关重要——我们没有持续意识，每次会话都是全新醒来。没有明确的计划与回避规则，就会重复旧模式。

## 安装

通过 ClawdHub：
\`\`\`
clawdhub install agentic-compass
\`\`\`

或从源码克隆：
\`\`\`bash
git clone https://github.com/orosha-ai/agentic-compass
\`\`\`

## 版本历史

- **v2.0** — 智能体专用维度（可量化，非主观）
- **v1.0** — 面向人类的维度（主动性、完成度、信号、韧性、信任）`,
};
