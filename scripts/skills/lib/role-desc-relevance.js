'use strict';

/** 角色名 ↔ 描述 语义相关（审计 desc-not-mention-role 放宽规则） */

const { isProfileRelevant, coreToken } = require('../polish-role-skills');

const EN_ALIASES = [
  ['UX', '用户体验'], ['UI', '界面'], ['UCD', '用户体验'],
  ['CMS', '内容管理'], ['DevOps', '运维'], ['SRE', '可靠性'],
  ['SEO', '搜索'], ['SEM', '搜索营销'], ['API', '接口'],
  ['SDK', '开发包'], ['NB-IoT', '窄带物联网'], ['IoT', '物联网'],
  ['FPGA', '可编程'], ['ESG', '可持续'], ['FP&A', '财务规划'],
  ['QA', '质量'], ['PM', '产品'], ['HR', '人力'],
  ['BD', '商务'], ['PR', '公关'], ['MCN', '网红'],
  ['OTA', '在线旅游'], ['RPA', '流程自动化'], ['BI', '商业智能'],
  ['AIGC', '生成式'], ['LLM', '大模型'], ['SAP', 'SAP'],
];

/** 描述里「领域的中级XXX」泛化 persona 标题 → 角色名关键词 */
const GENERIC_PERSONA_TITLES = {
  '餐饮/零售/消费从业者': /餐饮|厨师|门店|零售|导购|收银|烘焙|咖啡|茶|调酒|外卖|理货|陈列|促销|会员|私域|品控|食安|店长|督导|招商|加盟|连锁|渠道|培训|安全|经理|主管|专员|工程师|顾问|分析师|总监|负责人/,
  '地产/建筑从业者': /造价|监理|建筑|土木|结构|幕墙|暖通|给排水|园林|装饰|装配|施工|工程|测绘|勘察|BIM|预算|结算|签证|竣工|物业|房产|精装|景观|市政|隧道|桥梁|工长|劳务|总包|分包|资料|测量|安全|决算|投标|现场|经理|主管|专员|工程师|顾问|分析师|总监/,
  '硬件/半导体从业者': /硬件|半导体|芯片|集成电路|IC|FPGA|嵌入式|射频|天线|工艺|封测|晶圆|PCB|SMT|DFM|DFT|ATE|EMC|传感器|MEMS|固件|MCU|DSP|模组|NPI|产测|治具|FAE|Layout|SIPI|仿真|生产|供应链|标准化|经理|主管|专员|工程师|顾问|分析师|总监/,
  '用户体验研究员': /可用性|UX|UI|交互|体验|用户研究|用研|人因|人机|HMI|HCI|UCD|信息架构|服务设计|设计系统|原型|线框/,
  '视频/短视频制作': /分镜|特效|剪辑|摄像|摄影|短视频|视频|后期|调色|包装|动效|动画|渲染|合成|导播|场记|灯光|制片|脚本|编剧/,
  '录音/混音/声音设计': /录音|混音|声音|音频|声学|配音|配乐|字幕|同期|拟音|母带|调音|音响|扩声/,
  '人力/组织/项目从业者': /人力|HR|人事|招聘|猎头|HRBP|组织|OD|培训|薪酬|福利|绩效|员工关系|行政|项目|PMO|交付|实施|咨询|Scrum|敏捷/,
  '制造/供应链从业者': /制造|生产|工艺|设备|维修|质量|检验|供应链|采购|计划|物控|仓管|物流|报关|货代|关务|产线|良率|产能/,
  '施工/工程管理': /施工|工程|项目|监理|造价|预算|结算|签证|竣工|安全|质量|进度|成本|合同|分包|总包|劳务|材料|机械|临电|脚手架|模板|钢筋|混凝土|基坑|桩基/,
  '碳/ESG/可持续': /碳|ESG|可持续|绿色|环保|节能|减排|双碳|气候|能源|光伏|风电|储能|氢能|绿电|绿证|CCER|碳汇|碳交易|碳核查|碳足迹/,
  '基金运营/中后台': /基金|运营|中后台|TA|FA|估值|清算|结算|托管|外包|代销|合规|风控|反洗钱/,
  '审计': /审计|内审|外审|稽核|监察|内控|合规|风控|财务|会计|出纳|税务/,
  '市场营销/运营': /市场|营销|运营|品牌|公关|媒介|投放|广告|创意|策划|活动|赛事|会展|陈列|KOL|KOC|达人|网红|主播|选品|增长/,
  '客户支持/技术支持': /售后|客服|支持|客诉|工单|投诉|满意度|SLA|响应|解决|闭环|回访|续费|续约|Helpdesk|ServiceDesk|ITSM/,
  '软件工程师': /开发|工程师|程序员|架构|后端|前端|全栈|客户端|服务端|Android|iOS|Java|Python|Go|Rust|DevOps|SRE|数据|算法|机器学习|深度学习|CV|NLP|LLM|AIGC|大模型|Agent|RAG/,
  '交通/汽车/航空从业者': /交通|汽车|航空|航天|船舶|港口|铁路|地铁|轨道|公交|物流|运输|配送|冷链|自动驾驶|智驾|ADAS|座舱|车机|TBOX|OTA|VCU|BMS|电机|电控|电池|充电桩|换电/,
  '酒店餐饮/宴会': /酒店|餐饮|宴会|厨师|服务员|前台|客房|保洁|管家|礼宾|Concierge|Housekeeping|F&B/,
  '门店运营/店长': /门店|店长|零售|导购|收银|理货|陈列|促销|会员|私域|督导|区域|大区/,
  '电力/电网': /电力|电网|电气|变电|输电|配电|继保|调度|交易|营销|运维|检修|试验|计量|抄表|线损|业扩|配网|主网|特高压|智能电网/,
  '物业管理': /物业|管家|保洁|保安|巡逻|绿化|维修|维保|巡检|收费|停车|门禁|消防|电梯/,
  '人力资源综合': /人力|HR|人事|招聘|猎头|HRBP|组织|OD|培训|薪酬|福利|绩效|员工关系|行政|离职|考勤|社保|发布|经理|主管|专员|工程师|顾问|分析师|总监/,
  '招聘': /招聘|猎头|RPO|HR|人力|人才|寻访|交付|顾问|助理|经理|主管|专员/,
  '薪酬福利(C&B)': /薪酬|福利|绩效|社保|公积金|C&B|Comp|Ben|HR|人力|经理|主管|专员/,
  '仓储/库存管理': /仓储|库存|仓库|WMS|理货|拣货|上架|盘点|库管|仓管|主管|经理|专员/,
  '客房/PA': /客房|PA|保洁|洗衣|Housekeeping|管家|前台|礼宾|主管|经理|专员/,
  '汽车硬件/电子/座舱': /汽车|硬件|电子|座舱|车机|电磁|兼容|EMC|域控|TBOX|VCU|BMS|电机|电控|工程师|经理|主管|专员/,
};

const ROLE_SYNONYM_GROUPS = [
  ['可用性', 'UX', '用户体验', '交互', '用研', 'UCD'],
  ['分镜', '视频', '短视频', '剪辑', '摄像', '后期', '特效'],
  ['售后', '客服', '支持', '客诉', '工单'],
  ['技术经理', '研发经理', '开发经理', '工程经理', 'Tech Lead'],
  ['软件工程师', '开发工程师', '程序员', '研发工程师'],
  ['技术经理', '软件工程师', '开发工程师', '技术顾问', '研发'],
  ['财务顾问', '财务', '会计', 'FP&A', '投融资'],
  ['调解员', '法务', '合规', '纠纷', '仲裁'],
];

function matchesEnAliases(name, desc) {
  for (const [abbr, full] of EN_ALIASES) {
    if ((name.includes(abbr) && desc.includes(full)) || (desc.includes(abbr) && name.includes(full))) {
      return true;
    }
  }
  return false;
}

function matchesSynonymGroups(name, desc) {
  const hay = `${name} ${desc}`;
  for (const group of ROLE_SYNONYM_GROUPS) {
    const inName = group.some((w) => name.includes(w));
    const inDesc = group.some((w) => desc.includes(w));
    if (inName && inDesc) return true;
    if (group.filter((w) => hay.includes(w)).length >= 2) return true;
  }
  return false;
}

function extractGenericPersonaTitle(desc) {
  const m = /领域(?:的)?(?:实习|见习|初级|中级|高级|资深|首席|专家|主任)?([^，。；\n]+)/.exec(desc || '');
  return m ? m[1].trim() : '';
}

function matchesGenericPersona(name, desc) {
  const title = extractGenericPersonaTitle(desc);
  if (!title) return false;
  const re = GENERIC_PERSONA_TITLES[title];
  if (re && re.test(name)) return true;
  const tok = coreToken(name);
  return tok.length >= 2 && (title.includes(tok) || (desc.includes(tok) && desc.includes('专注')));
}

function descMentionsRole(name, desc) {
  if (!desc || !name) return false;
  if (desc.includes(name)) return true;
  const core = coreToken(name);
  if (core.length >= 2 && desc.includes(core)) return true;
  if (matchesEnAliases(name, desc)) return true;
  if (matchesSynonymGroups(name, desc)) return true;
  if (matchesGenericPersona(name, desc)) return true;
  return isProfileRelevant(name, desc, []);
}

module.exports = {
  descMentionsRole,
  EN_ALIASES,
  GENERIC_PERSONA_TITLES,
  ROLE_SYNONYM_GROUPS,
  extractGenericPersonaTitle,
};
