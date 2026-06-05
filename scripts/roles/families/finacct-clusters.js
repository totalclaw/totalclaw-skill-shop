'use strict';
/** 财务·会计·审计·税务族聚类。2 分类（finance 族未含）。 */
const CATEGORIES = ['财务与税务', '会计与审计'];
const CLUSTERS = [
  ['accounting', '会计核算', ['核算会计', '报表会计', '合并报表', '应收', '应付', '固定资产', '存货会计', '总账', '主办会计', '结算会计', '合同会计', '集团会计', '海外会计', '出纳', '会计师', '会计专员', '会计经理', '成本会计', '往来会计']],
  ['audit', '审计', ['内审', '外审', '审计师', '审计经理', '审计员', '审计专员', '审计助理', '合伙人', 'it审计', '审计执行', '审计总监']],
  ['tax', '税务', ['税务分析', '国际税务', '转让定价', '税务合规', '税务顾问', '税务师', '税务助理', '税务专员', '税务经理', '税收筹划']],
  ['fp-a', '财务管理/分析', ['财务专员', '预算分析', '财务控制', '管理会计', '财务经理', '财务总监', '财务高级经理', '财务分析', 'fp&a', '财务bp', '资金']],
  ['fin-system', '财务系统/共享中心', ['财务共享', '财务erp', '财务系统', '财务数据', '财务信息化', '共享中心']],
];
function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) { const low = title.toLowerCase(); for (const [k, n, kws] of CLUSTERS) { if (kws.some((x) => low.includes(x.toLowerCase()))) return { key: k, name: n }; } return { key: 'finacct-generic', name: '财务/会计从业者', fallback: true }; }
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };
if (require.main === module) { const t = require('../../../data/roles/job-titles.json'); const inFam = t.filter((x) => CATEGORIES.includes(x.category)); let g = 0; const gt = []; for (const x of inFam) if (clusterOf(x.title).fallback) { g++; gt.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, '')); } console.log('财会族', inFam.length, '方向', CLUSTERS.length + 1, '兜底', (g / inFam.length * 100).toFixed(1) + '%'); console.log('样例:', [...new Set(gt)].slice(0, 24).join(' | ')); }
