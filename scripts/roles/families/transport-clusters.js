'use strict';
/** 交通·汽车·航空·航运族聚类。8 分类。工程岗按行业语境自渲染；HR/财务/市场/采购等横切走 XCUT defer。 */
const CATEGORIES = ['航空航天', '汽车与出行', '新能源汽车', '自动驾驶', '轨道交通', '民航与机场', '航运与港口', '智慧交通'];
const CLUSTERS = [
  ['autonomous-driving', '自动驾驶/智能驾驶', ['自动驾驶', '无人驾驶', '感知算法', '点云', '决策规划', '传感器融合', '激光雷达', 'slam', '高精地图', '预测算法', '定位算法', '智能驾驶', '泊车']],
  ['auto-embedded', '车载嵌入式/软件', ['嵌入式软件', '嵌入式硬件', '车载软件', 'autosar', 'bsp', '车控', 'mcu', '车机', '座舱软件', '中间件', '固件']],
  ['ev-battery', '动力电池/电芯', ['电池', '电芯', '电池包', '电池系统', '电池热管理', '电池测试', '电池材料', '电池工艺', '电池产线', 'pack', '模组', 'bms']],
  ['auto-electrical', '汽车电气/三电', ['三电', '电控', 'ecu', '车身电子', '电机', '电驱', '电气工程', '充电', '高压', '电子电气']],
  ['vehicle-eng', '整车/底盘/车身', ['整车', '底盘', '车身', '动力总成', 'nvh', '汽车结构', '内外饰', '白车身', '总布置', '发动机', '变速箱', '车辆机械']],
  ['materials-process', '材料/工艺/强度', ['复合材料', '材料工艺', '强度分析', '制造工程', '装配工艺', '工艺工程', '焊接', '热力学', '热处理', '钣金', '材料工程']],
  ['auto-test-quality', '汽车测试/标定/可靠性', ['标定', '耐久', '试验', '道路试验', '可靠性', '整车测试', '法规认证', '碰撞', '质量工程']],
  ['aero-design', '航空航天设计', ['飞行器设计', '气动', '航空结构', '航天器', '航空发动机', '总体设计', '飞机设计', '火箭', '卫星', '热控', '推进', '飞行力学', '结构设计', '强度']],
  ['avionics', '航电/飞控/导航', ['航电', '飞控', '导航制导', '天线', '机载', '雷达', '惯导', '无人机飞控', 'gnc', '航空电子']],
  ['flight-ops', '飞行/航务', ['飞行员', '机长', '副驾驶', '飞行教员', '飞行签派', '飞行调度', '航线规划', '空乘', '客舱', '乘务']],
  ['rail-transit', '轨道交通', ['轨道', '地铁', '信号系统', '牵引', '机车', '动车', '轨道车辆', '接触网', '通信信号', '城轨']],
  ['aviation-airport', '民航/机场', ['民航', '机场', '空管', '航务', '机务', '地服', '航空安全', '航空维修', '机坪']],
  ['shipping-port', '航运/港口', ['航运', '港口', '船舶', '船代', '货代', '海事', '理货', '集装箱', '船舶设计', '轮机', '港机', '单证', '报关', '报检', '货运代理', '堆场', '配载']],
  ['smart-transport', '智慧交通/车联网', ['智慧交通', '车联网', 'v2x', '交通规划', '交通工程', '智能交通', 'tocc', '信号优化', '出行平台']],
  ['auto-software', '汽车软件/算法', ['软件工程', '算法工程', '机器学习', '计算机视觉', '深度学习', '自然语言', '数据挖掘', '大数据', '数据分析', '后端', '前端', '全栈', '系统架构', '测试开发', 'fpga', '仿真', '系统集成', '功能安全', '信息安全', '车联网安全', '控制算法']],
  ['auto-hardware', '汽车硬件/电子/座舱', ['硬件工程', '硬件架构', '硬件测试', '射频', '电源工程', '电磁兼容', 'emc', '电子工程', '线束', '热管理', '智能座舱', '车载以太网', 'ota工程', '车辆动力学', '电子电器']],
  ['auto-aftersales', '售后/技术支持', ['售后', '技术支持', '服务工程', '维修', '保养', '4s']],
];
function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) { const low = title.toLowerCase(); for (const [k, n, kws] of CLUSTERS) { if (kws.some((x) => low.includes(x.toLowerCase()))) return { key: k, name: n }; } return { key: 'transport-generic', name: '交通/汽车/航空从业者', fallback: true }; }
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };
if (require.main === module) { const t = require('../../../data/roles/job-titles.json'); const inFam = t.filter((x) => CATEGORIES.includes(x.category)); let g = 0; const gt = []; for (const x of inFam) if (clusterOf(x.title).fallback) { g++; gt.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, '')); } console.log('交通族', inFam.length, '方向', CLUSTERS.length + 1, '兜底', (g / inFam.length * 100).toFixed(1) + '%'); console.log('样例:', [...new Set(gt)].slice(0, 30).join(' | ')); }
