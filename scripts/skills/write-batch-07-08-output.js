'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../data/skills/translate-batches');
const ZH_DIR = path.resolve(__dirname, 'batch-07-08-zh');
const DESC = JSON.parse(fs.readFileSync(path.join(ZH_DIR, 'descriptions.json'), 'utf8'));

function loadBody(slug) {
  const md = path.join(ZH_DIR, 'bodies', `${slug}.md`);
  const js = path.join(ZH_DIR, 'long', `${slug}.js`);
  if (fs.existsSync(md)) return fs.readFileSync(md, 'utf8').replace(/\r\n/g, '\n').trimEnd();
  if (fs.existsSync(js)) return require(js).bodyZh;
  throw new Error(`Missing body for ${slug}`);
}

function writeBatch(batchNum) {
  const input = JSON.parse(fs.readFileSync(path.join(ROOT, `batch-${String(batchNum).padStart(2, '0')}-input.json`), 'utf8'));
  const lines = input.map((row) => {
    const slug = row.skillId.split('~').pop();
    const descriptionZh = DESC[row.skillId];
    const bodyZh = loadBody(slug);
    if (!descriptionZh) throw new Error(`Missing description for ${row.skillId}`);
    return JSON.stringify({ skillId: row.skillId, descriptionZh, bodyZh });
  });
  const out = path.join(ROOT, `batch-${String(batchNum).padStart(2, '0')}-output.jsonl`);
  fs.writeFileSync(out, lines.join('\n') + '\n', 'utf8');
  console.log(`Wrote ${lines.length} lines -> ${out}`);
  return lines.length;
}

const n7 = writeBatch(7);
const n8 = writeBatch(8);
console.log(`Total: ${n7 + n8} (${n7} batch-07, ${n8} batch-08)`);
