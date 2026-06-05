'use strict';
/** 文旅·酒店·体育·会展族聚类。5 分类。财税/招聘/采购/数字营销等跨职能走 XCUT defer。 */
const CATEGORIES = ['酒店与旅游', '民宿与酒店运营', '文旅与景区', '体育与健身', '会展与活动'];
const CLUSTERS = [
  ['hotel-mgmt', '酒店管理', ['酒店总经理', '驻店经理', '酒店运营', '大堂副理', '值班经理', '运营总监', '酒店店长', '总经理']],
  ['hotel-front-office', '前厅/礼宾/预订', ['前台', '礼宾', '行李员', '预订', '总机', '话务', '接待', '宾客关系', 'vip接待', '前厅']],
  ['housekeeping', '客房/PA', ['客房', '布草', '洗衣房', 'pa', '楼层主管', '客房部', '保洁主管', '客房服务']],
  ['hotel-fb', '酒店餐饮/宴会', ['行政总厨', '厨师长', '宴会', '餐饮总监', '西餐', '中餐', '调酒', '酒吧', '餐厅服务', '传菜', '餐饮部', '宴会销售', '出品总监']],
  ['hotel-facilities', '工程后勤/安保', ['电工', '锅炉', '弱电工程', '消防中控', '安保', '工程部', '设备工程', '安管', '保安', '维修工', '工程维修', '机电维修', '设施维护']],
  ['fitness-coach', '健身/教练', ['健身教练', '瑜伽', '游泳教练', '私教', '私人教练', '操课', '普拉提', '体能', '运动教练', '健身', '舞蹈教练', '拳击', '武术', '有氧操', '单车教练', '康复教练', '运动营养', '体育教师', '搏击', '球类教练']],
  ['scenic-area', '景区运营/管理', ['景区', '票务', '景点', '游乐', '主题公园', '文旅项目', '文旅策划', '研学基地', '索道', '游客中心']],
  ['tourism-product', '旅游产品/线路/导游', ['旅游产品', '线路设计', '计调', '导游', '景区讲解', '旅游策划', '旅游线路', '研学', '领队', '出境游']],
  ['ota-ops', 'OTA/酒店电商运营', ['ota', '酒店电商', '分销', '渠道运营', '收益管理', 'revenue', '在线旅游']],
  ['events-mice', '会展/会议/活动', ['会议协调', '活动执行', '会展', '会奖', '展览', '活动策划', '会务', '宴会统筹', '场馆运营', '展位', '搭建', '会议注册', '活动音响', '活动灯光', '舞台搭建', '展会']],
  ['homestay', '民宿运营', ['民宿', '精品酒店', '客栈', '主理人', '房东']],
];
function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) { const low = title.toLowerCase(); for (const [k, n, kws] of CLUSTERS) { if (kws.some((x) => low.includes(x.toLowerCase()))) return { key: k, name: n }; } return { key: 'tourism-generic', name: '文旅/酒店/体育从业者', fallback: true }; }
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };
if (require.main === module) { const t = require('../../../data/roles/job-titles.json'); const inFam = t.filter((x) => CATEGORIES.includes(x.category)); let g = 0; const gt = []; for (const x of inFam) if (clusterOf(x.title).fallback) { g++; gt.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, '')); } console.log('文旅族', inFam.length, '方向', CLUSTERS.length + 1, '兜底', (g / inFam.length * 100).toFixed(1) + '%'); console.log('样例:', [...new Set(gt)].slice(0, 30).join(' | ')); }
