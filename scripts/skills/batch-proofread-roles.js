'use strict';

/**
 * 批量校对角色技能（Claude agent 管线，不调用 DeepSeek）。
 *
 * 与「仅打标记」不同，本脚本对每个角色执行：
 *  1. 角色-技能映射校验（8 条 suffix、frontmatter role/category、skill name）
 *  2. 乱码扫描与修复（U+FFFD）
 *  3. 结构/红线/可用性审计（章节、职责锚定、P0、generic meta 等）
 *  5. 映射/乱码：轻量修复；结构/可用性/对齐/P0 不通过 → blueprint 重抛光（最多 2 轮）
 *  6. 复审计全部通过后标记 claude-author v1.6.1 + proofreadValidated
 *
 * 用法：
 *   node scripts/skills/batch-proofread-roles.js --from-manifest batch-003 --apply --full
 *   node scripts/skills/batch-proofread-roles.js --from-manifest batch-004 --apply --full --redo
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { buildSkillsForRole } = require('./polish-role-skills');
const { dutiesFromTitle } = require('./role-duty-helpers');
const { patchBodyWithSections } = require('./patch-pilot-sections');
const {
  fixEncoding,
  extractRoleFromMd,
  extractBody,
  extractFrontmatter,
  proofreadBody,
  hasCorruption,
} = require('./lib/proofread-body');
const {
  SUFFIXES,
  auditSkill,
  auditRoleSet,
  auditRoleGroup,
  flattenIssues,
  isPassing,
  categorizeIssues,
} = require('./lib/proofread-audit');

loadEnv();

const BATCH_BY = 'complete-totalclaw-agent-role-skills';
const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1];
  return d;
};

function loadManifest(batchRef) {
  const id = batchRef.replace(/^batch-/, '');
  const p = batchRef.includes('/')
    ? path.resolve(batchRef)
    : path.resolve(__dirname, `../../data/skills/proofread-batches/batch-${id}/manifest.json`);
  if (!fs.existsSync(p)) throw new Error('缺 manifest: ' + p);
  const m = JSON.parse(fs.readFileSync(p, 'utf8'));
  return { path: p, roles: (m.角色 || []).map((r) => ({ name: r.name, category: r.category })), meta: m };
}

async function scanRoleGroups(col) {
  const groups = new Map();
  const cur = col.find(
    { kind: 'skill', 'securityAudit.programmatic.by': BATCH_BY },
    { projection: { name: 1, category: 1, version: 1, contentMd: 1, 'securityAudit.programmatic': 1 } },
  );
  while (await cur.hasNext()) {
    const d = await cur.next();
    const role = extractRoleFromMd(d.contentMd) || '';
    const cat = d.category || /category:\s*"([^"]+)"/.exec(d.contentMd || '')?.[1] || '';
    if (!role || !cat) continue;
    const key = `${role}@${cat}`;
    if (!groups.has(key)) {
      groups.set(key, { name: role, category: cat, total: 0, validated: 0, corrupt: 0 });
    }
    const g = groups.get(key);
    g.total++;
    const sa = d.securityAudit?.programmatic || {};
    if (sa.proofreadValidated || sa.proofreadBatch === '001') g.validated++;
    if (hasCorruption(d.name) || hasCorruption(d.contentMd)) g.corrupt++;
  }
  return groups;
}

function pickRoles(groups, limit) {
  return [...groups.values()]
    .filter((g) => g.validated < g.total && g.total >= 8)
    .sort((a, b) => (b.corrupt - a.corrupt) || (a.validated - b.validated) || a.name.localeCompare(b.name, 'zh'))
    .slice(0, limit)
    .map(({ name, category }) => ({ name, category }));
}

async function resolveCanonicalRoleName(col, roleName, category) {
  if (!hasCorruption(roleName)) return roleName;
  const roles = await col.find({ kind: 'role', category }, { projection: { name: 1 } }).toArray();
  const clean = roles.filter((r) => !hasCorruption(r.name));
  const tail = roleName.replace(/[\uFFFD\s\d]+/g, '');
  for (const r of clean) {
    if (r.name === fixEncoding(roleName)) return r.name;
    if (tail.length >= 2 && (r.name.includes(tail.slice(-4)) || tail.includes(r.name.slice(0, 3)))) return r.name;
  }
  return fixEncoding(roleName);
}

async function findSkill(col, roleName, category, suffix) {
  for (const n of [...new Set([`${roleName}${suffix}`, `${fixEncoding(roleName)}${suffix}`])]) {
    const doc = await col.findOne({
      kind: 'skill',
      'securityAudit.programmatic.by': BATCH_BY,
      category,
      name: n,
    });
    if (doc) return doc;
  }
  return null;
}

function assembleMd(fm, skillName, body) {
  return `${fm}\n\n# ${skillName}\n\n${body}\n`;
}

function syncTagsInFrontmatter(fm, canonicalRole, category, suffix) {
  let out = fixEncoding(fm);
  out = out.replace(/role:\s*"[^"]+"/, `role: "${canonicalRole}"`);
  out = out.replace(/category:\s*"[^"]+"/, `category: "${category}"`);
  const required = ['totalclaw-agent', '岗位技能', category, canonicalRole, suffix];
  for (const tag of required) {
    if (!new RegExp(`-\\s*"${tag.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(out)) {
      out = out.replace(/(tags:\s*\n(?:\s+-\s*"[^"]+"\s*\n)+)/, (m) => `${m}      - "${tag}"\n`);
    }
  }
  return out;
}

function lightFixDoc(doc, canonicalRole, category, suffix) {
  const origFm = extractFrontmatter(doc.contentMd);
  if (!origFm) return null;
  const fmFixed = syncTagsInFrontmatter(origFm, canonicalRole, category, suffix);
  let body = proofreadBody(extractBody(doc.contentMd), canonicalRole, suffix);
  body = patchBodyWithSections(body, canonicalRole) || body;
  const skillName = `${canonicalRole}${suffix}`;
  return {
    _id: doc._id,
    skillId: doc.skillId,
    name: fixEncoding(skillName),
    description: fixEncoding(doc.description || ''),
    contentMd: assembleMd(fmFixed, skillName, body),
    suffix,
    category,
  };
}

function applyPolish(existing, polished, canonicalRole) {
  const updates = new Map();
  for (const u of polished) {
    const ex = existing.find((e) => String(e._id) === String(u._id));
    if (!ex) continue;
    const origFm = extractFrontmatter(ex.contentMd);
    if (!origFm) continue;
    let body = proofreadBody(extractBody(u.contentMd), canonicalRole, ex.suffix);
    body = patchBodyWithSections(body, canonicalRole) || body;
    const fmFixed = fixEncoding(origFm).replace(/role:\s*"[^"]+"/, `role: "${canonicalRole}"`);
    const skillName = `${canonicalRole}${ex.suffix}`;
    updates.set(ex.suffix, {
      _id: u._id,
      skillId: ex.skillId,
      name: skillName,
      description: u.description,
      contentMd: assembleMd(fmFixed, skillName, body),
      suffix: ex.suffix,
      category: ex.category,
    });
  }
  return updates;
}

function auditDocs(docs, roleDoc, canonicalRole, category, setIssues, roleIssues) {
  const out = { roleIssues, setIssues, skills: [], allPass: setIssues.length === 0 && roleIssues.length === 0 };
  for (const d of docs) {
    const audit = auditSkill(d, roleDoc, canonicalRole, category, d.suffix);
    audit.set = setIssues;
    const pass = isPassing(audit, roleIssues);
    out.skills.push({ suffix: d.suffix, pass, issues: flattenIssues(audit), audit });
    if (!pass) out.allPass = false;
  }
  return out;
}

async function proofreadRole(col, roleDoc, canonicalRole, category, batchNo, { apply, full, redo }) {
  const result = {
    role: canonicalRole,
    category,
    skills: [],
    roleIssues: [],
    setIssues: [],
    passed: false,
    fixed: false,
    repolished: false,
    fixSummary: { mapping: 0, corruption: 0, repolish: 0, alignment: 0 },
  };

  const existing = [];
  for (const suffix of SUFFIXES) {
    const doc = await findSkill(col, canonicalRole, category, suffix);
    if (!doc) {
      result.skills.push({ suffix, status: 'missing' });
      return result;
    }
    existing.push({ ...doc, suffix, category });
  }

  if (!redo && existing.every((d) => d.securityAudit?.programmatic?.proofreadValidated === true)) {
    result.skills = existing.map((d) => ({ suffix: d.suffix, pass: true, skipped: true }));
    result.passed = true;
    return result;
  }

  result.setIssues = auditRoleSet(existing, canonicalRole, category, roleDoc);
  const beforeFlat = [];
  for (const d of existing) {
    beforeFlat.push(...flattenIssues(auditSkill(d, roleDoc, canonicalRole, category, d.suffix)));
  }
  beforeFlat.push(...result.setIssues);

  // 阶段1：映射 + 乱码轻量修复
  let docs = [];
  for (const d of existing) {
    const fixed = lightFixDoc(d, canonicalRole, category, d.suffix);
    if (!fixed) {
      result.skills.push({ suffix: d.suffix, status: 'no-frontmatter' });
      return result;
    }
    docs.push(fixed);
  }
  if (beforeFlat.some((i) => i.startsWith('corrupt-'))) result.fixSummary.corruption++;
  if (beforeFlat.some((i) => i.includes('mismatch') || i.startsWith('tag-'))) result.fixSummary.mapping++;

  let roleIssues = auditRoleGroup(roleDoc, docs, canonicalRole, category);
  let audit = auditDocs(docs, roleDoc, canonicalRole, category, result.setIssues, roleIssues);

  // 至少 1 轮重抛光（从角色文档补充/修复正文），不通过再第 2 轮
  for (let round = 0; round < 2; round++) {
    const mustRepolish = full || round === 0 || !audit.allPass;
    if (!mustRepolish) break;

    result.fixed = true;
    result.repolished = true;
    result.fixSummary.repolish++;
    const titleDuties = dutiesFromTitle(canonicalRole, category);
    const { updates: polished } = buildSkillsForRole(roleDoc, existing, {
      blueprintAware: true,
      usabilityV2: true,
      titleDuties,
    });
    if (polished.length < 8) {
      result.skills.push({ suffix: '*', status: 'polish-incomplete', count: polished.length });
      return result;
    }
    const updateMap = applyPolish(existing, polished, canonicalRole);
    docs = SUFFIXES.map((s) => updateMap.get(s)).filter(Boolean);
    roleIssues = auditRoleGroup(roleDoc, docs, canonicalRole, category);
    audit = auditDocs(docs, roleDoc, canonicalRole, category, result.setIssues, roleIssues);
    if (audit.allPass && round === 0 && !full) break;
  }

  result.roleIssues = roleIssues;
  result.skills = audit.skills.map((s) => ({
    suffix: s.suffix,
    pass: s.pass,
    issues: s.issues,
  }));

  if (audit.skills.some((s) => s.issues.some((i) => i.includes('aligned')))) {
    result.fixSummary.alignment++;
  }

  result.passed = audit.allPass;

  if (apply) {
    for (const d of docs) {
      const sk = audit.skills.find((s) => s.suffix === d.suffix);
      const pass = sk?.pass;
      const $set = {
        name: d.name,
        contentMd: d.contentMd,
        description: fixEncoding(d.description || ''),
        descriptionZh: fixEncoding(d.description || ''),
        lastUpdated: new Date().toISOString(),
        'securityAudit.programmatic.proofreadBatch': batchNo,
      };
      if (pass) {
        Object.assign($set, {
          version: '1.6.1',
          'securityAudit.programmatic.refinedBy': 'claude-author',
          'securityAudit.programmatic.proofreadValidated': true,
          'securityAudit.programmatic.refinedAt': new Date().toISOString(),
          'securityAudit.programmatic.proofreadIssues': '',
        });
        await col.updateOne({ _id: d._id }, {
          $set,
          $unset: { 'securityAudit.programmatic.polishedBy': '' },
        });
      } else {
        Object.assign($set, {
          version: '1.5.2',
          'securityAudit.programmatic.polishedBy': 'proofread-fix-pending',
          'securityAudit.programmatic.proofreadIssues': (sk?.issues || []).join(';'),
        });
        await col.updateOne({ _id: d._id }, {
          $set,
          $unset: {
            'securityAudit.programmatic.refinedBy': '',
            'securityAudit.programmatic.proofreadValidated': '',
          },
        });
      }
    }
  }

  return result;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const dry = !apply;
  const full = process.argv.includes('--full');
  const redo = process.argv.includes('--redo');
  const batchNo = arg('batch', '002');
  const limit = Math.max(1, Number(arg('limit', 1000)));
  const fromManifest = arg('from-manifest', '');

  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  console.log(`模式: ${dry ? 'dry-run' : 'apply'} | 完整流程(重抛光): ${full ? '是' : '否'} | 强制重跑: ${redo ? '是' : '否'}`);
  let picked;
  let manifestPath;
  if (fromManifest) {
    const loaded = loadManifest(fromManifest);
    manifestPath = loaded.path;
    picked = loaded.roles;
    console.log(`从 manifest 加载 ${picked.length} 角色 → ${manifestPath}`);
  } else {
    const groups = await scanRoleGroups(col);
    picked = pickRoles(groups, limit);
    console.log(`自动选取 ${picked.length} 角色（limit=${limit}）`);
  }

  const outDir = path.resolve(__dirname, `../../data/skills/proofread-batches/batch-${batchNo}`);
  fs.mkdirSync(outDir, { recursive: true });

  let rolePass = 0;
  let roleFail = 0;
  let skillPass = 0;
  let skillFail = 0;
  let fixedRoles = 0;
  let missRole = 0;
  const failSamples = [];
  const auditReport = [];
  const issueStats = { mapping: 0, corruption: 0, structure: 0, usability: 0, alignment: 0, p0: 0, set: 0 };

  for (let i = 0; i < picked.length; i++) {
    const { name, category } = picked[i];
    if ((i + 1) % 50 === 0 || i === 0) console.log(`  [${i + 1}/${picked.length}] ${name}@${category}`);

    const roleDoc = await col.findOne({ kind: 'role', name, category })
      || await col.findOne({ kind: 'role', name: fixEncoding(name), category });
    if (!roleDoc) { missRole++; roleFail++; continue; }

    const canonicalRole = await resolveCanonicalRoleName(col, roleDoc.name, category);
    const r = await proofreadRole(col, roleDoc, canonicalRole, category, batchNo, { apply, full, redo });

    if (r.skills.some((s) => s.status === 'missing')) {
      roleFail++;
      failSamples.push({ role: canonicalRole, category, reason: '缺技能' });
      continue;
    }

    if (r.fixed) fixedRoles++;

    for (const s of r.skills) {
      if (s.issues) {
        const cats = categorizeIssues(s.issues);
        for (const [k, v] of Object.entries(cats)) issueStats[k] += v;
      }
    }

    const passed = r.skills.filter((s) => s.pass).length;
    const failed = r.skills.length - passed;
    skillPass += passed;
    skillFail += failed;

    if (r.passed) rolePass++;
    else {
      roleFail++;
      if (failSamples.length < 50) {
        failSamples.push({
          role: canonicalRole,
          category,
          roleIssues: r.roleIssues,
          skills: r.skills.filter((s) => !s.pass).map((s) => ({ suffix: s.suffix, issues: s.issues })),
        });
      }
    }

    if (auditReport.length < 5000) {
      auditReport.push({
        role: canonicalRole,
        category,
        passed: r.passed,
        setIssues: r.setIssues,
        roleIssues: r.roleIssues,
        repolished: r.repolished,
        fixSummary: r.fixSummary,
        skills: r.skills,
      });
    }
  }

  if (auditReport.length) {
    fs.writeFileSync(
      path.join(outDir, 'audit-report.jsonl'),
      auditReport.map((x) => JSON.stringify(x)).join('\n') + '\n',
      'utf8',
    );
  }

  const summary = {
    批次: batchNo,
    模式: dry ? 'dry-run' : 'apply',
    完整流程: full,
    强制重跑: redo,
    角色总数: picked.length,
    角色通过: rolePass,
    角色未通过: roleFail,
    缺角色文档: missRole,
    技能通过: skillPass,
    技能未通过: skillFail,
    重抛光角色数: fixedRoles,
    问题修复统计: issueStats,
    failSamples,
  };

  fs.writeFileSync(path.join(outDir, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');
  if (!fromManifest) {
    fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify({
      生成时间: new Date().toISOString(),
      批次: batchNo,
      角色数: picked.length,
      角色: picked.map(({ name, category }) => ({ name, category })),
    }, null, 2), 'utf8');
  }

  console.log(`\n完成。角色通过 ${rolePass}/${picked.length}，技能通过 ${skillPass}/${skillPass + skillFail}，修复/重抛光 ${fixedRoles} 角色`);
  console.log('问题统计:', JSON.stringify(issueStats));
  console.log('摘要 →', path.join(outDir, 'summary.json'));

  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { proofreadRole, loadManifest };
