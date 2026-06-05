'use strict';
/**
 * 不依赖 DeepSeek 的技能入库管线：吃 Claude agent 产出的 JSON，按原 genSkill 同款 schema 入库。
 *
 *   node scripts/skills/import-agent-skills.js <skills.json>
 *
 * 输入 JSON 形如：
 *   [{ "role": "MCN运营专员", "roleSlug": "mcn...", "category": "...",
 *      "skills": [{ "name":"技能名","desc":"一句话","paid":true,"body":"# 技能名\n## 何时使用 ...(完整 Markdown 正文)" }, ...] }]
 *
 * 行为：
 *   - 每个 skill upsert（按 skillId 去重，已存在跳过），schema 与 scripts/skills/generate.js::genSkill 完全一致
 *   - 一个角色的技能全部处理完 → 给该角色 role 文档打 skillsDone=true
 *   - 角色按 name 匹配 kind=role 文档（取其真实 slug 以保证 skillId 一致）
 */
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');

const PRICE = Number(process.env.SKILL_PRICE || 9);
const FAILED = path.resolve(__dirname, '../../data/skills/failed-agent-skills.jsonl');
const appendJsonl = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.appendFileSync(f, JSON.stringify(o) + '\n'); };

function slugify(s) {
  const a = String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (a && a.length >= 2) return a;
  let h = 0; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 's' + h.toString(36);
}
// 程序化校验：结构/篇幅/「何时使用」段
function validateSkill(body, name) {
  const reasons = [];
  if (!body || body.length < 200) reasons.push('正文过短');
  if (!/何时使用|when to use/i.test(body)) reasons.push('缺「何时使用」段');
  if (!/步骤|流程|操作/i.test(body)) reasons.push('缺步骤段');
  const score = Math.max(40, 92 - reasons.length * 18);
  return { pass: reasons.length === 0, score, reason: reasons.join('；') || 'ok' };
}

async function main() {
  loadEnv();
  const file = process.argv[2];
  if (!file) { console.error('用法: node import-agent-skills.js <skills.json>'); process.exit(1); }
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/totalclaw';
  const client = new MongoClient(uri); await client.connect();
  const skills = client.db().collection('skills');

  let ok = 0, skip = 0, fail = 0, rolesDone = 0, rolesMissing = 0;
  for (const entry of data) {
    const role = await skills.findOne({ kind: 'role', name: entry.role }, { projection: { _id: 1, slug: 1, name: 1, category: 1 } });
    if (!role) { rolesMissing++; appendJsonl(FAILED, { role: entry.role, reason: 'role-not-found', at: Date.now() }); continue; }
    const cat = role.category || entry.category;
    for (const spec of (entry.skills || [])) {
      const base = slugify(role.slug || role.name) + '-' + slugify(spec.name);
      const skillId = `totalclaw:roleskill/${base}`.replace(/\//g, '~').replace(/\s+/g, '-');
      if (await skills.findOne({ skillId }, { projection: { _id: 1 } })) { skip++; continue; }
      const body = String(spec.body || '').replace(/```(?:markdown|yaml)?/gi, '').trim();
      const v = validateSkill(body, spec.name);
      if (!v.pass) { fail++; appendJsonl(FAILED, { role: entry.role, spec: spec.name, verdict: v, at: Date.now() }); continue; }
      await skills.updateOne({ skillId }, {
        $set: {
          skillId, slug: base, name: spec.name, displayName: spec.name,
          description: (spec.desc || '').trim() || undefined, descriptionZh: (spec.desc || '').trim() || undefined,
          category: cat, tags: ['岗位技能', role.name, ...(Array.isArray(spec.tags) ? spec.tags.slice(0, 5) : [])],
          source: 'totalclaw', kind: 'skill', contentMd: body, author: 'TotalClaw',
          version: '1.0.0', syncedAt: new Date(), lastUpdated: new Date(),
          securityAudit: { programmatic: { score: v.score, reason: v.reason, by: 'agent-skill', at: new Date() } },
        },
        $setOnInsert: {
          listingType: 'paid', ownership: 'totalclaw-proprietary', closedSource: true,
          pricing: { model: spec.paid === false ? 'free' : 'paid', price: spec.paid === false ? 0 : PRICE, currency: 'CNY' },
          reviewStatus: 'n/a', featured: false,
          stats: { downloads: 0, sales: 0, ratingAvg: 0, ratingCount: 0 },
        },
      }, { upsert: true });
      ok++;
    }
    await skills.updateOne({ _id: role._id }, { $set: { skillsDone: true } });
    rolesDone++;
  }
  console.log(`[import-agent-skills] 技能 ok=${ok} skip=${skip} fail=${fail}；角色打标 done=${rolesDone} 未找到=${rolesMissing}`);
  await client.close();
}
main().catch((e) => { console.error('导入失败:', e); process.exit(1); });
