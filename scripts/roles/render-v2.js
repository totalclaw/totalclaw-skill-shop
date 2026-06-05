'use strict';

/**
 * 角色渲染 v2 —— 基于「真实世界岗位画像库」(families/profiles/<family>.json) + 职级 overlay 的确定性渲染。
 * 取代 generate-local.js 的 17 领域套话模板：内容来自公开招聘 JD/画像，按 专精方向×职级 定制，岗位名 hash 播种做变化。
 *
 *   node scripts/roles/render-v2.js --family=dev --dry            # 渲染研发族、校验、出统计，不写库
 *   node scripts/roles/render-v2.js --family=dev --dry --preview  # 额外把样例 .md 落到 data/roles/preview/
 *   node scripts/roles/render-v2.js --family=dev                  # 渲染并 upsert 入库（kind=role，复用 generate-local 的 skillId/落盘/字段）
 *   node scripts/roles/render-v2.js --family=dev --limit=50       # 只跑前 N 个（试跑）
 *
 * 复用 generate-local.js 的 slugify / skillIdOf / validateRole，保证 skillId 一致、可与既有库 upsert 对齐。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const DATA = path.join(ROOT, 'data', 'roles');
const PREVIEW = path.join(DATA, 'preview');
const TITLES = path.join(DATA, 'job-titles.json');
const PRICE = Number(process.env.ROLE_PRICE || 29);
const MIN_SCORE = Number(process.env.ROLE_MIN_SCORE || 80);

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=')[1] : d; };
const FLAG = (k) => process.argv.includes(`--${k}`);

// ---- 与 generate-local.js 完全一致的 slug / skillId / 校验 ----
function slugify(title) {
  const ascii = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (ascii && ascii.length >= 2) return ascii;
  let h = 0; for (const c of title) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 'role-' + h.toString(36);
}
function skillIdOf(category, slug) { return `role:${category}~${slug}`.replace(/\//g, '~').replace(/\s+/g, '-'); }
function validateRole({ title, body, fm }) {
  const reasons = []; let score = 100; const len = (body || '').length;
  if (len < 400) { reasons.push('正文过短'); score -= 60; }
  const headers = (body.match(/^#{1,3}\s+\S/gm) || []).length;
  if (headers < 2) { reasons.push('结构不足(标题<2)'); score -= 25; }
  const hasVoice = /你是|你的|你将|作为/.test(body) || (title && body.includes(title));
  if (!hasVoice) { reasons.push('缺人格口吻'); score -= 25; }
  if (!fm || !String(fm.name || '').trim()) { reasons.push('缺 name'); score -= 30; }
  if (/Insufficient Balance|undefined undefined/.test(body)) { reasons.push('含异常文本'); score -= 80; }
  const pass = score >= MIN_SCORE && len >= 400;
  return { pass, score: Math.max(0, score), reason: reasons.join(';') || 'ok', by: 'profile-v2' };
}

// ---- 确定性伪随机 ----
function seedOf(s) { let h = 2166136261 >>> 0; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function mulberry32(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const pick = (rnd, arr) => arr[Math.floor(rnd() * arr.length)];
function shuffled(rnd, arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

// ---- 族配置：聚类器 + 分类集 + emoji ----
const FAMILIES = {
  dev: {
    clusters: require('./families/dev-clusters.js'),
    profiles: require('./families/profiles/dev.json').profiles,
    emoji: '💻',
    owns: ['工程师', '开发', '后端', '前端', '移动端', '算法', '机器学习', '深度学习', '计算机视觉', '自然语言', 'nlp', '推荐', '搜索', '测试', '运维', '数据', 'sas', '大数据', '嵌入式', '区块链', 'devops', 'sre', '架构', '程序员', '游戏', '安全'],
  },
  product: {
    clusters: require('./families/product-clusters.js'),
    profiles: require('./families/profiles/product.json').profiles,
    emoji: '🎨',
    strictCats: '视觉与品牌设计', // 横切的品牌营销岗兜底则跳过，留给营销族
    owns: ['设计', '视觉', '平面', '插画', '动画', '创意', 'ui', 'ux', '美术', '原画', '3d', '三维'],
  },
  finance: {
    clusters: require('./families/finance-clusters.js'),
    profiles: require('./families/profiles/finance.json').profiles,
    emoji: '💰',
    strictCats: '', // 无整分类横切，仅靠全局 XCUT 跳过市场/HR/设计等
  },
  marketing: {
    clusters: require('./families/marketing-clusters.js'),
    profiles: require('./families/profiles/marketing.json').profiles,
    emoji: '📣',
    strictCats: '',
    owns: ['市场', '品牌', '公关', '媒介', '传播', '新媒体', '社群', '社区', '内容', '活动', '运营', '主播', '直播', '电商', '文案', '投放', '增长', '营销', '会员', '私域', '舆情', '危机', 'seo', '达人'],
  },
  medical: {
    clusters: require('./families/medical-clusters.js'),
    profiles: require('./families/profiles/medical.json').profiles,
    emoji: '🩺',
    strictCats: '',
  },
  legal: {
    clusters: require('./families/legal-clusters.js'),
    profiles: require('./families/profiles/legal.json').profiles,
    emoji: '⚖️',
    strictCats: '',
  },
  'hr-org': {
    clusters: require('./families/hr-org-clusters.js'),
    profiles: require('./families/profiles/hr-org.json').profiles,
    emoji: '🧑‍💼',
    strictCats: '',
    owns: ['人力资源', '招聘', '行政', 'hr', '员工', '薪酬', '福利', '培训', '组织', '人事', '猎头', '绩效', '项目', '咨询', '战略', '交付', '敏捷', '行政'],
  },
  manufacturing: {
    clusters: require('./families/manufacturing-clusters.js'),
    profiles: require('./families/profiles/manufacturing.json').profiles,
    emoji: '🏭',
    strictCats: '',
    owns: ['工业', '制造', '生产', '工艺', '质量', '质检', '物流', '供应链', '仓', '库存', '采购', '报关', '冷链', '工厂', '制程', '计划', '设备', '焊', '装配', '操作'],
  },
  sales: {
    clusters: require('./families/sales-clusters.js'),
    profiles: require('./families/profiles/sales.json').profiles,
    emoji: '🤝',
    strictCats: '',
    owns: ['销售', '商务', '客户', '渠道', '售前', '售后', '客服', '技术支持', '大客户', '客户成功', '客户经理', '业务'],
  },
  education: {
    clusters: require('./families/education-clusters.js'),
    profiles: require('./families/profiles/education.json').profiles,
    emoji: '📚',
    strictCats: '',
    owns: ['教育', '培训', '课程', '教学', '学术', '科研', '研究', '讲师', '教师', '学习', '实验', '教务', '导师', '招生', '学员', '幼', '学科', '教研'],
  },
  gov: {
    clusters: require('./families/gov-clusters.js'),
    profiles: require('./families/profiles/gov.json').profiles,
    emoji: '🏛️',
    strictCats: '',
    owns: ['政务', '环保', '环境', '水', '碳', '能源', '公共', '智慧城市', '应急', '生态', '节能', '绿色', '污', '废', '垃圾', '环卫', '可持续', '政策', '城管', '水务', '新能源', '政府'],
  },
  realestate: {
    clusters: require('./families/realestate-clusters.js'),
    profiles: require('./families/profiles/realestate.json').profiles,
    emoji: '🏢',
    strictCats: '',
    owns: ['建筑', '工程', '房', '地产', '物业', '造价', '施工', '结构', '暖通', '机电', '投资', '招商', '置业', '土建', '幕墙', '景观', '室内', 'bim', '监理', '设计', '成本', '合约', '楼', '测量', '绘图', '业主'],
  },
  consumer: {
    clusters: require('./families/consumer-clusters.js'),
    profiles: require('./families/profiles/consumer.json').profiles,
    emoji: '🍔',
    strictCats: '',
    owns: ['餐', '店', '厨', '咖啡', '茶', '食品', '导购', '门店', '服装', '美妆', '化妆', '护肤', '母婴', '玩具', '买手', '零售', '烘焙', '营运', '加盟', '配方', '面料', '服饰', '童', '西点', '收银', '服务员', '调饮', '商品'],
  },
  media: {
    clusters: require('./families/media-clusters.js'),
    profiles: require('./families/profiles/media.json').profiles,
    emoji: '🎬',
    strictCats: '',
    owns: ['影视', '传媒', '内容', '编剧', '导演', '制片', '摄影', '剪辑', '特效', '后期', '动画', '游戏', '美术', '插画', '漫画', '音乐', '配音', '声音', '录音', '混音', '出版', '编辑', '发行', 'ip', 'mcn', '达人', '演艺', '艺术', '绘', '造型', '原画', '概念', '演奏', '指挥'],
  },
  tourism: {
    clusters: require('./families/tourism-clusters.js'),
    profiles: require('./families/profiles/tourism.json').profiles,
    emoji: '🏨',
    strictCats: '',
    owns: ['酒店', '客房', '前厅', '礼宾', '旅游', '景区', '文旅', '健身', '教练', '会展', '会议', '活动', '民宿', '餐饮', '宴会', '导游', '体育', '瑜伽', '场馆', '客栈', '度假', '厨', '调酒', '运动'],
  },
  agri: {
    clusters: require('./families/agri-clusters.js'),
    profiles: require('./families/profiles/agri.json').profiles,
    emoji: '🌾',
    strictCats: '',
    owns: ['食品', '农', '畜', '兽', '水产', '养殖', '种植', '饲料', '作物', '育种', '农艺', '植保', '土壤', '营养', '肥料', '农药', '渔', '栽培', '果', '菜', '茶', '种业', '生物', '昆虫'],
  },
  transport: {
    clusters: require('./families/transport-clusters.js'),
    profiles: require('./families/profiles/transport.json').profiles,
    emoji: '🚗',
    strictCats: '',
    owns: ['汽车', '车', '航空', '航天', '飞', '轨道', '地铁', '信号', '民航', '机场', '空管', '机务', '航运', '港口', '船', '海事', '交通', '驾驶', '整车', '底盘', '动力', '标定', '嵌入式', '固件', '算法', '机器学习', '计算机视觉', '深度学习', '感知', '点云', '激光雷达', '控制', '电气', '电子', '结构', '仿真', 'fpga', '射频', '天线', '可靠性', '系统集成', '传感器', '信息安全', '电池', '电机', '材料', '工艺', '测试', '质量', '硬件', '导航', '飞控', '物流'],
  },
  energy: {
    clusters: require('./families/energy-clusters.js'),
    profiles: require('./families/profiles/energy.json').profiles,
    emoji: '⚡',
    strictCats: '',
    owns: ['能源', '电力', '电网', '电气', '光伏', '风电', '风能', '储能', '电池', '氢', '油', '气', '钻', '采', '测井', '油藏', '化工', '化学', '矿', '冶金', '地质', '勘探', '地震', '物探', '测绘', '遥感', '测量', 'gis', '电机', '电缆', '继电', '变电', '工艺', '焊接', '结构', '核', '反应', '钢', '材料', '工程师', '设计'],
  },
  hardware: {
    clusters: require('./families/hardware-clusters.js'),
    profiles: require('./families/profiles/hardware.json').profiles,
    emoji: '🔌',
    strictCats: '',
    owns: ['芯片', '半导体', 'ic', '版图', 'dft', 'soc', 'mems', '固件', '嵌入式', '驱动', '内核', 'bsp', 'android', 'linux', '硬件', '电源', '射频', '电路', 'pcb', 'emc', '电磁', 'esd', '可靠性', '热设计', '机器人', '无人机', '飞控', '光学', '声学', '结构', '工业设计', 'id', '物联网', 'iot', '光电', '光刻', '封装', '测试', '质量', 'sqe', 'npi', '设备', '工艺', '算法', '固态', '电池', '传感器', '机器学习', '计算机视觉', '验证', '自动化', 'plc', '电子', '系统架构', '专利'],
  },
  finacct: {
    clusters: require('./families/finacct-clusters.js'),
    profiles: require('./families/profiles/finacct.json').profiles,
    emoji: '📒',
    strictCats: '',
    owns: ['会计', '财务', '税', '审计', '核算', '出纳', '预算', '内审', '外审', '报表', '凭证', '账', '资金', '成本', '稽核', '合并', '应收', '应付'],
  },
  security: {
    clusters: require('./families/security-clusters.js'),
    profiles: require('./families/profiles/security.json').profiles,
    emoji: '🛡️',
    strictCats: '',
    owns: ['安全', '风控', '渗透', '攻防', '红队', '蓝队', '漏洞', '逆向', '威胁', '应急', '加密', '密钥', '合规', '等保', '隐私', '反欺诈', '区块链', '智能合约', 'web3', '链', 'nft', 'defi', '元宇宙', '密码', '取证', '审计', '反洗钱', '防火墙', '入侵'],
  },
  game: {
    clusters: require('./families/game-clusters.js'),
    profiles: require('./families/profiles/game.json').profiles,
    emoji: '🎮',
    strictCats: '',
    owns: ['游戏', '策划', '原画', '建模', '动作', '特效', '绑定', '美术', '电竞', '赛事', '关卡', '数值', '战斗', '剧情', '主美', 'ui', '渲染', 'c4d', '三维', '电商美工', '品牌', '视觉', '插画', '概念', '动效', '排版', '字体'],
  },
};
const COLOR_POOL = ['blue', 'green', 'purple', 'orange', 'red', 'cyan', 'pink', 'teal', 'indigo'];
const LEVEL_EMOJI = { 实习: '🌱', 见习: '🌱', 初级: '🧑‍💻', 中级: '💻', 高级: '🛠️', 资深: '🧭', 首席: '⭐', 专家: '⭐', 主任: '⭐' };

const LEVEL_PERSONA = {
  实习: '你处在成长期，肯学肯问，把交代的任务做扎实、不懂就澄清，逐步建立专业习惯。',
  见习: '你处在成长期，肯学肯问，把交代的任务做扎实、不懂就澄清，逐步建立专业习惯。',
  初级: '你能在规范与指导下独立完成明确任务，注重把基础打牢、做事规范、问题问清楚。',
  中级: '你已是团队骨干，能独立负责完整模块，从方案到落地闭环交付，遇到模糊地带主动澄清。',
  高级: '你是团队的业务中坚，能主导复杂问题的方案设计与攻坚，并指导初中级同事。',
  资深: '你具备跨团队视野，能统筹整条业务线，用机制而非救火解决问题。',
  首席: '你定义专业方向与发展路线，权衡短期与长期，对团队整体专业能力负责。',
  专家: '你是该领域的资深专家，沉淀方法论与最佳实践，攻坚别人解决不了的难题。',
  主任: '你统筹团队与专业方向，既懂全局又能下场攻坚，对结果负责。',
};

function profileMap(fam) { const m = {}; for (const p of fam.profiles) m[p.key] = p; return m; }

// ---- 渲染单个角色 ----
function render(item, fam, pmap) {
  const { title, category } = item;
  const { clusterOf, levelOf } = fam.clusters;
  const cl = clusterOf(title);
  const prof = pmap[cl.key] || pmap['dev-generic'] || pmap['design-generic'] || pmap['finance-generic'] || pmap['mktg-generic'] || pmap['medical-generic'] || pmap['legal-generic'] || pmap['hrorg-generic'] || pmap['mfg-generic'] || pmap['sales-generic'] || pmap['edu-generic'] || pmap['gov-generic'] || pmap['realestate-generic'] || pmap['consumer-generic'] || pmap['media-generic'] || pmap['tourism-generic'] || pmap['agri-generic'] || pmap['transport-generic'] || pmap['energy-generic'] || pmap['hardware-generic'] || pmap['finacct-generic'] || pmap['security-generic'] || pmap['game-generic'];
  const level = levelOf(title);
  const rnd = mulberry32(seedOf(title + '|' + category));

  const emoji = LEVEL_EMOJI[level] || fam.emoji;
  const color = pick(rnd, COLOR_POOL);
  const persona = LEVEL_PERSONA[level] || LEVEL_PERSONA['中级'];
  const ladderLine = (prof.ladder && (prof.ladder[level] || prof.ladder['中级'])) || '';

  // 按岗位名播种，从画像里抽取并打散顺序，制造同方向不同岗位的差异
  const resp = shuffled(rnd, prof.responsibilities);
  const skills = shuffled(rnd, prof.skills);
  const tools = shuffled(rnd, prof.tools);
  const kpis = shuffled(rnd, prof.kpis);
  const dels = shuffled(rnd, prof.deliverables);
  const collab = prof.collaborators;
  const bound = prof.boundaries;
  const pit = shuffled(rnd, prof.pitfalls).slice(0, Math.max(2, Math.min(3, prof.pitfalls.length)));

  const desc = `${category}领域的${level}${prof.name}，专注${prof.summary.replace(/。$/, '')}。`.slice(0, 140);

  const L = [];
  L.push('---');
  L.push(`name: ${title}`);
  L.push(`description: ${desc.replace(/\n/g, ' ')}`);
  L.push(`emoji: ${emoji}`);
  L.push(`color: ${color}`);
  L.push(`cluster: ${cl.key}`);
  L.push(`level: ${level}`);
  L.push('---');
  L.push('');
  L.push(`# ${title}·智能体人格`);
  L.push('');
  L.push(`你是 **${title}**，${prof.summary}${persona}`);
  L.push('');
  L.push('## 你的身份与定位');
  L.push(`- **岗位方向**：${prof.name}（${level}），属于${category}方向。`);
  L.push(`- **职级侧重**：${ladderLine}`);
  L.push(`- **记忆**：在整个对话中保持上下文一致、口径统一、目标不漂移，始终站在「${prof.name}」的专业视角回应。`);
  L.push('');
  L.push('## 你的核心职责');
  for (const r of resp) L.push(`- ${r}`);
  L.push('');
  L.push('## 必备技能与技术栈');
  L.push(`- **核心技能**：${skills.join('、')}。`);
  L.push(`- **常用工具/框架**：${tools.join('、')}。`);
  L.push('');
  L.push('## 衡量你的关键指标');
  for (const k of kpis) L.push(`- ${k}`);
  L.push('');
  L.push('## 你的交付物');
  for (const d of dels) L.push(`- ${d}`);
  L.push('');
  L.push('## 协作与边界');
  L.push(`- **主要协作方**：${collab.join('、')}。`);
  for (const b of bound) L.push(`- **边界**：${b}。`);
  L.push('');
  L.push('## 你要主动规避的常见坑');
  for (const p of pit) L.push(`- ${p}`);
  L.push('');
  L.push('## 你的工作方式');
  L.push(`1. **先对齐目标**：确认作为${prof.name}要解决的真问题与成功标准，不急着动手。`);
  L.push('2. **基于真实实践给方案**：用本岗位的行业最佳实践给出可落地步骤与取舍，标注关键风险。');
  L.push('3. **小步交付**：按里程碑推进，每步留下可检验的产出。');
  L.push('4. **复盘改进**：用上面的关键指标验证效果，沉淀为可复用经验。');
  L.push('');

  const md = L.join('\n');
  const fm = { name: title, description: desc, emoji, color };
  const bodyStart = md.indexOf(`# ${title}·智能体人格`);
  const body = md.slice(bodyStart).trim();
  return { md, fm, body, color, emoji, desc, cluster: cl.key, level };
}

async function main() {
  const famKey = arg('family', 'dev');
  const fam = FAMILIES[famKey];
  if (!fam) { console.error('未知 family:', famKey, '可选:', Object.keys(FAMILIES).join(',')); process.exit(1); }
  const limit = Number(arg('limit', 0)) || Infinity;
  const dry = FLAG('dry');
  const preview = FLAG('preview');
  const pmap = profileMap(fam);

  // 横切分类：只渲染能映射到真实方向的角色，兜底到通用画像的跳过（留给其归属族）
  const STRICT_FALLBACK_CATS = new Set((arg('strict-cats', fam.strictCats || '人工智能与大模型') || '').split(',').filter(Boolean));
  // 全局横切岗位：市场/品牌/公关/HR/行政/设计 等在每个族都出现，兜底时统一 defer 给其归属族（除非本族就是该归属族）
  // 横切职能标记：某角色明显属于「另一个族」。命中且本族不 owns 时 defer。只对兜底角色生效。
  const XCUT_MARKERS = ['人力资源', 'hr经理', 'hrbp', '行政经理', '行政专员', '招聘', '猎头', '前台', '法务', '财务经理', '会计',
    '市场总监', '市场经理', '市场专员', '品牌经理', '品牌总监', '公关', '媒介', '新媒体', '社群运营', '内容运营', '活动策划',
    'ui设计', 'ux设计', 'ui/ux', '平面设计', '视觉设计', '插画', '动画师', '动画设计', '动效', '美术指导', '创意总监', '副创意', '设计总监', '3d设计', '三维设计', '原画', '美工',
    '投资者关系',
    // 研发技术岗（归 dev 族；dev owns 这些不会自 defer）
    '后端工程', '前端工程', '移动端工程', '全栈工程', '算法工程', '机器学习', '深度学习', '计算机视觉', '自然语言处理', 'nlp', '推荐系统', '搜索工程', '测试工程', '运维工程', '数据工程师', '数据分析师', 'sas程序', '大数据', 'devops', 'sre工程',
    // 销售/商务（归 sales 族）+ 产品经理（归 product/PM）
    '销售经理', '销售专员', '销售总监', '商务拓展', '客户成功', '客户经理', '渠道经理', '产品经理', '产品总监', '用户运营', '活动运营', '运营经理', '运营专员',
    // 供应链/采购/仓储（归 manufacturing 族）+ 财税（归 finance 族）
    '采购专员', '采购经理', '采购助理', '供应链经理', '供应链专员', '仓储主管', '库存管理', '库存控制', '出纳', '税务专员', '融资专员', '成本会计'];
  const owns = (fam.owns || []).map((s) => s.toLowerCase());
  const isXcut = arg('no-xcut') ? () => false
    : (title) => { const low = title.toLowerCase(); return XCUT_MARKERS.some((m) => low.includes(m.toLowerCase()) && !owns.some((o) => low.includes(o))); };

  const titles = JSON.parse(fs.readFileSync(TITLES, 'utf8'));
  const devCats = new Set(fam.clusters.DEV_CATEGORIES);
  const inFam = titles.filter((t) => devCats.has(t.category));

  // 去重 skillId（池内同 category+slug 重复）
  const seen = new Set();
  const queue = [];
  for (const t of inFam) {
    if (queue.length >= limit) break;
    const slug = slugify(t.title);
    const sid = skillIdOf(t.category, slug);
    if (seen.has(sid)) continue;
    seen.add(sid);
    queue.push({ ...t, slug, skillId: sid });
  }

  console.log(`[render-v2] family=${famKey} 岗位(去重)=${queue.length} ${dry ? '（dry-run）' : '（写库）'}`);

  let ok = 0, fail = 0, deferred = 0, skippedNonTpl = 0;
  const byCluster = {}; const byLevel = {};
  const failSamples = [];
  const previewWritten = [];

  // 默认只覆盖现有 template 角色，保留 DeepSeek 富内容(by 缺失)；--all-roles 则全量覆盖
  const templateOnly = !arg('all-roles');

  // 写库准备
  let client, skills, templateSet = null;
  const batch = []; const BATCH = 500;
  if (!dry) {
    const { MongoClient } = require('mongodb');
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/totalclaw';
    client = new MongoClient(uri); await client.connect();
    skills = client.db().collection('skills');
    if (templateOnly) {
      const cats = [...devCats];
      const rows = await skills.find({ kind: 'role', category: { $in: cats }, 'securityAudit.programmatic.by': 'template' }).project({ skillId: 1 }).toArray();
      templateSet = new Set(rows.map((r) => r.skillId));
      console.log(`[render-v2] 仅覆盖 template 角色: 该族分类下 template skillId=${templateSet.size}`);
    }
  }
  async function flush() { if (batch.length && !dry) { await skills.bulkWrite(batch, { ordered: false }); batch.length = 0; } }

  for (const item of queue) {
    // 兜底岗里属于横切职能（市场/HR/设计…）或横切分类的，跳过、留给归属族
    const fb = fam.clusters.clusterOf(item.title).fallback;
    if (fb && (STRICT_FALLBACK_CATS.has(item.category) || isXcut(item.title))) { deferred++; continue; }
    // 只覆盖现有 template 角色：跳过 DeepSeek 富内容(不在 templateSet)
    if (templateSet && !templateSet.has(item.skillId)) { skippedNonTpl++; continue; }
    let r;
    try { r = render(item, fam, pmap); } catch (e) { fail++; failSamples.push(item.title + ': ' + e.message); continue; }
    const v = validateRole({ title: item.title, body: r.body, fm: r.fm });
    if (!v.pass) { fail++; if (failSamples.length < 10) failSamples.push(item.title + ': ' + v.reason); continue; }
    ok++;
    byCluster[r.cluster] = (byCluster[r.cluster] || 0) + 1;
    byLevel[r.level] = (byLevel[r.level] || 0) + 1;

    if (preview && previewWritten.length < 24) {
      const f = path.join(PREVIEW, item.category, `${item.slug}.md`);
      fs.mkdirSync(path.dirname(f), { recursive: true });
      fs.writeFileSync(f, r.md);
      previewWritten.push(path.relative(ROOT, f));
    }
    if (!dry) {
      const outFile = path.join(DATA, 'generated-v2', item.category, `${item.slug}.md`);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      fs.writeFileSync(outFile, r.md);
      batch.push({ updateOne: {
        filter: { skillId: item.skillId },
        update: {
          $set: {
            skillId: item.skillId, slug: item.slug, name: item.title, displayName: item.title,
            description: r.desc, descriptionZh: r.desc, emoji: r.emoji, color: r.color,
            category: item.category, tags: ['AI角色', item.category, r.cluster], source: 'totalclaw', kind: 'role',
            contentMd: r.body, author: 'TotalClaw',
            syncedAt: new Date(), lastUpdated: new Date(),
            securityAudit: { programmatic: { score: v.score, reason: v.reason, by: 'profile-v2', at: new Date() } },
          },
          $setOnInsert: {
            listingType: 'paid', ownership: 'totalclaw-proprietary', closedSource: true,
            pricing: { model: 'paid', price: PRICE, currency: 'CNY' },
            reviewStatus: 'n/a', featured: false,
            stats: { downloads: 0, sales: 0, ratingAvg: 0, ratingCount: 0 },
          },
        }, upsert: !templateOnly } });
      if (batch.length >= BATCH) await flush();
    }
  }
  await flush();
  if (client) await client.close();

  console.log(`[render-v2] ok=${ok} fail=${fail} deferred(横切留给归属族)=${deferred} 跳过(非template/DeepSeek保留)=${skippedNonTpl}`);
  console.log('按方向分布:', JSON.stringify(Object.fromEntries(Object.entries(byCluster).sort((a, b) => b[1] - a[1]))));
  console.log('按职级分布:', JSON.stringify(byLevel));
  if (failSamples.length) console.log('失败样例:', failSamples);
  if (previewWritten.length) console.log(`预览样例(${previewWritten.length}):\n  ` + previewWritten.join('\n  '));
}

module.exports = { render, profileMap, FAMILIES };
if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });
