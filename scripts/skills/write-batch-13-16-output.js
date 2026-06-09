'use strict';
const fs = require('fs');
const path = require('path');

const BATCHES = [13, 14, 15, 16];
const ROOT = path.resolve(__dirname, '../../data/skills/translate-batches');

for (const n of BATCHES) {
  const input = JSON.parse(fs.readFileSync(path.join(ROOT, `batch-${n}-input.json`), 'utf8'));
  const { translations } = require(`./batch-${n}-translations-data`);
  const byId = new Map(translations.map((t) => [t.skillId, t]));
  const lines = [];
  for (const skill of input) {
    const t = byId.get(skill.skillId);
    if (!t) throw new Error(`batch-${n}: missing translation for ${skill.skillId}`);
    lines.push(JSON.stringify({ skillId: t.skillId, descriptionZh: t.descriptionZh, bodyZh: t.bodyZh }));
  }
  const out = path.join(ROOT, `batch-${n}-output.jsonl`);
  fs.writeFileSync(out, lines.join('\n') + '\n', 'utf8');
  console.log(`Wrote ${lines.length} lines to batch-${n}-output.jsonl`);
}
