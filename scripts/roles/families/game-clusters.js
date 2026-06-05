'use strict';
/** 游戏·电竞·数字视觉族聚类。3 分类。品牌经理等横切走 XCUT defer。细分策划/美术以充分利用研究。 */
const CATEGORIES = ['游戏策划与美术', '电竞运营', '视觉与品牌设计'];
const CLUSTERS = [
  // —— 游戏策划（具体在前，通用在后）——
  ['game-design-director', '策划总监', ['策划总监']],
  ['game-design-lead', '主策划', ['主策划', '主策', '游戏制作人']],
  ['game-design-numeric', '数值/经济/成长策划', ['数值策划', '经济策划', '成长策划', '数值', '商业化策划']],
  ['game-design-level', '关卡策划', ['关卡策划', '关卡设计', '地图策划']],
  ['game-design-narrative', '剧情/文案策划', ['剧情策划', '文案策划', '叙事', '世界观策划', '编剧策划']],
  ['game-design-combat', '战斗/玩法策划', ['战斗策划', '玩法策划', '技能策划', '系统玩法']],
  ['game-design-system', '系统策划', ['游戏策划', '系统策划', '社交系统策划', '运营策划', '执行策划', '策划']],
  // —— 游戏美术（具体在前）——
  ['art-director', '游戏主美/美术总监', ['主美', '美术总监', '美术指导', '艺术总监']],
  ['game-modeling', '游戏建模/贴图', ['次世代', '手办级建模', '模型贴图', '3d建模', '场景建模', '角色模型', '模型师', '建模师']],
  ['game-animation', '游戏动作设计', ['动作设计', '动画师', '游戏动画', '动作师']],
  ['game-vfx', '游戏特效/粒子', ['特效师', '粒子特效', '游戏特效', '技能特效']],
  ['game-rigging', '游戏绑定', ['绑定师', '骨骼绑定', '蒙皮', 'rigging']],
  ['game-ui', '游戏UI设计', ['游戏ui', 'ui设计', 'ux设计', '界面设计师']],
  ['game-concept-art', '游戏原画/概念设计', ['原画', '概念设计', '游戏美术', '美宣', '角色设计师', '场景设计师', '插画师', '概念设计师']],
  // —— 电竞 ——
  ['esports-ops', '电竞运营/赛事', ['电竞联盟', '电竞俱乐部', '电竞平台', '电竞游戏运营', '电竞赛事', '赛事策划', '赛事执行', '赛事推广', '电竞内容', '电竞视频', '电竞社群', '电竞运营', '电竞社区', '电竞用户', '电竞产品', '电竞渠道', '电竞数据', '电竞活动', '电竞项目', '电竞直播', '电竞电商', '电竞新媒体', '战队', '领队', '电竞解说']],
  ['esports-biz', '电竞商务/营销', ['电竞商务', '电竞营销', '电竞品牌', '电竞市场', '电竞社交媒体', '电竞赞助', '电竞拓展', '电竞合作']],
  // —— 数字视觉/品牌设计 ——
  ['visual-3d', '三维视觉/影视后期', ['三维建模', '渲染师', 'c4d', '建筑可视化', '室内效果图', '视频设计', '视频剪辑', '后期制作', '合成师', '栏目包装', '动效设计', 'motion']],
  ['ecom-graphic', '电商/平面设计', ['电商美工', '网店设计', '天猫设计', '京东设计', '详情页', 'banner', '印刷设计', '出版物设计', '书籍装帧', '排版设计', '字体设计', '字形设计', '字库设计', '平面设计', '海报设计', '网店美工']],
  ['brand-visual', '品牌视觉设计', ['品牌识别', '品牌设计', 'vi设计', 'logo设计', '品牌视觉', '视觉识别', '视觉设计师']],
];
function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) { const low = title.toLowerCase(); for (const [k, n, kws] of CLUSTERS) { if (kws.some((x) => low.includes(x.toLowerCase()))) return { key: k, name: n }; } return { key: 'game-generic', name: '游戏/数字创意从业者', fallback: true }; }
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };
if (require.main === module) { const t = require('../../../data/roles/job-titles.json'); const inFam = t.filter((x) => CATEGORIES.includes(x.category)); let g = 0; const gt = []; for (const x of inFam) if (clusterOf(x.title).fallback) { g++; gt.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, '')); } console.log('游戏族', inFam.length, '方向', CLUSTERS.length + 1, '兜底', (g / inFam.length * 100).toFixed(1) + '%'); console.log('样例:', [...new Set(gt)].slice(0, 24).join(' | ')); }
