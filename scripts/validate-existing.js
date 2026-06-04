'use strict';
// 对存量角色/技能全量跑程序验证（只读，不改数据）。
// 校验逻辑与 scripts/roles/generate.js#validateRole、scripts/skills/generate.js#validateSkill 保持一致。
// 用法: node scripts/validate-existing.js
//   失败明细写入 data/validation/role-fails.jsonl、skill-fails.jsonl
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');

const ROLE_MIN = Number(process.env.ROLE_MIN_SCORE || 80);
const SKILL_MIN = Number(process.env.SKILL_MIN_SCORE || 78);
const OUT = path.join(__dirname, '..', 'data', 'validation');

function headers(body) { return (body.match(/^#{1,3}\s+\S/gm) || []).length; }

function validateRole({ title, body, name }) {
  const reasons = []; let score = 100;
  const len = (body || '').length;
  if (len < 400) { reasons.push('正文过短'); score -= 60; }
  if (headers(body) < 2) { reasons.push('结构不足(标题<2)'); score -= 25; }
  const hasVoice = /你是|你的|你将|作为/.test(body) || (title && body.includes(title));
  if (!hasVoice) { reasons.push('缺人格口吻'); score -= 25; }
  if (!String(name || '').trim()) { reasons.push('缺 name'); score -= 30; }
  if (/Insufficient Balance|undefined undefined/.test(body) || /^\s*\{[\s\S]{0,120}"(error|code|message)"\s*:/.test((body || '').trim())) { reasons.push('含异常文本'); score -= 80; }
  return { pass: score >= ROLE_MIN && len >= 400, score: Math.max(0, score), reason: reasons.join(';') || 'ok' };
}

function validateSkill({ body, name }) {
  const reasons = []; let score = 100;
  const len = (body || '').length;
  if (len < 160) { reasons.push('正文过短'); score -= 60; }
  if (headers(body) < 1) { reasons.push('无结构标题'); score -= 25; }
  if (!/何时使用|使用场景|步骤|流程|输入|输出|要求|示例/.test(body)) { reasons.push('缺用途/步骤'); score -= 25; }
  if (!String(name || '').trim()) { reasons.push('缺 name'); score -= 30; }
  if (/Insufficient Balance|undefined undefined/.test(body) || /^\s*\{[\s\S]{0,120}"(error|code|message)"\s*:/.test((body || '').trim())) { reasons.push('含异常文本'); score -= 80; }
  return { pass: score >= SKILL_MIN && len >= 160, score: Math.max(0, score), reason: reasons.join(';') || 'ok' };
}

async function audit(col, kind, validate, outFile) {
  fs.mkdirSync(OUT, { recursive: true });
  const ws = fs.createWriteStream(outFile);
  const q = kind === 'role' ? { kind: 'role' } : { kind: { $ne: 'role' }, closedSource: true };
  const cursor = col.find(q, { projection: { skillId: 1, name: 1, contentMd: 1, category: 1 } });
  let total = 0, pass = 0, fail = 0; const reasonCount = {};
  for await (const d of cursor) {
    total++;
    const v = kind === 'role'
      ? validate({ title: d.name, body: d.contentMd || '', name: d.name })
      : validate({ body: d.contentMd || '', name: d.name });
    if (v.pass) { pass++; }
    else {
      fail++;
      ws.write(JSON.stringify({ skillId: d.skillId, name: d.name, category: d.category, score: v.score, reason: v.reason }) + '\n');
      for (const r of v.reason.split(';')) reasonCount[r] = (reasonCount[r] || 0) + 1;
    }
    if (total % 20000 === 0) process.stdout.write(`  ...${kind} 已审 ${total}\n`);
  }
  ws.end();
  return { total, pass, fail, reasonCount };
}

(async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/skill-market';
  const c = new MongoClient(uri); await c.connect();
  const col = c.db('skill-market').collection('skills');

  console.log('=== 程序验证存量数据（只读快照）===');
  const r = await audit(col, 'role', validateRole, path.join(OUT, 'role-fails.jsonl'));
  console.log(`\n【角色】总 ${r.total}  通过 ${r.pass}  不通过 ${r.fail}  通过率 ${(100 * r.pass / Math.max(1, r.total)).toFixed(2)}%`);
  console.log('  不通过原因:', JSON.stringify(r.reasonCount, null, 0));

  const s = await audit(col, 'skill', validateSkill, path.join(OUT, 'skill-fails.jsonl'));
  console.log(`\n【技能】总 ${s.total}  通过 ${s.pass}  不通过 ${s.fail}  通过率 ${(100 * s.pass / Math.max(1, s.total)).toFixed(2)}%`);
  console.log('  不通过原因:', JSON.stringify(s.reasonCount, null, 0));

  console.log(`\n失败明细: data/validation/role-fails.jsonl、skill-fails.jsonl`);
  await c.close();
})().catch((e) => { console.error('审计失败:', e); process.exit(1); });
