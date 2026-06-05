'use strict';
/**
 * 法律合规族聚类。4 分类(法律与合规/法律科技/知识产权/隐私与数据合规)。
 * 法律科技的纯研发岗(后端/前端/NLP等)走 XCUT defer 给 dev。
 */
const CATEGORIES = ['法律与合规', '法律科技', '知识产权', '隐私与数据合规'];

const CLUSTERS = [
  ['privacy-compliance', '隐私/数据合规', ['隐私', '数据合规', 'dpo', '数据保护', '跨境数据', 'dpia', '个人信息', 'gdpr', '数据治理']],
  ['patent-agent', '专利代理/工程师', ['专利']],
  ['trademark-agent', '商标代理', ['商标']],
  ['copyright-agent', '版权代理', ['版权', '著作权']],
  ['ip-attorney', '知识产权律师/顾问', ['知识产权', 'ip顾问', 'ip律师', 'ip经理', 'ip分析', '专利分析']],
  ['litigation', '诉讼/争议解决', ['诉讼', '争议解决', '仲裁', '诉讼支持', '调解']],
  ['ma-lawyer', '公司/并购律师', ['并购律师', '公司律师', '税务律师', '资本市场律师', '投融资律师', '证券律师']],
  ['compliance-officer', '合规官', ['合规', '监管科技', '风险管理', '内控', '反舞弊', '反贿赂']],
  ['legaltech-eng', '法律科技工程师', ['电子取证', 'ediscovery', '法律文本挖掘', '法律对话系统', '法律聊天机器人', '智能合同', '智能证据', '智能法律研究', '法律nlp', '法律知识图谱', '法律科技后端', '法律科技前端', '法律科技全栈', '法律科技算法']],
  ['legaltech-pm', '法律科技产品/方案', ['法律科技产品', '法律科技顾问', '解决方案架构', '法律科技解决方案', 'legaltech产品', '法律科技实施', '法律科技需求', '法律科技商业分析']],
  ['legal-doc', '合同/法律文书与检索', ['合同管理', '合同审查', '合同专员', '合同经理', '合同生命周期', '法律检索', '法律秘书', '法律文书', '法律知识', '法律数据标注', '法律翻译', '法律编辑', '案件管理', '文件管理', '档案']],
  ['legal-counsel', '法律顾问/法务', ['法律顾问', '法务', '法律事务', '公司法律', '法律经理', '法律专员', '律师助理', '律师', '法律风险']],
];

function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人|principal|senior|junior)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) {
  const low = title.toLowerCase();
  for (const [key, name, kws] of CLUSTERS) { if (kws.some((k) => low.includes(k.toLowerCase()))) return { key, name }; }
  return { key: 'legal-generic', name: '法律从业者', fallback: true };
}
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };

if (require.main === module) {
  const t = require('../../../data/roles/job-titles.json');
  const XCUT = ['后端', '前端', '全栈', '算法工程', '机器学习', 'nlp', '测试工程', 'devops', '数据科学家', '数据工程', '产品经理', '运营', '销售', '架构师'];
  const isX = (s) => XCUT.some((m) => s.toLowerCase().includes(m.toLowerCase()));
  const inFam = t.filter((x) => CATEGORIES.includes(x.category));
  let rg = 0, df = 0; const rgs = [];
  for (const x of inFam) { if (clusterOf(x.title).fallback) { isX(x.title) ? df++ : (rg++, rgs.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, ''))); } }
  console.log(`法律族岗位 ${inFam.length}，方向 ${CLUSTERS.length + 1}，真兜底 ${rg} (${(rg / inFam.length * 100).toFixed(1)}%)，横切defer ${df}`);
  console.log('真兜底样例:', [...new Set(rgs)].slice(0, 30).join(' | '));
}
