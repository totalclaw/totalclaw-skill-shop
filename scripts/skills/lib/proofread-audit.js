'use strict';

const { classifyP0, extractKeyDuties } = require('../scan-p0-role-skills');
const {
  DEV_DUTY, isDevRoleTitle, isGenericDuty, dutyIsAnchored, dutiesFromTitle,
} = require('../role-duty-helpers');
const { hasRedLine, buildProfile } = require('../polish-role-skills');
const {
  fixEncoding, extractRoleFromMd, extractBody, hasCorruption,
} = require('./proofread-body');

const SUFFIXES = [
  '任务澄清与目标拆解', '工作流规划与里程碑排期', '信息收集与证据台账', '方案生成与备选比较',
  '质量检查与风险复核', '自动化提示词与工具调用清单', '交付物撰写与汇报', '复盘沉淀与知识库更新',
];

const REQUIRED_SECTIONS = [
  '何时使用', '适用角色与场景', '输入', '步骤', '输出',
  '边界与约束', '失败模式与规避', '质量标准与验收', '安全与合规', '示例', '注意事项',
];

const GENERIC_STEP = '列出缺失信息，用最多 8 个问题';

function auditSkillMapping(doc, canonicalRole, category, suffix) {
  const issues = [];
  const fmRole = extractRoleFromMd(doc.contentMd);
  const fmCat = /category:\s*"([^"]+)"/.exec(doc.contentMd || '')?.[1] || doc.category || '';
  const expectedName = `${canonicalRole}${suffix}`;

  if (doc.name !== expectedName && fixEncoding(doc.name) !== expectedName) {
    issues.push(`name-mismatch:期望${expectedName}实际${doc.name}`);
  }
  if (fmRole !== canonicalRole && fixEncoding(fmRole) !== canonicalRole) {
    issues.push(`fm-role-mismatch:${fmRole}`);
  }
  if (fmCat !== category) issues.push(`fm-category-mismatch:${fmCat}`);
  const h1 = (doc.contentMd || '').match(/^#\s+(.+)$/m)?.[1];
  if (h1 && h1 !== expectedName && fixEncoding(h1) !== expectedName) {
    issues.push(`h1-mismatch:${h1}`);
  }
  const tagsBlock = /tags:\s*\n((?:\s+-\s*"[^"]+"\s*\n)+)/.exec(doc.contentMd || '');
  if (tagsBlock) {
    const tags = [...tagsBlock[1].matchAll(/-\s*"([^"]+)"/g)].map((m) => m[1]);
    if (!tags.includes(canonicalRole)) issues.push('tag-missing-role');
    if (!tags.includes(category)) issues.push('tag-missing-category');
    if (!tags.includes('岗位技能')) issues.push('tag-missing-岗位技能');
    if (!tags.includes('totalclaw-agent')) issues.push('tag-missing-totalclaw-agent');
  } else {
    issues.push('tags-missing');
  }
  return issues;
}

function auditRoleSet(existing, canonicalRole, category, roleDoc) {
  const issues = [];
  if (existing.length !== 8) issues.push(`skill-count:${existing.length}`);
  const suffixes = existing.map((s) => s.suffix);
  const missing = SUFFIXES.filter((s) => !suffixes.includes(s));
  if (missing.length) issues.push(`missing-suffix:${missing.join(',')}`);
  const seen = new Set();
  for (const s of suffixes) {
    if (seen.has(s)) issues.push(`duplicate-suffix:${s}`);
    seen.add(s);
  }
  if (!roleDoc) issues.push('missing-role-doc');
  else {
    if (roleDoc.category && roleDoc.category !== category) issues.push('role-doc-category-mismatch');
    const docName = fixEncoding(roleDoc.name);
    if (docName !== canonicalRole) issues.push(`role-doc-name:${roleDoc.name}`);
  }
  const ids = existing.map((s) => s.skillId).filter(Boolean);
  if (ids.length !== new Set(ids).size) issues.push('duplicate-skillId');
  return issues;
}

function auditCorruption(doc) {
  const issues = [];
  if (hasCorruption(doc.name)) issues.push('corrupt-name');
  if (hasCorruption(doc.contentMd)) issues.push('corrupt-content');
  if (hasCorruption(doc.description)) issues.push('corrupt-desc');
  return issues;
}

function auditStructure(body) {
  const issues = [];
  if (!body || body.length < 400) issues.push('body-too-short');
  for (const sec of REQUIRED_SECTIONS) {
    if (!new RegExp(`^##\\s*${sec}`, 'm').test(body)) issues.push(`missing-section:${sec}`);
  }
  if (!/^\s*1\.\s/m.test(body)) issues.push('steps-not-numbered');
  const red = hasRedLine(body);
  if (red.length) issues.push(`redline:${red.join(',')}`);
  return issues;
}

function auditUsability(body, roleName) {
  const issues = [];
  if (body.includes(GENERIC_STEP)) issues.push('generic-meta-step');
  const exSec = body.match(/## 示例[\s\S]*?(?=\n## |$)/)?.[0] || '';
  if (/用户提出一个与「/.test(exSec) && !/例：|例如|样例/.test(exSec)) issues.push('skeleton-example');
  const duties = extractKeyDuties(body);
  if (!isDevRoleTitle(roleName) && duties.some((x) => DEV_DUTY.test(x))) issues.push('dev-duty-leak');
  if (!isDevRoleTitle(roleName) && duties.some((x) => isGenericDuty(x))) issues.push('generic-duty');
  if (duties.length && !duties.some((x) => dutyIsAnchored(roleName, x))) issues.push('duty-not-anchored');
  const core = roleName.replace(/(工程师|架构师|设计师|分析师|工程|师|员|经理|专员|主管|总监|顾问|代表|专家|官|长|助理|策划|运营|开发|测试)$/, '').trim();
  if (!body.includes(roleName) && !(core.length >= 2 && body.includes(core))) issues.push('role-not-in-body');
  return issues;
}

function auditContentAlignment(body, roleDoc, canonicalRole, category) {
  const issues = [];
  if (!roleDoc) return issues;
  const profile = buildProfile(roleDoc);
  if (profile.relevant && profile.responsibilities.length) {
    const hit = profile.responsibilities.some((r) => {
      const token = String(r).slice(0, Math.min(6, String(r).length));
      return token.length >= 2 && body.includes(token);
    });
    if (!hit && !body.includes(category)) issues.push('content-not-aligned-to-role');
  }
  const titleDuties = dutiesFromTitle(canonicalRole, category);
  if (titleDuties.length && !titleDuties.some((d) => body.includes(d.slice(0, 4)))) {
    issues.push('title-duty-not-reflected');
  }
  return issues;
}

function auditRoleGroup(roleDoc, skills, canonicalRole, category) {
  const sampleMd = skills[0]?.contentMd || '';
  const duties = extractKeyDuties(sampleMd);
  const p0 = classifyP0(canonicalRole, category, duties, roleDoc);
  return p0.length ? [`p0:${p0.join('|')}`] : [];
}

function auditSkill(doc, roleDoc, canonicalRole, category, suffix) {
  const body = extractBody(doc.contentMd);
  return {
    mapping: auditSkillMapping(doc, canonicalRole, category, suffix),
    corruption: auditCorruption(doc),
    structure: auditStructure(body),
    usability: auditUsability(body, canonicalRole),
    alignment: auditContentAlignment(body, roleDoc, canonicalRole, category),
  };
}

function flattenIssues(audit) {
  return [
    ...(audit.set || []),
    ...audit.mapping,
    ...audit.corruption,
    ...audit.structure,
    ...audit.usability,
    ...(audit.alignment || []),
  ];
}

function isPassing(audit, roleIssues = []) {
  return flattenIssues(audit).length === 0 && roleIssues.length === 0;
}

function categorizeIssues(flat) {
  const cats = { mapping: 0, corruption: 0, structure: 0, usability: 0, alignment: 0, p0: 0, set: 0 };
  for (const i of flat) {
    if (i.startsWith('p0:')) cats.p0++;
    else if (i.includes('mismatch') || i.startsWith('tag-') || i.startsWith('tags-') || i.startsWith('h1-')) cats.mapping++;
    else if (i.startsWith('corrupt-')) cats.corruption++;
    else if (i.startsWith('missing-section') || i === 'body-too-short' || i.startsWith('steps-') || i.startsWith('redline')) cats.structure++;
    else if (i.startsWith('skill-count') || i.startsWith('missing-suffix') || i.startsWith('duplicate-') || i.startsWith('role-doc') || i.startsWith('missing-role')) cats.set++;
    else if (i.includes('aligned') || i.includes('duty-not-reflected')) cats.alignment++;
    else cats.usability++;
  }
  return cats;
}

module.exports = {
  SUFFIXES,
  REQUIRED_SECTIONS,
  auditSkill,
  auditRoleSet,
  auditRoleGroup,
  auditSkillMapping,
  auditCorruption,
  auditStructure,
  auditUsability,
  auditContentAlignment,
  flattenIssues,
  isPassing,
  categorizeIssues,
};
