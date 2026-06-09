module.exports = {
  skillId: 'totalclaw:totalclaw~dda-oo-sap-journal-auditor',
  descriptionZh:
    '审计 SAP FI/CO 日记账导出，识别重复过账、整数金额异常、成本中心错配、期末异常与审批绕过等风险，输出分级审计备忘录。',
  bodyZh: `# SAP 日记账审计

审计 SAP FI/CO 日记账导出，识别异常、重复过账、异常成本中心分配、期末离群值与审批绕过模式。

## 触发词

- audit journal
- check journal entries  
- SAP audit
- review postings
- flag anomalies
- prüfe buchungen
- journal analyse

## 描述

本技能分析 SAP FI/CO 日记账导出（CSV 或 Excel），识别潜在审计问题：

- **重复过账** — 相同金额、科目、参考号多次过账
- **整数金额异常** — 大额整数可能为估计或应计
- **成本中心错配** — 费用记入异常成本中心
- **审批绕过** — 缺少参考号、手工日记账
- **公司间问题** — IC 过账缺少正确清账参考
- **用户模式** — 特定用户异常过账活动

支持的 SAP 导出：
- FB03（凭证显示）
- FAGLL03（总账科目行项目）
- KSB1（成本中心行项目）
- ACDOCA（S/4HANA 通用日记账）

## 输入

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| \`file\` | file | 是 | SAP FI/CO 的 CSV 或 Excel 导出 |
| \`language\` | string | 否 | 输出语言：\`en\`（英语）或 \`de\`（德语）。默认：\`en\` |
| \`period\` | string | 否 | 聚焦会计期间，如 \`2025-03\` 或 \`Q1-2025\` |

## 输出

- 按严重程度分类的发现（CRITICAL、HIGH、MEDIUM、LOW）结构化审计备忘录
- 标记分录的 CSV 导出供进一步审阅
- 汇总统计与风险评估

## 示例

\`\`\`
Audit the attached journal_march_2025.csv for anomalies
\`\`\`

\`\`\`
Prüfe die angehängte Buchungsdatei auf Auffälligkeiten
\`\`\`

## 作者

**Daryoosh Dehestani**  
RadarRoster | [https://radarroster.com](https://radarroster.com)

## 许可证

CC-BY-4.0`,
};
