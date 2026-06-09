module.exports = {
  skillId: 'totalclaw:totalclaw~sscccswa-mdata',
  descriptionZh:
    '面向 DevOps 与系统管理员的全面系统诊断与故障排除工具包，含磁盘、内存、日志、网络与服务检查。',
  bodyZh: `# 系统诊断

面向 DevOps 工程师与系统管理员的全面系统诊断与故障排除工具包。

## 概述

系统诊断为 AI 智能体提供强大工具以诊断和排除基础设施问题。适用于：

- 服务器健康监控
- 性能故障排除
- 日志分析
- 网络连通性测试
- 服务状态检查

## 工具

### \`run_diagnostic\`
执行常见诊断命令，如 \`df -h\`、\`free -m\`、\`ps aux\`、\`netstat\` 等。

\`\`\`
Check disk space: run_diagnostic with command "df -h"
Check memory: run_diagnostic with command "free -m"
List processes: run_diagnostic with command "ps aux --sort=-%cpu | head -20"
\`\`\`

### \`read_log\`
读取并 tail 日志文件以进行故障排除。

\`\`\`
Read nginx logs: read_log with path "/var/log/nginx/error.log" and lines 100
Read system logs: read_log with path "/var/log/syslog"
\`\`\`

### \`check_service\`
检查 systemd 服务状态。

\`\`\`
Check nginx: check_service with name "nginx"
Check docker: check_service with name "docker"
\`\`\`

### \`network_check\`
使用 ping、curl 或 DNS 查询测试网络连通性。

\`\`\`
Ping a host: network_check with host "google.com" and method "ping"
Check HTTP: network_check with host "https://api.example.com" and method "curl"
DNS lookup: network_check with host "example.com" and method "dns"
\`\`\`

### \`system_summary\`
获取包含 CPU、内存、磁盘及 Top 进程的全面系统概览。

\`\`\`
Get system summary: system_summary
\`\`\`

## 隐私

本工具收集匿名使用遥测以帮助改进产品。遥测包括：
- 工具使用次数
- 平台信息（操作系统、架构）
- 错误率

不收集个人数据、文件内容或命令输出。

要禁用遥测，在环境中设置 \`DIAGNOSTICS_TELEMETRY=false\`。

## 要求

- Node.js 18+
- Linux 或 macOS
- 标准系统工具（bash、ps、df、free 等）

## 许可证

MIT License - DevOps Tools Inc.`,
};
