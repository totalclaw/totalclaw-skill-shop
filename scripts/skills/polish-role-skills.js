'use strict';

/**
 * 打磨 complete-totalclaw-agent-role-skills 批次的 46,400 条技能。
 *
 * 思路：从对应 kind:'role' 文档挖出真实「核心职责 / 定位 / 职级 / 防御标记」，
 * 把这些信号注入到升级版正文模板（品类感知 + 更丰富章节），
 * 让每条技能真正按角色差异化、可加载、可实操、安全合规可控。
 *
 * 用法：
 *   node scripts/skills/polish-role-skills.js --sample              # 小样本试跑（仅打印 before/after，不写库）
 *   node scripts/skills/polish-role-skills.js --apply               # 全量重生成并 upsert
 *   node scripts/skills/polish-role-skills.js --apply --limit 1000  # 限量
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { filterDutiesForRole, mergeRoleDuties, dutiesFromTitle: titleDutiesFromTitle, isGenericDuty, isDevRoleTitle } = require('./role-duty-helpers');
const { resolvePack } = require('./blueprint-steps');
const { resolveRoleTypePack } = require('./blueprint-steps/role-type-fallback');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const BATCH_BY = 'complete-totalclaw-agent-role-skills';

function slugify(s) {
  const a = String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (a.length >= 2) return a;
  return `s${hash36(s)}`;
}

function hash36(s) {
  let h = 2166136261;
  for (const ch of String(s)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h.toString(36);
}

function shortHash(s) {
  return crypto.createHash('md5').update(String(s)).digest('hex').slice(0, 6);
}

// ---- 安全敏感判定 ----
const SECURITY_HINTS = ['安全', '渗透', '攻防', '红队', '蓝队', '审计', '合规', '风控', '反欺诈', '威胁', '漏洞', '取证', '隐私', '等保'];
function isSecurityRole(role) {
  const tags = role.tags || [];
  if (tags.some((t) => /security|risk|compliance|audit/i.test(String(t)))) return true;
  const txt = `${role.name || ''} ${role.description || ''} ${role.category || ''}`;
  return SECURITY_HINTS.some((k) => txt.includes(k));
}

// ---- 攻击性红线词（出现即判为不合规，需人工复核）----
const RED_LINES = ['编写漏洞利用', '绕过授权', '提权脚本', '免杀', '木马', '攻破', '入侵他人', '窃取', '非法获取'];
// 「勒索」仅拦截攻击性语境；防御岗角色名/正文中的「勒索软件/反勒索」允许
const RED_LINE_RANSOM = /(?<![反防检测分析事件威胁应对处置响应])勒索(?!软件|ware|病毒|木马|攻击事件|事件分析|防护|防御|检测|情报|样本)/;
function hasRedLine(text) {
  // 命中红线词，但忽略否定/防御/风险描述语境（前 20 字内出现 不/禁/严/勿/拒/防/避/泄/护/范/检/识/对抗）
  const hits = [];
  for (const w of RED_LINES) {
    let from = 0;
    let idx;
    while ((idx = text.indexOf(w, from)) !== -1) {
      const before = text.slice(Math.max(0, idx - 20), idx);
      if (!/[不禁严勿拒防避泄护范检识]|对抗|抵御|遭受|被.{0,6}$/.test(before)) hits.push(w);
      from = idx + w.length;
    }
  }
  if (RED_LINE_RANSOM.test(text)) hits.push('勒索');
  return [...new Set(hits)];
}

// ---- 从角色人格正文提取「核心职责」要点 ----
function extractResponsibilities(roleDoc) {
  const md = roleDoc && roleDoc.contentMd ? String(roleDoc.contentMd) : '';
  if (!md) return [];
  // 找「核心职责」小节，取其下的 - 列表，直到下一个 ## 标题
  const idx = md.indexOf('核心职责');
  if (idx === -1) return [];
  const after = md.slice(idx);
  const stop = after.indexOf('\n## ');
  const section = stop === -1 ? after : after.slice(0, stop);
  const bullets = [];
  for (const line of section.split('\n')) {
    const m = /^[-*]\s+(.+?)\s*$/.exec(line.trim());
    if (m) {
      const t = m[1].replace(/[，。;；,]+$/, '').trim();
      if (t && t.length >= 4) bullets.push(t);
    }
  }
  return bullets.slice(0, 6);
}

// 去掉通用职级/职能后缀，取角色名核心 token
function coreToken(name) {
  return String(name).replace(/(工程师|架构师|设计师|分析师|工程|师|员|经理|专员|主管|总监|顾问|代表|专家|官|长|助理|策划|运营|开发|测试)$/, '').trim();
}

function hasTitleAnchoredDuties(name, responsibilities) {
  const tok = coreToken(name);
  if (tok.length >= 2 && responsibilities.some((r) => r.includes(tok) || r.includes(name))) return true;
  return responsibilities.length >= 4 && responsibilities.some((r) => r.includes(name.slice(0, 2)));
}

// 相关性闸门：判断角色名是否与其人格描述/职责语义相关，避免把错配的品类兜底人格注入技能
function isProfileRelevant(name, description, responsibilities) {
  const tok = coreToken(name);
  if (tok.length < 2) return true; // 太短无法判断，按相关处理
  const hay = `${description} ${responsibilities.join(' ')}`;
  if (hay.includes(tok)) return true;
  // 角色名中任意 2-gram 出现在描述/职责里也算相关
  for (let i = 0; i + 2 <= name.length; i++) {
    const g = name.slice(i, i + 2);
    if (/^[\u4e00-\u9fa5A-Za-z]{2}$/.test(g) && hay.includes(g)) return true;
  }
  return false;
}

function buildProfile(roleDoc) {
  const raw = extractResponsibilities(roleDoc);
  const name = roleDoc.name;
  const category = roleDoc.category || '通用岗位';
  const responsibilities = filterDutiesForRole(name, category, raw);
  const description = (roleDoc.description || roleDoc.descriptionZh || '').trim();
  const relevant = isProfileRelevant(name, description, responsibilities.length ? responsibilities : raw);
  return {
    name,
    slug: roleDoc.slug || slugify(name),
    category: roleDoc.category || '通用岗位',
    description,
    responsibilities,
    relevant, // 人格是否与角色名相关；不相关则走安全框架，不注入具体职责/描述
    security: isSecurityRole(roleDoc),
  };
}

// ---- 8 个升级版蓝图 ----
const blueprints = [
  {
    suffix: '任务澄清与目标拆解',
    desc: (p) => `帮助${p.name}把模糊需求拆成目标、边界、输入、验收标准和下一步行动。`,
    when: (p) => `当用户给出的需求笼统、目标不清或范围未定，需要${p.name}先对齐再动手时。`,
    inputs: [
      '用户的原始业务请求（一句话或一段话）',
      '已知约束：截止时间、预算、可用数据、工具权限、合规要求',
      '期望交付物的形式与受众',
    ],
    steps: (p) => [
      `复述${p.name}收到的请求，标出目标、对象、场景、截止时间和已知限制。`,
      '列出缺失信息，用最多 8 个问题向用户确认优先级、约束、可用数据和交付格式。',
      `结合${p.category}的工作特点，把任务拆成 3~6 个子目标，每个写清输入、动作、完成标志。`,
      '把风险、依赖和需要人工确认的事项单列，避免在信息不足时自行假设。',
      '输出一版可执行任务说明，供后续调用工具或继续生成交付物。',
    ],
    outputs: ['需求澄清清单', '目标拆解表', '验收标准', '下一步行动列表'],
  },
  {
    suffix: '工作流规划与里程碑排期',
    desc: (p) => `为${p.name}生成可执行工作流、里程碑、责任分工和节奏安排。`,
    when: (p) => `当${p.name}需要把一项较大任务排出阶段、节点和责任，避免无序推进时。`,
    inputs: ['任务总目标与截止时间', '可用人力、工具与预算', '关键依赖与外部协作方'],
    steps: (p) => [
      '确认任务周期、资源约束、协作对象、关键风险和必须优先完成的交付物。',
      `按${p.name}的岗位职责，把工作划分为准备、执行、检查、交付、复盘阶段。`,
      '为每个阶段写出目标、输入、动作、负责人、预计耗时和完成证据。',
      '识别会阻塞后续工作的前置事项，给出提前验证或并行推进的方法。',
      '输出可放进项目管理工具或对话上下文的里程碑计划。',
    ],
    outputs: ['阶段计划', '里程碑表', '责任分工', '节奏检查点'],
  },
  {
    suffix: '信息收集与证据台账',
    desc: (p) => `指导${p.name}收集资料、记录来源、判断可信度并形成可复查证据台账。`,
    when: (p) => `当${p.name}需要为结论或决策准备可追溯依据，避免凭印象下判断时。`,
    inputs: ['任务相关的内部资料、外部资料与数据字段', '干系人输入与历史记录', '资料的使用与合规限制'],
    steps: (p) => [
      '列出完成任务所需的内部资料、外部资料、历史记录、数据字段和干系人输入。',
      '为每类资料标注来源、更新时间、责任人、可信度、使用限制和是否含敏感信息。',
      `结合${p.category}场景，判断哪些资料足以支撑结论，哪些只能作为参考。`,
      '把缺失、冲突或过期信息汇总成待补资料列表，并给出向用户追问的模板。',
      '输出结构化台账，便于后续步骤引用而不丢失上下文。',
    ],
    outputs: ['资料清单', '证据台账', '可信度判断', '待补资料列表'],
  },
  {
    suffix: '方案生成与备选比较',
    desc: (p) => `让${p.name}生成多套方案，并从成本、收益、风险和执行难度进行比较。`,
    when: (p) => `当${p.name}面对开放性问题、需要给出可被批准的建议而非单一答案时。`,
    inputs: ['决策目标与硬约束（预算/时间/合规/能力）', '当前已知事实与数据', '可接受的风险与不可逆程度'],
    steps: (p) => [
      '明确决策目标和约束条件，例如预算、时间、质量、合规、团队能力或用户体验。',
      `围绕${p.name}的典型职责生成 2~4 个可执行方案，避免只给单一答案。`,
      '从价值、成本、实施难度、依赖、风险、可逆性和验证方式比较每个方案。',
      '指出推荐方案以及不推荐其它方案的原因，保留适用前提和反例。',
      '把最终建议写成用户可直接批准、修改或继续追问的格式。',
    ],
    outputs: ['备选方案', '比较矩阵', '推荐方案', '取舍说明'],
  },
  {
    suffix: '质量检查与风险复核',
    desc: (p) => `帮助${p.name}在交付前检查质量、遗漏、风险、合规和用户预期偏差。`,
    when: (p) => `当${p.name}即将交付成果，需要一次系统化自检以降低返工与风险时。`,
    inputs: ['当前交付物或计划草稿', '原始目标与验收标准', '相关合规与边界要求'],
    steps: (p) => [
      '读取当前交付物或计划，先判断它是否满足用户原始目标和验收标准。',
      `按${p.name}的专业视角检查准确性、完整性、可执行性、表达清晰度和边界条件。`,
      '列出高风险问题、一般问题和可选优化，分别给出影响和修正建议。',
      '检查是否有未授权承诺、未经验证的数据、过度推断或遗漏的干系人。',
      '输出放行结论：可交付、需小修、需重做，并说明原因。',
    ],
    outputs: ['质量检查表', '风险清单', '修正建议', '放行结论'],
  },
  {
    suffix: '自动化提示词与工具调用清单',
    desc: (p) => `把${p.name}的重复工作转成 TotalClaw-agent 可执行提示词、工具清单和检查步骤。`,
    when: (p) => `当${p.name}有反复出现的固定流程，希望沉淀成可复用、可复核的自动化时。`,
    inputs: ['需要自动化的重复任务描述', '每次运行的输入字段与数据来源', '输出格式与质量标准'],
    steps: (p) => [
      '识别任务中可自动化的重复动作、固定判断、资料整理、格式转换和报告生成环节。',
      '定义每次运行必须提供的输入字段，包括目标、数据来源、限制、输出格式和质量标准。',
      `为${p.name}写出可直接使用的主提示词，要求结果结构稳定、可复核。`,
      '列出可能需要的工具类型，例如文件读取、网页检索、表格处理、代码执行或接口调用。',
      '补充执行后的检查点，确保自动化结果不会绕过人工确认或业务约束。',
    ],
    outputs: ['自动化提示词', '工具调用计划', '输入字段模板', '执行检查点'],
  },
  {
    suffix: '交付物撰写与汇报',
    desc: (p) => `帮助${p.name}把分析过程转成清晰、可交付、适合不同受众的汇报材料。`,
    when: (p) => `当${p.name}需要把工作成果向管理层、客户或协作方清晰汇报时。`,
    inputs: ['汇报对象与其关注点', '已完成的分析、数据与结论', '格式、篇幅与截止时间要求'],
    steps: (p) => [
      '确认汇报对象、阅读时间、需要做出的决策、必须呈现的数据和不应展开的细节。',
      `用${p.name}的岗位语言组织内容：背景、目标、发现、依据、建议、风险和下一步。`,
      '把复杂信息拆成标题、要点、证据和结论，避免长段堆叠。',
      '分别生成管理层摘要和执行层行动项，确保不同受众都能理解下一步。',
      '在结尾列出待确认问题、责任人、时间节点和复盘方式。',
    ],
    outputs: ['汇报大纲', '正式文本', '摘要版本', '行动项列表'],
  },
  {
    suffix: '复盘沉淀与知识库更新',
    desc: (p) => `让${p.name}把完成的任务沉淀为复盘、模板、检查清单和可复用知识。`,
    when: (p) => `当${p.name}完成一轮任务，需要把经验固化为下次可复用资产时。`,
    inputs: ['本次任务目标、过程与结果', '出现的偏差、失败与关键决策', '可沉淀范围与脱敏要求'],
    steps: (p) => [
      '回顾任务目标、实际结果、偏差、关键决策和影响最终质量的因素。',
      '区分可复用经验、一次性背景、失败教训和需要团队同步的流程问题。',
      `为${p.name}整理一份下次可直接复用的模板，包括输入、步骤、输出和检查项。`,
      '标记哪些内容适合进入知识库，哪些涉及敏感信息不能沉淀或需要脱敏。',
      '输出复盘结论和改进动作，便于后续同类任务调用。',
    ],
    outputs: ['复盘记录', '经验清单', '可复用模板', '知识库条目'],
  },
];

function fmName(profile, suffix) {
  // 与历史保持一致的命名空间，并以 skillId 短哈希保证全局唯一
  return `${slugify(profile.slug || profile.name)}-${hash36(`${profile.name}-${suffix}`)}`;
}

function yamlEscape(s) {
  return String(s).replace(/"/g, '\\"');
}

function buildFallbackExample(profile, blueprint) {
  const duty = (profile.enrichedDuties || profile.responsibilities || [])[0] || `${profile.name}核心工作`;
  const dutyHint = duty.length > 28 ? `${duty.slice(0, 28)}…` : duty;
  const bySuffix = {
    '任务澄清与目标拆解': {
      input: `例：${profile.category}场景，${profile.name}需在本周五前完成「${dutyHint}」相关交付，约束含预算/合规/协作方 3 项`,
      output: '任务澄清表：目标、范围、验收标准、待确认问题清单、责任人、截止时间',
    },
    '工作流规划与里程碑排期': {
      input: `例：2 周周期，${profile.name}需并行推进 ${profile.category} 下 2 条工作流，其中 1 条依赖外部审批`,
      output: '里程碑表：阶段划分、起止日期、依赖项、阻塞风险与备选路径',
    },
    '信息收集与证据台账': {
      input: `例：手头有制度文件 v1.1、业务数据导出 CSV、缺 1 份签字版授权/确认记录`,
      output: '证据台账：来源、版本、可用性、缺失项、脱敏要求、责任人',
    },
    '方案生成与备选比较': {
      input: `例：需在成本/质量/时效三目标间取舍，给出 ${profile.name} 可执行的 2~3 套方案`,
      output: '方案对比表：选项、前提、优缺点、推荐方案与批准待办',
    },
    '质量检查与风险复核': {
      input: `例：初稿已完成，需按 ${profile.category} 岗位标准做交付前复核，重点查 3 类常见遗漏`,
      output: '质检清单：检查项、结果、风险等级、整改建议、是否可放行',
    },
    '自动化提示词与工具调用清单': {
      input: `例：重复性工作占 40%，希望列出 ${profile.name} 可脚本化/模板化的步骤与工具`,
      output: '自动化清单：步骤、工具/MCP、输入输出、人工复核点、预期节省工时',
    },
    '交付物撰写与汇报': {
      input: `例：面向业务负责人汇报，需 1 页摘要 + 附录明细，强调结论与下一步`,
      output: '汇报稿骨架：摘要、关键发现、数据依据、风险、决策建议、行动项',
    },
    '复盘沉淀与知识库更新': {
      input: `例：刚完成一轮 ${dutyHint}，需沉淀模板并标注不可对外共享的敏感段落`,
      output: '复盘记录：结果对比、根因、可复用模板、知识库条目、改进动作',
    },
  };
  return bySuffix[blueprint.suffix] || {
    input: `例：${profile.category}场景下 ${profile.name} 收到一项 3 日内需反馈的任务（含 2 条硬性约束）`,
    output: `按上文「输出」清单给出 ${blueprint.outputs.slice(0, 2).join('、')}，并附待确认问题`,
  };
}

function buildBody(profile, blueprint, skillId, opts = {}) {
  const deep = !!opts.deep;
  const skillName = `${profile.name}${blueprint.suffix}`;
  let name = fmName(profile, blueprint.suffix);
  // frontmatter name 追加 skillId 短哈希，确保全局唯一（同名角色不撞车）
  name = `${name}-${shortHash(skillId)}`;

  const tags = ['totalclaw-agent', '岗位技能', profile.category, profile.name, blueprint.suffix];
  const blueprintAware = !!opts.blueprintAware;
  const version = blueprintAware ? '1.5.2' : (opts.usabilityV2 ? '1.4.0' : (deep ? '1.3.0' : '1.2.0'));

  const dutyPool = profile.enrichedDuties || profile.responsibilities;
  const respForScene = dutyPool.slice(0, blueprintAware ? 5 : (deep ? 5 : 3));

  const domainPack = blueprintAware
    ? (resolvePack(profile, blueprint.suffix) || resolveRoleTypePack(profile, blueprint.suffix))
    : null;
  const inputLines = domainPack?.inputs || blueprint.inputs;
  const stepLines = domainPack?.steps || (blueprintAware ? resolveRoleTypePack(profile, blueprint.suffix)?.steps : null);
  const concreteExample = domainPack?.example || (blueprintAware ? buildFallbackExample(profile, blueprint) : null);

  // 职责注入：仅当人格与角色名相关时注入具体职责与描述；否则走安全框架（只用角色名+品类）
  let sceneLines;
  if (profile.relevant) {
    const respLines = respForScene.length
      ? respForScene.map((r) => `- 围绕「${r}」这类职责展开，确保产出贴合岗位实际。`)
      : [`- 围绕${profile.name}在${profile.category}方向的核心职责展开，确保产出贴合岗位实际。`];
    sceneLines = [
      `- 角色：${profile.name}（${profile.category}）。`,
      profile.description ? `- 定位：${profile.description}` : `- 定位：${profile.category}方向的专业岗位。`,
      ...respLines,
    ];
    if ((deep || blueprintAware) && respForScene.length >= 2) {
      sceneLines.push(`- 本技能侧重：${blueprint.suffix}，与上述职责形成闭环。`);
    }
  } else {
    // 安全框架：不引用可能错配的人格描述/职责，只锚定角色名与品类
    sceneLines = [
      `- 角色：${profile.name}（${profile.category}）。`,
      `- 定位：${profile.category}方向的${profile.name}，按该岗位的专业标准推进任务。`,
      `- 始终以${profile.name}的专业视角组织产出，紧扣用户给出的具体目标与上下文，不套用无关领域的做法。`,
    ];
  }

  const securitySection = profile.security
    ? [
        '## 安全与合规',
        '',
        '- 本技能面向**防御与合规**用途：仅在获得授权的范围内开展检查、评估与整改建议。',
        '- 不输出任何攻击性或危害他人系统的可执行步骤；发现风险只描述定级、影响与修复方向。',
        '- 涉及敏感数据、凭证、个人信息时遵循最小必要原则并脱敏，保留可审计记录。',
        '- 任何对外部系统的操作前，先确认授权边界与人工批准点。',
        '',
      ]
    : [
        '## 安全与合规',
        '',
        '- 仅使用用户授权范围内的数据与系统，涉及敏感信息时遵循最小必要原则并脱敏。',
        '- 不替用户做出未经授权的对外承诺；超出权限的动作先停下来请求确认。',
        '',
      ];

  const lines = [
    '---',
    `name: ${name}`,
    `description: "${yamlEscape(blueprint.desc(profile))}"`,
    `version: ${version}`,
    'author: TotalClaw',
    'metadata:',
    '  totalclaw:',
    `    role: "${yamlEscape(profile.name)}"`,
    `    category: "${yamlEscape(profile.category)}"`,
    '    exposure:',
    '      runtime_visible: true',
    '      prompt_visible: true',
    '      user_invocable: true',
    '    tags:',
    ...tags.map((t) => `      - "${yamlEscape(t)}"`),
    '---',
    '',
    `# ${skillName}`,
    '',
    '## 何时使用',
    '',
    `${blueprint.when(profile)}此时让 TotalClaw-agent 以「${profile.name}」身份加载本技能：${blueprint.desc(profile)}`,
    '',
    '## 适用角色与场景',
    '',
    ...sceneLines,
    '',
    '## 输入',
    '',
    ...inputLines.map((i) => `- ${i}`),
    '',
    '## 步骤',
    '',
    ...(() => {
      const base = stepLines || blueprint.steps(profile);
      const useAlign = (deep || opts.usabilityV2 || blueprintAware) && respForScene.length;
      if (!useAlign) return base.map((s, i) => `${i + 1}. ${s}`);
      return base.map((s, i) => {
        const extra = i === 2 && respForScene.length ? `（对齐职责：${respForScene[i % respForScene.length]}）` : '';
        return `${i + 1}. ${s}${extra}`;
      });
    })(),
    '',
    ...((deep || blueprintAware) && respForScene.length >= 2
      ? [
          '## 岗位关键动作',
          '',
          ...respForScene.slice(0, 4).map((r) => `- ${r}`),
          '',
        ]
      : []),
    '## 输出',
    '',
    ...blueprint.outputs.map((o) => `- ${o}`),
    '',
    '## 边界与约束',
    '',
    '- 只基于用户提供的事实和当前上下文工作，不编造数据、政策或结论。',
    '- 缺信息时先提问，不在假设上继续往下推。',
    '- 需要调用工具、读文件或访问外部系统前，先说明目的与预期产出。',
    '',
    '## 失败模式与规避',
    '',
    '- 目标漂移：每步对照原始目标与验收标准核对一次。',
    '- 过度承诺：区分「已验证事实」与「推测」，对不确定项明确标注。',
    `- 角色脱节：始终以${profile.name}的专业视角组织内容，避免泛泛而谈。`,
    ...(deep && respForScene[0] && !blueprintAware
      ? [`- 职责遗漏：对照「${respForScene[0]}」等岗位关键动作，确认本步骤产出未偏离。`]
      : []),
    ...(blueprintAware && respForScene[0]
      ? [`- 步骤偏离：每步完成后对照「${blueprint.suffix}」目标与岗位关键动作核对一次。`]
      : []),
    '',
    '## 质量标准与验收',
    '',
    '- 产出可被用户直接批准、修改或继续追问，结构清晰、要点可核对。',
    '- 保留依据来源、待确认问题、责任人与下一步行动。',
    '- 关键结论可追溯到具体输入或证据。',
    '',
    ...securitySection,
    '## 示例（输入 → 输出骨架）',
    '',
    ...(concreteExample
      ? [
          `- 输入：${concreteExample.input}`,
          `- 输出：${concreteExample.output}`,
        ]
      : [
          `- 输入：用户提出一个与「${profile.name}」相关的具体任务及其约束。`,
          `- 输出：按上文「输出」清单给出 ${blueprint.outputs.join('、')}，并附待确认问题与下一步。`,
        ]),
    '',
    '## 注意事项',
    '',
    '- 涉及付费闭源内容时，只在授权环境中使用，不把正文转发给未授权运行时。',
    '- 输出必须保留可复查依据、待确认问题和下一步行动，便于用户继续推进。',
    '',
  ];

  return lines.join('\n');
}

function enrichProfile(profile, titleDuties) {
  const merged = mergeRoleDuties(
    profile.name,
    profile.category,
    profile.responsibilities,
    titleDuties || titleDutiesFromTitle(profile.name, profile.category),
  );
  return { ...profile, enrichedDuties: merged };
}

function buildSkillsForRole(roleDoc, existingSkills, opts = {}) {
  let profile = buildProfile(roleDoc);
  if (opts.deep && opts.titleDuties) profile = enrichProfile(profile, opts.titleDuties);
  else if (opts.usabilityV2 || opts.blueprintAware) profile = enrichProfile(profile, titleDutiesFromTitle(profile.name, profile.category));
  // 把现有 8 条技能按 suffix 对应到蓝图，沿用其 skillId 仅更新 contentMd/description
  const updates = [];
  for (const blueprint of blueprints) {
    const match = existingSkills.find((s) => s.name === `${profile.name}${blueprint.suffix}`);
    if (!match) continue;
    const body = buildBody(profile, blueprint, match.skillId, opts);
    const red = hasRedLine(body);
    updates.push({
      skillId: match.skillId,
      _id: match._id,
      description: blueprint.desc(profile),
      contentMd: body,
      redLines: red,
    });
  }
  return { profile, updates };
}

async function main() {
  const apply = process.argv.includes('--apply');
  const sample = process.argv.includes('--sample');
  const limitIdx = process.argv.indexOf('--limit');
  const limit = limitIdx !== -1 ? Number(process.argv[limitIdx + 1]) : 0;
  const auditATier = process.argv.includes('--audit-a-tier');
  const deep = process.argv.includes('--deep');
  const usabilityV2 = process.argv.includes('--usability-v2');
  const blueprintAware = process.argv.includes('--blueprint-aware');
  const scanP0 = process.argv.includes('--scan-p0');
  const categoryFilter = (() => { const i = process.argv.indexOf('--category'); return i !== -1 ? process.argv[i + 1] : null; })();
  const { dutiesFromTitle } = require('./role-duty-helpers');

  let auditRoleKeys = null;
  const auditBTier = process.argv.includes('--audit-b-tier');
  if (scanP0) {
    const p0Path = path.resolve(__dirname, '../../data/skills/p0-role-skills-audit.json');
    const p0 = JSON.parse(fs.readFileSync(p0Path, 'utf8'));
    auditRoleKeys = new Set((p0.P0角色清单 || []).map((r) => `${r.name}|||${r.category}`));
    console.log(`仅处理 P0 角色: ${auditRoleKeys.size}`);
  }

  if (auditATier || auditBTier) {
    const audit = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../data/skills/role-skill-mismatch-audit.json'), 'utf8'));
    auditRoleKeys = new Set();
    const section = auditATier ? 'A级高危错配_按品类' : 'B级同域泛化_按品类';
    for (const [cat, info] of Object.entries(audit[section] || {})) {
      if (categoryFilter && cat !== categoryFilter) continue;
      for (const name of info.角色) auditRoleKeys.add(`${name}|||${cat}`);
    }
    console.log(`仅处理 ${auditATier ? 'A' : 'B'} 级审计角色: ${auditRoleKeys.size}`);
  }

  const scanRemaining = process.argv.includes('--scan-remaining');

  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  // 直接遍历该批 skill，按 contentMd 里的 role + category 聚合
  const cursor = col.find(
    { kind: 'skill', 'securityAudit.programmatic.by': BATCH_BY },
    { projection: { skillId: 1, name: 1, contentMd: 1, _id: 1 } }
  );
  // key = `${roleName}|||${category}`，因为角色名在不同品类下不唯一
  const byRole = new Map();
  while (await cursor.hasNext()) {
    const d = await cursor.next();
    if (d.securityAudit?.programmatic?.refinedBy === 'claude-author') continue;
    const m = /role:\s*"([^"]+)"/.exec(d.contentMd || '');
    const cm = /category:\s*"([^"]+)"/.exec(d.contentMd || '');
    const roleName = m ? m[1] : null;
    const category = cm ? cm[1] : null;
    if (!roleName) continue;
    const key = `${roleName}|||${category || ''}`;
    if (!byRole.has(key)) byRole.set(key, { roleName, category, skills: [] });
    byRole.get(key).skills.push(d);
  }

  let roleList;

  // 按 name+category 精确取角色文档；回退到仅 name
  async function findRoleDoc(roleName, category) {
    if (category) {
      const exact = await col.findOne({ kind: 'role', name: roleName, category });
      if (exact) return exact;
    }
    return col.findOne({ kind: 'role', name: roleName });
  }

  if (scanRemaining) {
    auditRoleKeys = new Set();
    for (const key of byRole.keys()) {
      const { roleName, category } = byRole.get(key);
      const roleDoc = await findRoleDoc(roleName, category);
      if (!roleDoc) continue;
      const prof = buildProfile(roleDoc);
      if (!prof.relevant) auditRoleKeys.add(key);
    }
    console.log(`仅处理仍不相关角色: ${auditRoleKeys.size}`);
  }

  roleList = [...byRole.keys()];
  if (auditRoleKeys) roleList = roleList.filter((k) => auditRoleKeys.has(k));
  if (categoryFilter) {
    roleList = roleList.filter((k) => byRole.get(k).category === categoryFilter);
    console.log(`品类过滤: ${categoryFilter} → ${roleList.length} 组`);
  }
  if (limit) roleList = roleList.slice(0, limit);
  console.log(`涉及角色分组数(name+category): ${byRole.size}，本次处理: ${roleList.length}`);

  if (sample) {
    // 选 5 个不同品类（含安全角色）做 before/after
    const picks = [];
    const seenCat = new Set();
    for (const key of byRole.keys()) {
      const { roleName, category } = byRole.get(key);
      const roleDoc = await findRoleDoc(roleName, category);
      if (!roleDoc) continue;
      const cat = roleDoc.category;
      const sec = isSecurityRole(roleDoc);
      if (sec && !picks.some((p) => p.sec)) {
        picks.push({ key, roleDoc, sec });
      } else if (!seenCat.has(cat) && picks.length < 5) {
        seenCat.add(cat);
        picks.push({ key, roleDoc, sec });
      }
      if (picks.length >= 5) break;
    }
    for (const pk of picks) {
      const existing = byRole.get(pk.key).skills;
      const before = existing[0];
      const { profile, updates } = buildSkillsForRole(pk.roleDoc, existing, { deep });
      const after = updates[0];
      console.log('\n' + '='.repeat(70));
      console.log(`角色: ${pk.roleDoc.name} | 品类: ${pk.roleDoc.category} | 安全角色: ${pk.sec}`);
      console.log(`核心职责提取(${profile.responsibilities.length}):`, profile.responsibilities.slice(0, 3));
      console.log('\n----- BEFORE (旧正文，首 600 字) -----');
      console.log((before.contentMd || '').slice(0, 600));
      console.log('\n----- AFTER (新正文，首 1200 字) -----');
      console.log((after.contentMd || '').slice(0, 1200));
      console.log('\n新正文章节数:', (after.contentMd.match(/^##\s/gm) || []).length, '| 红线词:', after.redLines);
    }
    await client.close();
    return;
  }

  // 全量/限量 apply
  let processed = 0;
  let updatedSkills = 0;
  let redFlags = 0;
  let ops = [];
  const flush = async () => {
    if (!ops.length) return;
    await col.bulkWrite(ops, { ordered: false });
    updatedSkills += ops.length;
    ops = [];
  };
  let noRoleDoc = 0;
  let noResp = 0;
  let safeFallback = 0;
  for (const key of roleList) {
    const { roleName, category } = byRole.get(key);
    const roleDoc = await findRoleDoc(roleName, category);
    if (!roleDoc) { noRoleDoc++; continue; }
    const existing = byRole.get(key).skills;
    const titleDuties = (deep || usabilityV2) ? dutiesFromTitle(roleName, category || roleDoc.category) : null;
    const polishOpts = {
      deep: deep || usabilityV2 || blueprintAware,
      usabilityV2,
      blueprintAware,
      titleDuties,
    };
    const { profile, updates } = buildSkillsForRole(roleDoc, existing, polishOpts);
    if (!profile.responsibilities.length) noResp++;
    if (!profile.relevant) safeFallback++;
    const docTags = ['岗位技能', roleName, 'totalclaw-agent', category || roleDoc.category].filter(Boolean);
    for (const u of updates) {
      if (u.redLines.length) redFlags++;
      if (apply) {
        const polishedBy = auditATier ? 'polish-role-skills-a-tier'
          : (blueprintAware ? 'polish-role-skills-blueprint'
            : (usabilityV2 ? 'polish-role-skills-v2' : (deep ? 'polish-role-skills-deep' : 'polish-role-skills')));
        ops.push({
          updateOne: {
            filter: { _id: u._id },
            update: {
              $set: {
                contentMd: u.contentMd,
                description: u.description,
                descriptionZh: u.description,
                tags: docTags,
                version: blueprintAware ? '1.5.2' : (usabilityV2 ? '1.4.0' : (deep ? '1.3.0' : '1.2.0')),
                'securityAudit.programmatic.polishedBy': polishedBy,
                'securityAudit.programmatic.polishedAt': new Date().toISOString(),
                lastUpdated: new Date().toISOString(),
              },
            },
          },
        });
      }
      if (ops.length >= 1000) await flush();
    }
    processed++;
    if (processed % 500 === 0) console.log(`  已处理角色 ${processed}/${roleList.length}，更新技能 ${updatedSkills}`);
  }
  await flush();
  console.log(`\n完成。处理角色 ${processed}，更新技能 ${updatedSkills}，红线命中 ${redFlags}，缺角色文档 ${noRoleDoc}，无核心职责 ${noResp}，走安全框架(人格不相关) ${safeFallback}${apply ? '' : '（dry-run，未写库）'}`);
  await client.close();
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = {
  buildProfile, extractResponsibilities, buildBody, isSecurityRole, hasRedLine,
  buildSkillsForRole, isProfileRelevant, coreToken, hasTitleAnchoredDuties, enrichProfile,
  blueprints, slugify, hash36, shortHash, BATCH_BY,
};
