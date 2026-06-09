'use strict';
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '../../data/skills/translate-batches/batch-02-output.jsonl');

const entries = [];

function add(skillId, descriptionZh, bodyZh) {
  entries.push({ skillId, descriptionZh, bodyZh });
}

// Translations loaded from companion module
const { translations } = require('./batch-02-translations-data');

for (const t of translations) {
  add(t.skillId, t.descriptionZh, t.bodyZh);
}

const lines = entries.map((e) => JSON.stringify(e));
fs.writeFileSync(OUT, lines.join('\n') + '\n', 'utf8');
console.log(`Wrote ${entries.length} lines to ${OUT}`);
