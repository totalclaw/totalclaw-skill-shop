'use strict';
/** 媒体·内容·传媒族聚类。6 分类。短视频/新媒体/数据等跨职能走 XCUT defer 给营销/dev。 */
const CATEGORIES = ['影视与传媒', '音乐与艺术', '动漫与IP', 'MCN与达人经纪', '短剧与微综艺', '出版与数字阅读'];
const CLUSTERS = [
  ['game-art', '游戏美术', ['游戏原画', '游戏角色', '游戏场景', '游戏ui', '游戏特效', '游戏美术', '次世代', '角色设计师', '场景设计师']],
  ['animation', '动画师/动画导演', ['动画师', '动画导演', '二维动画', '三维动画', '3d建模', '模型师', '绑定', '动画设计', '骨骼', 'mg动画']],
  ['concept-illustration', '概念设计/插画', ['插画', '概念设计', '原画', '分镜', '美宣', '商业插画', '气氛图']],
  ['screenwriter', '编剧/策划', ['编剧', '剧本', '编审', '文案策划', '故事', '剧情策划', '内容策划', '综艺策划', '微综艺', '文学策划', '节目策划']],
  ['director-producer', '导演/制片', ['导演', '制片人', '制片', '监制', '统筹', '执行制片', '导播', '总导演', '副导演']],
  ['cinematography', '摄影/灯光', ['摄影指导', '摄影师', '灯光师', '摄影助理', '掌机', '摄像', '灯光', 'dit', '航拍']],
  ['post-production', '后期/剪辑/特效', ['剪辑', '调色', '特效师', '视效', '视觉特效', '合成', '包装', '后期', '栏目包装', '剪辑师']],
  ['sound-audio', '录音/混音/声音设计', ['录音师', '混音', '音效设计', '声音设计', '拟音', '音频', '编曲', '配乐', '音乐制作', '母带', '音响师']],
  ['music-performer', '音乐演奏/演唱/指挥', ['钢琴', '小提琴', '声乐', '合唱', '乐团', '音乐总监', '演奏', '指挥', '乐手', '歌手', '演唱', '作曲', '乐器', '音乐治疗', '艺术指导']],
  ['comic-artist', '漫画/绘本', ['漫画', '绘本', '上色师', '勾线', '主笔', '背景师', '条漫']],
  ['art-styling', '美术/化妆/造型/道具', ['化妆师', '特效化妆', '服装造型', '造型师', '道具', '美术指导', '置景', '场务', '服装设计师', '梳化']],
  ['voice-actor', '配音/播音', ['配音', '声优', '播音', '主持', '解说']],
  ['editor-publishing', '编辑/出版', ['责任编辑', '文学编辑', '艺术编辑', '漫画编辑', '出版', '校对', '版权编辑', '策划编辑', '编辑']],
  ['distribution-ip', '发行/IP授权', ['发行', '宣发', 'ip授权', 'ip运营', '版权运营', '版权', '营销发行', '内容采购', '艺人经纪']],
  ['mcn-ops', 'MCN/达人运营', ['达人运营', '网红经纪', '达人经纪', '粉丝运营', '知识付费', '直播场控', '红人', 'kol运营', '主播运营', '艺人统筹']],
];
function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) { const low = title.toLowerCase(); for (const [k, n, kws] of CLUSTERS) { if (kws.some((x) => low.includes(x.toLowerCase()))) return { key: k, name: n }; } return { key: 'media-generic', name: '媒体/内容从业者', fallback: true }; }
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };
if (require.main === module) { const t = require('../../../data/roles/job-titles.json'); const inFam = t.filter((x) => CATEGORIES.includes(x.category)); let g = 0; const gt = []; for (const x of inFam) if (clusterOf(x.title).fallback) { g++; gt.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, '')); } console.log('媒体族', inFam.length, '方向', CLUSTERS.length + 1, '兜底', (g / inFam.length * 100).toFixed(1) + '%'); console.log('样例:', [...new Set(gt)].slice(0, 28).join(' | ')); }
