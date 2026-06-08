'use strict';

/**
 * 用 DeepSeek 对「核心/高价角色子集」的 8 条技能做逐条高质量精修。
 *
 * 设计：
 *  - frontmatter（name / metadata.totalclaw / tags）由程序生成，沿用现有唯一 name，保证可加载与全局唯一；
 *  - 仅让 LLM 产出高质量「正文章节」（## 何时使用 ... ## 注意事项），贴合角色真实职责；
 *  - 安全敏感角色强制防御口径；输出经结构 + 红线校验，不过则保留现有模板版本（不降级）。
 *
 * 用法：
 *   node scripts/skills/llm-refine-role-skills.js --dry --roles "云渗透测试工程师@云计算与中间件,做市交易员@私募与创投"
 *   node scripts/skills/llm-refine-role-skills.js --apply --category "金融与投资" --limit 30 --concurrency 6
 *   node scripts/skills/llm-refine-role-skills.js --apply --limit 100   # 默认从主流高需求品类挑选
 */

const { MongoClient } = require('mongodb');
const matter = require('gray-matter');
const { loadEnv } = require('../roles/lib/env');
const { chat } = require('../roles/lib/deepseek');
const { buildProfile, isSecurityRole, hasRedLine } = require('./polish-role-skills');

loadEnv();

const BATCH_BY = 'complete-totalclaw-agent-role-skills';
const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';

// 主流高需求品类（无销量信号时的默认"高价值"口径）
const DEFAULT_CATEGORIES = [
  '金融与投资', '销售与商务', '增长与投放', '内容与新媒体', '客户成功与支持',
  '供应链与采购', '项目与交付', '战略与咨询', '隐私与数据合规', '测试与质量',
];

const SUFFIXES = [
  '任务澄清与目标拆解', '工作流规划与里程碑排期', '信息收集与证据台账', '方案生成与备选比较',
  '质量检查与风险复核', '自动化提示词与工具调用清单', '交付物撰写与汇报', '复盘沉淀与知识库更新',
];

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  if (i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--')) return process.argv[i + 1];
  return d;
};

function yamlEscape(s) {
  return String(s).replace(/"/g, '\\"');
}

// 从现有 contentMd 抽出我们生成的唯一 frontmatter（保持 name 不变）
function extractFrontmatter(md) {
  const m = /^---\n([\s\S]*?)\n---/.exec(md || '');
  return m ? m[0] : null;
}

function buildPrompt(profile, suffix) {
  const dutyBlock = profile.relevant && profile.responsibilities.length
    ? `该角色真实核心职责（务必贴合，不要写无关领域内容）：\n${profile.responsibilities.map((r) => `- ${r}`).join('\n')}`
    : `请只围绕「${profile.name}」这一岗位名称与「${profile.category}」领域的通用专业职责来写，不要臆造与岗位名不符的具体业务。`;

  const securityRule = profile.security
    ? `这是安全/合规敏感岗位：全程防御与合规口径，只描述检查、评估、定级、修复方向；严禁输出任何攻击性、越权、危害他人系统的可执行步骤。`
    : '';

  const sys = `你是资深的 SKILL.md 作者，为 TotalClaw-agent 编写可直接落地执行的中文岗位技能正文。
要求：
1. 只输出正文 Markdown，不要 YAML frontmatter，不要代码块包裹，不要任何客套话。
2. 严格包含且仅包含以下二级标题，顺序固定：
   ## 何时使用
   ## 适用角色与场景
   ## 输入
   ## 步骤
   ## 输出
   ## 边界与约束
   ## 失败模式与规避
   ## 质量标准与验收
   ## 安全与合规
   ## 示例
   ## 注意事项
3. 「步骤」用编号(1. 2. 3...)，至少 5 步，每步具体可执行、贴合岗位。
4. 内容专业、具体、可复核，紧扣角色真实职责，不空泛、不堆砌套话。
5. ${securityRule}
6. 「示例」给一个"输入→输出骨架"的简短示例。`;

  const user = `岗位：${profile.name}（领域：${profile.category}）
本技能主题：${profile.name}${suffix}（聚焦"${suffix}"这一工作环节）
角色定位：${profile.description || profile.category + '方向的专业岗位'}
${dutyBlock}

请输出这条技能的完整正文（从「## 何时使用」开始）。`;

  return [{ role: 'system', content: sys }, { role: 'user', content: user }];
}

const REQUIRED_SECTIONS = [
  '何时使用', '适用角色与场景', '输入', '步骤', '输出',
  '边界与约束', '失败模式与规避', '质量标准与验收', '安全与合规', '示例', '注意事项',
];

function validateBody(body, profile) {
  const reasons = [];
  if (!body || body.length < 500) reasons.push('正文过短');
  for (const sec of REQUIRED_SECTIONS) {
    if (!new RegExp(`^##\\s*${sec}`, 'm').test(body)) reasons.push(`缺章节:${sec}`);
  }
  if (!/^\s*1\.\s/m.test(body)) reasons.push('步骤缺编号');
  if (/Insufficient Balance|undefined undefined|```/.test(body)) reasons.push('含异常/代码块');
  // 角色名命中放宽：正文含完整角色名或其核心 token 即可
  const core = String(profile.name).replace(/(工程师|架构师|设计师|分析师|工程|师|员|经理|专员|主管|总监|顾问|代表|专家|官|长|助理|策划|运营|开发|测试)$/, '').trim();
  if (!body.includes(profile.name) && !(core.length >= 2 && body.includes(core))) reasons.push('正文未出现角色名');
  const red = hasRedLine(body);
  if (red.length) reasons.push('红线:' + red.join(','));
  return { ok: reasons.length === 0, reasons };
}

async function refineSkill(col, skillDoc, profile, suffix, { apply, dry }) {
  const fm = extractFrontmatter(skillDoc.contentMd);
  if (!fm) return { status: 'nofm' };

  let body = null;
  let v = { ok: false, reasons: ['未生成'] };
  for (let attempt = 1; attempt <= 2 && !v.ok; attempt++) {
    let out = await chat(buildPrompt(profile, suffix), { temperature: attempt === 1 ? 0.6 : 0.4, maxTokens: 4096 });
    out = String(out).replace(/```(?:markdown|md)?/gi, '').trim();
    const idx = out.indexOf('## 何时使用');
    if (idx > 0) out = out.slice(idx);
    const vv = validateBody(out, profile);
    if (vv.ok) { body = out; v = vv; break; }
    v = vv;
    body = out;
  }
  if (!v.ok) return { status: 'fail', reasons: v.reasons };

  const newMd = `${fm}\n\n# ${profile.name}${suffix}\n\n${body.trim()}\n`;

  if (dry) return { status: 'ok', preview: newMd };
  if (apply) {
    await col.updateOne(
      { _id: skillDoc._id },
      {
        $set: {
          contentMd: newMd,
          version: '1.2.0',
          'securityAudit.programmatic.refinedBy': 'llm-refine',
          'securityAudit.programmatic.refinedAt': new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
      }
    );
  }
  return { status: 'ok' };
}

async function pickRoles(col, { rolesArg, category, limit }) {
  // 收集本批角色（name+category）
  const cur = col.find({ kind: 'skill', 'securityAudit.programmatic.by': BATCH_BY }, { projection: { contentMd: 1 } });
  const groups = new Map();
  while (await cur.hasNext()) {
    const d = await cur.next();
    const m = /role:\s*"([^"]+)"/.exec(d.contentMd || '');
    const cm = /category:\s*"([^"]+)"/.exec(d.contentMd || '');
    if (!m) continue;
    const key = `${m[1]}@${cm ? cm[1] : ''}`;
    if (!groups.has(key)) groups.set(key, { name: m[1], category: cm ? cm[1] : '' });
  }

  if (rolesArg) {
    return rolesArg.split(',').map((s) => s.trim()).filter(Boolean).map((s) => {
      const [name, cat] = s.split('@');
      return { name, category: cat || '' };
    });
  }
  let list = [...groups.values()];
  if (category) list = list.filter((r) => r.category === category);
  // 主流高需求品类优先排序（无销量信号时的"高价值"口径）
  list.sort((a, b) => {
    const ia = DEFAULT_CATEGORIES.indexOf(a.category);
    const ib = DEFAULT_CATEGORIES.indexOf(b.category);
    return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
  });

  const relevantOnly = process.argv.includes('--relevant');
  if (!relevantOnly) return limit ? list.slice(0, limit) : list;

  // 仅保留人格与角色名匹配的角色（relevant=true），按上面排序取前 limit 个
  const picked = [];
  for (const r of list) {
    if (limit && picked.length >= limit) break;
    const roleDoc = await col.findOne({ kind: 'role', name: r.name, category: r.category })
      || await col.findOne({ kind: 'role', name: r.name });
    if (!roleDoc) continue;
    if (buildProfile(roleDoc).relevant) picked.push(r);
  }
  return picked;
}

async function main() {
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error('缺 DEEPSEEK_API_KEY');
    process.exit(1);
  }
  const apply = process.argv.includes('--apply');
  const dry = process.argv.includes('--dry') || !apply;
  const rolesArg = arg('roles', '');
  const category = arg('category', '');
  const limit = Number(arg('limit', rolesArg ? 0 : 50));
  const concurrency = Math.max(1, Number(arg('concurrency', 6)));

  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const roles = await pickRoles(col, { rolesArg, category, limit });
  console.log(`选中角色: ${roles.length}（${dry ? 'DRY-RUN' : 'APPLY'}），每角色 8 条，预计 LLM 调用 ${roles.length * 8} 次`);

  const counters = { ok: 0, fail: 0, skip: 0, nofm: 0 };
  for (const r of roles) {
    const roleDoc = await col.findOne({ kind: 'role', name: r.name, category: r.category })
      || await col.findOne({ kind: 'role', name: r.name });
    if (!roleDoc) { console.log('  缺角色文档:', r.name, r.category); continue; }
    const profile = buildProfile(roleDoc);
    const skills = await col
      .find({ kind: 'skill', 'securityAudit.programmatic.by': BATCH_BY, name: { $in: SUFFIXES.map((s) => `${r.name}${s}`) }, category: r.category })
      .toArray();

    let tasks = SUFFIXES.map((suffix) => {
      const doc = skills.find((s) => s.name === `${r.name}${suffix}`);
      return doc ? { doc, suffix } : null;
    }).filter(Boolean);

    let i = 0;
    const previews = [];
    async function w() {
      while (i < tasks.length) {
        const t = tasks[i++];
        try {
          const res = await refineSkill(col, t.doc, profile, t.suffix, { apply, dry });
          if (res.status === 'ok') { counters.ok++; if (res.preview) previews.push(res.preview); }
          else if (res.status === 'nofm') counters.nofm++;
          else { counters.fail++; if (res.reasons) console.log('    FAIL', t.suffix, res.reasons.join('|')); }
        } catch (e) {
          counters.fail++;
          console.log('    ERR', t.suffix, e.message);
        }
      }
    }
    await Promise.all(Array.from({ length: concurrency }, () => w()));
    console.log(`  [${r.name}@${r.category}] 相关人格=${profile.relevant} 安全=${profile.security} | ok=${counters.ok} fail=${counters.fail}`);
    if (dry && previews.length) {
      console.log('\n----- 预览（首条精修正文）-----');
      console.log(previews[0].slice(0, 1800));
      console.log('----- 预览结束 -----\n');
    }
  }
  console.log(`\n完成。ok=${counters.ok} fail=${counters.fail} nofm=${counters.nofm}${dry ? '（DRY-RUN，未写库）' : ''}`);
  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
