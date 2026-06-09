module.exports = {
  skillId: 'totalclaw:totalclaw~manas-io-ai-legaldoc-ai',
  descriptionZh:
    '法律文档自动化技能，帮助律所与法律专业人士完成合同条款提取、文档摘要、法律研究与期限管理，支持多种文件格式与实务管理系统集成。',
  bodyZh: `# LegalDoc AI

**版本：** 1.0.0  
**类别：** 法律 / 专业服务  
**作者：** Manas AI  
**许可证：** 商业  

## 概述

LegalDoc AI 是一套全面的法律文档自动化技能，帮助律所与法律专业人士简化文档审阅、合同分析、法律研究与期限管理。面向律师、律师助理与法律运营团队设计。

## 能力

### 1. 合同条款提取
从合同中提取并分析特定条款：
- 赔偿条款
- 责任限制
- 终止条款
- 不可抗力
- 保密/NDA 条款
- 竞业禁止/招揽限制
- 知识产权转让
- 适用法律与管辖
- 争议解决（仲裁/诉讼）
- 付款条款与违约金
- 陈述与保证
- 控制权变更条款

### 2. 文档摘要
为法律文档生成执行摘要：
- 突出关键条款的合同摘要
- 案件简报生成
- 证词摘要
- 证据开示文档摘要
- 监管申报摘要
- 并购尽职调查摘要

### 3. 法律研究查询
AI 驱动的法律研究辅助：
- 判例检索与分析
- 法规解释
- 监管指引查询
- 先例识别
- 特定司法管辖区研究
- 引用核验

### 4. 期限追踪
自动化法律期限管理：
- 诉讼时效追踪
- 申报截止日提取
- 开庭日期监控
- 合同里程碑提醒
- 监管合规日期
- 证据开示截止日

## 命令

### 条款提取
\`\`\`
legaldoc extract clauses <file_path>
legaldoc extract clauses <file_path> --type indemnification,liability
legaldoc extract clauses <file_path> --output json|markdown|table
legaldoc compare clauses <file1> <file2> --type all
\`\`\`

### 文档摘要
\`\`\`
legaldoc summarize <file_path>
legaldoc summarize <file_path> --type executive|detailed|bullet
legaldoc summarize <file_path> --length short|medium|long
legaldoc summarize <file_path> --focus obligations|risks|terms
\`\`\`

### 法律研究
\`\`\`
legaldoc research "<query>"
legaldoc research "<query>" --jurisdiction CA|NY|TX|federal
legaldoc research "<query>" --type case_law|statute|regulation
legaldoc research citations <file_path> --verify
\`\`\`

### 期限管理
\`\`\`
legaldoc deadlines extract <file_path>
legaldoc deadlines list --upcoming 30d
legaldoc deadlines add "<description>" --date YYYY-MM-DD --matter <matter_id>
legaldoc deadlines alert --email <address> --days-before 7,3,1
\`\`\`

### 文档对比
\`\`\`
legaldoc compare <file1> <file2>
legaldoc compare <file1> <file2> --type redline|summary|clause-by-clause
legaldoc compare versions <file_path> --show-history
\`\`\`

## 支持的文件类型

- PDF（含扫描件 OCR）
- Microsoft Word (.doc, .docx)
- 纯文本 (.txt)
- 富文本 (.rtf)
- HTML 文档
- Markdown (.md)

## 配置

\`\`\`yaml
# ~/.legaldoc/config.yaml
default_jurisdiction: "federal"
output_format: "markdown"
ocr_enabled: true
deadline_alerts:
  enabled: true
  email: "legal@yourfirm.com"
  slack_webhook: "https://hooks.slack.com/..."
  days_before: [7, 3, 1]
matter_management:
  enabled: true
  system: "clio"  # or "mycase", "practicepanther", "custom"
  api_key: "\${CLIO_API_KEY}"
\`\`\`

## 环境变量

| 变量 | 说明 | 必填 |
|----------|-------------|----------|
| \`LEGALDOC_API_KEY\` | LegalDoc AI API 密钥 | 是 |
| \`WESTLAW_API_KEY\` | Westlaw 研究 API（可选） | 否 |
| \`LEXIS_API_KEY\` | LexisNexis API（可选） | 否 |
| \`COURTLISTENER_API_KEY\` | CourtListener 免费 API | 否 |
| \`CLIO_API_KEY\` | Clio 案件管理 | 否 |
| \`LEGALDOC_STORAGE_PATH\` | 本地文档存储路径 | 否 |

## 数据隐私与安全

- **不存储文档**：文档在内存中处理，从不存储于外部服务器
- **端到端加密**：所有 API 通信使用 TLS 1.3
- **SOC 2 Type II 合规**：企业级安全标准
- **HIPAA 就绪**：适用于医疗健康相关法律事务
- **律师-客户特权**：设计以维护特权保护
- **审计日志**：完整记录所有操作

## 输出格式

### 条款提取输出（JSON）
\`\`\`json
{
  "document": "Master_Services_Agreement.pdf",
  "extracted_at": "2026-01-31T10:30:00Z",
  "clauses": [
    {
      "type": "indemnification",
      "section": "8.1",
      "page": 12,
      "text": "Client shall indemnify and hold harmless...",
      "risk_level": "high",
      "notes": "Broad indemnification with no carve-outs",
      "suggested_revision": "Consider adding carve-outs for gross negligence..."
    }
  ]
}
\`\`\`

### 摘要输出（Markdown）
\`\`\`markdown
# Executive Summary: Master Services Agreement

**Parties:** Acme Corp (Client) ↔ TechVendor Inc (Provider)
**Effective Date:** January 1, 2026
**Term:** 3 years with auto-renewal

## Key Terms
- **Contract Value:** $2.4M over term
- **Payment:** Net 30, quarterly invoicing
- **Termination:** 90-day notice for convenience

## Risk Assessment
🔴 **High Risk:** Unlimited liability for data breaches
🟡 **Medium Risk:** Broad IP assignment clause
🟢 **Low Risk:** Standard force majeure provisions

## Critical Deadlines
- First payment due: February 1, 2026
- Annual review: December 1, 2026
- Renewal notice deadline: October 1, 2028
\`\`\`

## 集成点

### 实务管理系统
- Clio
- MyCase
- PracticePanther
- Rocket Matter
- CosmoLex

### 文档管理
- NetDocuments
- iManage
- Dropbox Business
- Google Drive
- SharePoint

### 通信
- Email (SMTP)
- Slack
- Microsoft Teams
- SMS 提醒

## 最佳实践

1. **始终对照源文档核验**提取的条款
2. **使用司法管辖区标志**确保研究查询的相关性
3. **设置多间隔提醒**的期限告警
4. **审阅 AI 建议**后再纳入最终文档
5. **保留审计日志**以符合合规与执业过失防护要求

## 定价层级

| 层级 | 文档/月 | 研究查询 | 价格 |
|------|-----------------|------------------|-------|
| Solo | 50 | 100 | $99/mo |
| Small Firm | 200 | 500 | $299/mo |
| Mid-Size | 1,000 | 2,500 | $799/mo |
| Enterprise | Unlimited | Unlimited | Custom |

## 支持

- **文档：** https://docs.legaldoc.ai
- **邮箱：** support@legaldoc.ai
- **Slack 社区：** legaldoc-users.slack.com
- **企业版：** 专属客户经理

## 更新日志

### v1.0.0 (2026-01-31)
- 首次发布
- 合同条款提取（12 种条款类型）
- 文档摘要
- 法律研究集成
- 期限追踪系统`,
};
