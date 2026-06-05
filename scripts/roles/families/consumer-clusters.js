'use strict';
/** 餐饮·零售·消费族聚类。7 分类。品牌/电商/供应链/财务/人力等跨职能走 XCUT defer。 */
const CATEGORIES = ['餐饮', '零售与连锁', '连锁餐饮运营', '新茶饮与咖啡', '美妆与个护', '服装与时尚', '母婴与玩具'];
const CLUSTERS = [
  ['barista', '咖啡师/调饮师', ['咖啡师', '调饮', '茶饮师', '吧台', '饮品师', '烘焙师']],
  ['fb-kitchen', '后厨/厨师', ['后厨', '厨师', '凉菜', '面点', '中餐', '西餐', '主厨', '厨师长', '砧板', '炒锅', '配菜', '出品']],
  ['store-ops', '门店运营/店长', ['店长', '储备店长', '值班经理', '营运', '督导', '门店运营', '区域经理', '巡店', '连锁运营', '店助', '营业经理', '门店管理', '餐厅主管', '前厅', '厨房领班', '领班', '见习经理', '楼面']],
  ['retail-associate', '导购/店员/服务员', ['导购', '收银', '护肤顾问', '美容顾问', '营业员', '服务员', '销售顾问', '柜员', '美导', '彩妆师', '传菜', '迎宾', '店员', '洗碗', '保洁', '后勤', '理货', '美容师', '形象顾问']],
  ['buyer', '买手/商品企划', ['买手', '商品企划', '陈列', '视觉陈列', '选品', '品类管理', '商品运营', '商品经理', '货品', 'vmd']],
  ['food-rd', '食品/餐饮研发', ['食品研发', '研发助理', '工艺研发', '菜品研发', '饮品研发', '调香', '原料研发', '食品配方', '产品开发总监', '产品开发经理', '商品总监']],
  ['cosmetics-rd', '化妆品/个护研发', ['化妆品研发', '护肤产品', '彩妆产品', '个护产品', '化妆品配方', '美妆研发', '香精香料', '护肤研发', '配方工程', '配方师']],
  ['apparel-design', '服装设计/打版', ['服装设计', '面料开发', '制版', '样衣', '服装工艺', '版师', '时装设计', '纸样', '服装跟单', '服装制版', '设计师助理', '花型', '服装', '缝纫', '裁剪', '车工', '后整', '服装生产', '服饰', '童装']],
  ['toy-design', '玩具/母婴产品研发', ['玩具设计', '母婴用品', '婴童产品', '玩具研发', '母婴产品', '童装设计', '安全测试']],
  ['franchise', '加盟/拓店', ['加盟', '拓店', '招商加盟', '门店开发', '点位开发', '展店', '特许经营']],
  ['food-qc', '食品质检/品控', ['食品质检', '食品品控', '食品安全', '食品质量', '品控', '食安', 'qa', 'qc']],
];
function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) { const low = title.toLowerCase(); for (const [k, n, kws] of CLUSTERS) { if (kws.some((x) => low.includes(x.toLowerCase()))) return { key: k, name: n }; } return { key: 'consumer-generic', name: '餐饮/零售/消费从业者', fallback: true }; }
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };
if (require.main === module) { const t = require('../../../data/roles/job-titles.json'); const inFam = t.filter((x) => CATEGORIES.includes(x.category)); let g = 0; const gt = []; for (const x of inFam) if (clusterOf(x.title).fallback) { g++; gt.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, '')); } console.log('消费族', inFam.length, '方向', CLUSTERS.length + 1, '兜底', (g / inFam.length * 100).toFixed(1) + '%'); console.log('样例:', [...new Set(gt)].slice(0, 30).join(' | ')); }
