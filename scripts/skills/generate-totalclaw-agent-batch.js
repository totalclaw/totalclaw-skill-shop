'use strict';

/**
 * Deterministically generate TotalClaw-agent role skills for uncovered role names.
 *
 * Usage:
 *   node scripts/skills/generate-totalclaw-agent-batch.js [outFile] [targetRoles]
 *
 * Output matches scripts/skills/import-agent-skills.js:
 *   [{ role, roleSlug, category, skills: [{ name, desc, paid, tags, body }] }]
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');

const OUT = path.resolve(process.argv[2] || 'data/skills/totalclaw-agent-batch-100.json');
const TARGET = Number(process.argv[3] || 100);

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

function skillFrontmatterName(role, suffix) {
  return `${slugify(role.slug || role.name)}-${hash36(`${role.name}-${suffix}`)}`;
}

const skillBlueprints = [
  {
    suffix: '任务澄清与目标拆解',
    desc: (r) => `帮助${r.name}把模糊需求拆成目标、边界、输入、验收标准和下一步行动。`,
    outputs: ['需求澄清清单', '目标拆解表', '验收标准', '下一步行动列表'],
    steps: (r) => [
      `复述${r.name}收到的业务请求，标出目标、对象、场景、截止时间和已知限制。`,
      '列出缺失信息，用最多 8 个问题向用户确认优先级、约束、可用数据和交付格式。',
      `把任务拆成适合${r.category || '当前领域'}工作的 3 到 6 个子目标，每个子目标写清输入、动作和完成标志。`,
      '把风险、依赖和需要人工确认的事项单独列出，避免 agent 在信息不足时自行假设。',
      '输出一版可执行任务说明，供 TotalClaw-agent 后续调用其它工具或继续生成交付物。',
    ],
  },
  {
    suffix: '工作流规划与里程碑排期',
    desc: (r) => `为${r.name}生成可执行工作流、里程碑、责任分工和节奏安排。`,
    outputs: ['阶段计划', '里程碑表', '责任分工', '节奏检查点'],
    steps: (r) => [
      '确认任务周期、资源约束、协作对象、关键风险和必须优先完成的交付物。',
      `按照${r.name}的岗位职责，把工作划分为准备、执行、检查、交付和复盘阶段。`,
      '为每个阶段写出目标、输入、动作、负责人、预计耗时和完成证据。',
      '识别会阻塞后续工作的前置事项，并给出提前验证或并行推进的方法。',
      '输出适合放进项目管理工具或对话上下文的里程碑计划。',
    ],
  },
  {
    suffix: '信息收集与证据台账',
    desc: (r) => `指导${r.name}收集资料、记录来源、判断可信度并形成可复查证据台账。`,
    outputs: ['资料清单', '证据台账', '可信度判断', '待补资料列表'],
    steps: (r) => [
      '列出完成任务所需的内部资料、外部资料、历史记录、数据字段和干系人输入。',
      '为每类资料标注来源、更新时间、责任人、可信度、使用限制和是否含敏感信息。',
      `结合${r.category || '岗位'}场景，判断哪些资料足以支撑结论，哪些只能作为参考。`,
      '把缺失、冲突或过期信息汇总成待补资料列表，并给出向用户追问的模板。',
      '输出结构化台账，便于 TotalClaw-agent 在后续步骤中引用而不丢失上下文。',
    ],
  },
  {
    suffix: '方案生成与备选比较',
    desc: (r) => `让${r.name}生成多套方案，并从成本、收益、风险和执行难度进行比较。`,
    outputs: ['备选方案', '比较矩阵', '推荐方案', '取舍说明'],
    steps: (r) => [
      '明确决策目标和约束条件，例如预算、时间、质量、合规、团队能力或用户体验。',
      `围绕${r.name}的典型职责生成 2 到 4 个可执行方案，避免只给单一答案。`,
      '从价值、成本、实施难度、依赖、风险、可逆性和验证方式比较每个方案。',
      '指出推荐方案以及不推荐其它方案的原因，保留适用前提和反例。',
      '把最终建议写成用户可直接批准、修改或继续追问的格式。',
    ],
  },
  {
    suffix: '质量检查与风险复核',
    desc: (r) => `帮助${r.name}在交付前检查质量、遗漏、风险、合规和用户预期偏差。`,
    outputs: ['质量检查表', '风险清单', '修正建议', '放行结论'],
    steps: (r) => [
      '读取当前交付物或计划，先判断它是否满足用户原始目标和验收标准。',
      `按${r.name}的专业视角检查准确性、完整性、可执行性、表达清晰度和边界条件。`,
      '列出高风险问题、一般问题和可选优化，分别给出影响和修正建议。',
      '检查是否有未授权承诺、未经验证的数据、过度推断或遗漏的干系人。',
      '输出放行结论：可交付、需小修、需重做，并说明原因。',
    ],
  },
  {
    suffix: '自动化提示词与工具调用清单',
    desc: (r) => `把${r.name}的重复工作转成 TotalClaw-agent 可执行提示词、工具清单和检查步骤。`,
    outputs: ['自动化提示词', '工具调用计划', '输入字段模板', '执行检查点'],
    steps: (r) => [
      '识别任务中可以自动化的重复动作、固定判断、资料整理、格式转换和报告生成环节。',
      '定义每次运行必须提供的输入字段，包括目标、数据来源、限制、输出格式和质量标准。',
      `为${r.name}写出 TotalClaw-agent 可直接使用的主提示词，要求结果结构稳定、可复核。`,
      '列出可能需要的工具类型，例如文件读取、网页检索、表格处理、代码执行或接口调用。',
      '补充执行后的检查点，确保自动化结果不会绕过人工确认或业务约束。',
    ],
  },
  {
    suffix: '交付物撰写与汇报',
    desc: (r) => `帮助${r.name}把分析过程转成清晰、可交付、适合不同受众的汇报材料。`,
    outputs: ['汇报大纲', '正式文本', '摘要版本', '行动项列表'],
    steps: (r) => [
      '确认汇报对象、阅读时间、需要做出的决策、必须呈现的数据和不应展开的细节。',
      `用${r.name}的岗位语言组织内容：背景、目标、发现、依据、建议、风险和下一步。`,
      '把复杂信息拆成标题、要点、证据和结论，避免长段堆叠。',
      '分别生成管理层摘要和执行层行动项，确保不同受众都能理解下一步。',
      '在结尾列出待确认问题、责任人、时间节点和复盘方式。',
    ],
  },
  {
    suffix: '复盘沉淀与知识库更新',
    desc: (r) => `让${r.name}把完成的任务沉淀为复盘、模板、检查清单和可复用知识。`,
    outputs: ['复盘记录', '经验清单', '可复用模板', '知识库条目'],
    steps: (r) => [
      '回顾任务目标、实际结果、偏差、关键决策和影响最终质量的因素。',
      '区分可复用经验、一次性背景、失败教训和需要团队同步的流程问题。',
      `为${r.name}整理一份下次可直接复用的模板，包括输入、步骤、输出和检查项。`,
      '标记哪些内容适合进入知识库，哪些涉及敏感信息不能沉淀或需要脱敏。',
      '输出复盘结论和改进动作，便于 TotalClaw-agent 在后续同类任务中调用。',
    ],
  },
];

function buildBody(role, blueprint) {
  const skillName = `${role.name}${blueprint.suffix}`;
  const skillSlug = skillFrontmatterName(role, blueprint.suffix);
  const tags = ['totalclaw-agent', '岗位技能', role.category || '通用岗位', role.name, blueprint.suffix];
  return [
    '---',
    `name: ${skillSlug}`,
    `description: "${blueprint.desc(role).replace(/"/g, '\\"')}"`,
    'version: 1.0.0',
    'author: TotalClaw',
    'metadata:',
    '  totalclaw:',
    `    role: "${role.name.replace(/"/g, '\\"')}"`,
    `    category: "${String(role.category || '通用岗位').replace(/"/g, '\\"')}"`,
    '    exposure:',
    '      runtime_visible: true',
    '      prompt_visible: true',
    '      user_invocable: true',
    '    tags:',
    ...tags.map((tag) => `      - "${String(tag).replace(/"/g, '\\"')}"`),
    '---',
    '',
    `# ${skillName}`,
    '',
    '## 何时使用',
    '',
    `${blueprint.desc(role)}当用户希望 TotalClaw-agent 以「${role.name}」身份推进任务、整理资料、生成方案或交付结果时加载本技能。`,
    '',
    '## 输入',
    '',
    '- 用户的原始目标或业务问题',
    '- 已有资料、链接、文件、数据表或上下文记录',
    '- 输出受众、格式、截止时间和质量要求',
    '- 约束条件：预算、工具权限、合规要求、禁止事项和人工确认点',
    '',
    '## 步骤',
    '',
    ...blueprint.steps(role).map((step, index) => `${index + 1}. ${step}`),
    '',
    '## 输出',
    '',
    ...blueprint.outputs.map((item) => `- ${item}`),
    '',
    '## 注意事项',
    '',
    '- 优先使用用户提供的事实和当前项目上下文，不要编造不存在的数据、政策或结论。',
    '- 需要调用工具、读取文件或访问外部系统时，先说明目的和预期产出。',
    '- 涉及付费闭源内容时，只在授权环境中使用，不把正文转发给未授权运行时。',
    '- 输出必须保留可复查依据、待确认问题和下一步行动，便于用户继续推进。',
    '',
  ].join('\n');
}

function buildSkills(role) {
  return skillBlueprints.map((blueprint) => ({
    name: `${role.name}${blueprint.suffix}`,
    desc: blueprint.desc(role),
    paid: true,
    tags: ['totalclaw-agent', role.category || '通用岗位', blueprint.suffix],
    body: buildBody(role, blueprint),
  }));
}

async function selectRoles(skills) {
  const skillTags = new Set(await skills.distinct('tags', { kind: 'skill' }));
  const undone = await skills.find(
    { kind: 'role', skillsDone: { $ne: true }, category: { $nin: ['安全与风控', '网络安全攻防'] } },
    { projection: { _id: 0, name: 1, slug: 1, category: 1 } },
  ).toArray();
  const uncovered = undone.filter((role) => !skillTags.has(role.name));
  const catCounts = uncovered.reduce((acc, role) => {
    const cat = role.category || 'other';
    acc.set(cat, (acc.get(cat) || 0) + 1);
    return acc;
  }, new Map());
  uncovered.sort((a, b) => {
    const ca = catCounts.get(a.category || 'other') || 0;
    const cb = catCounts.get(b.category || 'other') || 0;
    return cb - ca || String(a.category || '').localeCompare(String(b.category || ''), 'zh') || a.name.localeCompare(b.name, 'zh');
  });
  const picked = [];
  const seen = new Set();
  for (const role of uncovered) {
    if (picked.length >= TARGET) break;
    if (seen.has(role.name)) continue;
    seen.add(role.name);
    picked.push(role);
  }
  return { picked, totalUncovered: uncovered.length };
}

async function main() {
  loadEnv();
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/totalclaw');
  await client.connect();
  const skills = client.db().collection('skills');
  const { picked, totalUncovered } = await selectRoles(skills);
  if (picked.length < TARGET) {
    throw new Error(`only selected ${picked.length}/${TARGET} uncovered roles`);
  }
  const batch = picked.map((role) => ({
    role: role.name,
    roleSlug: role.slug,
    category: role.category,
    skills: buildSkills(role),
  }));
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(batch, null, 2));
  const dist = picked.reduce((acc, role) => {
    acc[role.category || 'other'] = (acc[role.category || 'other'] || 0) + 1;
    return acc;
  }, {});
  console.log(JSON.stringify({ out: OUT, selectedRoles: picked.length, generatedSkills: batch.reduce((n, r) => n + r.skills.length, 0), totalUncoveredBeforePick: totalUncovered, dist }, null, 2));
  await client.close();
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = {
  buildSkills,
  hash36,
  skillFrontmatterName,
};
