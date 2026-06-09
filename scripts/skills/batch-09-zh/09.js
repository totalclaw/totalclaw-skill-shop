module.exports = {
  skillId: 'totalclaw:mrnsmh~mrnsmh-nexus-sentinel',
  descriptionZh:
    '自主 SRE 智能体 Nexus-Sentinel，诊断故障、优化资源并管理配置备份，含严格安全协议与恢复命令。',
  bodyZh: `# 技能：Nexus-Sentinel (V1.1)

Nexus-Sentinel 是自主 SRE 智能体，负责诊断故障、优化资源并管理配置备份。

## 🛡️ 安全协议（关键）
1. **零密钥泄露**：未经用户明确 \`/approve\` 确认，智能体严禁将 \`.env\` 或含 "secrets/clés/tokens" 的文件纳入云备份。
2. **先诊断后行动**：重启服务前，智能体必须执行 \`sentinel.py analyze <service>\`，判断错误是软件问题（如语法错误）还是基础设施问题（如数据库宕机）。
3. **自主性限制**：智能体每小时最多自动重启 2 次。超出后须进入告警模式并等待人工指令。

## ⚙️ 配置
完整模式所需环境变量：
- \`MATON_API_KEY\`：用于 WhatsApp 告警与安全 GDrive 上传。
- \`NEXUS_REPORT_CHANNEL\`：简报 WhatsApp 号码。
- \`NEXUS_BACKUP_PATH\`：目标 Google Drive 文件夹 ID。

## 🚀 安装与依赖
本技能需要：
- 宿主机上的 \`docker\`、\`pm2\`、\`tar\`、\`curl\`。
- Python 库 \`psutil\` 与 \`requests\`。
若缺失，智能体应提议通过 \`pip\` 与本地包管理器安装。

## 命令
- **/nexus brief**：智能活动报告。
- **/nexus optimize**：日志轮转与临时文件清理。
- **/nexus recover <service>**：三步诊断与恢复（日志 → 数据库状态 → 服务重启）。`,
};
