'use strict';

/**
 * Generate safe TotalClaw role-skill batch JSON for the blocked security-role backlog.
 *
 * Source list:
 *   ../ceshi/shop/weilai/被拦截角色-全量.json
 *
 * Output is consumed by:
 *   node scripts/skills/import-agent-skills.js <output.json>
 *
 * Roles marked offensive receive governance-only workflows: authorization,
 * defensive scope, evidence handling, risk reporting, and human escalation.
 */
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_SOURCE = path.resolve(REPO_ROOT, '../ceshi/shop/weilai/被拦截角色-全量.json');
const DEFAULT_OUT = path.resolve(REPO_ROOT, 'data/skills/weilai-totalclaw-skills.json');

const sourceFile = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_SOURCE;
const outFile = process.argv[3] ? path.resolve(process.argv[3]) : DEFAULT_OUT;

function roleType(role) {
  const text = `${role.category} ${role.name}`;
  if (role.offensive) return 'governance';
  if (/合规|审计|隐私|监管|法律|CCPA|国际合规|政府关系/.test(text)) return 'compliance';
  if (/取证|调查|事件响应|应急|告警|监控|SOC|NOC|情报|暗网|开源情报|勒索/.test(text)) return 'response';
  if (/密钥|证书|加密|密码|量子/.test(text)) return 'crypto';
  if (/云|容器|Kubernetes|DevOps|微服务|数据中心|网络|网关|防火墙|VPN|路由|交换|负载|5G|卫星|边缘|物联网|工控|汽车|无人机|自动驾驶|远程医疗|智慧城市|工业4/.test(text)) return 'architecture';
  if (/门禁|摄像|报警|控制室|物理|生物识别|环境监测/.test(text)) return 'physical';
  if (/风险|保险|理赔|连续性|灾/.test(text)) return 'risk';
  if (/开发|SDK|插件|代理|仪表板|产品|社区|公关|媒体/.test(text)) return 'product';
  return 'operations';
}

function workflow(type, role) {
  if (role.offensive) {
    return [
      '确认书面授权、业务目的、资产范围、时间窗口、数据处理规则和审批人，未确认前不开展任何技术性动作。',
      '把请求改写为防御性工作章程：目标、受保护系统、允许使用的证据、明确排除项、停止条件和升级联系人。',
      '只使用资产清单、策略文档、既有审计记录、控制证明、工单、访谈纪要和系统所有者主动提供的日志摘要。',
      '形成风险登记表，包含影响、可能性、控制现状、责任人、修复期限、关闭证据和复核时间。',
      '遇到漏洞利用、入侵、绕过、持久化、凭证滥用、恶意代码、社工执行等请求时，停止生成操作内容并升级给安全负责人。',
      '输出最终治理报告：范围、假设、观察、建议控制、残余风险、责任人和后续检查点。',
    ];
  }
  const shared = [
    '明确业务背景、受保护资产、责任人、时间窗口、输出受众和验收标准。',
    '收集授权范围内的材料：策略记录、系统清单、控制配置摘要、告警元数据、事件纪要、工单和干系人输入。',
  ];
  const byType = {
    compliance: [
      '把每条要求映射到内部控制、证据来源、复核人、当前状态和例外责任人。',
      '标记缺失证据、职责冲突、逾期整改和制度空白，避免夸大合规结论。',
      '整理审计摘要，包含发现、整改动作、截止日期和证据留存位置。',
    ],
    response: [
      '按影响范围、受影响资产、置信度、处置状态和证据质量给信号分级。',
      '保留时间线、相关系统、分析判断和交接记录，保证调查过程可复盘。',
      '给出防御性遏制、监控、恢复和沟通建议，等待责任人确认后执行。',
    ],
    crypto: [
      '盘点密钥、证书、算法、到期时间、责任人、轮换状态、存储控制和访问路径。',
      '识别缺失责任人、证书过期、弱算法例外、轮换证据不完整等生命周期风险。',
      '制定轮换或整改计划，写清验证方式、回滚条件和复核日期。',
    ],
    architecture: [
      '从高层审阅信任边界、网络暴露、身份权限、日志覆盖、备份状态和变更历史。',
      '按资产关键性、暴露程度、补偿控制和运维风险排列加固优先级。',
      '生成责任人可执行的整改待办，包含验收标准和证据要求。',
    ],
    physical: [
      '审阅访问区域、摄像或传感覆盖、报警归属、留存规则、访客流程和应急联系人。',
      '识别盲区、过期权限、维护记录缺失或升级路径不清等控制缺口。',
      '输出整改计划，写清责任团队、证据收集方式和安全约束。',
    ],
    risk: [
      '把技术或运营观察转换为可能性、影响、控制强度和残余风险语言。',
      '对照连续性、灾备、保险、供应商或法律义务判断业务影响。',
      '输出决策备忘录，包含选项、取舍、所需审批和复核节奏。',
    ],
    product: [
      '定义用户需求、滥用场景、遥测要求、权限边界、数据留存和支持流程。',
      '把安全要求转成产品验收标准、发布检查、文档更新和运营看板。',
      '准备发布或社区沟通材料，只提供防御采用所需信息，不暴露敏感细节。',
    ],
    operations: [
      '把观察转成防御任务队列，包含责任人、优先级、状态、依赖和验证证据。',
      '按受影响控制协调工程、运维、法务、合规或业务团队复核。',
      '用简明状态报告闭环，并安排下一次检查日期。',
    ],
  };
  return [...shared, ...(byType[type] || byType.operations)];
}

function outputs(type, role) {
  if (role.offensive) return ['授权工作章程', '防御性风险登记表', '控制与证据清单', '不安全请求升级记录', '最终治理报告'];
  const byType = {
    compliance: ['控制-证据矩阵', '审计发现摘要', '例外与整改跟踪表'],
    response: ['事件分诊记录', '证据时间线', '遏制与恢复检查清单'],
    crypto: ['密码资产清单', '轮换计划', '到期与责任例外列表'],
    architecture: ['安全架构审阅记录', '加固待办列表', '验证证据清单'],
    physical: ['物理控制审阅记录', '访问与监控缺口列表', '整改跟踪表'],
    risk: ['风险决策备忘录', '连续性或保险证据包', '残余风险登记表'],
    product: ['安全产品需求简报', '遥测与支持流程', '发布就绪检查清单'],
    operations: ['防御运营检查清单', '责任人与动作跟踪表', '干系人状态摘要'],
  };
  return byType[type] || byType.operations;
}

function buildBody(role) {
  const type = roleType(role);
  const steps = workflow(type, role).map((step, index) => `${index + 1}. ${step}`).join('\n');
  const out = outputs(type, role).map((item) => `- ${item}`).join('\n');
  const guardrails = role.offensive
    ? [
      '不提供漏洞利用、入侵、绕过、持久化、凭证滥用、恶意代码或社工执行步骤。',
      '不把本技能改写成攻击第三方系统的操作手册。',
      '用户索要攻击性细节时，停止并要求改为防御、授权、治理范围。',
    ]
    : [
      '保持防御、合规和证据导向。',
      '避免输出会被非授权环境复用的敏感实施细节。',
      '涉及法律、隐私、披露或对外沟通时升级给责任人。',
    ];
  return [
    `# ${role.name}防御工作流`,
    '',
    '## 何时使用',
    '',
    role.offensive
      ? `当「${role.name}」相关需求需要被转化为授权边界、风险界定、合规复盘和报告工作流时使用。本技能不生成攻击操作步骤。`
      : `当「${role.name}」需要进行防御运营、证据审阅、控制跟踪、响应协作或干系人报告时使用。`,
    '',
    '## 输入',
    '',
    '- 授权范围或业务请求',
    '- 受保护的资产、服务、设施、流程或策略',
    '- 系统所有者提供的工单、日志摘要、策略、控制说明或历史证据',
    '- 输出受众、截止时间、复核人和期望格式',
    '',
    '## 步骤',
    '',
    steps,
    '',
    '## 输出',
    '',
    out,
    '',
    '## 注意事项',
    '',
    ...guardrails.map((line) => `- ${line}`),
    '- 所有结论都要写清范围、假设、证据来源、责任人和复核日期。',
    '',
  ].join('\n');
}

function main() {
  if (!fs.existsSync(sourceFile)) throw new Error(`source file not found: ${sourceFile}`);
  const roles = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
  if (!Array.isArray(roles)) throw new Error('source file must contain an array');
  const batch = roles.map((role) => ({
    role: role.name,
    roleSlug: role.slug,
    category: role.category,
    skills: [{
      name: `${role.name}防御工作流`,
      desc: role.offensive
        ? `${role.name}的授权边界、风险界定、合规复盘和报告工作流。`
        : `${role.name}的防御运营、证据审阅、控制跟踪和报告工作流。`,
      paid: true,
      tags: [role.category, role.offensive ? '治理限定' : '防御运营'],
      body: buildBody(role),
    }],
  }));
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, JSON.stringify(batch, null, 2));
  console.log(`[generate-weilai-totalclaw-skills] generated ${batch.length} role entries -> ${outFile}`);
}

main();
