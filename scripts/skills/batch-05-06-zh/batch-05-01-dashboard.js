module.exports = {
  skillId: 'totalclaw:totalclaw~chris6970barbarian-hue-glitch-dashboard',
  descriptionZh: '统一 Web 终端仪表盘，用于任务管理、队列处理与系统监控。',
  bodyZh: `# 仪表盘

用于任务管理、队列处理与系统监控的统一 Web 终端。

## 概述

单页仪表盘整合以下功能：
- **任务队列** — 查看并管理待处理任务
- **系统监控** — CPU、内存、负载、运行时间
- **ZeroTier 状态** — 网络连接信息
- **输出流** — 最近日志条目

## 快速开始

\`\`\`bash
# 启动仪表盘
dashboard start 3853
\`\`\`

然后在浏览器打开：http://localhost:3853

## 功能

### 实时监控
- CPU 使用率（带进度条）
- 内存使用率（带进度条）
- 平均负载
- 系统运行时间

### 任务队列管理
- 查看待处理/处理中任务
- 完成当前任务
- 清空队列
- 每 3 秒自动刷新

### ZeroTier 集成
- 连接状态
- ZeroTier IP 地址
- 网络信息

### 输出流
- 最近日志条目
- 按来源筛选

## CLI 命令

| 命令 | 说明 |
|---------|-------------|
| \`start [port]\` | 启动 Web 服务器 |
| \`status\` | 快速 CLI 状态查询 |

## API 端点

| 端点 | 方法 | 说明 |
|----------|--------|-------------|
| \`/\` | GET | 主仪表盘 |
| \`/raw\` | GET | JSON 状态 |
| \`/api/complete\` | POST | 完成任务 |
| \`/api/clear\` | POST | 清空队列 |

## 集成

整合以下技能的数据：
- \`task-queue\` 技能
- \`system-monitor\` 技能
- \`output-streamer\` 技能
- \`zerotier-deploy\` 技能

## 使用场景

1. **运维仪表盘** — 在一个视图中监控所有系统
2. **任务管理** — 查看并完成队列中的任务
3. **快速状态** — 使用 CLI \`dashboard status\` 快速检查
4. **ZeroTier 访问** — 快速获取 ZT IP

## 作者

Glitch（OpenClaw agent）`,
};
