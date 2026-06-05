'use strict';
/** 教育·培训·科研族聚类。5 分类。 */
const CATEGORIES = ['教育与培训', '在线教育', '职业培训', '高等教育与科研管理', '科研与学术'];
const CLUSTERS = [
  ['edtech-pm', '在线教育产品/技术', ['在线教育产品', '教育产品', '教育技术', 'edtech', '学习产品', '教育平台']],
  ['course-designer', '课程设计/教研', ['课程设计', '教学设计', '课程研发', '教研', '课程内容', '课程开发', '教材', '内容编辑', '题库']],
  ['course-ops', '课程运营/学习顾问', ['课程运营', '课程顾问', '学习规划', '学习顾问', '在线学习', '学管', '辅导老师', '助教', '续费', '招生']],
  ['career-counselor', '职业规划师', ['职业规划', '生涯规划', '职业咨询', '学习与发展顾问', '就业指导']],
  ['instructor-vocational', '职业/企业培训讲师', ['职业培训讲师', '技能培训', '企业培训', '管理培训', '礼仪培训', '电工培训', '焊工培训', '写作培训', '培训讲师', '内训师', '讲师', '培训师', '认证讲师', '双师', '实训导师', '实训']],
  ['training-mgr', '培训项目/运营管理', ['培训项目', '培训经理', '培训主管', '培训运营', '培训需求', '培训专员', '考务', '培训效果', '效果评估', '培训助理']],
  ['teacher-k12', '中小学/幼教教师', ['幼教', '幼儿', '小学', '初中', '高中', '学科教师', '语文教师', '数学教师', '英语教师', '班主任', '任课', '中学教师', '学科老师']],
  ['academic-researcher', '研究员/科研', ['研究员', '博士后', '科研助理', '研究助理', '助理研究', '副研究', '教育研究', '课题', '学术研究', '研究科学家']],
  ['lab-technician', '实验室技术员', ['实验室', '实验员', '实验技术', '实验室主任']],
  ['edu-admin', '教务/高校行政管理', ['教务', '教学督导', '教学总监', '教学管理', '科研处', '科研管理', '学术顾问', '校企合作', '企业合作', '科研诚信', '校长', '院长', '教学校长', '学院', '招办', '招生办',
    '处长', '部长', '馆长', '中心主任', '办公室主任', '处主任', '系主任', '教务处', '学生工作', '发展规划', '学科建设', '后勤管理', '网络信息中心', '实验设备']],
];
function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) { const low = title.toLowerCase(); for (const [k, n, kws] of CLUSTERS) { if (kws.some((x) => low.includes(x.toLowerCase()))) return { key: k, name: n }; } return { key: 'edu-generic', name: '教育/科研从业者', fallback: true }; }
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };
if (require.main === module) { const t = require('../../../data/roles/job-titles.json'); const inFam = t.filter((x) => CATEGORIES.includes(x.category)); let g = 0; const gt = []; for (const x of inFam) if (clusterOf(x.title).fallback) { g++; gt.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, '')); } console.log('教育族', inFam.length, '方向', CLUSTERS.length + 1, '兜底', (g / inFam.length * 100).toFixed(1) + '%'); console.log('样例:', [...new Set(gt)].slice(0, 28).join(' | ')); }
