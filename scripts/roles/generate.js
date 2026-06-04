'use strict';

/**
 * 角色生成管线：岗位清单 → DeepSeek 生成角色 .md → DeepSeek 验证 → 入库（kind=role 付费）。
 *
 *   node scripts/roles/generate.js --limit=20            # 处理 job-titles.json 中前 N 个未生成的
 *   node scripts/roles/generate.js --limit=20 --concurrency=3
 *
 * 特性：
 *   - 断点续跑：已存在（按 slug）的岗位跳过
 *   - 验证不过 → 记录到 data/roles/failed-roles.jsonl，不入库
 *   - 成功 → upsert skills(kind=role)，并把生成的 .md 落盘到 data/roles/generated/<cat>/<slug>.md
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('./lib/env');
const { chat } = require('./lib/deepseek');
const { genMessages, validateMessages } = require('./lib/prompts');

const ROOT = path.resolve(__dirname, '../..');
const DATA = path.join(ROOT, 'data', 'roles');
const GEN_DIR = path.join(DATA, 'generated');
const FAILED = path.join(DATA, 'failed-roles.jsonl');
const TITLES = (() => {
  const a = process.argv.find((x) => x.startsWith('--titles='));
  return a ? path.resolve(a.split('=')[1]) : path.join(DATA, 'job-titles.json');
})();
const PRICE = Number(process.env.ROLE_PRICE || 29);
const MIN_SCORE = Number(process.env.ROLE_MIN_SCORE || 80);

const arg = (k, d) => {
  const a = process.argv.find((x) => x.startsWith(`--${k}=`));
  return a ? a.split('=')[1] : d;
};

function slugify(title) {
  // 中文岗位名转 slug：保留英文数字，其它转拼音不可得时用 hash 兜底
  const ascii = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (ascii && ascii.length >= 2) return ascii;
  let h = 0; for (const c of title) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return 'role-' + h.toString(36);
}

function appendJsonl(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.appendFileSync(file, JSON.stringify(obj) + '\n');
}

// 程序化校验角色：返回 {pass, score, reason}。无 LLM 调用。
function validateRole({ title, body, fm }) {
  const reasons = [];
  let score = 100;
  const len = (body || '').length;
  if (len < 400) { reasons.push('正文过短'); score -= 60; }
  const headers = (body.match(/^#{1,3}\s+\S/gm) || []).length;
  if (headers < 2) { reasons.push('结构不足(标题<2)'); score -= 25; }
  // 人格口吻：含「你是/你的」或岗位名出现在正文
  const hasVoice = /你是|你的|你将|作为/.test(body) || (title && body.includes(title));
  if (!hasVoice) { reasons.push('缺人格口吻'); score -= 25; }
  if (!fm || !String(fm.name || '').trim()) { reasons.push('缺 name'); score -= 30; }
  // 明显异常：含大量未渲染的代码围栏/报错文本
  if (/Insufficient Balance|undefined undefined/.test(body) || /^\s*\{[\s\S]{0,120}"(error|code|message)"\s*:/.test((body || '').trim())) { reasons.push('含异常文本'); score -= 80; }
  const pass = score >= MIN_SCORE && len >= 400;
  return { pass, score: Math.max(0, score), reason: reasons.join(';') || 'ok', by: 'programmatic' };
}

async function genOne(skills, { title, category }) {
  const slug = slugify(title);
  const skillId = `role:${category}~${slug}`.replace(/\//g, '~').replace(/\s+/g, '-');

  if (await skills.findOne({ skillId }, { projection: { _id: 1 } })) {
    return { status: 'skip', skillId };
  }

  // 1) 生成
  let md = await chat(genMessages({ title, category }), { temperature: 0.8, maxTokens: 4096 });
  md = md.replace(/```(?:markdown|yaml)?/gi, '').trim();
  const fmIdx = md.indexOf('---');
  let fm = {}, body = md;
  if (fmIdx >= 0) { try { const p = matter(md.slice(fmIdx)); fm = p.data || {}; body = p.content || ''; } catch { /* */ } }
  // 容错：解析不到 name 用岗位名合成 frontmatter，正文用生成内容（避免浪费调用）
  if (!fm.name) { fm = { name: title, emoji: '🤖', color: 'blue' }; body = md.replace(/^---[\s\S]*?---/, '').trim() || md; }
  if (!body || body.length < 400) {
    appendJsonl(FAILED, { title, category, reason: 'too short', at: Date.now() });
    return { status: 'fail', skillId, reason: 'too short' };
  }

  // 2) 程序化校验（替代 DeepSeek 自评：结构/篇幅/人格口吻/frontmatter）
  const verdict = validateRole({ title, body, fm });
  if (!verdict.pass) {
    appendJsonl(FAILED, { title, category, verdict, at: Date.now() });
    return { status: 'fail', skillId, reason: verdict.reason };
  }

  // 3) 落盘 + 入库
  const outFile = path.join(GEN_DIR, category, `${slug}.md`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, md);

  const name = String(fm.name).trim();
  await skills.updateOne(
    { skillId },
    {
      $set: {
        skillId, slug, name, displayName: name,
        description: (fm.description || '').toString().trim() || undefined,
        descriptionZh: (fm.description || '').toString().trim() || undefined,
        emoji: (fm.emoji || '').toString().trim() || undefined,
        color: (fm.color || '').toString().trim() || undefined,
        category, tags: ['AI角色', category], source: 'totalclaw', kind: 'role',
        contentMd: body.trim(), author: 'TotalClaw',
        syncedAt: new Date(), lastUpdated: new Date(),
        securityAudit: { programmatic: { score: verdict.score, reason: verdict.reason, at: new Date() } },
      },
      $setOnInsert: {
        listingType: 'paid', ownership: 'totalclaw-proprietary', closedSource: true,
        pricing: { model: 'paid', price: PRICE, currency: 'CNY' },
        reviewStatus: 'n/a', featured: false,
        stats: { downloads: 0, sales: 0, ratingAvg: 0, ratingCount: 0 },
      },
    },
    { upsert: true },
  );
  return { status: 'ok', skillId, score: verdict.score };
}

async function main() {
  loadEnv();
  if (!process.env.DEEPSEEK_API_KEY) { console.error('缺 DEEPSEEK_API_KEY'); process.exit(1); }
  if (!fs.existsSync(TITLES)) { console.error('缺岗位清单:', TITLES, '（先跑 gen-taxonomy.js）'); process.exit(1); }

  const titles = JSON.parse(fs.readFileSync(TITLES, 'utf8'));
  const limit = Number(arg('limit', 20));
  const concurrency = Math.max(1, Number(arg('concurrency', 3)));
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/skill-market';

  const client = new MongoClient(uri);
  await client.connect();
  const skills = client.db().collection('skills');

  // 选未生成的前 limit 个
  const queue = [];
  for (const t of titles) {
    if (queue.length >= limit) break;
    const slug = slugify(t.title);
    const skillId = `role:${t.category}~${slug}`.replace(/\//g, '~').replace(/\s+/g, '-');
    if (!(await skills.findOne({ skillId }, { projection: { _id: 1 } }))) queue.push(t);
  }
  console.log(`[gen] 待生成 ${queue.length} 个（limit=${limit}, concurrency=${concurrency}, MIN_SCORE=${MIN_SCORE}）`);

  let ok = 0, fail = 0, skip = 0, i = 0;
  async function worker(wid) {
    while (i < queue.length) {
      const item = queue[i++];
      const n = i;
      try {
        const r = await genOne(skills, item);
        if (r.status === 'ok') { ok++; console.log(`  [${n}/${queue.length}] ✓ ${item.title} (score=${r.score})`); }
        else if (r.status === 'skip') { skip++; }
        else { fail++; console.log(`  [${n}/${queue.length}] ✗ ${item.title} (${r.reason})`); }
      } catch (e) {
        fail++; console.log(`  [${n}/${queue.length}] ✗ ${item.title} (${e.message})`);
        appendJsonl(FAILED, { title: item.title, category: item.category, reason: e.message, at: Date.now() });
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, (_, w) => worker(w)));

  const total = await skills.countDocuments({ kind: 'role' });
  console.log(`[gen] 完成 ok=${ok} fail=${fail} skip=${skip}；角色总数=${total}`);
  await client.close();
}

main().catch((e) => { console.error('生成失败:', e); process.exit(1); });
