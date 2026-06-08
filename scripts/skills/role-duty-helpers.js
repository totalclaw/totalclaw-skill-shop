'use strict';

/**
 * 岗位名 → 职责要点 + 职责过滤/合并（P0 修复：避免「测试工程师→写代码」等错配）
 */

const GENERIC_DUTY = /承担.+在.+方向的专业工作，独立推进任务闭环|与相关团队协作，确保输入、过程与交付物符合岗位标准|按 SOP\/规范完成操作、记录与异常上报|配合团队达成质量、时效与客户\/业务满意度目标|参与培训与复盘，持续改进工作方法|分析.+相关需求，制定技术方案并拆解可执行任务|完成核心模块设计、实现与联调，保障质量与可维护性/;

const DEV_DUTY = /核心模块设计、实现与联调|制定技术方案并拆解可执行任务|参与代码评审|接口设计、数据库|写代码|联调与部署/;

/** 角色名与职责行的明显域冲突 */
const DOMAIN_CONFLICTS = [
  { role: /出纳|会计|记账|财务专员|收款|付款/, reject: /选矿|岩石力学|冶炼|采矿|爆破|井巷|浮选|炼钢|地质|勘探|选厂|尾矿/ },
  { role: /润滑|机修|维保|维修工|电工（?!气）/, reject: /报关|船代|预配载|单证|选矿|出纳|核心模块|联调|写代码/ },
  { role: /出纳|会计|审计|税务/, reject: /船舶|港口|配载|润滑|液压|PLC|传感器标定/ },
  { role: /律师|法务|合规(?!工程师)/, reject: /选矿|焊接|电路|PCB|润滑|养殖|兽医/ },
  { role: /护士|护理|康复|医师|药师/, reject: /选矿|报关|SEO|直播带货|坑产/ },
  { role: /主播|运营|客服|销售/, reject: /选矿|岩石力学|内核|驱动开发|FPGA/ },
  { role: /研发/, reject: /施工组织|竣工验收|工程签证|工程量|进度款|采掘|采矿工程|岩石力学|监理|危大工程|施工组织设计|隐蔽工程|技术交底|实测实量|分部分项|现场质量管理/ },
  { role: /(?:软件|开发)(?:工程师|师)|程序员|接入开发/, reject: /采掘|采矿|岩石力学|选矿|爆破|支护|采空区|施工组织|现场勘察|监理/ },
];

function isRnDEngineerTitle(title) {
  return /研发/.test(title);
}

function isSoftDevRoleTitle(title) {
  return /(?:软件|固件|后端|前端|接入|SDK|API|数据工程|算法|DevOps|SRE|全栈|中间件|云原生|区块链|游戏开发|客户端|服务端|Android|iOS|Java|Python|Go|Rust|C\+\+)(?:工程师|师|开发)?|(?:开发|编程)工程师|程序员/.test(title);
}

function isDevRoleTitle(title) {
  if (/测试|QA|质检|品控|试验/.test(title)) return false;
  if (/渗透|安全测试|红队|蓝队|SDL|漏洞/.test(title)) return false;
  if (isRnDEngineerTitle(title) && !isSoftDevRoleTitle(title)) return false;
  if (isSoftDevRoleTitle(title)) return true;
  if (/嵌入式|固件|FPGA|RTOS|驱动开发|内核开发|Bootloader/.test(title)) return true;
  if (isHardwareEngTitle(title)) return false;
  return /(?:系统|架构)(?:工程师|师|开发)?|架构师|程序员/.test(title);
}

function isHardwareEngTitle(title) {
  if (isSoftDevRoleTitle(title)) return false;
  if (isRnDEngineerTitle(title)) return false;
  return /(?:电气|机械|土木|结构|工艺|设备|制造|工装|模具|液压|润滑|PLC|自动化控制|硬件|射频|天线|光学|材料|冶金|采矿|矿建|给排水|暖通|造价|监理)(?:工程师|师|技术员)?/.test(title);
}

function isTestRoleTitle(title) {
  return /测试|QA|质检|品控|试验员|Validation|V&V|HIL|MIL|SIL|DIL|VIL/.test(title);
}

function isSecurityRoleTitle(title) {
  if (/财务|税务|法务|律师|内审|会计|出纳|审计专员|审计师|审计经理|监察|稽核/.test(title) && !/信息安全|网络安全|安全审计|渗透/.test(title)) {
    return false;
  }
  return /安全|渗透|攻防|红队|蓝队|SDL|漏洞|取证|信息安全|网络安全|等保/.test(title);
}

function isFinanceRoleTitle(title) {
  return /出纳|会计|财务|审计|税务|精算|信贷|成本会计|总账/.test(title);
}

function isDesignRoleTitle(title) {
  return /设计(?!院|所)|UI|UX|视觉|交互|平面|包装|插画|动效/.test(title) && !/工业设计|结构设计|电路设计|芯片设计/.test(title);
}

function isFrontlineWorkerTitle(title) {
  if (/工程师|架构师|设计师|分析师|会计师|审计师|律师|法务|医师|药师|技师|研究员|监察师|评估师|规划师|造价师|监理师|翻译官|指挥官|交易员|操盘手|基金经理|投资经理|风控经理|量化|税务|财务|出纳|会计|合规|秘书|文员|科员|顾问/.test(title)) {
    return false;
  }
  return /(?:专员|服务员|保洁|收银|导购|柜员|话务|坐席|安检|分拣|快递|保育|厨师|茶艺|调酒|保安|巡逻|搬运|司机|焊工|电工|钳工|车工|技工|操作|巡检|养护|保洁员|搬运工|分拣员|安检员|话务员|营业员|售票员|检票员|理货员|仓管员|库管员|收发员|统计员|录入员|接线员|网格员|协管员|办事员|科员|文员|秘书|助理|员|师傅|工)$/.test(title);
}

function isOpsRoleTitle(title) {
  return /运营|客服|售后|支持|坐席|主播|内容|编辑|文案|新媒体|社群|私域|会员|用户增长|投放|SEO|SEM/.test(title);
}

function isSalesRoleTitle(title) {
  return /销售|商务|BD|渠道|招商|拓展|客户经理|大客|电销|网销|导购(?!设计)/.test(title);
}

function isFinanceTradingTitle(title) {
  return /交易|做市|操盘|量化|基金|证券|期货|期权|债券|外汇|投行|并购|私募|创投|PE|VC|风控|合规(?!工程师)/.test(title);
}

function dutyConflictsRole(title, duty) {
  const dutyBody = String(duty).replace(title, '');
  for (const { role, reject } of DOMAIN_CONFLICTS) {
    if (role.test(title) && reject.test(dutyBody)) return true;
  }
  if (isTestRoleTitle(title) && DEV_DUTY.test(duty)) return true;
  if (!isDevRoleTitle(title) && DEV_DUTY.test(duty)) return true;
  if (isFinanceRoleTitle(title) && /选矿|冶炼|采矿|岩石|爆破|兽医|直播带货|坑产|投放|SDL|攻击面|等保|渗透|亲本|育苗|催产|投喂|TMR|畜群|病害|配种|跟踪货物|滞箱|索赔/.test(dutyBody)) return true;
  if (/法务|律师/.test(title) && /亲本|育苗|催产|投喂|TMR|畜群|病害|配种|SDL|攻击面/.test(dutyBody)) return true;
  return false;
}

function filterDutiesForRole(title, category, duties) {
  return (duties || []).filter((d) => {
    const t = String(d).trim();
    if (!t) return false;
    if (dutyConflictsRole(title, t)) return false;
    return true;
  });
}

function isGenericDuty(duty) {
  return GENERIC_DUTY.test(String(duty));
}

function coreToken(name) {
  return String(name).replace(/(工程师|架构师|设计师|分析师|工程|师|员|经理|专员|主管|总监|顾问|代表|专家|官|长|助理|策划|运营|开发|测试)$/, '').trim();
}

function dutyIsAnchored(title, duty) {
  const d = String(duty);
  if (d.includes(title)) return true;
  const tok = coreToken(title);
  return tok.length >= 2 && d.includes(tok);
}

/** 确保至少一条职责含角色名锚点（供启发式与读稿验收） */
function ensureAnchoredDuties(title, category, duties) {
  if (!duties.length) return duties;
  const idx = duties.findIndex((d) => dutyIsAnchored(title, d));
  if (idx > 0) {
    const reordered = [duties[idx], ...duties.filter((_, i) => i !== idx)];
    return reordered.slice(0, 6);
  }
  if (idx === 0) return duties;

  const anchoredTitle = dutiesFromTitle(title, category)
    .filter((d) => !isGenericDuty(d) && dutyIsAnchored(title, d));
  if (anchoredTitle.length) {
    const lead = anchoredTitle[0];
    if (!duties.includes(lead)) return [lead, ...duties].slice(0, 6);
  }

  const [first, ...rest] = duties;
  return [`${title}：${first}`, ...rest].slice(0, 6);
}

function dutiesFromTitle(title, category) {
  const rules = [
    [isTestRoleTitle, [
      `参与${title}相关需求与原型评审，识别测试点、边界与异常场景`,
      `设计并维护测试用例（等价类/边界值/场景法），组织用例评审与需求追溯`,
      `搭建测试环境、准备数据，执行冒烟/功能/回归/验收测试并记录结果`,
      `在缺陷系统提交问题（复现步骤/日志/截图），跟踪修复并做回归验证`,
      `输出测试报告，给出遗留风险与是否可上线的明确结论`,
    ]],
    [isFinanceRoleTitle, [
      `按制度处理${category}方向收付、记账、对账与凭证归档`,
      `编制日报/周报/月报，核对银行流水与业务系统数据一致性`,
      `配合审计、税务申报与费用报销审核，确保合规与可追溯`,
      `识别异常账务与资金风险，及时上报并跟进处理`,
    ]],
    [isFinanceTradingTitle, [
      `执行${title}相关交易/报价/下单，控制执行质量与滑点`,
      `盘后做盈亏归因、持仓复盘并报送风控与合规`,
      `管理风险敞口、限额与对冲，遵守交易合规要求`,
      `跟踪市场与品种信息，制定并调整${title}交易计划`,
    ]],
    [isSecurityRoleTitle, [
      `在授权范围内开展${title}相关的安全检查、评估与整改建议`,
      `梳理资产与攻击面，按企业 SDL/等保/合规要求执行测试或审计活动`,
      `记录发现项、定级影响并推动修复闭环，保留可审计证据`,
      `编写安全测试/审计报告，向业务与管理层说明风险与修复优先级`,
    ]],
    [/法务|律师|合规(?!工程师)/, [
      `审查${category}相关合同、制度与业务活动的法律风险`,
      `出具${title}法律意见、合规建议与标准合同/条款修订`,
      `处理诉讼、仲裁、知识产权与劳动纠纷等法律事务`,
      `开展合规培训，建立法律与合规台账及证据留存`,
    ]],
    [isDesignRoleTitle, [
      `理解${category}业务与${title}的设计需求，输出可评审的方案与稿面`,
      `跟进打样、改稿与评审，确保设计符合品牌/产品/工艺约束`,
      `沉淀设计规范、素材与版本，支持后续量产或上线`,
      `与产品、供应链或内容团队对齐设计落地与验收标准`,
    ]],
    [isRnDEngineerTitle, [
      `开展${title}相关的小试/中试/配方或工艺研发，记录实验数据与结论`,
      `编写研发实验报告、技术标准或工艺规程，支撑评审与量产转移`,
      `对接生产、品控与供应链，解决研发成果落地中的工艺与质量风险`,
      `跟踪原料/工艺/设备变更的影响，迭代优化方案与成本结构`,
    ]],
    [/润滑|机修|维保|维修/, [
      `制定${title}设备润滑/保养计划，按周期执行点检与换油记录`,
      `识别异常振动、温升、泄漏等问题，排查原因并安排维修`,
      `维护备件台账与润滑油脂品号，确保符合设备厂家规范`,
      `填写维保工单，向生产/设备主管汇报停机风险与修复进度`,
    ]],
    [isHardwareEngTitle, [
      `按${category}规范开展${title}相关的现场勘察、方案编制或技术交底`,
      `核对设计图纸、设备参数与施工/安装标准，记录偏差并跟踪整改`,
      `配合监理、安全与质量检查，保留测量数据与验收记录`,
      `输出符合行业标准的工程/设备技术文档与问题闭环清单`,
    ]],
    [/经理|总监|主管|负责人|主任|VP|总裁|CEO|CTO|CFO|COO/, [
      `制定${title}岗位在${category}方向的目标、计划与资源安排`,
      `协调跨团队推进关键项目，跟踪里程碑与风险`,
      `建立流程与标准，带领团队达成业务与质量指标`,
      `向上汇报进展，向下拆解任务并复盘改进`,
    ]],
    [/分析|顾问|咨询师|研究员/, [
      `收集并整理${category}相关数据与业务信息，形成分析框架`,
      `输出洞察、建议与可执行方案，支持决策`,
      `跟踪方案落地效果，迭代分析模型与报告`,
      `与业务方对齐问题定义、假设与验收标准`,
    ]],
    [isDevRoleTitle, [
      `分析${title}相关需求，制定技术方案并拆解可执行任务`,
      `完成核心模块设计、实现与联调，保障质量与可维护性`,
      `编写必要文档，参与代码/方案评审与问题排查`,
      `跟踪上线与运行指标，持续优化性能与稳定性`,
    ]],
    [isSalesRoleTitle, [
      `跟进${category}商机与客户需求，维护 CRM 与沟通记录`,
      `制定${title}拜访/报价/谈判策略，协调售前与交付资源`,
      `达成签约、回款与续约目标，复盘赢单/丢单原因`,
      `收集竞品与市场信息，反馈产品与市场策略`,
    ]],
    [isOpsRoleTitle, [
      `执行${category}方向${title}的日常运营/服务任务，按 SOP 留痕`,
      `监控关键指标（转化/留存/满意度/响应时效）并异常上报`,
      `协同产品、设计、供应链处理用户/客户问题与活动上线`,
      `沉淀话术、FAQ、活动 checklist 并参与复盘优化`,
    ]],
    [isFrontlineWorkerTitle, [
      `按${category}岗位 SOP 执行${title}当班核心操作与服务`,
      `填写工作记录/巡检表/工单，异常与安全隐患即时上报`,
      `与班组长或协作岗位对齐质量、时效与安全要求`,
      `参与班组培训与复盘，优化本岗位常用 checklist`,
    ]],
  ];

  for (const [pred, pts] of rules) {
    const ok = typeof pred === 'function' ? pred(title) : pred.test(title);
    if (ok) return pts;
  }
  return [
    `承担${title}在${category}方向的专业工作，独立推进任务闭环`,
    `与相关团队协作，确保输入、过程与交付物符合岗位标准`,
    `识别风险与待确认项，主动澄清后再执行关键动作`,
    `用可检验的产出与数据复盘工作效果`,
  ];
}

/** 合并 title 职责与 cluster 职责，优先专有、剔除泛化套话与错配；锚定职责排首位 */
function mergeRoleDuties(title, category, clusterDuties, titleDuties) {
  const rawTitle = filterDutiesForRole(title, category, titleDuties || dutiesFromTitle(title, category));
  const fromCluster = filterDutiesForRole(title, category, clusterDuties || [])
    .filter((d) => !isGenericDuty(d));
  const fromTitle = rawTitle.filter((d) => !isGenericDuty(d));
  const seen = new Set();
  const out = [];

  const push = (r) => {
    const t = String(r).trim();
    if (!t || seen.has(t) || isGenericDuty(t)) return;
    if (dutyConflictsRole(title, t)) return;
    seen.add(t);
    out.push(t);
  };

  const leadAnchored = fromTitle.find((d) => dutyIsAnchored(title, d))
    || fromTitle[0]
    || dutiesFromTitle(title, category).find((d) => !isGenericDuty(d));
  if (leadAnchored) push(leadAnchored);

  for (const r of fromCluster) {
    push(r);
    if (out.length >= 5) break;
  }
  for (const r of fromTitle) {
    push(r);
    if (out.length >= 6) break;
  }
  if (out.length < 3) {
    for (const r of rawTitle) {
      push(r);
      if (out.length >= 4) break;
    }
  }
  return ensureAnchoredDuties(title, category, out.slice(0, 6));
}

module.exports = {
  dutiesFromTitle,
  filterDutiesForRole,
  mergeRoleDuties,
  isGenericDuty,
  coreToken,
  dutyIsAnchored,
  ensureAnchoredDuties,
  isDevRoleTitle,
  isSoftDevRoleTitle,
  isRnDEngineerTitle,
  isHardwareEngTitle,
  isTestRoleTitle,
  isSecurityRoleTitle,
  isFinanceRoleTitle,
  isDesignRoleTitle,
  isFrontlineWorkerTitle,
  isOpsRoleTitle,
  isSalesRoleTitle,
  dutyConflictsRole,
  GENERIC_DUTY,
  DEV_DUTY,
};
