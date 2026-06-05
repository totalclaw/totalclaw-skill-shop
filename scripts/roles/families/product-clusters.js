'use strict';
/**
 * 产品族「规范专精方向」聚类规则。
 * 3 个分类(产品经理/产品设计与UX/视觉与品牌设计，949 岗位)→ ~16 个规范方向。
 * 与 dev-clusters.js 同构：导出 CATEGORIES / CLUSTERS / clusterOf / levelOf / stripLevel。
 * 顺序敏感：越具体越靠前；通用兜底 design-generic 在最后。
 */
const CATEGORIES = ['产品经理', '产品设计与UX', '视觉与品牌设计'];

// [key, 中文名, 关键词(任一命中即归类)]
const CLUSTERS = [
  ['ux-research', '用户体验研究员', ['ux研究', '用户研究', '用户体验研究', '可用性分析', '可用性工程', '可用性测试', '设计研究', 'ux分析', '体验研究', '用户洞察', '用户行为分析', 'ux数据', '用户画像研究']],
  ['design-system', '设计系统设计师', ['设计系统', 'design system', '设计规范', '组件库设计']],
  ['service-design', '服务设计师', ['服务设计', '服务体验', 'service design']],
  ['info-architecture', '信息架构师', ['信息架构', 'ia设计', '信息设计']],
  ['accessibility', '可访问性/无障碍设计师', ['可访问性', '无障碍', 'accessibility', '包容性设计']],
  ['content-design', '内容设计/UX 文案', ['内容策略', '内容设计', 'ux文案', 'ux写作', '文案撰稿', 'ux内容', '内容体验']],
  ['motion-design', '动效/动画设计师', ['动效', '动画设计', 'motion', '交互动效', '动态设计', 'mg动画', '品牌动画', '品牌视频', '品牌动效', '动画师']],
  ['illustration', '插画师', ['插画', '插图', '原画', 'illustration', '商业插画']],
  ['packaging-design', '包装设计师', ['包装设计', '包装', '结构设计', '礼盒设计']],
  ['brand-design', '品牌设计师', ['品牌设计', '品牌体验', '品牌视觉', '设计策略', 'vi设计', '品牌形象', 'logo设计', '标志设计',
    '品牌策略', '品牌标识', '品牌手册', '品牌宣传设计', '品牌推广设计', '品牌活动设计', '品牌空间', '品牌陈列', '品牌橱窗', '品牌平面', '品牌包装']],
  ['growth-design', '增长/转化设计师', ['增长设计', '转化率优化', '用户增长设计', '转化设计', '商业化设计', '用户留存设计', '留存设计', 'ab测试设计', 'a/b测试设计']],
  ['ui-design', 'UI 设计师', ['ui设计', '用户界面', '界面设计', 'gui设计', 'ui视觉']],
  ['ux-design', '用户体验/交互设计师', ['ux设计', '用户体验设计', '交互设计', '体验设计', '产品设计师', '产品体验', 'hmi', '语音交互', '车机交互',
    '游戏ux', '游戏ui设计', 'ar/vr', 'ar设计', 'vr设计', 'ai ux', 'ai交互', 'saas ux', '企业ux', '电商ux', '移动端ux', '网页ux', '前端ux', '原型设计', '交互体验',
    'ux策略', 'ux架构', 'ux顾问', 'ux设计师', '用户体验师', '用户旅程', '可用性专家', 'ux经理', 'ux咨询', 'ux审计', 'ux总监', 'ux主管', '体验经理', '设计思考', '工作坊引导', '设计引导']],
  ['visual-design', '视觉设计师', ['视觉设计', '平面设计', '图形设计', '美术设计', '电商设计', '广告设计', '海报设计', '视觉传达']],
  ['pm', '产品经理', ['产品经理', '产品专家', '产品策略', '产品负责人', '产品总监', '产品运营经理', '产品总管', '需求分析师', '产品助理', '产品规划',
    '产品专员', '产品副总裁', '首席产品官', '产品官', '产品vp', '产品设计专家', '产品']],
  ['design-mgmt', '设计管理(总监/经理)', ['创意总监', '艺术总监', '美术指导', '美术总监', '设计总监', '设计经理', '设计主管', '设计负责人', '设计项目经理', '设计顾问', '设计leader', '设计专家', '设计运营']],
];

function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|专家|总监|负责人|principal|senior|junior)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) {
  const low = title.toLowerCase();
  for (const [key, name, kws] of CLUSTERS) { if (kws.some((k) => low.includes(k.toLowerCase()))) return { key, name }; }
  return { key: 'design-generic', name: '设计师', fallback: true };
}

module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };

if (require.main === module) {
  const t = require('../../../data/roles/job-titles.json');
  const inFam = t.filter((x) => CATEGORIES.includes(x.category));
  const cnt = {}; let gen = 0; const genT = [];
  for (const x of inFam) { const c = clusterOf(x.title); cnt[c.key] = (cnt[c.key] || 0) + 1; if (c.fallback) { gen++; genT.push(x.title); } }
  console.log(`产品族岗位 ${inFam.length}，方向 ${Object.keys(cnt).length}，兜底 ${gen} (${(gen / inFam.length * 100).toFixed(1)}%)`);
  const names = Object.fromEntries(CLUSTERS.map(([k, n]) => [k, n]));
  for (const [k, v] of Object.entries(cnt).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(18)} ${(names[k] || '设计师').padEnd(22)} ${v}`);
  console.log('兜底样例:', [...new Set(genT)].slice(0, 30).join(' | '));
}
