'use strict';
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
const ROOT = path.join(REPO, 'data/skills/translate-batches');
const BATCHES = [13, 14, 15, 16];

function hasCJK(s) {
  return /[\u4e00-\u9fff]/.test(s);
}

let total = 0;
for (const n of BATCHES) {
  const input = JSON.parse(fs.readFileSync(path.join(ROOT, `batch-${n}-input.json`), 'utf8'));
  const dir = path.join(__dirname, `batch-${n}-zh`);
  const files = fs
    .readdirSync(dir)
    .filter((f) => /^\d{2}-.+\.js$/.test(f))
    .sort();
  const byId = new Map();
  for (const f of files) {
    const m = require(path.join(dir, f));
    byId.set(m.skillId, m);
  }
  const lines = [];
  for (const skill of input) {
    const t = byId.get(skill.skillId);
    if (!t) throw new Error(`batch-${n} missing translation: ${skill.skillId}`);
    if (!hasCJK(t.descriptionZh) || !hasCJK(t.bodyZh)) {
      throw new Error(`batch-${n} invalid ZH: ${skill.skillId}`);
    }
    lines.push(JSON.stringify({ skillId: t.skillId, descriptionZh: t.descriptionZh, bodyZh: t.bodyZh }));
  }
  fs.writeFileSync(path.join(ROOT, `batch-${n}-output.jsonl`), lines.join('\n') + '\n', 'utf8');
  console.log(`batch-${n}: ${lines.length} skills`);
  total += lines.length;
}
console.log(`TOTAL: ${total}`);
