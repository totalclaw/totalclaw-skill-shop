module.exports = {
  skillId: 'totalclaw:totalclaw~hugosbl-legal-docs-fr',
  descriptionZh:
    '法国自由职业者/微型企业法律文档生成器，可生成 CGV、法律声明、服务合同与报价单 HTML 文档，符合法国商法与 GDPR 要求。',
  bodyZh: `# Legal Docs FR（法国法律文档）

面向自由职业者/微型企业的法国法律文档生成器。
生成 CGV、法律声明、服务合同与报价单 HTML 文档。

## 脚本

全部位于 \`scripts/\`。仅使用 Python 3 标准库。文档保存在 \`~/.freelance/legal/\`。

### legal.py — 法律文档生成

\`\`\`bash
# CGV — 通用销售条款
python3 legal.py generate cgv [--no-open]
python3 legal.py generate cgv --tribunal "Paris" --mediateur "CMAP, Paris"

# 网站法律声明
python3 legal.py generate mentions --hebergeur "Vercel Inc, San Francisco" [--site "monsite.fr"] [--dpo "dpo@email.com"]

# 服务合同
python3 legal.py generate contrat --client "Acme Corp" --mission "Développement application web" \\
  --montant 5000 --duree "3 mois" [--client-address "10 rue Example, Paris"] \\
  [--client-siret "12345678900010"] [--date-debut "01/03/2026"] [--non-sollicitation]

# 报价单
python3 legal.py generate devis --client "Acme Corp" --items "Dev frontend:10:400" "Design UX:3:500" \\
  [--number DEV-2026-001] [--date 2026-02-15]

# 列出所有已生成文档
python3 legal.py list [--json]

# 查看服务提供方配置
python3 legal.py config [--json]
\`\`\`

所有 generate 命令均支持 \`--no-open\` 以不在浏览器中打开。

### 服务提供方覆盖（所有 generate 命令）
\`\`\`bash
--nom "Hugo Dupont" --siret "12345" --adresse "42 rue X" --email "x@y.com" --phone "06..."
\`\`\`
若存在 \`~/.freelance/config.json\`（来自 freelance-toolkit），信息会自动预填。

## 生成的文档

| 类型 | 文件 | 内容 |
|------|---------|---------|
| CGV | \`cgv.html\` | 10 条：对象、订单、付款（30 天、3×法定利率、40€）、期限、知识产权、责任、终止、不可抗力、管辖、调解 |
| 法律声明 | \`mentions.html\` | 身份、托管商、出版负责人、RGPD（权利、目的、DPO）、Cookie、知识产权 |
| 合同 | \`contrat-{client}-{ts}.html\` | 双方、任务、期限、价格（30/70）、义务、保密、知识产权、终止、可选竞业禁止 |
| 报价单 | \`DEV-YYYY-NNN.html\` | 自动编号、30 天有效期、服务明细、付款条件、「Bon pour accord」签名栏 |

## 配置

使用 \`~/.freelance/config.json\`（与 freelance-toolkit 共享）：
\`\`\`json
{
  "provider": { "name": "...", "address": "...", "siret": "...", "email": "...", "phone": "..." },
  "micro_entreprise": true,
  "tva_rate": 0
}
\`\`\`

若 \`micro_entreprise: true\` → 所有文档注明 CGI 第 293B 条。

## 数据目录

\`\`\`
~/.freelance/legal/
├── cgv.html / cgv.json
├── mentions.html / mentions.json
├── contrat-acme-20260215-143022.html / .json
├── DEV-2026-001.html / .json
└── ...
\`\`\`

## 法律内容

文档包含法国法强制性条款：
- **付款**：30 天、罚息 3×法定利率、40€ 补偿（商法典 D441-5 条）
- **知识产权**：全额付款后方可转让
- **调解**：2016 年起强制（消费者法典 L611-1 条）
- **RGPD**：个人权利、处理目的、保留期限、DPO 联系方式
- **不可抗力**：民法典第 1218 条

详见 \`references/french-legal-ref.md\` 了解法律义务细节。

## 说明
- 内联 CSS 的 HTML，优化打印 / PDF 导出
- 金额使用法国格式（2 900,00 €）
- 服务提供方首字母作为 logo（与发票风格一致）
- \`list\` 与 \`config\` 支持 \`--json\`
`,
};
