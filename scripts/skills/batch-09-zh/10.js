module.exports = {
  skillId: 'totalclaw:totalclaw~nantes-agent-metrics-osiris',
  descriptionZh:
    '内置可观测性的 AI 智能体指标追踪与监控，支持调用计数、错误日志、延迟与资源使用，含终端仪表盘。',
  bodyZh: `# Agent Metrics 技能

追踪并监控 AI 智能体行为，内置可观测性。

**包含文件：**
- \`metrics.py\` - Python CLI（跨平台）
- \`agent-metrics.ps1\` - PowerShell 封装（Windows）

## 功能

- **调用追踪** - 统计 API 调用、消息、任务
- **错误日志** - 记录错误及堆栈跟踪
- **延迟指标** - 测量响应时间
- **资源使用** - CPU、内存、网络
- **简易仪表盘** - 终端指标视图
- **导出** - JSON 导出供外部仪表盘使用

## 安装

\`\`\`powershell
# 安装 Python 依赖
pip install psutil
\`\`\`

## 用法

### 方式 1：PowerShell（Windows 推荐）

\`\`\`powershell
.\\agent-metrics.ps1 -Action record -MetricType call -Label "api_openai"
\`\`\`

### 方式 2：Python CLI（跨平台）

\`\`\`powershell
python metrics.py record --type call --label "api_openai"
\`\`\`

### 记录错误

\`\`\`powershell
.\\agent-metrics.ps1 -Action record -MetricType error -Label "api_error" -Details "Rate limit exceeded"
\`\`\`

### 记录延迟

\`\`\`powershell
.\\agent-metrics.ps1 -Action record -MetricType latency -Label "task_process" -Value 1500
\`\`\`

### 查看仪表盘

\`\`\`powershell
.\\agent-metrics.ps1 -Action dashboard
\`\`\`

### 查看资源使用（CPU、内存、磁盘）

\`\`\`powershell
.\\agent-metrics.ps1 -Action resources
\`\`\`

### 导出指标

\`\`\`powershell
.\\agent-metrics.ps1 -Action export -Format json -Output metrics.json
\`\`\`

### 获取摘要

\`\`\`powershell
.\\agent-metrics.ps1 -Action summary
\`\`\`

## 指标类型

| 类型 | 说明 | 字段 |
|------|-------------|--------|
| call | API 调用 | label, timestamp |
| error | 发生错误 | label, details, timestamp |
| latency | 响应时间（毫秒） | label, value, timestamp |
| custom | 自定义指标 | label, value |

## 仪表盘示例

\`\`\`
╔═══════════════════════════════════════════════╗
║           AGENT METRICS DASHBOARD            ║
╠═══════════════════════════════════════════════╣
║ Total Calls:     1,247                       ║
║ Total Errors:   23                          ║
║ Error Rate:     1.84%                        ║
║ Avg Latency:    234ms                        ║
║ Uptime:         4h 32m                      ║
╠═══════════════════════════════════════════════╣
║ Top Labels:                                  ║
║   api_openai      892 (71.5%)               ║
║   api_claude      234 (18.8%)               ║
║   task_process    121 (9.7%)                ║
╚═══════════════════════════════════════════════╝
\`\`\`

## 要求

- Python 3.8+
- psutil 库

## 许可证

MIT`,
};
