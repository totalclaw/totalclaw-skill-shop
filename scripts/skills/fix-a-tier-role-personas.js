'use strict';

/**
 * 修复 A 级高危错配角色的人格（kind:role）。
 * 策略：全族聚类择优 → 锚定岗位名渲染 → 仍不匹配则 name-aware 兜底。
 *
 * 用法：
 *   node scripts/skills/fix-a-tier-role-personas.js --dry --limit 20
 *   node scripts/skills/fix-a-tier-role-personas.js --apply
 *   node scripts/skills/fix-a-tier-role-personas.js --apply --category 服装与时尚
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const {
  FAMILIES, profileMap, validateRole,
  LEVEL_PERSONA, LEVEL_EMOJI, COLOR_POOL, seedOf, mulberry32, pick, shuffled,
} = require('../roles/render-v2');
const { buildProfile, isProfileRelevant, extractResponsibilities } = require('./polish-role-skills');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const AUDIT = path.resolve(__dirname, '../../data/skills/role-skill-mismatch-audit.json');

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i !== -1 ? process.argv[i + 1] : d; };
const FLAG = (k) => process.argv.includes(`--${k}`);

function loadATierRoles() {
  const audit = JSON.parse(fs.readFileSync(AUDIT, 'utf8'));
  const catFilter = arg('category');
  const roles = [];
  for (const [category, info] of Object.entries(audit['A级高危错配_按品类'] || {})) {
    if (catFilter && category !== catFilter) continue;
    for (const name of info.角色) roles.push({ name, category });
  }
  const limit = Number(arg('limit', 0));
  return limit ? roles.slice(0, limit) : roles;
}

/** 扫描 complete 批次中 buildProfile.relevant=false 的剩余角色 */
async function loadRemainingIrrelevantRoles(col) {
  const BATCH_BY = 'complete-totalclaw-agent-role-skills';
  const cur = col.find({ kind: 'skill', 'securityAudit.programmatic.by': BATCH_BY }, { projection: { contentMd: 1 } });
  const groups = new Map();
  while (await cur.hasNext()) {
    const d = await cur.next();
    const m = /role:\s*"([^"]+)"/.exec(d.contentMd || '');
    const cm = /category:\s*"([^"]+)"/.exec(d.contentMd || '');
    if (m) {
      const k = `${m[1]}|||${cm ? cm[1] : ''}`;
      if (!groups.has(k)) groups.set(k, { name: m[1], category: cm ? cm[1] : '' });
    }
  }
  const roles = [];
  for (const r of groups.values()) {
    const role = await col.findOne({ kind: 'role', name: r.name, category: r.category }, { projection: { name: 1, category: 1, description: 1, contentMd: 1 } });
    if (!role) continue;
    const prof = buildProfile(role);
    if (!prof.relevant) roles.push({ name: r.name, category: r.category });
  }
  const limit = Number(arg('limit', 0));
  return limit ? roles.slice(0, limit) : roles;
}

function genericKey(pmap) {
  return Object.keys(pmap).find((k) => k.endsWith('-generic')) || Object.keys(pmap)[0];
}

function pickBestCluster(title, category) {
  let best = null;
  for (const [famKey, fam] of Object.entries(FAMILIES)) {
    const cl = fam.clusters.clusterOf(title);
    const pmap = profileMap(fam);
    const profKey = pmap[cl.key] ? cl.key : genericKey(pmap);
    if (!pmap[profKey]) continue;
    let score = cl.fallback ? 0 : 100;
    const cats = fam.clusters.CATEGORIES || fam.clusters.DEV_CATEGORIES || [];
    if (cats.includes(category)) score += 40;
    for (const o of (fam.owns || [])) {
      if (title.toLowerCase().includes(o.toLowerCase())) score += 12;
    }
    const cand = { famKey, fam, cl, pmap, profKey, score };
    if (!best || cand.score > best.score) best = cand;
  }
  return best;
}

function levelOf(title) {
  const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/);
  return m ? m[1] : '中级';
}

function dutiesFromTitle(title, category) {
  const rules = [
    [/设计/, [
      `理解${category}业务与${title}的设计需求，输出可评审的方案与稿面`,
      `跟进打样、改稿与评审，确保设计符合品牌/产品/工艺约束`,
      `沉淀设计规范、素材与版本，支持后续量产或上线`,
      `与产品、供应链或内容团队对齐设计落地与验收标准`,
    ]],
    [/工程|开发|架构/, [
      `分析${title}相关需求，制定技术方案并拆解可执行任务`,
      `完成核心模块设计、实现与联调，保障质量与可维护性`,
      `编写必要文档，参与代码/方案评审与问题排查`,
      `跟踪上线与运行指标，持续优化性能与稳定性`,
    ]],
    [/经理|总监|主管|负责人|官/, [
      `制定${title}岗位在${category}方向的目标、计划与资源安排`,
      `协调跨团队推进关键项目，跟踪里程碑与风险`,
      `建立流程与标准，带领团队达成业务与质量指标`,
      `向上汇报进展，向下拆解任务并复盘改进`,
    ]],
    [/分析|顾问|咨询师/, [
      `收集并整理${category}相关数据与业务信息，形成分析框架`,
      `输出洞察、建议与可执行方案，支持决策`,
      `跟踪方案落地效果，迭代分析模型与报告`,
      `与业务方对齐问题定义、假设与验收标准`,
    ]],
    [/专员|员|师|师傅|工|员$/, [
      `执行${title}在${category}场景下的日常核心工作任务`,
      `按 SOP/规范完成操作、记录与异常上报`,
      `配合团队达成质量、时效与客户/业务满意度目标`,
      `参与培训与复盘，持续改进工作方法`,
    ]],
  ];
  for (const [re, pts] of rules) {
    if (re.test(title)) return pts;
  }
  return [
    `承担${title}在${category}方向的专业工作，独立推进任务闭环`,
    `与相关团队协作，确保输入、过程与交付物符合岗位标准`,
    `识别风险与待确认项，主动澄清后再执行关键动作`,
    `用可检验的产出与数据复盘工作效果`,
  ];
}

/** 锚定岗位名的人格渲染（desc/职责含 title，便于 relevance 校验） */
function renderAnchored({ title, category }, fam, pmap, clusterKey) {
  const { levelOf: lvlOf } = fam.clusters;
  const cl = fam.clusters.clusterOf(title);
  const profKey = clusterKey || cl.key;
  const prof = pmap[profKey] || pmap[genericKey(pmap)];
  const level = lvlOf(title);
  const rnd = mulberry32(seedOf(`${title}|${category}|fix`));

  const emoji = LEVEL_EMOJI[level] || fam.emoji;
  const color = pick(rnd, COLOR_POOL);
  const persona = LEVEL_PERSONA[level] || LEVEL_PERSONA['中级'];
  const ladderLine = (prof.ladder && (prof.ladder[level] || prof.ladder['中级'])) || '';

  const respBase = shuffled(rnd, prof.responsibilities);
  const titleDuties = dutiesFromTitle(title, category);
  const resp = [...titleDuties.slice(0, 2), ...respBase.slice(0, 4)].slice(0, 6);
  const skills = shuffled(rnd, prof.skills);
  const tools = shuffled(rnd, prof.tools);
  const kpis = shuffled(rnd, prof.kpis);
  const dels = shuffled(rnd, prof.deliverables);
  const pit = shuffled(rnd, prof.pitfalls).slice(0, 3);

  const desc = `${category}领域${level}${title}，专注${title}相关核心工作，结合${prof.summary.replace(/。$/, '')}。`.slice(0, 160);

  const L = [];
  L.push('---');
  L.push(`name: ${title}`);
  L.push(`description: ${desc.replace(/\n/g, ' ')}`);
  L.push(`emoji: ${emoji}`);
  L.push(`color: ${color}`);
  L.push(`cluster: ${profKey}`);
  L.push(`level: ${level}`);
  L.push('---');
  L.push('');
  L.push(`# ${title}·智能体人格`);
  L.push('');
  L.push(`你是 **${title}**，在${category}方向从事${title}相关工作。${prof.summary}${persona}`);
  L.push('');
  L.push('## 你的身份与定位');
  L.push(`- **岗位方向**：${title}（${level}），属于${category}方向，专业领域贴近${prof.name}。`);
  L.push(`- **职级侧重**：${ladderLine}`);
  L.push(`- **记忆**：在整个对话中保持上下文一致、口径统一、目标不漂移，始终站在「${title}」的专业视角回应。`);
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
  L.push(`- **主要协作方**：${prof.collaborators.join('、')}。`);
  for (const b of prof.boundaries) L.push(`- **边界**：${b}。`);
  L.push('');
  L.push('## 你要主动规避的常见坑');
  for (const p of pit) L.push(`- ${p}`);
  L.push('');
  L.push('## 你的工作方式');
  L.push(`1. **先对齐目标**：确认作为${title}要解决的真问题与成功标准，不急着动手。`);
  L.push('2. **基于真实实践给方案**：用本岗位的行业最佳实践给出可落地步骤与取舍，标注关键风险。');
  L.push('3. **小步交付**：按里程碑推进，每步留下可检验的产出。');
  L.push('4. **复盘改进**：用上面的关键指标验证效果，沉淀为可复用经验。');
  L.push('');

  const md = L.join('\n');
  const bodyStart = md.indexOf(`# ${title}·智能体人格`);
  const body = md.slice(bodyStart).trim();
  return { md, fm: { name: title, description: desc, emoji, color }, body, desc, cluster: profKey, level, strategy: clusterKey ? 'cluster' : 'cluster-fallback' };
}

/** 纯 name-aware 兜底（不依赖画像库） */
function renderNameAware({ title, category }) {
  const level = levelOf(title);
  const rnd = mulberry32(seedOf(`${title}|${category}|name-aware`));
  const emoji = pick(rnd, ['👔', '🎯', '📋', '💼', '✨', '🔧']);
  const color = pick(rnd, COLOR_POOL);
  const persona = LEVEL_PERSONA[level] || LEVEL_PERSONA['中级'];
  const resp = dutiesFromTitle(title, category);
  const desc = `${category}领域${level}${title}，专注${title}岗位的核心职责与专业交付，对质量与结果负责。`;

  const L = [];
  L.push('---');
  L.push(`name: ${title}`);
  L.push(`description: ${desc}`);
  L.push(`emoji: ${emoji}`);
  L.push(`color: ${color}`);
  L.push(`cluster: name-aware`);
  L.push(`level: ${level}`);
  L.push('---');
  L.push('');
  L.push(`# ${title}·智能体人格`);
  L.push('');
  L.push(`你是 **${title}**，${category}方向的${level}${title}。${persona}`);
  L.push('');
  L.push('## 你的身份与定位');
  L.push(`- **岗位方向**：${title}（${level}），属于${category}方向。`);
  L.push(`- **记忆**：在整个对话中保持上下文一致、口径统一、目标不漂移，始终站在「${title}」的专业视角回应。`);
  L.push('');
  L.push('## 你的核心职责');
  for (const r of resp) L.push(`- ${r}`);
  L.push('');
  L.push('## 必备技能与技术栈');
  L.push(`- **核心技能**：${title}岗位所需的专业知识、流程规范与工具使用能力。`);
  L.push(`- **常用工具/框架**：与${category}和${title}工作相关的业务系统、文档与协作工具。`);
  L.push('');
  L.push('## 衡量你的关键指标');
  L.push(`- ${title}关键任务按时完成率与交付质量`);
  L.push(`- 业务/客户满意度与问题闭环率`);
  L.push(`- 流程合规与复盘改进落地率`);
  L.push('');
  L.push('## 你的交付物');
  L.push(`- 与${title}职责匹配的工作成果、报告或清单`);
  L.push('- 过程记录、风险说明与下一步行动建议');
  L.push('');
  L.push('## 协作与边界');
  L.push(`- **主要协作方**：${category}相关业务、运营、技术或管理团队。`);
  L.push(`- **边界**：专注${title}职责范围内工作，超出授权或专业边界的事项先确认再执行。`);
  L.push('');
  L.push('## 你要主动规避的常见坑');
  L.push('- 目标不清就动手，导致返工');
  L.push('- 跳过关键确认，擅自扩大范围或对外承诺');
  L.push('- 缺少过程记录，交付无法追溯');
  L.push('');
  L.push('## 你的工作方式');
  L.push(`1. **先对齐目标**：确认作为${title}要解决的真问题与成功标准。`);
  L.push('2. **小步交付**：按里程碑推进，每步留下可检验的产出。');
  L.push('3. **复盘改进**：根据反馈与数据调整方法。');
  L.push('');

  const md = L.join('\n');
  const bodyStart = md.indexOf(`# ${title}·智能体人格`);
  const body = md.slice(bodyStart).trim();
  return { md, fm: { name: title, description: desc, emoji, color }, body, desc, cluster: 'name-aware', level, strategy: 'name-aware' };
}

function isRelevant(title, desc, body) {
  const resp = extractResponsibilities({ contentMd: body });
  return isProfileRelevant(title, desc, resp);
}

function buildFixedPersona(title, category) {
  const best = pickBestCluster(title, category);
  let r = null;
  if (best && best.score >= 100) {
    r = renderAnchored({ title, category }, best.fam, best.pmap, best.profKey);
    r.strategy = `cluster:${best.famKey}/${best.profKey}`;
  } else if (best && best.score >= 40) {
    r = renderAnchored({ title, category }, best.fam, best.pmap, best.profKey);
    r.strategy = `anchored:${best.famKey}/${best.profKey}`;
  } else {
    r = renderNameAware({ title, category });
  }
  if (!isRelevant(title, r.desc, r.body)) {
    r = renderNameAware({ title, category });
    r.strategy = 'name-aware-forced';
  }
  const v = validateRole({ title, body: r.body, fm: r.fm });
  if (!v.pass) throw new Error(v.reason);
  return { ...r, validate: v };
}

async function main() {
  const apply = FLAG('apply');
  const dry = !apply;
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  let roles;
  if (FLAG('scan-remaining')) {
    roles = await loadRemainingIrrelevantRoles(col);
    console.log(`扫描仍不相关角色: ${roles.length}${dry ? '（dry-run）' : '（写库）'}`);
  } else {
    roles = loadATierRoles();
    console.log(`A 级待修复角色: ${roles.length}${dry ? '（dry-run）' : '（写库）'}`);
  }

  let ok = 0; let fail = 0; let stillIrrelevant = 0;
  const byStrategy = {};
  const failSamples = [];
  let ops = [];

  for (const { name, category } of roles) {
    try {
      const roleDoc = await col.findOne({ kind: 'role', name, category });
      if (!roleDoc) { fail++; failSamples.push(`${name}@${category}: 缺角色文档`); continue; }

      const fixed = buildFixedPersona(name, category);
      const prof = buildProfile({ ...roleDoc, description: fixed.desc, contentMd: fixed.body });
      if (!prof.relevant) stillIrrelevant++;

      byStrategy[fixed.strategy] = (byStrategy[fixed.strategy] || 0) + 1;

      if (apply) {
        ops.push({
          updateOne: {
            filter: { _id: roleDoc._id },
            update: {
              $set: {
                description: fixed.desc,
                descriptionZh: fixed.desc,
                contentMd: fixed.body,
                emoji: fixed.fm.emoji,
                color: fixed.fm.color,
                tags: ['AI角色', category, fixed.cluster],
                lastUpdated: new Date(),
                syncedAt: new Date(),
                'securityAudit.programmatic.by': 'a-tier-fix',
                'securityAudit.programmatic.fixedAt': new Date().toISOString(),
                'securityAudit.programmatic.fixedStrategy': fixed.strategy,
                'securityAudit.programmatic.score': fixed.validate.score,
              },
            },
          },
        });
        if (ops.length >= 200) {
          await col.bulkWrite(ops, { ordered: false });
          ops = [];
        }
      }
      ok++;
    } catch (e) {
      fail++;
      if (failSamples.length < 15) failSamples.push(`${name}@${category}: ${e.message}`);
    }
  }
  if (ops.length) await col.bulkWrite(ops, { ordered: false });

  console.log(`\n完成: 成功 ${ok}，失败 ${fail}，修复后仍不相关 ${stillIrrelevant}`);
  console.log('策略分布:', JSON.stringify(byStrategy, null, 2));
  if (failSamples.length) console.log('失败样例:', failSamples);

  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { buildFixedPersona, loadATierRoles, loadRemainingIrrelevantRoles, pickBestCluster };
