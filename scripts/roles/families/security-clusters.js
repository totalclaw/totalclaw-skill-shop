'use strict';
/** 安全·风控·区块链族聚类。3 分类。安全方向均为企业防御/授权测试/合规语境。 */
const CATEGORIES = ['安全与风控', '网络安全攻防', '区块链与Web3'];
const CLUSTERS = [
  ['offensive-sec', '安全测试/红蓝对抗', ['渗透测试', '红队', '蓝队', '漏洞研究', '漏洞管理', '逆向', '安全评估', '攻防', '众测', '安全研究员']],
  ['sec-ops', '安全运营/事件响应', ['事件响应', '威胁情报', 'soc', '应急响应', '态势感知', '安全运营', '安全监控', '日志分析']],
  ['sec-engineering', '安全工程/纵深防御', ['安全网关', '防火墙', '入侵检测', '入侵防御', '防病毒', '沙箱', '蜜罐', '加密', '解密', '密钥', '证书', 'vpn', '安全sdk', '安全插件', '安全代理', '安全隔离', '安全网络', '安全架构', '负载均衡', '协议分析', '数据中心', '远程访问', '路由器', '交换机', '欺骗', '陷阱']],
  ['sec-compliance', '安全合规/管理', ['合规安全', '数据隐私', '第三方安全评估', '内审安全', '业务连续性', '灾备', '灾难恢复', '信息安全经理', '信息安全总监', '安全合规', '等保', '审计安全']],
  ['domain-sec', '行业/场景安全', ['云安全', '物联网安全', '工控安全', '汽车信息安全', '区块链安全', '应用安全', '移动安全', '数据安全', 'iot安全']],
  ['risk-fraud', '风控/反欺诈', ['反欺诈', '风控模型', '风控数据', '风控专家', '风控策略', '风险管理', '信用风险', '风控分析', '反洗钱', '风险经理']],
  ['blockchain-dev', '区块链开发/系统', ['区块链开发', '智能合约', '交易系统', '交易所', '清结算', '区块链支付', '跨境支付', '溯源系统', '区块链供应链', '链上', '公链', '联盟链', '共识', '钱包开发', '区块链架构', '版权保护', '政务系统', '金融系统', '医疗数据']],
  ['web3-product', '区块链产品/设计/GameFi', ['gamefi', '元宇宙', 'nft', '数字藏品', '区块链ui', '区块链交互', '区块链视觉', '区块链游戏', 'web3', 'dapp', 'defi', 'dao', '区块链数据治理', '区块链bi', 'vr工程', 'ar工程']],
];
function stripLevel(s) { return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|主管|负责人)/i, ''); }
function levelOf(title) { const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/); return m ? m[1] : '中级'; }
function clusterOf(title) { const low = title.toLowerCase(); for (const [k, n, kws] of CLUSTERS) { if (kws.some((x) => low.includes(x.toLowerCase()))) return { key: k, name: n }; } return { key: 'security-generic', name: '安全/风控从业者', fallback: true }; }
module.exports = { CATEGORIES, DEV_CATEGORIES: CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };
if (require.main === module) { const t = require('../../../data/roles/job-titles.json'); const inFam = t.filter((x) => CATEGORIES.includes(x.category)); let g = 0; const gt = []; for (const x of inFam) if (clusterOf(x.title).fallback) { g++; gt.push(x.title.replace(/^(初级|中级|高级|资深|首席)/, '')); } console.log('安全族', inFam.length, '方向', CLUSTERS.length + 1, '兜底', (g / inFam.length * 100).toFixed(1) + '%'); console.log('样例:', [...new Set(gt)].slice(0, 24).join(' | ')); }
