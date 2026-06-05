'use strict';
/** 制造·供应链·物流族聚类。7 分类。工业算法/APP开发等纯研发岗走 XCUT defer。 */
const CATEGORIES = ['制造与工艺', '供应链与采购', '物流与仓储', '智能制造', '工业互联网', '智慧物流', '生鲜与冷链'];
const CLUSTERS = [
  ['smart-mfg', '智能制造工程师', ['智能制造', '数字孪生', '运动控制', 'mes', '自动化产线', '产线工程', '3d打印', '增材制造', '工业互联网', '工业app', '工业数据', '工业知识图谱', '工业视觉', '机器视觉', '工业软件', '物联网平台', 'plc', '智能工厂',
    '工业机器人', 'scada', '自动化控制', '工业自动化', 'agv', '数字化工厂', '智能装备', '工业网络', '边缘计算', '工业云', '协作机器人', '工业控制', '机电', '自动化设备研发', '智能调度']],
  ['operator', '一线操作技工', ['cnc操作', '数控', '焊工', '氩弧焊', '气保焊', '设备调试', '操作工', '普工', '钳工', '装配工', '电工', '机修', '冲压', '注塑工', '调机', '电焊']],
  ['quality-engineer', '质量工程师', ['质量工程', '供应商质量', 'sqe', '质量管理', '质检', 'qc', 'qa工程', '体系工程', '可靠性', '计量', '检验', '品控', '品质', '来料检验', 'iqc', 'oqc']],
  ['process-engineer', '工艺/制造工程师', ['工艺工程', '制造工程', '制程', '工艺', '生产工艺', '设备工程', '工业工程', 'ie工程', '注塑', '焊接工艺', '装配工艺']],
  ['production-mgmt', '生产管理', ['生产主管', '生产经理', '生产计划', 'pmc', '车间', '生产管理', '制造经理', '生产调度', '生产总监', '现场管理']],
  ['procurement', '采购', ['采购', '寻源', 'sourcing', 'buyer', '供应商开发', '招采', '商品采购', '战略采购']],
  ['supply-chain', '供应链管理', ['供应链', 'scm', 's&op', '需求计划', '供应计划', '计划员', '订单管理', '物料计划', '产销协同']],
  ['logistics-planning', '物流规划/网络', ['物流规划', '物流网络', '网络规划', '物流工程', '物流仿真', '物流数据', '物流成本', '物流产品', '物流系统', '运筹优化']],
  ['logistics-ops', '物流运营/运输', ['物流运营', '物流调度', '运输', '物流经理', '物流专员', '物流客服', '配送', '货运', '运力', '物流主管', '快递', '物流合规', '物流培训', '物流供应商', '物流项目']],
  ['warehouse', '仓储/库存管理', ['仓库', '仓储', '库存', 'wms', '库管', '入库', '出库', '盘点']],
  ['warehouse-worker', '仓储作业员', ['拣货', '打包', '叉车', '分拣', '理货', '装卸', '搬运', '打包员', '质检员', '操作工', '普工']],
  ['cold-chain', '冷链物流', ['冷链', '生鲜物流', '低温仓', '冷库']],
  ['customs', '报关/关务', ['报关', '关务', '进出口', '清关', '保税', '单证', '货代']],
];
function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) { const low = title.toLowerCase(); for (const [k, n, kws] of CLUSTERS) { if (kws.some((x) => low.includes(x.toLowerCase()))) return { key: k, name: n }; } return { key: 'mfg-generic', name: '制造/供应链从业者', fallback: true }; }
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };
if (require.main === module) { const t = require('../../../data/roles/job-titles.json'); const inFam = t.filter((x) => CATEGORIES.includes(x.category)); let g = 0; const gt = []; for (const x of inFam) if (clusterOf(x.title).fallback) { g++; gt.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, '')); } console.log('制造族', inFam.length, '方向', CLUSTERS.length + 1, '兜底', (g / inFam.length * 100).toFixed(1) + '%'); console.log('样例:', [...new Set(gt)].slice(0, 28).join(' | ')); }
