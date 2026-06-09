module.exports = {
  skillId: 'totalclaw:totalclaw~pascalwhoop-medical-clinicaltrials',
  descriptionZh: '访问 ClinicalTrials.gov，按条件、干预措施、阶段与状态搜索临床试验。',
  bodyZh: `# 临床试验搜索

访问 ClinicalTrials.gov，使用高级筛选选项搜索临床试验。

## 功能

- 按疾病/病情、干预措施、阶段和状态搜索临床试验
- 通过 NCT ID 获取试验详细信息
- 按疾病/病情或治疗类型筛选
- 访问试验元数据与研究信息

## 使用场景

- 查找特定疾病的进行中临床试验（重症肌无力、多发性硬化等）
- 发现药物再利用机会
- 跟踪试验状态与招募情况
- 发现治疗创新

## 可用工具

- \`ctg_search_studies\` — 使用多种筛选条件搜索试验
- \`ctg_get_study\` — 通过 NCT ID 获取单项研究
- \`ctg_search_by_condition\` — 按疾病搜索试验
- \`ctg_search_by_intervention\` — 按治疗方式搜索试验
- \`ctg_get_study_metadata\` — 获取可用字段元数据

## 要求

无需 API 密钥。使用 ClinicalTrials.gov 公开 API。

## 作者

Pascal Brockmeyer 与 medical-mcps 贡献者`,
};
