'use strict';
/** 农业·食品·畜牧族聚类。4 分类。电商/品牌/销售/AI算法等跨职能走 XCUT defer。 */
const CATEGORIES = ['农业与食品', '现代农业与种业', '畜牧与水产', '食品研发与质检'];
const CLUSTERS = [
  ['food-rd', '食品研发', ['食品研发', '食品工艺', '调味品', '饮料研发', '肉制品', '预制菜', '宠物食品', '食品配方', '烘焙研发', '乳品', '乳制品', '产品研发工程师', '食品技术', '食品应用', '食品创新', '糖果', '巧克力', '食品工程师']],
  ['food-qc', '食品质检/安全/合规', ['食品质检', '食品品控', '食品安全', '食品合规', '标签审核', '微生物检验', '食品感官', '食品实验室', '食安', '质检员', '化验员', '品控']],
  ['food-nutrition', '食品营养/感官', ['食品营养', '营养师', '感官分析师', '营养配方', '膳食']],
  ['vet-husbandry', '畜牧兽医', ['畜牧兽医', '兽医', '动物营养', '养殖技术', '畜牧', '宠物医生', '动物疫病', '执业兽医', '繁殖技术', '人工授精', '胚胎移植', '养殖主管', '养殖场技术', '动物医学']],
  ['feed-tech', '饲料配方/品控', ['饲料配方', '饲料品控', '饲料研发', '饲料', '预混料']],
  ['aquaculture', '水产养殖', ['水产养殖', '水产病害', '养殖工程', '水产', '渔业', '海洋牧场']],
  ['farm-mgmt', '农场/种植场管理', ['农场经理', '种植场', '养殖场', '基地管理', '生产场长', '农场管理', '园区管理']],
  ['planting-tech', '种植/栽培技术', ['水肥一体化', '食用菌栽培', '中药材种植', '作物', '栽培', '植保', '农艺', '园艺', '果蔬', '茶叶种植', '育种', '种子']],
  ['smart-ag', '智慧农业/农业工程', ['智慧农业', '精准农业', '智能灌溉', '灌溉工程', '农田水利', '农业气象', '农业物联网', '无人机', '植保无人机', '农业机械', '农业机器人', '农业工程', '设施农业', '数字农业', '智能农业']],
  ['ag-research', '育种/作物科研', ['育种', '转基因', '基因编辑', '种质', '品种选育', '植物病理', '土壤科学', '土壤学', '遗传', '生物技术研究', '作物科学', '农业生态', '生物安全', '生物信息', '种子工程', '分子育种']],
  ['ag-extension', '农技推广/政策', ['农业技术推广', '农业科技特派', '农业政策', '农技', '科技特派员', '农业推广', '乡村振兴', '农业技术员']],
  ['agri-input-rd', '生物肥料/农药/农化研发', ['生物肥料', '生物农药', '植物营养', '农化研发', '昆虫学', '肥料研发', '农药研发', '植物保护研究', '兽药研发']],
];
function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) { const low = title.toLowerCase(); for (const [k, n, kws] of CLUSTERS) { if (kws.some((x) => low.includes(x.toLowerCase()))) return { key: k, name: n }; } return { key: 'agri-generic', name: '农业/食品从业者', fallback: true }; }
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };
if (require.main === module) { const t = require('../../../data/roles/job-titles.json'); const inFam = t.filter((x) => CATEGORIES.includes(x.category)); let g = 0; const gt = []; for (const x of inFam) if (clusterOf(x.title).fallback) { g++; gt.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, '')); } console.log('农业族', inFam.length, '方向', CLUSTERS.length + 1, '兜底', (g / inFam.length * 100).toFixed(1) + '%'); console.log('样例:', [...new Set(gt)].slice(0, 30).join(' | ')); }
