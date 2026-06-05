'use strict';
/** 能源·资源·化工·地质族聚类。7 分类。HR/财务/市场/采购等横切走 XCUT defer。 */
const CATEGORIES = ['能源与电力', '油气与化工', '矿业与冶金', '地质与勘探', '风电与光伏', '储能与氢能', '测绘与遥感'];
const CLUSTERS = [
  ['solar-pv', '光伏', ['光伏', '太阳能', '组件', '逆变器', '电站运维', '光伏系统', '光伏电气', '光伏结构']],
  ['wind-power', '风电', ['风电', '风机', '风能', '风资源', '叶片', '风电运维', '风电电气', '风电开发']],
  ['energy-storage', '储能/电池', ['储能', '液流电池', '锂电池', '固态电池', '电池', '电芯', '热管理', 'pcs', 'bms', '电池研发', '电池系统']],
  ['hydrogen', '氢能/燃料电池', ['氢能', '氢安全', '燃料电池', '制氢', '电解槽', '电解系统', '加氢', '膜电极', '双极板', '质子交换膜', 'soec', '电堆']],
  ['power-grid', '电力/电网', ['电力系统', '电网', '输配电', '输电线路', '继电保护', '变电', '配电', '电气工程', '电气一次', '电气二次', '电机', '电缆', '高压', '电力调度', '发电', '电力交易', '核电', '核安全', '一次设计', '二次设计']],
  ['oil-gas', '油气', ['钻井', '完井', '固井', '修井', '采油', '采气', '增产', '油藏', '测井', '石油', '油气', '集输', '炼化', '管道', '勘探开发', '海上平台', '平台操作']],
  ['chemical', '化工', ['化工', '化学工程', '精细化工', '反应', '化工工艺', '化工设备', '聚合', '催化', '分离']],
  ['mining-metallurgy', '矿业/冶金', ['采矿', '选矿', '矿山', '矿井通风', '冶金', '矿物', '矿物加工', '爆破', '尾矿', '炼钢', '有色', '冶炼', '高炉', '连铸', '轧钢', '金属材料', '钢铁']],
  ['geology', '地质/勘探/物探', ['地质工程', '地质师', '勘探', '地震资料', '地震解释', '物探', '化探', '岩土', '水文地质', '地球物理', '矿产勘查', '地质灾害']],
  ['surveying', '测绘/遥感/GIS', ['测绘', '遥感', '测量', 'gis', '摄影测量', '外业', '内业', '绘图员', '地理信息', '北斗', '激光扫描', '影像处理', '管线探测', '变形监测', '无人机飞手']],
];
function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) { const low = title.toLowerCase(); for (const [k, n, kws] of CLUSTERS) { if (kws.some((x) => low.includes(x.toLowerCase()))) return { key: k, name: n }; } return { key: 'energy-generic', name: '能源/资源/化工从业者', fallback: true }; }
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };
if (require.main === module) { const t = require('../../../data/roles/job-titles.json'); const inFam = t.filter((x) => CATEGORIES.includes(x.category)); let g = 0; const gt = []; for (const x of inFam) if (clusterOf(x.title).fallback) { g++; gt.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, '')); } console.log('能源族', inFam.length, '方向', CLUSTERS.length + 1, '兜底', (g / inFam.length * 100).toFixed(1) + '%'); console.log('样例:', [...new Set(gt)].slice(0, 30).join(' | ')); }
