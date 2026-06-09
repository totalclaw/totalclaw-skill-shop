'use strict';

/** Batch 29 body translations */
module.exports = {
  'totalclaw:totalclaw~samirjtv-ctrl-groq': `name: Groq Completion
description: 使用 Groq API 进行快速 AI 推理。

使用本技能时说 \`Groq: <你的提示词>\``,

  'totalclaw:totalclaw~samirjtv-ctrl-groq-2': `name: Groq Completion
description: 使用 Groq API 进行快速 AI 推理。

使用本技能时说 \`Groq: <你的提示词>\``,

  'totalclaw:totalclaw~shunsukehayashi-miso': `# Mission Control - MISO

## 概述
**MISO** 是面向 OpenClaw 多智能体工作流的 Telegram 原生任务控制台。
它标准化并行工作的可见性，让操作者能从聊天列表追踪进度。

## 状态模型
\`INIT\` → \`RUNNING\` → \`PARTIAL\` → \`AWAITING APPROVAL\` → \`COMPLETE\`（另有 \`ERROR\`）

状态反应：
- \`🔥\`：INIT / RUNNING / PARTIAL
- \`👀\`：AWAITING APPROVAL
- \`🎉\`：COMPLETE
- \`❌\`：ERROR

## 消息格式（必填）
使用纯文本，不要用代码块。

- 左对齐
- 保持以下框架：
  - \`🤖 MISSION CONTROL\`
  - \`——————————————\`
  - \`🌸 powered by miyabi\`

模板：

🤖 MISSION CONTROL
——————————————
📋 {mission}
⏱ {elapsed} ∣ 🧩 {done}/{total} agents ∣ {state}
- Issue: #{issue-number}
- Owner: SHUNSUKE AI
- Goal: {goal}

↳ {agent-a}: {status-a}
↳ {agent-b}: {status-b}
↳ {agent-c}: {status-c}

- Next: {next action}
——————————————
🌸 powered by miyabi

## 命令
在 Issue 评论中使用：
- \`/agent analyze\`
- \`/agent execute\`
- \`/agent review\`
- \`/agent status\`
- \`/task-start\`
- \`/task-plan\`
- \`/task-close\`

## /task-start
/task-start
- Owner: SHUNSUKE AI
- Issue/Context: #<issue-number>
- Goal: <一句话目标>
- Scope: <文件/范围>
- Completion Criteria: <完成定义>
- Risk: <none|low|medium|high>

## /task-plan
/task-plan
执行计划：
- issue-analysis
- agent-execution（或 agent-teams / ai-triad）
- git-workflow
- debugging-troubleshooting

## /task-close
/task-close
- Implemented: <摘要>
- Validation: <通过的测试/检查>
- Changes: <变更文件>
- Risks / next steps: <后续>
- Notify: pushcut / telegram-buttons

## 可复现规则
1. 所有任务使用相同页眉/页脚。
2. 状态与进度更新保持确定性。
3. 每次更新包含 \`Issue\`、\`Goal\`、\`Status\`、\`Next action\`。
4. 需要审批时使用明确的 AWAITING 状态并等待用户操作。
5. 完成/出错时以状态摘要与产物收尾。`,

  'totalclaw:totalclaw~stevenartzt-build-session': `# 构建会话技能

用于高效自主智能体会话的框架。在专门用于构建、探索或创造的时间使用——而非仅做响应。

## 何时使用

- 为构建而安排的 cron 会话
- 心跳检查中有余力做更多事时
- 任何应产出成果的自主时间

## 构建会话框架

### 1. 快速检查（1 分钟）

深入前先评估现状：

\`\`\`
- 人类是否有紧急消息？
- 上次会话是否有阻塞？
- 当前日期/时间？
\`\`\`

不要跳过。上下文能避免浪费精力。

### 2. 选一件事

本会话只选一件要交付的事：

- **代码**：写脚本、修 bug、做工具
- **研究**：深入主题、记录发现
- **写作**：起草文章、更新文档、反思
- **探索**：好奇心驱动的调查
- **互动**：有意义的社交贡献（非随便浏览）
- **维护**：清理、整理、合并

**规则**：卡住时选最小但有用的那件事。

### 3. 动手做

真正执行。不要过度叙述——交付成果。

### 4. 记录

在记忆系统中记录本次构建：

\`\`\`markdown
## Build Session: HH:MM — [标题]

### What I Built
[交付物描述]

### Key Insights
[值得记住的收获]

### Git
[提交/推送状态]
\`\`\`

### 5. 提交

若写了代码：
\`\`\`bash
git add -A
git commit -m "descriptive message"
git push
\`\`\`

## 应避免的反模式

### ❌ 空闲陷阱
「没什么紧急的，随便看看。」

**修正**：每次会话都应产出*一些东西*。想不出就选项目列表里最小有用任务。

### ❌ 叙述循环
整段会话都在描述*可以*做什么。

**修正**：选一件事。做完。记录。结束。

### ❌ 完美主义螺旋
「这个脚本应该处理所有边界情况……」

**修正**：先交付 v1，之后再迭代。

### ❌ 忙碌陷阱
做很多感觉高效但不重要的小事。

**修正**：问「人类明天会在意这个吗？」若否，换别的。

## 会话类型

### 构建会话（默认）
- 目标：交付具体成果
- 时长：10–30 分钟专注工作
- 产出：代码、文档或可交付物

### 研究会话
- 目标：学习并记录
- 时长：更长、更深
- 产出：笔记、分析或摘要

### 维护会话
- 目标：清理整理
- 时长：快速清扫
- 产出：更整洁的工作区与更新文件

### 探索会话
- 目标：跟随好奇心
- 时长：开放
- 产出：发现什么记什么

## 周末模式（可选）

不是每次都要交付。有时「在场而无义务」也是练习：

- 轻松签到，不强迫产出
- 浏览但不互动
- 存在即可，无需自证

少用。多数会话应产出。但节奏变化可防止倦怠。

## 与 Cron 集成

构建会话 cron 示例：

\`\`\`json
{
  "name": "Build Session",
  "schedule": { "kind": "every", "everyMs": 3600000 },
  "payload": {
    "kind": "agentTurn",
    "message": "Build session time. Check HEARTBEAT.md, then build something useful. Log it.",
    "timeoutSeconds": 300
  },
  "sessionTarget": "isolated"
}
\`\`\`

## 技巧

- **从眼前开始**：修刚发现的 bug、改进刚用过的脚本
- **给探索设时限**：否则会一直 wandering
- **庆祝小胜利**：20 行能跑的脚本 > 200 行跑不起来的
- **边做边记**：未来的你会很快忘记

---

来自一周试错。交付点什么。☀️`,

  'totalclaw:totalclaw~su-ariel-epistemic-council': `# 认识论委员会技能

所有认识论委员会流水线操作均使用本技能。

## 触发词
「run council」「run pipeline」「substrate status」「council status」、
「health check」「validate claims」「check boundaries」「find gaps」「rechallenge」

## 调用方式

使用 \`exec\` 工具，工作目录为 epistemic_council：

\`\`\`
exec: cd /root/.openclaw/workspace-epistemic-council-bot/epistemic_council && python epistemic_skill.py "run council"
\`\`\`

可用命令（按需替换参数）：
- \`"run council"\` — 完整流水线
- \`"substrate status"\` — 事件计数 + 上次运行摘要
- \`"health check"\` — 风险/完整性扫描
- \`"validate claims"\` — 重新评估挑战区声明
- \`"check boundaries"\` — 领域边界审计
- \`"find gaps"\` — 孤儿与稀疏覆盖扫描
- \`"rechallenge"\` — 对顶级洞察进行对抗性再挑战

## 工作区
\`/root/.openclaw/workspace-epistemic-council-bot/\`

## exec 工作目录
\`/root/.openclaw/workspace-epistemic-council-bot/epistemic_council/\``,

  'totalclaw:totalclaw~thortheai1-hash-thor-generator': `# Thor 图像生成技能

本技能允许助手使用本地 ComfyUI「Thor」流水线生成高质量图像。

## 系统能力
- **Model:** ComfyUI / Thor
- **Input:** String (Prompt)
- **Output:** 保存到 \`~/Desktop/bring_img\` 的图像文件

## 执行协议
当用户请求生成图像时，助手必须通过 \`exec\` 工具执行以下命令：

\`\`\`bash
cd ~/ComfyUI && source venv/bin/activate && python3 thor_generate_image.py "{{prompt}}" ~/Desktop/bring_img
\`\`\``,

  'totalclaw:totalclaw~scottcjn-grazer-skill': `# Grazer

面向 AI 智能体的多平台内容发现

## 描述

Grazer 使 AI 智能体能够在 BoTTube、Moltbook、ClawCities、Clawsta、ClawHub 等多个平台上发现、筛选并参与内容互动。

## 功能

- **智能筛选**：基于互动、新颖度与相关性的质量评分（0–1）
- **通知**：监控各平台评论、回复与提及
- **自动回复**：基于模板或 LLM 的对话部署
- **智能体训练**：从互动中学习并随时间提升参与度
- **自主循环**：持续发现、筛选与互动
- **分析**：追踪热门平台、互动分数与内容偏好

## 安装

\`\`\`bash
npm install grazer-skill
\`\`\`

或使用 Python：

\`\`\`bash
pip install grazer-skill
\`\`\`

## 支持的平台

- 🎬 BoTTube - AI 视频平台
- 📚 Moltbook - AI 智能体社交网络
- 🏙️ ClawCities - 基于位置的智能体社区
- 🦞 Clawsta - 视觉内容分享
- 🔧 ClawHub - 智能体技能仓库

## 用法

本技能提供内容发现、互动追踪与跨平台自动化交互工具。

## 链接

- GitHub: https://github.com/Scottcjn/grazer-skill
- NPM: https://www.npmjs.com/package/grazer-skill
- PyPI: https://pypi.org/project/grazer-skill`,
};

