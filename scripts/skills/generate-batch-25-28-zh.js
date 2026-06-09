#!/usr/bin/env node
'use strict';

/**
 * Generate batch-25 through batch-28-output.jsonl (manual EN→ZH, no API).
 */
const fs = require('fs');
const path = require('path');
const { extractZh, firstLineSummary } = require('./lib/translate-batch-helpers');

const BATCH_DIR = path.resolve(__dirname, '../../data/skills/translate-batches');
const DESCRIPTIONS = require('./batch-25-28-zh-descriptions');
const bodies = require('./batch-25-28-zh-bodies');
const manual25 = require('./zh-data/batch-25-zh');

function translateBody(skill) {
  const { skillId, englishBody } = skill;
  if (bodies[skillId]) return bodies[skillId];
  const m25 = manual25[skillId];
  if (m25 && m25.bodyZh) return m25.bodyZh;
  const zh = extractZh(englishBody);
  if (zh) return zh;
  throw new Error(`Missing body translation for ${skillId}`);
}

function descriptionZh(skill) {
  const { skillId, descriptionEn, name } = skill;
  if (DESCRIPTIONS[skillId]) return DESCRIPTIONS[skillId];
  const m25 = manual25[skillId];
  if (m25 && m25.descriptionZh) return m25.descriptionZh;
  const zh = extractZh(skill.englishBody);
  if (zh) return firstLineSummary(zh, name);
  if (descriptionEn && descriptionEn.trim()) return descriptionEn;
  return name;
}

function processBatch(num) {
  const inputPath = path.join(BATCH_DIR, `batch-${String(num).padStart(2, '0')}-input.json`);
  const outputPath = path.join(BATCH_DIR, `batch-${String(num).padStart(2, '0')}-output.jsonl`);
  const items = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const lines = items.map((skill) =>
    JSON.stringify({
      skillId: skill.skillId,
      descriptionZh: descriptionZh(skill),
      bodyZh: translateBody(skill),
    }),
  );
  fs.writeFileSync(outputPath, lines.join('\n') + '\n', 'utf8');
  return items.length;
}

let total = 0;
for (const n of [25, 26, 27, 28]) {
  const c = processBatch(n);
  console.log(`batch-${String(n).padStart(2, '0')}-output.jsonl: ${c} skills`);
  total += c;
}
console.log(`Total: ${total}`);
