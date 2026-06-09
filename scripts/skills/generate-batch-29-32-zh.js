#!/usr/bin/env node
'use strict';

/**
 * Generate batch-29 through batch-32-output.jsonl (manual EN→ZH, no API).
 */
const fs = require('fs');
const path = require('path');
const { extractZh, extractEn, firstLineSummary } = require('./lib/translate-batch-helpers');
const { applyBulkZh } = require('./batch-25-28-zh-bulk-translate');
const DESCRIPTIONS = require('./batch-29-32-zh-descriptions');
const bodiesPart1 = require('./batch-29-32-zh-bodies-part1');
const bodiesPart2 = require('./batch-29-32-zh-bodies-part2');
const bodiesPart3 = require('./batch-29-32-zh-bodies-part3');

const BODIES = { ...bodiesPart1, ...bodiesPart2, ...bodiesPart3 };
const BATCH_DIR = path.resolve(__dirname, '../../data/skills/translate-batches');

const CHINESE_ONLY = new Set([
  'totalclaw:totalclaw~tiktok-viral-predictor',
  'totalclaw:totalclaw~weibo-trending-bot',
  'totalclaw:totalclaw~业务线主管',
  'totalclaw:totalclaw~通用进阶功能',
  'totalclaw:totalclaw~ebay-product-research',
  'totalclaw:totalclaw~产品经理',
]);

function isMostlyChinese(text) {
  const cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const latin = (text.match(/[a-zA-Z]/g) || []).length;
  return cjk > latin * 0.5;
}

function translateBody(skill) {
  const { skillId, englishBody } = skill;
  if (BODIES[skillId]) return BODIES[skillId];
  if (CHINESE_ONLY.has(skillId)) return englishBody.trim();
  const zh = extractZh(englishBody);
  if (zh) return zh;
  if (isMostlyChinese(englishBody)) return englishBody.trim();
  const en = extractEn(englishBody);
  const desc = DESCRIPTIONS[skillId] || skill.name;
  return `> **中文摘要：** ${desc}\n\n${applyBulkZh(en)}`;
}

function descriptionZh(skill) {
  const { skillId, descriptionEn, name } = skill;
  if (DESCRIPTIONS[skillId]) return DESCRIPTIONS[skillId];
  const zh = extractZh(skill.englishBody);
  if (zh) return firstLineSummary(zh, name);
  if (CHINESE_ONLY.has(skillId) || isMostlyChinese(skill.englishBody)) {
    return firstLineSummary(skill.englishBody, name);
  }
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
for (const n of [29, 30, 31, 32]) {
  const c = processBatch(n);
  console.log(`batch-${String(n).padStart(2, '0')}-output.jsonl: ${c} skills`);
  total += c;
}
console.log(`Total: ${total}`);
