'use strict';
/** 硬件·半导体·机器人·IoT族聚类。5 分类。HR/财务/市场/电商/采购等横切走 XCUT defer。 */
const CATEGORIES = ['半导体与芯片', '物联网IoT', '机器人与自动化', '智能硬件', '消费电子'];
const CLUSTERS = [
  ['ic-design', 'IC/芯片设计', ['模拟ic', '数字前端', '数字后端', '版图', 'dft', 'soc', 'ic设计', 'ic验证', '芯片设计', 'rtl', '后端设计', '数模混合', 'serdes', 'ip设计', '物理设计', '静态时序', 'sta', '数字验证', '模拟验证', '验证工程', '产品工程师（芯片）', '产品工程师(芯片)', '芯片产品', '封装设计', 'dv', '形式验证']],
  ['automation', '工业自动化/控制', ['自动化', 'plc', 'scada', '工控', 'dcs', '运动控制', '电气控制', '自动化系统', '自动化项目', '自动化运维', '组态', '上位机']],
  ['semi-process', '半导体工艺/设备/封测', ['设备工程', '半导体工艺', '失效分析', '良率', '封装测试', '光刻', '刻蚀', '薄膜', '制程', '封装工程', '晶圆', 'cmp', '扩散']],
  ['mems-sensor', 'MEMS/传感器', ['mems', '传感器', '敏感元件', '微纳', '惯性器件']],
  ['firmware-embedded', '固件/嵌入式/驱动', ['固件', '嵌入式软件', 'bsp', '驱动开发', 'linux内核', 'android系统', 'rtos', '嵌入式', '驱动工程', 'mcu']],
  ['hardware-eng', '硬件/电路/电源/射频', ['硬件工程', '电源工程', '射频', '电路设计', 'pcb', '高速', '信号完整性', '模拟电路', '电子工程']],
  ['emc-reliability', 'EMC/可靠性/热设计', ['电磁兼容', 'emc', 'esd', '可靠性', '可靠性测试', '热设计', '失效', '环境试验', '安规']],
  ['robotics', '机器人/运动控制', ['机器人算法', '机器人调试', '机械臂', '运动控制', '机器人', 'agv', '伺服', '视觉定位', '力控', '协作机器人']],
  ['drone', '无人机', ['无人机', '飞控', '无人系统', '云台', '植保无人机', '飞行器控制']],
  ['optics-acoustics', '光学/声学', ['光学工程', '声学', '光电', '镜头', '成像', '光通信', '激光器']],
  ['structure-id', '结构/工业设计', ['结构工程', '工业设计', 'id设计', '外观', 'cmf', '产品结构', '机构设计', '手板']],
  ['iot-platform', '物联网/嵌入式系统', ['物联网平台', 'iot', '边缘计算', '通信协议', '物联网', '无线通信', '智能家居', '车联网', 'lora', 'nb-iot']],
  ['hw-software', '硬件软件/算法', ['软件工程', '算法工程', '机器学习', '计算机视觉', '全栈', '系统架构', '测试开发', '应用工程', '系统工程', '专利工程']],
  ['hw-test-quality', '测试/质量/SQE/NPI', ['测试工程', '质量工程', 'sqe', 'npi', '可靠性', '制程', 'dqe', '品质']],
];
function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) { const low = title.toLowerCase(); for (const [k, n, kws] of CLUSTERS) { if (kws.some((x) => low.includes(x.toLowerCase()))) return { key: k, name: n }; } return { key: 'hardware-generic', name: '硬件/半导体从业者', fallback: true }; }
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };
if (require.main === module) { const t = require('../../../data/roles/job-titles.json'); const inFam = t.filter((x) => CATEGORIES.includes(x.category)); let g = 0; const gt = []; for (const x of inFam) if (clusterOf(x.title).fallback) { g++; gt.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, '')); } console.log('硬件族', inFam.length, '方向', CLUSTERS.length + 1, '兜底', (g / inFam.length * 100).toFixed(1) + '%'); console.log('样例:', [...new Set(gt)].slice(0, 30).join(' | ')); }
