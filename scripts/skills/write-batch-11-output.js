'use strict';
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '../../data/skills/translate-batches/batch-11-output.jsonl');
const INPUT = path.resolve(__dirname, '../../data/skills/translate-batches/batch-11-input.json');
const { translations } = require('./batch-11-translations-data');

const input = JSON.parse(fs.readFileSync(INPUT, 'utf8'));
const byId = new Map(translations.map((t) => [t.skillId, t]));

const lines = [];
for (const skill of input) {
  const t = byId.get(skill.skillId);
  if (!t) throw new Error(`Missing translation for ${skill.skillId}`);
  lines.push(
    JSON.stringify({
      skillId: t.skillId,
      descriptionZh: t.descriptionZh,
      bodyZh: t.bodyZh,
    })
  );
}

fs.writeFileSync(OUT, lines.join('\n') + '\n', 'utf8');
console.log(`Wrote ${lines.length} lines to ${OUT}`);
