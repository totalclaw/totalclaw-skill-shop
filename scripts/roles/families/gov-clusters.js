'use strict';
/** 政务·公共·环保·ESG族聚类。5 分类。跨职能(财务/人力/纯IT开发)走 XCUT defer。 */
const CATEGORIES = ['政务与公共事业', '环保与可持续', '碳中和与ESG', '水务与环卫', '智慧城市'];
const CLUSTERS = [
  ['carbon-esg', '碳/ESG/可持续', ['碳资产', '碳交易', '碳足迹', '碳排放', '碳减排', '碳中和', 'ccus', 'esg', '绿色金融', '可持续发展', '双碳', '碳核算', '碳管理', '碳市场', '碳审计', '碳咨询']],
  ['env-monitor', '环境监测/检测/评价', ['环境监测', '水质检测', '环保技术', '环境影响评价', '环评', '环境数据', '环境检测', '在线监测', '生态监测']],
  ['env-engineer', '环保/环境工程师', ['污水', '水处理', '给排水', '大气治理', '废气', '废水', '固废', '危废', '垃圾处理', '有机废弃物', '节能工程', '环保工程', '环保项目', '土壤修复', '脱硫脱硝', '环保设备', '污泥', '再生水', '中水', '环境工程']],
  ['water-ops', '水务运营', ['水务', '水务技术', '水务项目', '水资源', '供水', '排水运营', '管网', '水厂', '净水']],
  ['waste-mgmt', '环卫/垃圾分类', ['垃圾分类', '环卫工程', '环卫运营', '环卫', '保洁运营', '再生资源', '清运']],
  ['smart-city', '智慧城市/政务解决方案', ['智慧城市', '城市大脑', '智慧政务', '智能交通', '智慧安防', '城市数据', '智慧社区', '数字政府', '智慧园区', '城市信息模型', 'cim',
    '电子政务', '智慧水务', '智慧城管', '公共数据', '数字孪生城市', '应急指挥系统', '智能路灯', '智慧停车', '智慧能源', '智慧政务', '智慧园区', '城市运营']],
  ['new-energy', '新能源/可再生能源', ['新能源', '可再生能源', '光伏', '风电', '储能', '氢能', '综合能源', '能源管理', '能源审计', '电力工程', '充电桩']],
  ['green-building', '绿色建筑/节能', ['绿色建筑', '建筑节能', '近零能耗', 'leed', '绿建']],
  ['policy-gov', '政策研究/政府事务', ['政策研究', '公共政策', '法规起草', '政府事务', '行政审批', '政务服务', '行政办事', '公共事务', '政研', '调研员', '公务',
    '应急管理', '安全生产', '信访', '政务公开', '城管', '综合执法', '网格', '应急', '城市管理', '监管', '行政执法']],
];
function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) { const low = title.toLowerCase(); for (const [k, n, kws] of CLUSTERS) { if (kws.some((x) => low.includes(x.toLowerCase()))) return { key: k, name: n }; } return { key: 'gov-generic', name: '政务/公共/环保从业者', fallback: true }; }
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };
if (require.main === module) { const t = require('../../../data/roles/job-titles.json'); const inFam = t.filter((x) => CATEGORIES.includes(x.category)); let g = 0; const gt = []; for (const x of inFam) if (clusterOf(x.title).fallback) { g++; gt.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, '')); } console.log('政务族', inFam.length, '方向', CLUSTERS.length + 1, '兜底', (g / inFam.length * 100).toFixed(1) + '%'); console.log('样例:', [...new Set(gt)].slice(0, 28).join(' | ')); }
