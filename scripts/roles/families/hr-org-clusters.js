'use strict';
/**
 * 人力·组织·战略族聚类。4 分类(人力资源/行政与组织/战略与咨询/项目与交付)。
 */
const CATEGORIES = ['人力资源', '行政与组织', '战略与咨询', '项目与交付'];

const CLUSTERS = [
  ['recruiter', '招聘', ['招聘', '猎头', '人才获取', 'recruiter', '社招', '校招', '校园招聘', '招募']],
  ['hrbp', 'HRBP', ['hrbp', '人力资源业务伙伴', '业务伙伴']],
  ['comp-ben', '薪酬福利(C&B)', ['薪酬', '福利', 'c&b', '薪资', '绩效专员', '社保', '薪酬绩效']],
  ['employee-relations', '员工关系', ['员工关系', '员工关怀', '劳动关系', '员工活动']],
  ['training-od', '培训/组织发展(OD)', ['培训', '人才发展', '组织发展', '学习发展', 'od专员', '企业文化', '人才培养', '领导力', 'ld', '企业大学']],
  ['hr-generalist', '人力资源综合', ['人力资源', 'hr专员', 'hr经理', '人事', 'shrbp', '人力资源管理']],
  ['admin', '行政/后勤', ['行政', '前台', '秘书', '文员', '档案', '固定资产', '后勤', '总务', '接待', '商务支持', '物业', '安全管理', '消防', '司机', '车队', '保洁', '绿化', '食堂', '宿舍', '采购专员', '党务', '工会', '办公']],
  ['mgmt-consultant', '管理/战略咨询顾问', ['管理咨询', '战略咨询', '咨询顾问', '运营咨询', '数字化咨询', '战略顾问', '人力资源咨询', '组织咨询']],
  ['strategy', '战略/商业分析', ['战略分析', '战略经理', '战略规划', '战略总监', '商业分析', '业务分析师', '商业分析师', '战略发展', '战略官', '行业研究', '竞争情报', '商业洞察', '投资分析']],
  ['recruiter-rpo', '招聘/RPO', ['rpo', '招聘外包']],
  ['implementation-consultant', '实施/交付顾问', ['实施顾问', '交付顾问', '实施工程', '应用顾问', '解决方案顾问']],
  ['delivery-manager', '交付经理', ['交付经理', '服务交付', '交付总监', '交付主管']],
  ['pmo', 'PMO', ['pmo', '项目管理办公室', '项目群', '项目集']],
  ['scrum-agile', '敏捷教练/Scrum', ['scrum', '敏捷教练', '敏捷专家', 'agile']],
  ['project-control', '项目控制(计划/成本/风险)', ['项目控制', '项目计划', '项目调度', '项目成本', '项目风险', '项目质量', '项目文档', '项目协调', '项目支持', '计划员']],
  ['project-manager', '项目经理', ['项目经理', '项目顾问', '项目主管', '项目总监', '项目助理', '项目专员', '项目分析师', '项目秘书', '项目管理', '项目集', 'pm']],
];

function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人|principal|senior|junior)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) {
  const low = title.toLowerCase();
  for (const [key, name, kws] of CLUSTERS) { if (kws.some((k) => low.includes(k.toLowerCase()))) return { key, name }; }
  return { key: 'hrorg-generic', name: '人力/组织/项目从业者', fallback: true };
}
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };

if (require.main === module) {
  const t = require('../../../data/roles/job-titles.json');
  const XCUT = ['后端', '前端', '算法', '数据工程', '产品经理', '市场', '品牌', '销售', '财务', '设计师'];
  const isX = (s) => XCUT.some((m) => s.toLowerCase().includes(m.toLowerCase()));
  const inFam = t.filter((x) => CATEGORIES.includes(x.category));
  let rg = 0, df = 0; const rgs = [];
  for (const x of inFam) { if (clusterOf(x.title).fallback) { isX(x.title) ? df++ : (rg++, rgs.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, ''))); } }
  console.log(`人力组织战略族岗位 ${inFam.length}，方向 ${CLUSTERS.length + 1}，真兜底 ${rg} (${(rg / inFam.length * 100).toFixed(1)}%)，横切defer ${df}`);
  console.log('真兜底样例:', [...new Set(rgs)].slice(0, 30).join(' | '));
}
