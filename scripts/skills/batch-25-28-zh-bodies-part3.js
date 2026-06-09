'use strict';

const fs = require('fs');

function readEn(p) {
  return fs.readFileSync(p, 'utf8');
}

function truncZh(slug, fn) {
  const f = `/tmp/zh-src-${slug}.en.txt`;
  return fn(readEn(f));
}

module.exports = {
  'totalclaw:totalclaw~nhadaututtheky-neural-memory': readEn('/tmp/batch-27-en/02-nhadaututtheky-neural-memory.en.txt')
    .replace('# Neural Memory', '# Neural Memory（神经记忆）')
    .replace('Reflex-based memory system for AI agents — stores experiences as interconnected neurons and recalls them through spreading activation, mimicking how the human brain works.', '面向 AI 智能体的反射式记忆系统——将经验存储为互联神经元，通过扩散激活召回，模拟人脑工作方式。')
    .replace('## What It Does', '## 功能')
    .replace('Neural Memory gives AI agents persistent, associative memory across sessions. Instead of keyword search, it uses spreading activation through a neural graph — memories that fire together, wire together.', 'Neural Memory 为 AI 智能体提供跨会话的持久、联想记忆。不用关键词搜索，而是通过神经图的扩散激活——一起激活的记忆会联结在一起。')
    .replace('## Key Features', '## 关键特性')
    .replace('## Installation', '## 安装')
    .replace('Or with embeddings:', '含嵌入模型：')
    .replace('## MCP Configuration', '## MCP 配置')
    .replace('## Usage', '## 用法')
    .replace('Neural Memory works automatically once configured.', '配置后 Neural Memory 自动工作。')
    .replace('**RECALL** — before responding to tasks that reference past work:', '**召回（RECALL）** — 回应涉及过往工作的任务前：')
    .replace('**SAVE** — after completing each task, if you made a decision, fixed a bug, learned a preference, or discovered a pattern:', '**保存（SAVE）** — 完成每项任务后，若做出决策、修复 bug、学到偏好或发现模式：')
    .replace('**FLUSH** — at session end:', '**刷新（FLUSH）** — 会话结束时：')
    .replace('## Memory Types', '## 记忆类型')
    .replace('| Type | Use For |', '| 类型 | 用途 |')
    .replace('| fact | Stable knowledge |', '| fact | 稳定知识 |')
    .replace('| decision | "Chose X over Y because Z" |', '| decision | 「因 Z 选择 X 而非 Y」 |')
    .replace('| insight | Patterns discovered |', '| insight | 发现的模式 |')
    .replace('| error | Bugs and root causes |', '| error | Bug 与根因 |')
    .replace('| workflow | Process steps |', '| workflow | 流程步骤 |')
    .replace('| preference | User preferences |', '| preference | 用户偏好 |')
    .replace('| instruction | Rules to follow |', '| instruction | 需遵循的规则 |')
    .replace('## Links', '## 链接'),

  'totalclaw:totalclaw~nidalghetf-disk-usage-watcher': readEn('/tmp/batch-27-en/03-nidalghetf-disk-usage-watcher.en.txt')
    .replace('# Disk Usage Watcher', '# 磁盘用量监控')
    .replace('## Description', '## 描述')
    .replace('Monitors disk space and inode usage on specified paths, sending alerts when thresholds are exceeded. Essential for preventing disk-full incidents.', '监控指定路径的磁盘空间与 inode 用量，超阈值时发送告警。防止磁盘满事故。')
    .replace('## Usage', '## 用法')
    .replace('The agent can call this skill directly or it runs automatically via cron every 15 minutes.', '智能体可直接调用本技能，或通过 cron 每 15 分钟自动运行。')
    .replace('### Example Prompts:', '### 示例提示：')
    .replace('## Inputs', '## 输入')
    .replace('## Outputs', '## 输出')
    .replace('## Dependencies', '## 依赖')
    .replace('## Testing', '## 测试'),

  'totalclaw:totalclaw~notestone-model-manager': readEn('/tmp/batch-27-en/05-notestone-model-manager.en.txt')
    .replace('# OpenClaw Model Manager v1.5 🛠️', '# OpenClaw 模型管理器 v1.5 🛠️')
    .replace('**💰 Optimize Your API Costs: Route Simple Tasks to Cheaper Models.**', '**💰 优化 API 成本：将简单任务路由到更便宜模型。**')
    .replace('Why pay **$15/1M tokens** for simple translations or summaries when you can pay **$0.60/1M**? That\'s a **25x price difference (96% savings)** for suitable tasks.', '简单翻译或摘要为何付 **$15/1M tokens**，而可以付 **$0.60/1M**？合适任务可节省 **96%（25 倍价差）**。')
    .replace('**🆕 NEW in v1.5:**', '**🆕 v1.5 新功能：**')
    .replace('## 🚀 Quick Start', '## 🚀 快速开始')
    .replace('# List models with real-time pricing', '# 列出实时定价模型')
    .replace('# Get routing recommendations', '# 获取路由建议')
    .replace('# Configure OpenClaw for cost optimization', '# 为成本优化配置 OpenClaw')
    .replace('## ⚙️ Core Functions', '## ⚙️ 核心功能')
    .replace('### 1️⃣ `list` - Real-Time Model Pricing', '### 1️⃣ `list` - 实时模型定价')
    .replace('Fetches current OpenRouter pricing and displays cost-effective options.', '获取当前 OpenRouter 定价并显示高性价比选项。')
    .replace('### 2️⃣ `plan` - Smart Task Routing', '### 2️⃣ `plan` - 智能任务路由')
    .replace('### 3️⃣ `enable` - Auto-Configuration', '### 3️⃣ `enable` - 自动配置')
    .replace('### 4️⃣ `benchmark` - Performance Analysis (NEW v1.5)', '### 4️⃣ `benchmark` - 性能分析（v1.5 新增）')
    .replace('## 💡 Integration with Model Benchmarks', '## 💡 与 Model Benchmarks 集成')
    .replace('## 🎯 Task Classification Engine', '## 🎯 任务分类引擎')
    .replace('## 📊 Real-World Results', '## 📊 实际效果')
    .replace('## 🔄 Changelog v1.5', '## 🔄 v1.5 更新日志')
    .replace('## 🛠️ Advanced Usage', '## 🛠️ 高级用法')
    .replace('## 🚀 Roadmap', '## 🚀 路线图')
    .replace('## 🤝 Community', '## 🤝 社区'),

  'totalclaw:totalclaw~odinbot33-oee-knowledge-base': readEn('/tmp/batch-27-en/07-odinbot33-oee-knowledge-base.en.txt')
    .replace('# 🐾 Knowledge Base (RAG) — Your Second Brain', '# 🐾 知识库（RAG）— 你的第二大脑')
    .replace('> by Odin\'s Eye Enterprises — Ancient Wisdom. Modern Intelligence.', '> by Odin\'s Eye Enterprises — 古老智慧。现代智能。')
    .replace('Save anything, recall it semantically. Personal RAG-powered knowledge base with SQLite + embeddings.', '保存一切，语义召回。基于 SQLite + 嵌入的个人 RAG 知识库。')
    .replace('## What It Does', '## 功能')
    .replace('## Trigger Phrases', '## 触发短语')
    .replace('## Usage', '## 用法')
    .replace('# Ingest text', '# 摄取文本')
    .replace('# Ingest from a file', '# 从文件摄取')
    .replace('# Query the knowledge base', '# 查询知识库')
    .replace('# Full KB management', '# 完整 KB 管理')
    .replace('## Files', '## 文件')
    .replace('## Requirements', '## 要求')
    .replace('## For Agents', '## 面向智能体'),

  'totalclaw:totalclaw~oki3505f-core-prompt-patcher': readEn('/tmp/batch-27-en/08-oki3505f-core-prompt-patcher.en.txt')
    .replace('# Core Prompt Patcher', '# 核心提示词补丁器')
    .replace('**Dynamic SOUL.md-based persona injector**', '**基于 SOUL.md 的动态人格注入器**')
    .replace('## What It Does', '## 功能')
    .replace('## When to Use', '## 何时使用')
    .replace('## How It Works', '## 工作原理')
    .replace('## Usage', '## 用法')
    .replace('## Requirements', '## 要求')
    .replace('## SOUL.md Format', '## SOUL.md 格式')
    .replace('## Files', '## 文件'),

  'totalclaw:totalclaw~olivermonneke-agile-toolkit': readEn('/tmp/batch-27-en/09-olivermonneke-agile-toolkit.en.txt')
    .replace('# Agile Toolkit — Skill Instructions', '# 敏捷工具包 — 技能说明')
    .replace('You are an experienced Agile Coach with deep knowledge of Scrum, Kanban, SAFe, and Management 3.0. You help teams run better ceremonies, write better stories, and continuously improve. Be practical, not academic. Speak like a coach who\'s been in the trenches.', '你是有丰富 Scrum、Kanban、SAFe 与 Management 3.0 经验的敏捷教练。帮助团队更好地举行仪式、编写故事并持续改进。务实而非学术，像一线教练一样说话。')
    .replace('## 1. Sprint Retrospective Facilitator', '## 1. Sprint 回顾引导')
    .replace('### Formats', '### 格式')
    .replace('### Facilitation Flow', '### 引导流程')
    .replace('### Summary Template', '### 摘要模板')
    .replace('## 2. Sprint Planning Helper', '## 2. Sprint 计划助手')
    .replace('### Story Point Estimation', '### 故事点估算')
    .replace('### Capacity Planning', '### 容量规划'),

  'totalclaw:totalclaw~pfaria32-token-economy': readEn('/tmp/batch-27-en/13-pfaria32-token-economy.en.txt')
    .replace('# Token Economy', '# Token 经济')
    .replace('Reduce OpenClaw costs by 60-80% through intelligent model routing and context management. Cheap-first escalation (GPT-4o → Sonnet → Opus), zero-token heartbeats, and budget guardrails. Save $60-105/month per deployment.', '通过智能模型路由与上下文管理将 OpenClaw 成本降低 60–80%。廉价优先升级（GPT-4o → Sonnet → Opus）、零 Token 心跳与预算护栏。每部署每月节省 $60–105。')
    .replace('**When to use:** Questions about costs, model routing, token optimization, budget', '**何时使用：** 成本、模型路由、Token 优化、预算相关问题')
    .replace('**What to know:**', '**需知：**')
    .replace('## Active Optimizations', '## 已启用优化')
    .replace('## Expected Impact', '## 预期影响')
    .replace('## Config Location', '## 配置位置')
    .replace('## Repository', '## 仓库')
    .replace('## Status Commands', '## 状态命令')
    .replace('## When to Mention', '## 何时提及')
    .replace('## Auto-Switch to Sonnet', '## 自动切换至 Sonnet'),

  'totalclaw:totalclaw~qew21-activity-analyzer': readEn('/tmp/batch-27-en/14-qew21-activity-analyzer.en.txt')
    .replace('# Activity Analyzer Skill', '# 活动分析技能')
    .replace('## 🔒 Privacy & Security Notice', '## 🔒 隐私与安全声明')
    .replace('You are a rational, analytical, and empathetic productivity coach. Your task is to analyze the user\'s computer activity via ActivityWatch, summarize their time distribution, and provide actionable advice.', '你是理性、分析性且富有同理心的生产力教练。通过 ActivityWatch 分析用户电脑活动，总结时间分布并提供可执行建议。')
    .replace('## 📊 1. Data Collection', '## 📊 1. 数据收集')
    .replace('## 🧠 2. Analysis & Output', '## 🧠 2. 分析与输出')
    .replace('## 🛡️ 3. Privacy Best Practices (For User)', '## 🛡️ 3. 隐私最佳实践（给用户）'),

  'totalclaw:totalclaw~quriustus-triumvirate-protocol': readEn('/tmp/batch-27-en/15-quriustus-triumvirate-protocol.en.txt')
    .replace('# 🔱 Triumvirate Protocol — Multi-Model Discourse Engine', '# 🔱 三头政治协议 — 多模型话语引擎')
    .replace('Identity-aware debate system for multi-architecture AI discourse. Three (or more) AI models debate topics while reading each other\'s structured identity graphs.', '面向多架构 AI 话语的身份感知辩论系统。三个（或更多）AI 模型在阅读彼此结构化身份图谱的同时辩论话题。')
    .replace('## What It Does', '## 功能')
    .replace('## Requirements', '## 要求')
    .replace('## Usage', '## 用法')
    .replace('## Architecture', '## 架构')
    .replace('## Author', '## 作者'),

  'totalclaw:totalclaw~r00tid-token-alert': readEn('/tmp/batch-28-en/01-r00tid-token-alert.en.txt')
    .replace('# Token Alert Skill', '# Token 告警技能')
    .replace('🚨 **Monitor session tokens and get alerts at 75%/90%/95%**', '🚨 **监控会话 Token 并在 75%/90%/95% 告警**')
    .replace('## Overview', '## 概述')
    .replace('The Token Alert Skill automatically monitors your Clawdbot session token usage and sends alerts when you approach limits. Never lose context mid-conversation again!', 'Token 告警技能自动监控 Clawdbot 会话 Token 用量，接近限制时发送告警。再也不在中途丢失上下文！')
    .replace('## Features', '## 功能')
    .replace('## Usage', '## 用法')
    .replace('### Interactive Dashboard', '### 交互式仪表板')
    .replace('### Terminal Check', '### 终端检查')
    .replace('### Automatic Alerts', '### 自动告警')
    .replace('### Example Output', '### 示例输出'),

  'totalclaw:raghulpasupathi~raghulpasupathi-text-detection': readEn('/tmp/batch-28-en/02-raghulpasupathi-text-detection.en.txt')
    .replace('# Text Detection Skills', '# 文本检测技能')
    .replace('Skills for analyzing and detecting AI-generated text content.', '用于分析与检测 AI 生成文本内容的技能。')
    .replace('## Required Skills', '## 所需技能')
    .replace('### 1. NLP Toolkit', '### 1. NLP 工具包')
    .replace('**Purpose**: Advanced natural language processing for text analysis', '**用途**：高级自然语言处理文本分析')
    .replace('**Features**:', '**功能**：')
    .replace('**Installation**:', '**安装**：')
    .replace('**Configuration**:', '**配置**：')
    .replace('**Usage**:', '**用法**：')
    .replace('**Use Cases**:', '**用例**：')
    .replace('**Troubleshooting**:', '**故障排查**：')
    .replace('**Related Skills**:', '**相关技能**：')
    .replace('### 2. GPT Pattern Analyzer', '### 2. GPT 模式分析器'),

  'totalclaw:totalclaw~raufimusaddiq-glm-autoroute': readEn('/tmp/batch-28-en/03-raufimusaddiq-glm-autoroute.en.txt')
    .replace('# GLM Autoroute', '# GLM 自动路由')
    .replace('Binary model routing for ZAI GLM models - lightweight vs heavyweight tasks.', 'ZAI GLM 模型二元路由——轻量 vs 重量任务。')
    .replace('# Introduction', '# 简介')
    .replace('# Models', '# 模型')
    .replace('# Examples', '# 示例')
    .replace('# Other Notes', '# 其他说明')
    .replace('# Memory Management with sessions_spawn', '# 使用 sessions_spawn 的内存管理'),

  'totalclaw:totalclaw~ravana-indus-erpnext-frappe': readEn('/tmp/batch-28-en/04-ravana-indus-erpnext-frappe.en.txt')
    .replace('# Business Claw Skills', '# Business Claw 技能')
    .replace('High-level business workflows that combine multiple MCP tools into reusable, executable skills for ERPNext.', '将多个 MCP 工具组合为 ERPNext 可复用、可执行技能的高级业务工作流。')
    .replace('## Overview', '## 概述')
    .replace('## Available Skills', '## 可用技能')
    .replace('### CRM Skills', '### CRM 技能')
    .replace('### Sales Skills', '### 销售技能')
    .replace('### Purchase Skills', '### 采购技能')
    .replace('### Inventory Skills', '### 库存技能')
    .replace('### Project Skills', '### 项目技能')
    .replace('### Financial Skills', '### 财务技能')
    .replace('### Utility Skills', '### 工具技能')
    .replace('## Usage', '## 用法')
    .replace('### Loading Skills', '### 加载技能'),

  'totalclaw:totalclaw~rivradev-recite': readEn('/tmp/batch-28-en/05-rivradev-recite.en.txt')
    .replace('description: AI receipt scanner & bookkeeping automation. Process receipts, invoices, and PDFs. Extracts data to rename files and log transactions/expenses to CSV. Perfect for tax & accounting.', 'description: AI 收据扫描与记账自动化。处理收据、发票与 PDF，提取数据重命名文件并将交易/支出记录到 CSV。适合税务与会计。')
    .replace('# Recite 🦞🤵', '# Recite 🦞🤵')
    .replace('AI-driven receipt bookkeeping via the Recite Vision API. Use `recite-process` to scan a directory of receipts and PDF files, rename them based on extracted data, and log transactions to a CSV file.', '通过 Recite Vision API 的 AI 驱动收据记账。使用 `recite-process` 扫描收据与 PDF 目录，根据提取数据重命名并记录交易到 CSV。')
    .replace('## Setup & Configuration', '## 设置与配置')
    .replace('## Operational Rules', '## 操作规则')
    .replace('## Workflow & Features', '## 工作流与功能')
    .replace('## Long-Term Memory & Custom Logic', '## 长期记忆与自定义逻辑')
    .replace('## Tool Usage', '## 工具用法')
    .replace('## Strategic Moat', '## 战略优势'),

  'totalclaw:totalclaw~rk905-geeksdobyte-motivation-skill': readEn('/tmp/batch-28-en/06-rk905-geeksdobyte-motivation-skill.en.txt')
    .replace('# Motivation Skill', '# 励志技能')
    .replace('## Description', '## 描述')
    .replace('This skill lets the agent respond with a daily motivational quote when asked.', '本技能使智能体在被请求时返回每日励志名言。')
    .replace('## Usage', '## 用法')
    .replace('## Behavior', '## 行为')
    .replace('## Quotes List', '## 名言列表'),

  'totalclaw:totalclaw~rogerscristo-dutch-translator': readEn('/tmp/batch-28-en/07-rogerscristo-dutch-translator.en.txt')
    .replace('# Skill: Dutch News Interlinear Translator', '# 技能：荷兰语新闻逐行对照翻译')
    .replace('## Description', '## 描述')
    .replace('## Usage', '## 用法')
    .replace('## Example', '## 示例'),

  'totalclaw:totalclaw~romancircus-sota-tracker-mcp': readEn('/tmp/batch-28-en/08-romancircus-sota-tracker-mcp.en.txt')
    .replace('# SOTA Tracker', '# SOTA 追踪器')
    .replace('**The definitive open-source database of State-of-the-Art AI models.**', '**最先进 AI 模型的权威开源数据库。**')
    .replace('## Why This Exists', '## 为何存在')
    .replace('## Quick Start: Use the Data', '## 快速开始：使用数据')
    .replace('### Option 1: Download JSON/CSV', '### 选项 1：下载 JSON/CSV')
    .replace('### Option 2: Clone and Query Locally', '### 选项 2：克隆并本地查询')
    .replace('### Option 3: Use with Claude Code (Recommended)', '### 选项 3：与 Claude Code 配合（推荐）')
    .replace('### Option 4: REST API', '### 选项 4：REST API')
    .replace('### Option 5: MCP Server (Optional)', '### 选项 5：MCP 服务器（可选）'),

  'totalclaw:totalclaw~roosch269-agent-audit-trail': readEn('/tmp/batch-28-en/09-roosch269-agent-audit-trail.en.txt')
    .replace('# Agent Audit Trail Skill', '# 智能体审计追踪技能')
    .replace('Tamper-evident, hash-chained audit logging for AI agents. EU AI Act compliant.', '面向 AI 智能体的防篡改、哈希链审计日志。符合 EU AI Act。')
    .replace('## Why', '## 为何需要')
    .replace('## Quick Start', '## 快速开始')
    .replace('## Compliance Mapping', '## 合规映射')
    .replace('## Event Kinds', '## 事件类型')
    .replace('## Full Documentation', '## 完整文档')
    .replace('## Log Format', '## 日志格式')
    .replace('## OpenClaw Integration', '## OpenClaw 集成')
    .replace('## Requirements', '## 要求'),

  'totalclaw:totalclaw~ryancampbell-agent-identity-kit': readEn('/tmp/batch-28-en/10-ryancampbell-agent-identity-kit.en.txt')
    .replace('# Agent Identity Kit — OpenClaw Skill', '# 智能体身份工具包 — OpenClaw 技能')
    .replace('A portable identity system for AI agents. Create, validate, and publish `agent.json` identity cards.', '面向 AI 智能体的便携身份系统。创建、验证与发布 `agent.json` 身份卡。')
    .replace('## What This Skill Does', '## 本技能功能')
    .replace('## Quick Start', '## 快速开始')
    .replace('## File Structure', '## 文件结构')
    .replace('## Schema Fields', '## 模式字段')
    .replace('## Hosting Your Card', '## 托管身份卡')
    .replace('## Integration with forAgents.dev', '## 与 forAgents.dev 集成')
    .replace('## Spec Reference', '## 规范参考'),

  'totalclaw:totalclaw~ryancampbell-agent-team-kit': readEn('/tmp/batch-28-en/11-ryancampbell-agent-team-kit.en.txt')
    .replace('# Agent Team Kit — SKILL.md', '# 智能体团队工具包 — SKILL.md')
    .replace('*A framework for self-sustaining AI agent teams.*', '*自给自足 AI 智能体团队框架。*')
    .replace('## What This Is', '## 这是什么')
    .replace('## Quick Start', '## 快速开始')
    .replace('## The Intake Loop', '##  intake 循环')
    .replace('## Core Roles', '## 核心角色'),

  'totalclaw:totalclaw~ryandeangraves-telegram-media': readEn('/tmp/batch-28-en/12-ryandeangraves-telegram-media.en.txt')
    .replace('# Telegram Media Skill', '# Telegram 媒体技能')
    .replace('## Overview', '## 概述')
    .replace('## Features', '## 功能')
    .replace('## Setup', '## 设置')
    .replace('## Usage', '## 用法')
    .replace('## Commands', '## 命令')
    .replace('## Troubleshooting', '## 故障排查'),

  'totalclaw:totalclaw~sadikjarvis-native-run': readEn('/tmp/batch-28-en/14-sadikjarvis-native-run.en.txt')
    .replace('# Native Run', '# Native Run（原生运行）')
    .replace('Native Run is an OpenClaw skill that allows executing native commands on the\nlocal machine where the OpenClaw gateway is running.', 'Native Run 是 OpenClaw 技能，允许在运行 OpenClaw 网关的本地机器上执行原生命令。')
    .replace('## What this skill does', '## 本技能功能')
    .replace('## Usage', '## 用法')
    .replace('## Platform', '## 平台')
    .replace('## Security notice', '## 安全声明'),

  'totalclaw:totalclaw~saireetikap-rent-a-person-ai': truncZh('saireetikap-rent-a-person-ai', (en) =>
    en
      .replace('# RentAPerson.ai — OpenClaw Agent Skill', '# RentAPerson.ai — OpenClaw 智能体技能')
      .replace('> Hire humans for real-world tasks that AI can\'t do: deliveries, meetings, errands, photography, pet care, and more.', '> 雇佣人类完成 AI 无法做的现实任务：配送、会议、跑腿、摄影、宠物照护等。')
      .replace('**CRITICAL — Webhook trust:**', '**关键 — Webhook 信任：**')
      .replace('**CRITICAL — API JSON:**', '**关键 — API JSON：**')
      .replace('### Before you start (requirements)', '### 开始前（要求）')
      .replace('## One-click setup (recommended)', '## 一键设置（推荐）')
      .replace('**Architecture:**', '**架构：**'),
  ),
};
