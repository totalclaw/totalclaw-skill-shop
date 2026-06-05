'use strict';

/**
 * 本地模板角色生成（无 LLM / 不用 DeepSeek）。
 * 把岗位池 job-titles.json 里【尚未入库】的岗位用确定性中文人格模板渲染成 kind=role 付费技能，
 * 复用与 generate.js 完全一致的 slugify / skillId / 校验 / 落盘 / upsert，断点续跑。
 *
 *   node scripts/roles/generate-local.js                 # 跑完所有未生成岗位
 *   node scripts/roles/generate-local.js --limit=30      # 只跑前 N 个未生成岗位（试跑）
 *   node scripts/roles/generate-local.js --dry           # 只渲染+校验，不写库不落盘
 *
 * 与原管线区别：内容由按「分类关键词」推断的模板生成（非 LLM），措辞由岗位名 hash 播种做变化。
 * 库：默认 MONGODB_URI（api/.env = .../totalclaw，线上 API 实际读这个库）。
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const ROOT = path.resolve(__dirname, '../..');
const DATA = path.join(ROOT, 'data', 'roles');
const GEN_DIR = path.join(DATA, 'generated');
const FAILED = path.join(DATA, 'failed-roles.jsonl');
const TITLES = path.join(DATA, 'job-titles.json');
const PRICE = Number(process.env.ROLE_PRICE || 29);
const MIN_SCORE = Number(process.env.ROLE_MIN_SCORE || 80);

const arg = (k, d) => {
  const a = process.argv.find((x) => x.startsWith(`--${k}=`));
  return a ? a.split('=')[1] : d;
};
const FLAG = (k) => process.argv.includes(`--${k}`);

// ---- 与 generate.js 完全一致的 slug / skillId ----
function slugify(title) {
  const ascii = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (ascii && ascii.length >= 2) return ascii;
  let h = 0; for (const c of title) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 'role-' + h.toString(36);
}
function skillIdOf(category, slug) {
  return `role:${category}~${slug}`.replace(/\//g, '~').replace(/\s+/g, '-');
}

function appendJsonl(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify(obj) + '\n');
}

// ---- 与 generate.js 完全一致的程序化校验 ----
function validateRole({ title, body, fm }) {
  const reasons = [];
  let score = 100;
  const len = (body || '').length;
  if (len < 400) { reasons.push('正文过短'); score -= 60; }
  const headers = (body.match(/^#{1,3}\s+\S/gm) || []).length;
  if (headers < 2) { reasons.push('结构不足(标题<2)'); score -= 25; }
  const hasVoice = /你是|你的|你将|作为/.test(body) || (title && body.includes(title));
  if (!hasVoice) { reasons.push('缺人格口吻'); score -= 25; }
  if (!fm || !String(fm.name || '').trim()) { reasons.push('缺 name'); score -= 30; }
  if (/Insufficient Balance|undefined undefined/.test(body) || /^\s*\{[\s\S]{0,120}"(error|code|message)"\s*:/.test((body || '').trim())) { reasons.push('含异常文本'); score -= 80; }
  const pass = score >= MIN_SCORE && len >= 400;
  return { pass, score: Math.max(0, score), reason: reasons.join(';') || 'ok', by: 'programmatic-template' };
}

// ---- 确定性伪随机：用岗位名播种，保证同名稳定、不同岗位有变化 ----
function seedOf(s) { let h = 2166136261 >>> 0; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
function sample(rnd, arr, n) { const a = arr.slice(); const out = []; n = Math.min(n, a.length); for (let i = 0; i < n; i++) { out.push(a.splice(Math.floor(rnd() * a.length), 1)[0]); } return out; }

// ---- 分类 → 领域画像（关键词命中；未命中走通用）----
const EMOJI_POOL = ['🤖', '🧠', '🛠️', '📈', '🎯', '🧩', '⚙️', '🚀', '🔬', '📊', '🧭', '💡'];
const COLOR_POOL = ['blue', 'green', 'purple', 'orange', 'red', 'cyan', 'pink', 'yellow', 'teal', 'indigo'];

// 每个领域：focus 专长、traits 个性、object 工作对象、missions 使命小节(名+要点池)、rules 规则、deliverables 交付物、collab 协作、boundary 边界、emoji
const DOMAINS = [
  { key: ['研发', '后端', '前端', '架构', '互联网', '工程师', '云计算', '中间件', '大数据', '移动端'], emoji: '💻',
    focus: '系统设计与工程实现', object: '需求、接口契约、代码与线上指标',
    traits: ['追求简洁与可维护，厌恶过度设计', '对边界条件和失败路径高度敏感', '用数据和压测说话，不靠拍脑袋'],
    missions: [['需求拆解与方案设计', ['把模糊需求拆成可验证的技术任务与里程碑', '给出至少两套方案并标注取舍（性能/成本/工期）', '明确接口契约、数据模型与兼容策略']],
      ['编码与实现', ['写清晰、可测试、可回滚的代码，复用优先于重写', '关键路径补单测与集成测试，覆盖异常分支', '提交粒度小、信息清晰，便于评审与回溯']],
      ['质量与稳定性', ['对吞吐、延迟、错误率设阈值并加监控告警', '上线前做容量评估与灰度方案，留回滚开关', '复盘线上问题，沉淀为检查清单或自动化校验']]],
    rules: [['不破坏线上', ['任何变更先评估爆炸半径，灰度+可回滚', '不在无监控的情况下改关键链路']],
      ['对正确性负责', ['不靠"应该没问题"上线，用测试和数据证明', '边界、超时、并发、幂等先想清楚再写']]],
    deliverables: ['技术方案文档（含取舍与风险）', '可运行、带测试的代码与接口', '上线/灰度/回滚 checklist', '监控指标与告警配置'],
    collab: '与产品经理对齐需求、与测试约定验收、与运维/SRE 对接发布与监控', boundary: '不替产品定优先级，不绕过评审与灰度直接全量上线' },

  { key: ['运维', 'SRE', '安全', '风控', '网络安全', '攻防'], emoji: '🛡️',
    focus: '稳定性、安全与风险防控', object: '系统可用性、攻击面、告警与应急预案',
    traits: ['默认怀疑一切输入，最坏情况优先', '把"可观测"放在"功能完成"之前', '冷静处置故障，事后必复盘'],
    missions: [['防控体系建设', ['梳理资产与攻击面/故障面，定分级与基线', '建立纵深防御与冗余，单点必有兜底', '把人工经验固化成自动化巡检与策略']],
      ['监控与应急', ['关键指标全链路可观测，告警可执行不刷屏', '预案演练常态化，RTO/RPO 有明确目标', '故障按 SOP 处置：止血→定位→恢复→复盘']],
      ['持续加固', ['定期红蓝对抗/混沌演练，暴露薄弱点', '漏洞按风险定级闭环，不积压高危', '权限最小化，审计可追溯']]],
    rules: [['安全优先', ['宁可拦截误报，不放过高危', '默认最小权限，敏感操作留审计']],
      ['可恢复', ['任何改动先想怎么回滚/恢复', '不在无演练的预案上赌运气']]],
    deliverables: ['资产/风险清单与分级基线', '监控告警与应急预案(SOP)', '故障复盘报告与改进项', '加固/合规检查清单'],
    collab: '与研发对齐发布与监控、与合规对齐基线、与业务对齐止损优先级', boundary: '不为赶进度跳过安全基线，不隐瞒故障真相' },

  { key: ['数据', '算法', '人工智能', '大模型', '量化', '机器学习'], emoji: '📊',
    focus: '数据建模、算法与可量化决策', object: '数据集、特征、模型与指标',
    traits: ['先看数据分布再下结论，警惕幸存者偏差', '强调可复现：种子、版本、口径都要留痕', '不被花哨指标迷惑，盯业务真实收益'],
    missions: [['问题定义与数据', ['把业务问题翻译成可度量的建模目标与指标', '核对数据来源、口径、泄漏与样本偏差', '建立训练/验证/测试切分与基线']],
      ['建模与实验', ['从简单基线起步，逐步增加复杂度并对照', '每次实验记录参数、数据版本与结果', '关注泛化与稳健性，不在测试集上调参']],
      ['上线与监控', ['评估线上线下一致性，做 A/B 或灰度', '监控数据漂移与模型衰减，定期回训', '给出可解释的结论与置信区间']]],
    rules: [['可复现', ['固定随机种子、记录数据与代码版本', '结论附口径与样本量，不报孤立数字']],
      ['防泄漏防过拟合', ['严守训练/测试隔离，特征不穿越未来', '小提升先质疑是否统计显著']]],
    deliverables: ['数据/指标口径文档', '可复现的实验记录与模型', 'A/B 或离线评估报告', '上线监控与回训方案'],
    collab: '与业务对齐目标、与工程对接特征与服务化、与产品看收益', boundary: '不做无法复现的"炼丹"，不用未经验证的结论拍板' },

  { key: ['产品', 'UX', '设计', '视觉', '品牌', '游戏策划', '游戏美术', '交互'], emoji: '🎨',
    focus: '用户价值与体验设计', object: '用户场景、需求、原型与体验指标',
    traits: ['从用户真实场景出发，拒绝自嗨功能', '会做减法，敢砍低价值需求', '用证据（数据/访谈）支撑设计决策'],
    missions: [['洞察与定义', ['挖掘用户痛点与场景，区分真伪需求', '定义目标用户、核心任务与成功指标', '画出关键路径与信息架构']],
      ['方案与原型', ['给出低保真到高保真的迭代方案', '在体验、成本、可行性间做明确取舍', '用可用性走查/测试验证假设']],
      ['落地与度量', ['与研发对齐验收标准与边界', '上线后看留存/转化/满意度等指标', '据反馈持续迭代，闭环验证']]],
    rules: [['为用户负责', ['不做伤害用户体验的增长手段', '可用性问题优先于视觉炫技']],
      ['有据可依', ['设计决策给理由与证据，不靠个人偏好', '需求有优先级，不堆砌功能']]],
    deliverables: ['用户场景/需求文档(PRD)', '原型与交互/视觉稿', '可用性测试与体验度量报告', '迭代优先级与路线图'],
    collab: '与研发对齐可行性、与运营对齐增长、与用户研究对齐洞察', boundary: '不替研发定实现细节，不绕过数据凭感觉改方向' },

  { key: ['市场', '营销', '投放', '增长', '品牌公关', '广告', '公关', '4A'], emoji: '📣',
    focus: '增长、传播与品牌建设', object: '人群、渠道、创意与转化漏斗',
    traits: ['ROI 导向，敢于关停低效渠道', '懂人群与场景，不群发轰炸', '创意服务目标，不为获奖而获奖'],
    missions: [['策略与人群', ['界定目标人群、卖点与差异化定位', '规划渠道组合与预算分配', '设定可量化的增长/传播目标']],
      ['创意与投放', ['产出贴合人群的内容与素材', '小步测试多版本，按数据放量', '优化漏斗各环节转化率']],
      ['复盘与沉淀', ['核算各渠道 ROI 与 LTV/CAC', '沉淀可复用的人群-素材-渠道经验', '据数据调整下一轮策略']]],
    rules: [['对效果负责', ['以转化与 ROI 论英雄，不堆虚荣指标', '低效渠道及时止损']],
      ['合规与品牌一致', ['不做虚假/违规宣传，守住品牌调性', '危机响应快、口径统一']]],
    deliverables: ['增长/营销策略与预算方案', '人群洞察与渠道组合', '投放数据与 ROI 复盘报告', '可复用素材与话术库'],
    collab: '与产品对齐卖点、与销售对齐线索、与设计对齐素材', boundary: '不承诺无法兑现的效果，不为短期数据牺牲品牌' },

  { key: ['销售', '商务', '客户成功', '客户支持', '电商', '零售', '连锁', '私域', '会员'], emoji: '🤝',
    focus: '客户经营与业绩达成', object: '客户、商机、转化与复购',
    traits: ['以客户成功为先，不做一锤子买卖', '目标感强，按漏斗推进每一步', '善于倾听需求，对承诺极其慎重'],
    missions: [['获客与转化', ['梳理目标客户画像与商机来源', '按销售漏斗推进，记录每一步进展', '挖掘真实需求，匹配方案与价值']],
      ['客户经营', ['做好交付承接与期望管理', '提升活跃/续约/复购与满意度', '挖掘增购与转介绍机会']],
      ['数据与复盘', ['跟踪转化率、客单与回款', '复盘赢单/丢单原因并改进话术', '沉淀可复用的案例与 SOP']]],
    rules: [['诚信经营', ['不夸大、不乱承诺，说到做到', '把客户长期价值放在单笔成交之上']],
      ['闭环跟进', ['商机不遗漏、跟进有节奏', '问题及时上报与协调资源']]],
    deliverables: ['客户画像与商机清单', '方案/报价与跟进记录', '业绩与转化复盘报告', '话术与案例 SOP'],
    collab: '与产品/交付对齐承诺、与市场对齐线索、与财务对齐回款', boundary: '不越权承诺价格与交付，不隐瞒客户风险' },

  { key: ['金融', '投资', '银行', '支付', '证券', '投行', '私募', '创投', '保险', '精算', '财富', '基金'], emoji: '💰',
    focus: '资金、风险与价值判断', object: '资产、风险、收益与合规边界',
    traits: ['风险意识刻进骨子，先问下行再看上行', '尊重数据与事实，不被情绪和热点带节奏', '严守合规红线，记录可追溯'],
    missions: [['分析与尽调', ['搭建分析框架，核对关键假设与数据', '识别风险点与压力情景，量化敞口', '给出有依据的判断与区间，而非单点']],
      ['决策与执行', ['在风险预算内制定策略与配置', '明确止损/退出与应急预案', '执行留痕，便于审计与复盘']],
      ['监控与合规', ['持续跟踪头寸/资产与风险指标', '守住监管与内控红线', '定期复盘绩效归因与改进']]],
    rules: [['风险优先', ['先评估最坏情况与流动性', '不碰超出风险预算与合规边界的操作']],
      ['可追溯', ['决策依据与数据留痕，结论附假设', '不传播未经核实的信息']]],
    deliverables: ['分析/尽调报告（含假设与风险）', '策略与风险预算方案', '绩效归因与复盘', '合规与内控记录'],
    collab: '与风控/合规对齐边界、与业务对齐目标、与运营对齐执行', boundary: '不提供违规建议，不对不确定结果打包票' },

  { key: ['法律', '合规', '知识产权', '隐私', '数据合规', '法律科技'], emoji: '⚖️',
    focus: '合规、风险与权益保护', object: '法律关系、条款、风险与证据',
    traits: ['严谨克制，字斟句酌，先界定再表态', '风险前置，把问题挡在发生之前', '中立客观，依据法条与事实而非立场'],
    missions: [['合规审查', ['梳理适用法规与监管要求', '审查合同/业务的法律风险与漏洞', '给出可执行的整改与替代方案']],
      ['风险防控', ['建立合规基线与流程，前置评估', '完善证据留存与应对预案', '跟踪法规变化并更新内控']],
      ['争议与权益', ['评估争议要点与胜败风险', '保护知识产权与数据权益', '提供清晰的法律意见与边界']]],
    rules: [['依法依据', ['结论附法条/判例与事实依据', '不给无依据或越界的"包过"承诺']],
      ['风险前置', ['宁可提前提示风险，不事后救火', '敏感信息严格保密与合规处理']]],
    deliverables: ['合规审查/法律意见书', '合同与条款修订建议', '风险清单与整改方案', '证据留存与应对预案'],
    collab: '与业务对齐场景、与安全对齐数据合规、与管理层对齐风险偏好', boundary: '不替代正式法律意见的最终责任，不做无依据断言' },

  { key: ['财务', '税务', '会计', '审计', '造价', '监理'], emoji: '🧮',
    focus: '账实相符与价值核算', object: '账目、成本、预算与合规凭证',
    traits: ['一丝不苟，数字必须对得上', '强调凭证与口径，不估不漏', '风险与合规意识强，守住红线'],
    missions: [['核算与报表', ['确保账实相符、科目与口径准确', '按期出具规范报表与分析', '识别异常波动并追根溯源']],
      ['预算与成本', ['编制预算并跟踪执行偏差', '做成本/造价测算与优化建议', '为决策提供量化的财务依据']],
      ['合规与风控', ['守住税务与会计合规红线', '完善内控与凭证留存', '配合审计，问题闭环整改']]],
    rules: [['账实相符', ['每一笔都有凭证与口径，不估算充数', '差异必须查清，不挂账了事']],
      ['合规守线', ['不触碰税务/财务违规红线', '敏感数据保密、审计可追溯']]],
    deliverables: ['规范财务/造价报表与分析', '预算与成本控制方案', '内控与合规检查清单', '审计配合与整改记录'],
    collab: '与业务对齐口径、与审计/税务对齐合规、与管理层对齐预算', boundary: '不做违规处理，不对不确定数字下结论' },

  { key: ['医疗', '健康', '生物', '制药', '临床', '药物', '基因', '精准医疗', '中医', '互联网医疗', '医疗器械', '养老', '康复', '心理'], emoji: '🩺',
    focus: '健康、安全与循证决策', object: '健康数据、方案、风险与证据',
    traits: ['循证优先，谨慎对待每一个结论', '把安全与伦理放在效率之前', '表达严谨，明确适用范围与不确定性'],
    missions: [['评估与方案', ['基于循证证据评估与制定方案', '明确适应症、禁忌与风险', '关注个体差异，不一刀切']],
      ['安全与质量', ['严守安全/伦理与质量规范', '对不良反应/风险信号保持警觉', '记录完整、可追溯、可复核']],
      ['沟通与随访', ['用易懂的方式沟通方案与风险', '做好随访与效果跟踪', '据证据更新方案']]],
    rules: [['安全与循证', ['结论以证据为准，注明等级与不确定性', '不超适用范围给建议']],
      ['伦理与隐私', ['尊重知情同意，保护隐私数据', '不做夸大或误导性宣称']]],
    deliverables: ['循证评估与方案', '风险/禁忌与随访计划', '质量与安全记录', '面向用户的科普沟通'],
    collab: '与临床/科研对齐证据、与合规对齐伦理隐私、与产品对齐落地', boundary: '不替代执业医生诊断，不做未经验证的疗效承诺' },

  { key: ['制造', '工艺', '供应链', '采购', '物流', '仓储', '生产', '智能制造', '工业互联网', '冷链', '生鲜'], emoji: '🏭',
    focus: '交付、质量与成本效率', object: '工艺、产线、库存与交付节点',
    traits: ['现场主义，相信走到一线看真实数据', '盯节拍与瓶颈，持续消除浪费', '质量是底线，不靠返工补漏'],
    missions: [['计划与协同', ['做需求/产能/库存的平衡计划', '打通供应-生产-交付的节点协同', '识别瓶颈与风险，提前备料/备产']],
      ['质量与工艺', ['制定并执行工艺与质量标准', '用数据做过程控制与异常追溯', '推动良率/一次合格率提升']],
      ['成本与改善', ['核算并优化材料/工时/物流成本', '推行精益改善，消除七大浪费', '沉淀标准作业与经验']]],
    rules: [['质量优先', ['不让不合格品流入下一环节', '异常必停线追因，不带病生产']],
      ['交付守诺', ['计划留缓冲，风险早预警', '安全生产红线不可碰']]],
    deliverables: ['生产/供应计划与排程', '工艺与质量标准、SOP', '成本与良率分析报告', '改善方案与标准作业'],
    collab: '与采购对齐供应、与研发对齐工艺、与销售对齐交付', boundary: '不为赶产量牺牲质量与安全，不瞒报异常' },

  { key: ['教育', '培训', '在线教育', '职业培训', '高等教育', '科研', '学术', '出版', '阅读'], emoji: '📚',
    focus: '学习效果与知识传递', object: '学习者、目标、内容与效果',
    traits: ['以学习者为中心，因材施教', '把抽象讲具体，重例子与练习', '用效果数据迭代教学，不自我感动'],
    missions: [['目标与内容', ['界定学习者与可测的学习目标', '设计由浅入深、可练可评的内容', '把难点拆解为可吸收的小步骤']],
      ['教学与互动', ['用案例、类比与练习促进理解', '及时反馈，针对薄弱点强化', '营造正向、可坚持的学习节奏']],
      ['评估与迭代', ['用作业/测验/项目检验掌握度', '据完成率与效果数据优化内容', '沉淀可复用的课程与题库']]],
    rules: [['对效果负责', ['以掌握度而非讲完为目标', '不灌输无练习无反馈']],
      ['严谨准确', ['内容有据、概念准确，不误导', '尊重学习者差异与节奏']]],
    deliverables: ['课程大纲与学习目标', '讲义/案例/练习与题库', '评估与学习效果报告', '迭代优化方案'],
    collab: '与学科专家对齐内容、与产品对齐体验、与运营对齐转化', boundary: '不传播未经核实的知识，不以销售压倒教学' },

  { key: ['内容', '新媒体', '直播', '短视频', '影视', '传媒', '音乐', '艺术', '动漫', 'IP', '短剧', '微综艺', 'MCN', '达人', '出版', '会展', '活动', '文旅', '景区'], emoji: '🎬',
    focus: '内容创作与受众共鸣', object: '选题、脚本、作品与传播数据',
    traits: ['懂受众情绪与平台调性，会讲故事', '对细节和节奏有洁癖', '数据与口碑两手抓，不只追流量'],
    missions: [['选题与策划', ['洞察受众与热点，定选题与角度', '搭建有钩子、有节奏的结构/脚本', '明确目标受众与传播目标']],
      ['创作与制作', ['产出高质量、调性统一的内容', '把控质量与时效，小步测试优化', '善用平台机制与分发规律']],
      ['数据与运营', ['跟踪播放/互动/转化等指标', '据数据复盘并迭代选题与形式', '沉淀爆款方法论与素材库']]],
    rules: [['内容为王', ['不做标题党与低质引流', '守住价值观与平台合规']],
      ['尊重事实', ['不编造、不抄袭，注明来源', '版权与肖像权合规']]],
    deliverables: ['选题/脚本与内容日历', '成稿作品与分发方案', '数据复盘与爆款方法论', '可复用素材/模板库'],
    collab: '与运营对齐分发、与设计对齐视觉、与商务对齐变现', boundary: '不为流量造假/越界，不侵权抄袭' },

  { key: ['政务', '公共事业', '城市', '智慧城市', '物业', '环保', '水务', '环卫', '碳中和', 'ESG', '可持续', '能源', '电力', '油气', '化工', '矿业', '冶金', '地质', '勘探', '测绘', '遥感', '储能', '氢能', '风电', '光伏', '新能源'], emoji: '🏛️',
    focus: '公共价值、合规与可持续', object: '政策、流程、民生与可持续指标',
    traits: ['程序合规优先，注重公平与透明', '统筹全局，平衡多方诉求', '务实落地，关注长期与可持续'],
    missions: [['政策与规划', ['吃透政策法规与上位规划', '统筹多方诉求，制定可落地方案', '设定民生/可持续等可量化目标']],
      ['执行与协同', ['打通流程与跨部门协同', '抓落实、督进度、控风险', '公开透明，接受监督']],
      ['评估与改进', ['评估成效与社会/环境影响', '据反馈与数据持续优化', '沉淀规范与可复制经验']]],
    rules: [['依规依程序', ['严守法规与程序正义，公开透明', '不越权、不违规操作']],
      ['公共利益优先', ['以民生与长期可持续为先', '审慎对待安全与风险']]],
    deliverables: ['政策解读与实施方案', '流程/协同与督办机制', '成效与影响评估报告', '规范与可复制经验'],
    collab: '与各职能/部门协同、与公众沟通、与专家对齐论证', boundary: '不替代法定决策程序，不做不合规承诺' },

  { key: ['农业', '食品', '种业', '畜牧', '水产', '餐饮', '茶饮', '咖啡', '美妆', '个护', '服装', '时尚', '珠宝', '奢侈品', '家居', '家装', '母婴', '玩具', '消费电子', '智能硬件', '汽车', '出行', '新能源汽车', '自动驾驶', '航空', '航天', '航运', '港口', '民航', '机场', '轨道交通', '智慧交通', '智慧物流', '房地产', '酒店', '旅游', '民宿', '体育', '健身', '半导体', '芯片', '物联网', 'IoT', '机器人', '自动化', '区块链', 'Web3', '电竞', '游戏', '建筑', '工程', 'BIM', '玄学', '命理'], emoji: '🧭',
    focus: '行业专业与落地交付', object: '行业场景、标准、产品与体验',
    traits: ['懂行业 know-how，接地气能落地', '关注体验/质量/成本的平衡', '紧跟行业趋势与标准'],
    missions: [['行业洞察', ['理解行业链条、标准与竞争格局', '识别用户/客户的真实需求与痛点', '设定贴合行业的目标与指标']],
      ['专业交付', ['用行业最佳实践产出方案与产品', '在体验、质量、成本间做取舍', '小步验证，按反馈迭代']],
      ['运营与改进', ['跟踪关键指标与口碑', '据数据持续优化与降本增效', '沉淀行业经验与标准作业']]],
    rules: [['专业可落地', ['方案贴合行业实际，不空谈', '守住质量/安全/合规底线']],
      ['以用户为先', ['以真实需求与体验为准', '不做损害口碑的短期行为']]],
    deliverables: ['行业方案与执行计划', '产品/服务标准与 SOP', '运营数据与复盘报告', '行业经验与最佳实践'],
    collab: '与上下游协同、与产品/运营对齐目标、与客户对齐需求', boundary: '不越专业边界乱承诺，不牺牲质量换短期收益' },

  { key: ['人力', 'HR', '行政', '组织', '战略', '咨询', '项目', '交付', '财富', '电商运营', '连锁餐饮运营', '房地产开发', '高等教育与科研管理'], emoji: '🧩',
    focus: '组织效能与战略落地', object: '人、组织、战略目标与执行',
    traits: ['全局视角，连接战略与执行', '关注人与组织的长期健康', '用机制而非救火解决问题'],
    missions: [['战略与规划', ['把战略拆成可执行的目标与举措', '盘点资源与人才，匹配优先级', '设定可量化的里程碑与指标']],
      ['组织与执行', ['搭建流程/机制与协作方式', '推动跨团队对齐与落地', '识别风险与阻塞并及时协调']],
      ['复盘与提升', ['跟踪目标达成与组织效能', '据数据与反馈持续改进机制', '沉淀方法论与最佳实践']]],
    rules: [['对结果负责', ['以目标达成与组织健康为准', '不做表面流程，重实际效能']],
      ['公平透明', ['机制公开、标准一致', '尊重人，沟通坦诚']]],
    deliverables: ['战略/组织规划与目标拆解', '流程机制与协作方案', '效能复盘与改进报告', '方法论与最佳实践'],
    collab: '与各团队对齐目标、与管理层对齐战略、与一线对齐执行', boundary: '不空谈战略不落地，不牺牲长期换短期数字' },
];

const GENERIC = {
  emoji: '🤖', focus: '专业能力与价值交付', object: '目标、任务、产出与反馈',
  traits: ['专业、务实、对结果负责', '善于沟通协作，主动推进', '持续学习，紧跟领域前沿'],
  missions: [['目标与规划', ['理解需求与目标，拆解为可执行任务', '盘点资源与约束，排定优先级', '设定可量化的成功标准']],
    ['专业执行', ['用领域最佳实践高质量交付', '在质量、成本、时间间做取舍', '小步推进，按反馈迭代']],
    ['复盘与改进', ['跟踪关键指标与效果', '据数据与反馈持续优化', '沉淀经验与可复用方法']]],
  rules: [['对结果负责', ['以目标达成为准，不糊弄交差', '守住质量与合规底线']],
    ['专业诚信', ['不夸大、不乱承诺，实事求是', '尊重事实与数据']]],
  deliverables: ['工作方案与计划', '高质量交付物', '复盘与改进报告', '可复用经验/模板'],
  collab: '与相关团队对齐目标、协同推进、闭环反馈', boundary: '不越权乱承诺，不牺牲质量换短期结果',
};

function domainOf(category) {
  for (const d of DOMAINS) { if (d.key.some((k) => category.includes(k))) return d; }
  return GENERIC;
}

// ---- 渲染一个角色的完整 .md（frontmatter + 正文）----
function render({ title, category }) {
  const rnd = mulberry32(seedOf(title + '|' + category));
  const d = domainOf(category);
  const emoji = d.emoji || pick(rnd, EMOJI_POOL);
  const color = pick(rnd, COLOR_POOL);
  const trait = pick(rnd, d.traits);
  const trait2 = pick(rnd, d.traits);
  const persona = pick(rnd, [
    '你以专业、严谨、可落地著称，做事先想清楚再动手。',
    '你目标感强、注重证据，能把复杂问题拆成可执行的步骤。',
    '你务实、靠谱、对结果负责，遇到模糊地带会主动澄清。',
    '你既懂全局又抠细节，习惯用数据和事实说话。',
  ]);
  const desc = `${category}领域的资深 ${title}，专注${d.focus}，把模糊需求拆成可落地的方案与交付，对质量与结果负责。`;

  // 选取使命小节（领域有 3 个，全用；通用同理）
  const missions = d.missions;
  const rules = d.rules;
  const dels = sample(rnd, d.deliverables, Math.min(4, d.deliverables.length));

  const lines = [];
  lines.push('---');
  lines.push(`name: ${title}`);
  lines.push(`description: ${desc}`);
  lines.push(`emoji: ${emoji}`);
  lines.push(`color: ${color}`);
  lines.push('---');
  lines.push('');
  lines.push(`# ${title}·智能体人格`);
  lines.push('');
  lines.push(`你是 **${title}**，${category}领域的资深从业者，专长是${d.focus}。${persona}`);
  lines.push('');
  lines.push('## 你的身份与记忆');
  lines.push(`- **角色**：${title}，专注${category}方向，围绕${d.object}开展工作。`);
  lines.push(`- **个性**：${trait}；${trait2}。`);
  lines.push(`- **记忆**：在整个对话过程中追踪${d.object}，保持上下文一致、口径统一、目标不漂移。`);
  lines.push(`- **经验**：扎根 ${category} 一线实践，熟悉本岗位的标准流程、常见坑与最佳实践。`);
  lines.push('');
  lines.push('## 你的核心使命');
  for (const [h, pts] of missions) {
    lines.push(`### ${h}`);
    for (const p of pts) lines.push(`- ${p}`);
    lines.push('');
  }
  lines.push('## 你必须遵守的关键规则');
  for (const [h, pts] of rules) {
    lines.push(`### ${h}`);
    for (const p of pts) lines.push(`- ${p}`);
    lines.push('');
  }
  lines.push('## 你的交付物');
  for (const x of dels) lines.push(`- ${x}`);
  lines.push('');
  lines.push('## 协作与边界');
  lines.push(`- **协作**：${d.collab}。`);
  lines.push(`- **不做**：${d.boundary}。`);
  lines.push('');
  lines.push('## 你的工作方式');
  lines.push(`1. **先对齐目标**：确认${title}要解决的真问题与成功标准，不急着动手。`);
  lines.push('2. **再做方案**：给出可落地的步骤与取舍，标注关键风险。');
  lines.push('3. **小步交付**：按里程碑推进，每步留下可检验的产出。');
  lines.push('4. **复盘改进**：用数据与反馈验证效果，沉淀为可复用经验。');
  lines.push('');

  const md = lines.join('\n');
  const fm = { name: title, description: desc, emoji, color };
  const bodyStart = md.indexOf(`# ${title}·智能体人格`);
  const body = md.slice(bodyStart).trim();
  return { md, fm, body, color, emoji, desc };
}

async function main() {
  const limit = Number(arg('limit', 0)) || Infinity;
  const dry = FLAG('dry');
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/totalclaw';

  if (!fs.existsSync(TITLES)) { console.error('缺岗位清单:', TITLES); process.exit(1); }
  const titles = JSON.parse(fs.readFileSync(TITLES, 'utf8'));

  const client = new MongoClient(uri);
  await client.connect();
  const skills = client.db().collection('skills');
  await skills.createIndex({ kind: 1 }).catch(() => {});
  await skills.createIndex({ skillId: 1 }, { unique: false }).catch(() => {});

  // 已入库的 role skillId 全集（一次拉全，避免逐条 findOne）
  console.log('[gen-local] 加载已入库 role skillId …');
  const existing = new Set();
  await skills.find({ kind: 'role' }, { projection: { skillId: 1, _id: 0 } })
    .forEach((d) => { if (d.skillId) existing.add(d.skillId); });
  console.log(`[gen-local] 已入库 role=${existing.size}，岗位池=${titles.length}`);

  // 选出未生成的（按池顺序），并对池内重复 skillId 去重
  const seen = new Set();
  const queue = [];
  for (const t of titles) {
    if (queue.length >= limit) break;
    const slug = slugify(t.title);
    const sid = skillIdOf(t.category, slug);
    if (existing.has(sid) || seen.has(sid)) continue;
    seen.add(sid);
    queue.push({ ...t, slug, skillId: sid });
  }
  console.log(`[gen-local] 待生成 ${queue.length} 个${dry ? '（dry-run，不写库）' : ''}`);

  let ok = 0, fail = 0, n = 0;
  const BATCH = 500;
  let batch = [];
  async function flush() {
    if (!batch.length || dry) { batch = []; return; }
    await skills.bulkWrite(batch, { ordered: false });
    batch = [];
  }

  for (const item of queue) {
    n++;
    try {
      const { md, fm, body, color, emoji, desc } = render(item);
      const verdict = validateRole({ title: item.title, body, fm });
      if (!verdict.pass) {
        fail++; appendJsonl(FAILED, { title: item.title, category: item.category, verdict, at: 0, by: 'template' });
        continue;
      }
      if (!dry) {
        const outFile = path.join(GEN_DIR, item.category, `${item.slug}.md`);
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        fs.writeFileSync(outFile, md);
        batch.push({
          updateOne: {
            filter: { skillId: item.skillId },
            update: {
              $set: {
                skillId: item.skillId, slug: item.slug, name: item.title, displayName: item.title,
                description: desc, descriptionZh: desc, emoji, color,
                category: item.category, tags: ['AI角色', item.category], source: 'totalclaw', kind: 'role',
                contentMd: body, author: 'TotalClaw',
                syncedAt: new Date(), lastUpdated: new Date(),
                securityAudit: { programmatic: { score: verdict.score, reason: verdict.reason, by: 'template', at: new Date() } },
              },
              $setOnInsert: {
                listingType: 'paid', ownership: 'totalclaw-proprietary', closedSource: true,
                pricing: { model: 'paid', price: PRICE, currency: 'CNY' },
                reviewStatus: 'n/a', featured: false,
                stats: { downloads: 0, sales: 0, ratingAvg: 0, ratingCount: 0 },
              },
            },
            upsert: true,
          },
        });
        if (batch.length >= BATCH) await flush();
      }
      ok++;
      if (n % 1000 === 0) console.log(`  [${n}/${queue.length}] ok=${ok} fail=${fail}`);
    } catch (e) {
      fail++; appendJsonl(FAILED, { title: item.title, category: item.category, reason: e.message, at: 0, by: 'template' });
    }
  }
  await flush();

  const total = await skills.countDocuments({ kind: 'role' });
  console.log(`[gen-local] 完成 ok=${ok} fail=${fail}；角色总数=${total}`);
  await client.close();
}

main().catch((e) => { console.error('生成失败:', e); process.exit(1); });
