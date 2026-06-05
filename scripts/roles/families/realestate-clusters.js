'use strict';
/** 地产·建筑·物业族聚类。6 分类。财务/采购/人力/平面设计等跨职能走 XCUT defer。 */
const CATEGORIES = ['房地产', '房地产开发与运营', '建筑与工程', '建筑设计与BIM', '工程造价与监理', '物业管理'];
const CLUSTERS = [
  ['bim', 'BIM 工程师', ['bim', '建筑信息模型', 'revit']],
  ['structural-eng', '结构/土建工程师', ['结构工程', '土建工程', '岩土', '结构设计', '土建', '钢结构', '基础工程']],
  ['mep-eng', '机电/暖通/水电/消防工程师', ['暖通', '电气工程', '给排水', '消防工程', '弱电', '机电', '智能化工程', '幕墙', '电梯工程', '空调工程', '管道工程']],
  ['cost-estimator', '造价/成本/合约', ['造价', '预算员', '成本控制', '成本经理', '成本工程', '合约', '招标', '清单计价', '结算', '工程预算']],
  ['construction-mgmt', '施工/工程管理', ['施工', '工程经理', '工程总监', '工程管理', '市政工程', '监理', '安全员', '质检员', '土木工程', '现场管理', '工程主管', '资料员', '材料员', '工长', '建造师', '测量员', '绘图员', '专业负责人', '工程师']],
  ['architect', '建筑设计师', ['建筑设计', '方案建筑', '施工图设计', '建筑师', '方案设计', '建筑方案']],
  ['interior-landscape', '室内/景观设计', ['室内设计', '景观设计', '软装', '陈设', '园林设计', '装饰设计', '空间设计']],
  ['property-mgmt', '物业管理', ['物业', '楼栋管家', '管家', '秩序', '保安', '客服专员', '物业工程', '设施管理', 'fm', '环境主管', '安管', '物业经理']],
  ['realestate-sales', '房产销售/经纪', ['置业顾问', '房产经纪', '案场', '房地产销售', '渠道分销', '二手房', '中介', '销售案场', '房产顾问', '经纪人', '楼盘销售']],
  ['realestate-invest', '房地产投资/评估/拓展', ['房地产投资', '房地产评估', '土地拓展', '投资拓展', '投资分析', '收并购', '资产管理', '资本运作', '前期开发', '报建', '投资测算', '投资发展', '项目投资', '前期', '拿地', '可研']],
  ['leasing', '商业地产招商/运营', ['招商', '商业运营', '商业地产', '资管运营', '租赁', '业态', '购物中心运营']],
  ['realestate-marketing', '地产营销策划', ['营销策划', '案场策划', '地产策划', '策划主管', '策划专员', '策划经理', '营销总监', '推广策划', '产品策划']],
  ['realestate-design-mgr', '设计管理(地产)', ['设计管理', '设计经理', '产品设计管理', '研发设计', '设计总监']],
];
function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) { const low = title.toLowerCase(); for (const [k, n, kws] of CLUSTERS) { if (kws.some((x) => low.includes(x.toLowerCase()))) return { key: k, name: n }; } return { key: 'realestate-generic', name: '地产/建筑从业者', fallback: true }; }
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };
if (require.main === module) { const t = require('../../../data/roles/job-titles.json'); const inFam = t.filter((x) => CATEGORIES.includes(x.category)); let g = 0; const gt = []; for (const x of inFam) if (clusterOf(x.title).fallback) { g++; gt.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, '')); } console.log('地产族', inFam.length, '方向', CLUSTERS.length + 1, '兜底', (g / inFam.length * 100).toFixed(1) + '%'); console.log('样例:', [...new Set(gt)].slice(0, 28).join(' | ')); }
