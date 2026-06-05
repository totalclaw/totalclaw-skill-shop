'use strict';
/** 销售·客户成功族聚类。2 分类。吸收其它族 deferred 的销售/商务/客户成功岗。 */
const CATEGORIES = ['销售与商务', '客户成功与支持'];
const CLUSTERS = [
  ['sales-ops', '销售运营', ['销售运营', '销售支持', '销售数据', '销售培训', '销售分析', 'sales ops', '销售管理']],
  ['customer-success', '客户成功', ['客户成功', 'customer success', 'csm', '客户成功运营', '续费', '客户健康']],
  ['presales', '售前/解决方案', ['售前', '解决方案经理', '解决方案顾问', '方案工程师', '售前咨询', '售前支持', 'presales']],
  ['customer-support', '客户支持/技术支持', ['客户支持', '技术支持', '产品支持', '售后支持', '客服支持', '支持工程师', '客户支持工程师', 'it支持', '服务台', 'helpdesk', '客服', '售后', '呼叫中心', '坐席']],
  ['customer-relations', '客户关系/体验', ['客户关系', '客户体验', '客户经营', '客户运营', 'cem', '客户经理', '客户主管', '客户专员']],
  ['account-sales', '大客户/渠道销售', ['大客户', '区域销售', '渠道销售', '海外销售', '销售经理', '销售总监', '销售主管', '商务经理', '商务总监', '商务拓展', 'bd', '业务拓展', '销售副总', 'ka销售', '行业销售', '渠道专员', '渠道主管', '渠道总监', '渠道', '商务专员', '商务主管']],
  ['inside-sales', '电销/网销', ['电话销售', '电销', '网络销售', '网销', '在线销售', '内勤销售']],
  ['sales-rep', '销售代表/顾问', ['销售代表', '销售顾问', '销售专员', '销售助理', '业务员', '客户顾问', '置业顾问', '课程销售', '销售工程师']],
];
function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) { const low = title.toLowerCase(); for (const [k, n, kws] of CLUSTERS) { if (kws.some((x) => low.includes(x.toLowerCase()))) return { key: k, name: n }; } return { key: 'sales-generic', name: '销售/商务从业者', fallback: true }; }
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };
if (require.main === module) { const t = require('../../../data/roles/job-titles.json'); const inFam = t.filter((x) => CATEGORIES.includes(x.category)); let g = 0; const gt = []; for (const x of inFam) if (clusterOf(x.title).fallback) { g++; gt.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, '')); } console.log('销售族', inFam.length, '方向', CLUSTERS.length + 1, '兜底', (g / inFam.length * 100).toFixed(1) + '%'); console.log('样例:', [...new Set(gt)].slice(0, 28).join(' | ')); }
