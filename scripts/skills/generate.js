'use strict';

/**
 * 技能生成管线：针对岗位(角色) → DeepSeek 拆解所需技能清单 → 逐个生成 SKILL.md → DeepSeek 验证 → 入库。
 *
 *   node scripts/skills/generate.js --roles=50 --perRole=8 --concurrency=10
 *
 * 特性：
 *   - 围绕 kind=role 的岗位生成配套技能（kind=skill）
 *   - 断点续跑：角色处理完打标 skillsDone；技能按 skillId 去重跳过
 *   - 验证不过 → data/skills/failed-skills.jsonl
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { chat } = require('../roles/lib/deepseek');

const DATA = path.resolve(__dirname, '../../data/skills');
const FAILED = path.join(DATA, 'failed-skills.jsonl');
const MIN_SCORE = Number(process.env.SKILL_MIN_SCORE || 78);

const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.split('=')[1] : d; };
const appendJsonl = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.appendFileSync(f, JSON.stringify(o) + '\n'); };

function slugify(s) {
  const a = String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (a && a.length >= 2) return a;
  let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 's' + h.toString(36);
}

function specMessages(role) {
  const sys = `你是技能体系设计师。针对某岗位，列出该岗位 AI 员工最需要的「可执行技能」(skill)。
每个技能是一个具体、可复用的工作能力（如「需求评审纪要生成」「SQL 慢查询优化」），不要泛泛而谈。
只输出 JSON：{"skills":[{"name":"技能名","desc":"一句话描述","paid":true/false}]}（paid: 进阶/专业技能为 true）`;
  const user = `岗位：${role.name}（分类：${role.category}）。请给出 ${role._per} 个技能。`;
  return [{ role: 'system', content: sys }, { role: 'user', content: user }];
}

function skillMdMessages(role, spec) {
  const sys = `你是 SKILL.md 作者，为 AI agent 编写可直接使用的技能文件。
输出一个完整 Markdown：
1) YAML frontmatter：name(技能名)、description(一句话)、version: 1.0.0、author: TotalClaw、tags: [相关标签]
2) 正文（中文）：## 何时使用 / ## 输入 / ## 步骤(编号步骤，明确可执行) / ## 输出 / ## 注意事项
内容要具体、专业、可落地，贴合岗位场景。只输出该 Markdown。`;
  const user = `岗位：${role.name}（${role.category}）
技能：${spec.name} —— ${spec.desc}`;
  return [{ role: 'system', content: sys }, { role: 'user', content: user }];
}

function validateMessages(spec, md) {
  const sys = `你是技能质量审核员。对给定 SKILL.md 按 结构合规/可执行性/专业度/中文质量 打分(0~100)。
只输出 JSON：{"pass":true/false,"score":数字,"reason":"简要理由"}（>=${MIN_SCORE} 为 pass）`;
  return [{ role: 'system', content: sys }, { role: 'user', content: `技能：${spec.name}\n---\n${md.slice(0, 6000)}` }];
}

// 程序化校验技能：返回 {pass, score, reason}。无 LLM 调用。
function validateSkill({ spec, body, fm }) {
  const reasons = [];
  let score = 100;
  const len = (body || '').length;
  if (len < 160) { reasons.push('正文过短'); score -= 60; }
  const headers = (body.match(/^#{1,3}\s+\S/gm) || []).length;
  if (headers < 1) { reasons.push('无结构标题'); score -= 25; }
  // 技能应说明用途/步骤：含「何时使用/使用/步骤/输入/输出」等关键词
  if (!/何时使用|使用场景|步骤|流程|输入|输出|要求|示例/.test(body)) { reasons.push('缺用途/步骤'); score -= 25; }
  if (!fm || !String(fm.name || spec.name || '').trim()) { reasons.push('缺 name'); score -= 30; }
  if (/Insufficient Balance|undefined undefined/.test(body) || /^\s*\{[\s\S]{0,120}"(error|code|message)"\s*:/.test((body || '').trim())) { reasons.push('含异常文本'); score -= 80; }
  const pass = score >= MIN_SCORE && len >= 160;
  return { pass, score: Math.max(0, score), reason: reasons.join(';') || 'ok', by: 'programmatic' };
}

async function genSkill(skills, role, spec) {
  const base = slugify(role.slug || role.name) + '-' + slugify(spec.name);
  const skillId = `totalclaw:roleskill/${base}`.replace(/\//g, '~').replace(/\s+/g, '-');
  if (await skills.findOne({ skillId }, { projection: { _id: 1 } })) return { status: 'skip' };

  let md = await chat(skillMdMessages(role, spec), { temperature: 0.7, maxTokens: 3000 });
  md = md.replace(/```(?:markdown|yaml)?/gi, '').trim();
  // 截到首个 frontmatter 块（容忍模型在 --- 前加客套话）
  const fmIdx = md.indexOf('---');
  let fm = {}, body = md;
  if (fmIdx >= 0) { try { const p = matter(md.slice(fmIdx)); fm = p.data || {}; body = p.content || ''; } catch { /* */ } }
  // 容错：解析不到 name 就用已知技能名合成 frontmatter，正文用生成内容（避免浪费调用）
  if (!fm.name) { fm = { name: spec.name }; body = md.replace(/^---[\s\S]*?---/, '').trim() || md; }
  if (!body || body.length < 160) { appendJsonl(FAILED, { spec, reason: 'too short', at: Date.now() }); return { status: 'fail' }; }

  // 程序化校验（替代 DeepSeek 自评：结构/篇幅/「何时使用」段/frontmatter）
  const verdict = validateSkill({ spec, body, fm });
  if (!verdict.pass) { appendJsonl(FAILED, { spec, verdict, at: Date.now() }); return { status: 'fail' }; }

  const name = String(fm.name).trim();
  await skills.updateOne({ skillId }, {
    $set: {
      skillId, slug: base, name, displayName: name,
      description: (fm.description || spec.desc || '').toString().trim() || undefined,
      descriptionZh: (fm.description || spec.desc || '').toString().trim() || undefined,
      category: role.category, tags: ['岗位技能', role.name, ...(Array.isArray(fm.tags) ? fm.tags.slice(0, 5) : [])],
      source: 'totalclaw', kind: 'skill', contentMd: body.trim(), author: 'TotalClaw',
      version: String(fm.version || '1.0.0'), syncedAt: new Date(), lastUpdated: new Date(),
      securityAudit: { programmatic: { score: verdict.score, reason: verdict.reason, at: new Date() } },
    },
    $setOnInsert: {
      // 新生成的岗位技能一律收费（原有聚合社区 skill 保持免费）
      listingType: 'paid',
      ownership: 'totalclaw-proprietary',
      closedSource: true,
      pricing: { model: 'paid', price: Number(process.env.SKILL_PRICE || 9), currency: 'CNY' },
      reviewStatus: 'n/a', featured: false,
      stats: { downloads: 0, sales: 0, ratingAvg: 0, ratingCount: 0 },
    },
  }, { upsert: true });
  return { status: 'ok', score: verdict.score };
}

// 原子认领一个未处理岗位（支持多 worker/多进程并行，不重复）。
// 用 skillsClaimedAt 防抢占：claim 10 分钟内不被他人重复领取。
async function claimRole(skills) {
  const staleBefore = new Date(Date.now() - 10 * 60 * 1000);
  const r = await skills.findOneAndUpdate(
    { kind: 'role', skillsDone: { $ne: true }, $or: [{ skillsClaimedAt: { $exists: false } }, { skillsClaimedAt: { $lt: staleBefore } }] },
    { $set: { skillsClaimedAt: new Date() } },
    { returnDocument: 'after' },
  );
  return r && (r.value || r); // 兼容驱动返回结构
}

async function processRole(skills, role, perRole, specConc, counters) {
  role._per = perRole;
  let specs = [];
  let specErr = null;
  try { specs = (JSON.parse(await chat(specMessages(role), { temperature: 0.8, maxTokens: 1500, json: true })).skills || []).slice(0, perRole); }
  catch (e) { specs = []; specErr = e; }
  // spec 生成本身失败（如 DeepSeek 余额不足/超时）→ 不要打 skillsDone，留待恢复后重试。
  // 释放 claim（清掉 skillsClaimedAt），让该岗位过 stale 期后可被重新领取。
  if (specErr) {
    appendJsonl(FAILED, { role: role.name, reason: 'spec-gen: ' + specErr.message, at: Date.now() });
    await skills.updateOne({ _id: role._id }, { $unset: { skillsClaimedAt: '' } });
    return;
  }
  let idx = 0;
  async function w() {
    while (idx < specs.length) {
      const spec = specs[idx++];
      try { const r = await genSkill(skills, role, spec); if (r.status === 'ok') counters.ok++; else if (r.status === 'skip') counters.skip++; else counters.fail++; }
      catch (e) { counters.fail++; appendJsonl(FAILED, { role: role.name, spec, reason: e.message, at: Date.now() }); }
    }
  }
  await Promise.all(Array.from({ length: specConc }, () => w()));
  await skills.updateOne({ _id: role._id }, { $set: { skillsDone: true } });
}

async function main() {
  loadEnv();
  if (!process.env.DEEPSEEK_API_KEY) { console.error('缺 DEEPSEEK_API_KEY'); process.exit(1); }
  const rolesN = Number(arg('roles', 50));          // 本次最多处理多少岗位
  const perRole = Number(arg('perRole', 8));
  const specConc = Math.max(1, Number(arg('concurrency', 8)));   // 单岗位内技能并发
  const roleConc = Math.max(1, Number(arg('roleConcurrency', 4))); // 同时处理几个岗位
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/totalclaw';

  const client = new MongoClient(uri);
  await client.connect();
  const skills = client.db().collection('skills');
  console.log(`[skills] 岗位并行=${roleConc} × 技能并发=${specConc}，目标处理 ${rolesN} 个岗位`);

  const counters = { ok: 0, fail: 0, skip: 0 };
  let processed = 0, stop = false;
  async function roleWorker() {
    while (!stop && processed < rolesN) {
      const role = await claimRole(skills);
      if (!role) { stop = true; break; }
      processed++;
      await processRole(skills, role, perRole, specConc, counters);
      if (processed % 5 === 0) console.log(`  已处理 ${processed} 岗位；累计 ok=${counters.ok} fail=${counters.fail} skip=${counters.skip}`);
    }
  }
  await Promise.all(Array.from({ length: roleConc }, () => roleWorker()));

  const total = await skills.countDocuments({ kind: { $ne: 'role' } });
  console.log(`[skills] 完成 ok=${counters.ok} fail=${counters.fail} skip=${counters.skip}；技能总数=${total}`);
  await client.close();
}

main().catch((e) => { console.error('技能生成失败:', e); process.exit(1); });
