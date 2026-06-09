module.exports = {
  skillId: 'totalclaw:mrnsmh~mrnsmh-nexus-sentinel',
  descriptionZh:
    '自主 SRE 代理：诊断故障、优化资源、管理配置备份，含严格安全协议与有限自动重启策略。',
  bodyZh: `# 技能：Nexus-Sentinel (V1.1)

Nexus-Sentinel 是一个自主 SRE 代理。它诊断故障、优化资源并管理配置备份。

## 🛡️ 安全协议（关键）
1. **零密钥泄露**：代理严禁在未获得用户明确 \`/approve\` 确认的情况下，将 \`.env\` 或含 "secrets/keys/tokens" 的文件纳入云端备份。
2. **先诊断后行动**：重启服务前，代理必须执行 \`sentinel.py analyze <service>\`，判断错误是软件问题（如语法错误）还是基础设施问题（如 DB 宕机）。
3. **自主性限制**：代理每小时最多自动重启 2 次。超出后必须进入告警模式并等待人工指令。

## ⚙️ 配置
完整模式所需环境变量：
- \`MATON_API_KEY\`：用于 WhatsApp 告警与安全 GDrive 上传。
- \`NEXUS_REPORT_CHANNEL\`：简报 WhatsApp 号码。
- \`NEXUS_BACKUP_PATH\`：目标 Google Drive 文件夹 ID。

## 🚀 安装与依赖
本技能需要：
- 宿主系统上的 \`docker\`、\`pm2\`、\`tar\`、\`curl\`。
- Python 库 \`psutil\` 与 \`requests\`。
若缺失，代理应提议通过 \`pip\` 及本地包管理器安装。

## 命令
- **/nexus brief**：智能活动报告。
- **/nexus optimize**：日志轮转与临时文件清理。
- **/nexus recover <service>**：三步诊断与恢复（日志 → DB 状态 → 服务重启）。`,
};
