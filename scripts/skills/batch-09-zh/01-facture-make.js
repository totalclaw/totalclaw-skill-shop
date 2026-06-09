module.exports = {
  skillId: 'totalclaw:totalclaw~cimes19-facture-make',
  descriptionZh:
    '在人工确认后生成并发送专业发票至 Make.com。支持按天数与客户名称创建发票，通过 prepare_invoice.py 与 send_invoice.py 完成准备与发送。',
  bodyZh: `# 技能：Facture Make

本技能可在人工确认后，生成并发送专业发票至 Make.com。

## 使用方式

当用户表达创建发票的意图时触发本技能：
- "crée une facture"
- "générer une facture pour [X] jours"
- "fais une facture pour le client [NOM]"

## 工作流程（Workflow）

1. **准备**：调用 \`prepare_invoice.py\`。该脚本计算金额并准备摘要文本。
2. **确认**：向用户展示第一个脚本返回的 \`confirmation\` 字段内容。
3. **发送**：若用户确认，调用 \`send_invoice.py\`，**仅**传入 \`invoice\` 键中的 JSON 对象。

## 技术规格

### 1. 准备脚本：\`prepare_invoice.py\`
- **作用**：接收详情（天数、客户）并返回 JSON。
- **预期输出格式**：
\`\`\`json
{
  "invoice": {
    "client": "Nom du client",
    "jours": 3,
    "tjm": 280,
    "libelle": "Consulting Février 2026",
    "total": 840
  },
  "confirmation": "Texte de confirmation à lire à l'utilisateur"
}
\`\`\`

## 最终回复
仅回复："Envoi confirmé."`,
};
