'use strict';

/**
 * Generate OpenClaw-compatible SKILL.md files for the blocked security-role backlog.
 *
 * The source list lives outside this repo:
 *   ../ceshi/shop/weilai/被拦截角色-全量.json
 *
 * The generated skills are intentionally defensive/compliance-oriented. Roles marked
 * offensive get governance, authorization, scoping, reporting, and lessons-learned
 * workflows only; no exploit, intrusion, evasion, malware, or social-engineering
 * procedure is generated.
 */
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../..');
const DEFAULT_SOURCE = path.resolve(REPO_ROOT, '../ceshi/shop/weilai/被拦截角色-全量.json');
const DEFAULT_OUT = path.resolve(REPO_ROOT, 'openclaw-skills/weilai-security');

const sourceFile = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_SOURCE;
const outRoot = process.argv[3] ? path.resolve(process.argv[3]) : DEFAULT_OUT;

function asciiSlug(input) {
  const raw = String(input || '').toLowerCase();
  const basic = raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (basic.length >= 3) return basic.slice(0, 72);
  let h = 2166136261;
  for (const ch of String(input || '')) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return `role-${h.toString(36)}`;
}

function yamlQuote(value) {
  return `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function categoryLabel(category) {
  if (category === '网络安全攻防') return 'cyber defense';
  if (category === '安全与风控') return 'security risk';
  return 'security governance';
}

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

function useLine(type, role) {
  if (role.offensive) {
    return `Use when a ${role.name} request must be converted into an authorized, defensive, and reviewable security engagement plan without producing attack instructions.`;
  }
  const lines = {
    compliance: `Use when ${role.name} needs to prepare defensible security governance, audit evidence, privacy controls, or regulatory follow-up.`,
    response: `Use when ${role.name} needs to triage alerts, preserve evidence, coordinate incident response, or write a defensive investigation note.`,
    crypto: `Use when ${role.name} needs to manage cryptographic assets, key lifecycle evidence, certificates, or encryption control reviews.`,
    architecture: `Use when ${role.name} needs to review secure architecture, hardening posture, control ownership, and remediation tracking.`,
    physical: `Use when ${role.name} needs to assess physical security controls, monitoring coverage, access records, or safety handoff procedures.`,
    risk: `Use when ${role.name} needs to translate security signals into risk decisions, continuity plans, insurance evidence, or recovery actions.`,
    product: `Use when ${role.name} needs to define security product requirements, defensive telemetry, release readiness, or community coordination.`,
    operations: `Use when ${role.name} needs a defensive operating workflow for security review, control tracking, and stakeholder reporting.`,
  };
  return lines[type] || lines.operations;
}

function workflow(type, role) {
  if (role.offensive) {
    return [
      'Confirm written authorization, scope, assets, time window, data handling rules, and named approvers before doing any security work.',
      'Rewrite the request as a defensive engagement charter: objective, protected systems, allowed evidence, explicit exclusions, and stop conditions.',
      'Identify safe review inputs such as policy documents, asset inventory, prior findings, control attestations, logs already provided by the owner, and interview notes.',
      'Produce a risk register with severity rationale, business impact, control owner, remediation due date, and evidence required for closure.',
      'Escalate any request for exploit steps, credential misuse, bypass instructions, persistence, evasion, malware behavior, or social-engineering execution to a human security lead.',
      'Write a final report that includes scope, assumptions, defensive observations, recommended controls, residual risk, and follow-up checkpoints.',
    ];
  }
  const shared = [
    'Define the business context, protected assets, accountable owner, time window, and required output before collecting evidence.',
    'Gather only authorized material: policy records, system inventory, control configuration summaries, alert metadata, incident notes, tickets, and stakeholder input.',
  ];
  const byType = {
    compliance: [
      'Map each requirement to an internal control, evidence source, reviewer, status, and exception owner.',
      'Flag missing evidence, conflicting ownership, overdue remediation, and policy gaps without overstating compliance status.',
      'Draft an audit-ready summary with findings, corrective actions, due dates, and retained evidence references.',
    ],
    response: [
      'Classify the signal by impact, affected asset, confidence, containment status, and evidence quality.',
      'Preserve the timeline, involved systems, analyst decisions, and handoffs so the investigation remains reproducible.',
      'Recommend defensive containment, monitoring, recovery, and communication actions for owner approval.',
    ],
    crypto: [
      'Inventory keys, certificates, algorithms, expiry dates, ownership, rotation state, storage controls, and access paths.',
      'Check lifecycle gaps such as missing owners, stale certificates, weak policy exceptions, or incomplete rotation evidence.',
      'Prepare a rotation or remediation plan with validation checks and rollback criteria.',
    ],
    architecture: [
      'Review trust boundaries, network exposure, identity controls, logging coverage, backup posture, and change history at a high level.',
      'Prioritize hardening gaps by asset criticality, exploitability indicators, compensating controls, and operational risk.',
      'Create an owner-ready remediation backlog with acceptance criteria and verification evidence.',
    ],
    physical: [
      'Review access zones, camera or sensor coverage, alarm ownership, retention rules, visitor processes, and emergency contacts.',
      'Identify control gaps such as blind spots, stale access, missing maintenance records, or unclear escalation paths.',
      'Prepare a corrective-action plan with responsible teams, evidence to collect, and safety constraints.',
    ],
    risk: [
      'Translate technical or operational observations into likelihood, impact, control strength, and residual-risk language.',
      'Compare the issue against continuity, disaster recovery, insurance, vendor, or legal obligations as applicable.',
      'Produce a decision memo with options, tradeoffs, required approvals, and review cadence.',
    ],
    product: [
      'Define user need, abuse case, telemetry requirement, permission boundary, data retention, and support workflow.',
      'Convert security requirements into product acceptance criteria, rollout checks, documentation updates, and operational dashboards.',
      'Prepare release or community communication that avoids sensitive details while enabling defensive adoption.',
    ],
    operations: [
      'Turn observations into a queue of defensive tasks with owners, priority, status, dependencies, and verification evidence.',
      'Coordinate review with engineering, operations, legal, compliance, or business teams based on the affected control.',
      'Close the loop with a concise status report and next review date.',
    ],
  };
  return [...shared, ...(byType[type] || byType.operations)];
}

function outputSection(type, role) {
  if (role.offensive) {
    return [
      'Authorized engagement charter',
      'Defensive risk register',
      'Control and evidence checklist',
      'Human-review escalation note for unsafe requests',
      'Final governance report',
    ];
  }
  const outputs = {
    compliance: ['Control-to-evidence matrix', 'Audit finding summary', 'Exception and remediation tracker'],
    response: ['Incident triage note', 'Evidence timeline', 'Containment and recovery checklist'],
    crypto: ['Cryptographic asset inventory', 'Rotation plan', 'Expiry and ownership exceptions'],
    architecture: ['Secure architecture review note', 'Hardening backlog', 'Verification evidence checklist'],
    physical: ['Physical control review note', 'Access and monitoring gaps', 'Corrective-action tracker'],
    risk: ['Risk decision memo', 'Continuity or insurance evidence pack', 'Residual-risk register'],
    product: ['Security product requirement brief', 'Telemetry and support workflow', 'Release readiness checklist'],
    operations: ['Defensive operations checklist', 'Owner/action tracker', 'Stakeholder status summary'],
  };
  return outputs[type] || outputs.operations;
}

function buildSkill(role) {
  const type = roleType(role);
  const slug = `weilai-${asciiSlug(role.category)}-${asciiSlug(role.slug)}-${asciiSlug(role.name)}`;
  const displayName = `${role.name}防御工作流`;
  const title = `${role.name} Defensive Workflow`;
  const description = role.offensive
    ? `${role.name} defensive authorization, risk scoping, and reporting workflow.`
    : `${role.name} defensive operations, evidence review, and reporting workflow.`;
  const descriptionZh = role.offensive
    ? `${role.name}的授权边界、风险界定、合规复盘和报告工作流，不包含攻击操作步骤。`
    : `${role.name}的防御运营、证据审阅、控制跟踪和报告工作流。`;
  const tags = [
    'openclaw',
    'totalclaw',
    'weilai-security',
    role.category,
    role.name,
    role.offensive ? 'governance-only' : 'defensive',
    categoryLabel(role.category),
  ];
  const steps = workflow(type, role).map((step, index) => `${index + 1}. ${step}`).join('\n');
  const outputs = outputSection(type, role).map((item) => `- ${item}`).join('\n');
  const guardrails = role.offensive
    ? [
      'Do not provide exploitation, intrusion, evasion, persistence, credential abuse, malware, or social-engineering instructions.',
      'Do not convert this workflow into a playbook for attacking third-party systems.',
      'When the user asks for operational attack detail, stop and ask for a defensive, authorized scope instead.',
    ]
    : [
      'Keep the workflow defensive and evidence-based.',
      'Avoid sensitive implementation details that would enable misuse outside an authorized environment.',
      'Escalate legal, privacy, or public-disclosure questions to the responsible owner.',
    ];

  const frontmatter = [
    '---',
    `name: ${slug}`,
    `displayName: ${yamlQuote(displayName)}`,
    `description: ${yamlQuote(description)}`,
    `descriptionZh: ${yamlQuote(descriptionZh)}`,
    'metadata:',
    '  openclaw:',
    '    tags:',
    ...tags.map((tag) => `      - ${yamlQuote(tag)}`),
    `    roleName: ${yamlQuote(role.name)}`,
    `    roleSlug: ${yamlQuote(role.slug)}`,
    `    category: ${yamlQuote(role.category)}`,
    `    safetyMode: ${yamlQuote(role.offensive ? 'governance-only' : 'defensive')}`,
    '---',
    '',
  ].join('\n');

  const body = [
    `# ${title}`,
    '',
    useLine(type, role),
    '',
    'This skill turns the role backlog item into a safe OpenClaw workflow for the TotalClaw skill market. It is suitable for defensive review, governance, compliance, incident handling, control tracking, and stakeholder reporting.',
    '',
    '## Inputs',
    '',
    '- Authorized scope or business request',
    '- Asset, service, facility, process, or policy under review',
    '- Existing tickets, logs, policies, control summaries, or evidence supplied by the owner',
    '- Required output format, audience, deadline, and reviewer',
    '',
    '## Workflow',
    '',
    steps,
    '',
    '## Outputs',
    '',
    outputs,
    '',
    '## Guardrails',
    '',
    ...guardrails.map((line) => `- ${line}`),
    '',
    '## Done Criteria',
    '',
    '- Scope and assumptions are explicit.',
    '- Evidence sources are named without exposing secrets.',
    '- Recommendations are defensive, reviewable, and assigned to owners.',
    '- Unsafe or out-of-scope requests are documented and escalated.',
    '',
  ].join('\n');

  return { slug, content: frontmatter + body };
}

function main() {
  if (!fs.existsSync(sourceFile)) {
    throw new Error(`source file not found: ${sourceFile}`);
  }
  const roles = JSON.parse(fs.readFileSync(sourceFile, 'utf8'));
  if (!Array.isArray(roles)) throw new Error('source file must contain an array');
  fs.mkdirSync(outRoot, { recursive: true });

  const manifest = [];
  for (const role of roles) {
    const skill = buildSkill(role);
    const dir = path.join(outRoot, skill.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'SKILL.md'), skill.content);
    manifest.push({
      slug: skill.slug,
      role: role.name,
      roleSlug: role.slug,
      category: role.category,
      safetyMode: role.offensive ? 'governance-only' : 'defensive',
    });
  }
  fs.writeFileSync(
    path.join(outRoot, 'manifest.json'),
    JSON.stringify({ sourceFile, total: manifest.length, generatedAt: new Date().toISOString(), skills: manifest }, null, 2),
  );
  console.log(`[generate-weilai-openclaw-skills] generated ${manifest.length} skills in ${outRoot}`);
}

main();
