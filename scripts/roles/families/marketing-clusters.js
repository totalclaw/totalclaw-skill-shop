'use strict';
/**
 * 营销/运营族「规范专精方向」聚类规则。
 * 11 个分类(市场营销/内容与新媒体/增长与投放/品牌公关/电商运营/直播与短视频/跨境电商/广告与4A/公关与危机管理/直播电商/私域与会员运营，2532岗位)→ ~23 方向。
 * 与其它族同构：导出 CATEGORIES / CLUSTERS / clusterOf / levelOf / stripLevel。
 * 设计/插画类(插画师/平面/动画师等)走全局 XCUT 留给产品族。
 */
const CATEGORIES = ['市场营销', '内容与新媒体', '增长与投放', '品牌公关', '电商运营', '直播与短视频', '跨境电商', '广告与4A', '公关与危机管理', '直播电商', '私域与会员运营'];

const CLUSTERS = [
  // —— 投放/搜索/增长 ——
  ['ad-optimizer', '广告投放/优化师', ['广告投放', '投放优化', '信息流', 'sem', '竞价', '媒介投放', '效果投放', '巨量', '腾讯广告', '广告优化', '投手', 'ocpc',
    '搜索引擎营销', 'google优化', '谷歌优化', 'ppc', '付费广告', '程序化购买', '程序化', '广告运营', '广告操作', 'dsp']],
  ['seo', 'SEO 专员', ['seo', '搜索引擎优化', '搜索优化', '站内优化', '关键词优化']],
  ['growth', '用户增长', ['用户增长', '增长运营', '增长产品', '增长黑客', '拉新', 'growth', '增长策略', '裂变', '增长']],
  // —— 电商/跨境/直播电商 ——
  ['cross-border-ecom', '跨境电商运营', ['跨境电商', 'tiktok', '亚马逊', '速卖通', 'shopee', 'lazada', '独立站', 'ebay', 'wish', '海外运营', 'temu']],
  ['live-ecommerce', '直播电商', ['直播电商', '直播带货', '电商直播', '带货运营', '抖音电商', '快手电商', '直播招商', '直播选品', '直播供应链', '选品', '达人招商', '主播招募']],
  ['ecommerce-ops', '电商运营', ['电商运营', '店铺运营', '天猫运营', '淘宝运营', '京东运营', '拼多多运营', '商品运营', '类目运营', '电商']],
  // —— 直播/短视频/主播 ——
  ['live-ops', '直播运营', ['直播运营', '直播策划', '直播间运营', '直播中控', '直播场控', '场控', '助播', '直播助理', '直播执行']],
  ['anchor', '主播/达人', ['主播', '带货主播', '才艺主播', '达人', '网红', '虚拟主播', 'kol', '出镜']],
  ['video-production', '视频/短视频制作', ['视频剪辑', '短视频编导', '编导', '摄像', '后期', '导演', '视频制作', '影视制作', '剪辑师', '分镜', '短视频策划', '短视频编剧', '短视频脚本', '脚本策划', '编剧', '音频编辑', '视频拍摄', '拍摄', '摄影师', '特效师', '特效', '视频特效']],
  ['short-video-ops', '短视频运营', ['短视频运营', '抖音运营', '视频号运营', '快手运营', '小红书运营', '种草']],
  // —— 内容/新媒体/文案 ——
  ['content-marketing', '内容营销', ['内容营销', '内容策略', '内容策划', '内容总监']],
  ['content-ops', '内容运营', ['内容运营', '内容编辑', '专栏运营', '图文运营', '内容审核', '内容管理', '内容', '编辑', '签约作者', '作者', '专题策划', '撰稿编辑']],
  ['new-media', '新媒体/社媒运营', ['新媒体', '社交媒体', '微信运营', '微博运营', '公众号', '社媒', '海外社媒', 'facebook', 'instagram', 'b站', 'bilibili', '知乎运营', '抖音号', '矩阵运营', '播客', '音频运营']],
  ['copywriter', '文案策划', ['文案', '撰稿', 'copywriter', '广告文案', '新闻稿', '脚本撰写', '创意文案']],
  // —— 用户/社群/私域 ——
  ['user-ops', '用户运营', ['用户运营', '会员运营', '客户运营', '用户生命周期', 'crm运营', '会员', '用户']],
  ['community-ops', '社群/社区运营', ['社群运营', '社区运营', '群运营', '论坛运营', '社群', '社区']],
  ['private-domain', '私域运营', ['私域', '企微运营', '裂变运营', '导购运营']],
  // —— 公关/品牌/活动/市场 ——
  ['account', '广告/4A 客户执行(Account)', ['客户执行', '客户经理', '客户总监', '客户群总监', 'account', 'ae执行', '客户对接', '客户服务总监', '客户主管']],
  ['pr', '公关/媒介', ['公关', '媒体关系', '媒介', '新闻发言', '品牌传播', '传播', '舆情', '危机管理', '政府关系', 'pr', '内部沟通', '企业传播', '公共事务', '声誉管理', '危机沟通', '版权管理', '版权', '政务关系']],
  ['brand-marketing', '品牌营销', ['品牌营销', '品牌策划', '品牌经理', '品牌专员', '品牌总监', '品牌主管', '品牌运营', '品牌manager', '品牌策略', '品牌', '产品营销']],
  ['event-planning', '活动策划', ['活动策划', '活动运营', '活动执行', '会展', '会议策划', '路演策划', '市场活动']],
  ['market-research', '市场调研', ['市场调研', '市场研究', '消费者研究', '市场分析师', '行业分析', '市场情报']],
  // —— 数字/整合营销/分析 ——
  ['digital-marketing', '数字营销/整合营销', ['数字营销', '整合营销', '营销自动化', 'martech', '联盟营销', '效果营销', '全域营销', '4a', '广告策划', '营销策划', '营销经理', '市场营销', '市场推广', '市场专员', '市场经理', '市场总监', '策略策划', '策略总监', '策略经理', '策略', '创意策划', 'crm策略', 'crm', '会员营销']],
  ['marketing-analytics', '营销数据分析', ['营销数据', '营销分析', '数据运营', 'bi运营', '数据分析', '广告数据']],
];

function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|专家|总监|负责人|principal|senior|junior)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) {
  const low = title.toLowerCase();
  for (const [key, name, kws] of CLUSTERS) { if (kws.some((k) => low.includes(k.toLowerCase()))) return { key, name }; }
  return { key: 'mktg-generic', name: '市场营销/运营', fallback: true };
}

module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };

if (require.main === module) {
  const t = require('../../../data/roles/job-titles.json');
  const inFam = t.filter((x) => CATEGORIES.includes(x.category));
  const cnt = {}; let gen = 0; const genT = [];
  for (const x of inFam) { const c = clusterOf(x.title); cnt[c.key] = (cnt[c.key] || 0) + 1; if (c.fallback) { gen++; genT.push(x.title); } }
  console.log(`营销/运营族岗位 ${inFam.length}，方向 ${Object.keys(cnt).length}，兜底 ${gen} (${(gen / inFam.length * 100).toFixed(1)}%)`);
  const names = Object.fromEntries(CLUSTERS.map(([k, n]) => [k, n]));
  for (const [k, v] of Object.entries(cnt).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(18)} ${(names[k] || '市场营销/运营').padEnd(20)} ${v}`);
  console.log('兜底样例:', [...new Set(genT.map((x) => x.replace(/^(初级|中级|高级|资深|首席)/, '')))].slice(0, 30).join(' | '));
}
