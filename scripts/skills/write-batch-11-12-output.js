'use strict';
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '../../data/skills/translate-batches');
const t11 = require('./batch-11-12-zh/batch-11');
const t12 = require('./batch-11-12-zh/batch-12');

function writeBatch(name, translations) {
  const input = JSON.parse(fs.readFileSync(path.join(OUT_DIR, `${name}-input.json`), 'utf8'));
  const map = new Map(translations.map((t) => [t.skillId, t]));
  const lines = [];
  for (const row of input) {
    const t = map.get(row.skillId);
    if (!t) throw new Error(`Missing translation: ${row.skillId}`);
    lines.push(JSON.stringify({ skillId: row.skillId, descriptionZh: t.descriptionZh, bodyZh: t.bodyZh }));
  }
  const out = path.join(OUT_DIR, `${name}-output.jsonl`);
  fs.writeFileSync(out, lines.join('\n') + '\n', 'utf8');
  return lines.length;
}

const n11 = writeBatch('batch-11', t11);
const n12 = writeBatch('batch-12', t12);
console.log(JSON.stringify({ batch11: n11, batch12: n12, total: n11 + n12 }));
