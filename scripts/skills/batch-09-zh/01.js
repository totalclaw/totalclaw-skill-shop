module.exports = {
  skillId: 'totalclaw:totalclaw~cimes19-facture-make',
  descriptionZh:
    '经人工确认后，生成并向 Make.com 发送专业发票。支持按天数与客户信息计算金额并准备发票明细。',
  bodyZh: `# 技能：Facture Make

本技能可在人工确认后，生成并向 Make.com 发送专业发票。

## 用法

当用户表达创建发票的意图时触发本技能。
- "crée une facture"（创建发票）
- "générer une facture pour [X] jours"（为 [X] 天生成发票）
- "fais une facture pour le client [NOM]"（为客户 [NOM] 制作发票）

## 工作流程

1. **准备**：调用 \`prepare_invoice.py\`。该脚本计算金额并准备发票描述。
2. **确认**：向用户展示第一个脚本返回的 \`confirmation\` 字段内容。
3. **发送**：若用户确认，调用 \`send_invoice.py\`，并**仅**传入 \`invoice\` 键中的 JSON 对象。

## 技术规范

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
