'use strict';
const fs = require('fs');
const path = require('path');

const DIR = path.resolve(__dirname, 'batch-05-06-zh');
const OUT_DIR = path.resolve(__dirname, '../../data/skills/translate-batches');

function loadBatch(batchNum) {
  const files = fs
    .readdirSync(DIR)
    .filter((f) => f.startsWith(`batch-${String(batchNum).padStart(2, '0')}-`))
    .sort();
  return files.map((f) => require(path.join(DIR, f)));
}

function writeJsonl(batchNum, entries) {
  const out = path.join(OUT_DIR, `batch-${String(batchNum).padStart(2, '0')}-output.jsonl`);
  fs.writeFileSync(out, entries.map((e) => JSON.stringify(e)).join('\n') + '\n', 'utf8');
  console.log(`Wrote ${entries.length} lines → ${out}`);
  return entries.length;
}

const b5 = loadBatch(5);
const b6 = loadBatch(6);
const c5 = writeJsonl(5, b5);
const c6 = writeJsonl(6, b6);
console.log(`Total: batch-05=${c5}, batch-06=${c6}, combined=${c5 + c6}`);
