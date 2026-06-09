module.exports = {
  skillId: 'totalclaw:totalclaw~gblockchainnetwork-vps-health-auditor',
  descriptionZh:
    '尽早发现 Linux VPS/服务器问题，检查系统资源、网络、关键服务并生成 PDF/HTML 报告。',
  bodyZh: `---

## 中文说明

---

## 中文说明

# VPS Health Auditor v1.0.0

## 🎯 用途
尽早发现 Linux VPS/服务器上的问题。检查项：
- 系统资源（CPU、内存、磁盘使用率）
- 网络延迟/带宽
- 关键服务（SSH、Web 服务器、数据库）
- 正常运行时间与日志
通过 Ollama 生成 PDF/HTML 报告。

## 🚀 快速开始
\`\`\`
!vps-health-auditor --host example.com --user root --key ~/.ssh/id_rsa
\`\`\`

## 文件
- \`scripts/healthcheck.sh\`：多平台审计脚本（Ubuntu/CentOS/Debian）
- \`reports/template.md\`：用于报告生成的 Ollama 提示词

## 自定义
编辑 \`scripts/healthcheck.sh\` 以添加自定义检查。在 triggers 中添加 Ollama 模型。`,
};
