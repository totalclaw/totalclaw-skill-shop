'use strict';

const fs = require('fs');
const path = require('path');
const { extractZh, firstLineSummary } = require('./lib/translate-batch-helpers');

const DIR = path.resolve(__dirname, '../../data/skills/translate-batches');
const ZH_DIR = path.join(__dirname, 'zh-data');

function loadManual(batchNum) {
  const f = path.join(ZH_DIR, `batch-${batchNum}-zh.js`);
  if (!fs.existsSync(f)) return {};
  return require(f);
}

function buildRow(skill, manual) {
  const m = manual[skill.skillId] || {};
  let bodyZh = m.bodyZh || extractZh(skill.englishBody);
  if (!bodyZh) {
    throw new Error(`Missing bodyZh for ${skill.skillId}`);
  }
  const descriptionZh =
    m.descriptionZh ||
    (skill.descriptionEn && skill.descriptionEn.trim()) ||
    firstLineSummary(bodyZh, skill.name);
  return { skillId: skill.skillId, descriptionZh, bodyZh };
}

function writeBatch(batchNum) {
  const input = JSON.parse(fs.readFileSync(path.join(DIR, `batch-${String(batchNum).padStart(2, '0')}-input.json`), 'utf8'));
  const manual = loadManual(batchNum);
  const rows = input.map((s) => buildRow(s, manual));
  const out = path.join(DIR, `batch-${String(batchNum).padStart(2, '0')}-output.jsonl`);
  fs.writeFileSync(out, rows.map((r) => JSON.stringify(r)).join('\n') + '\n', 'utf8');
  return rows.length;
}

const counts = [25, 26, 27, 28].map(writeBatch);
const total = counts.reduce((a, b) => a + b, 0);
console.log(JSON.stringify({ batches: counts, total }));
