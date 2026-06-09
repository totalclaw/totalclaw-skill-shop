'use strict';
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '../../data/skills/translate-batches');
const ZH_DIR = path.resolve(__dirname, 'batch-17-20-zh');

const BATCH_MODULES = {
  17: [
    './batch-17/01-docs-feeder',
    './batch-17/02-linkswarm-api',
    './batch-17/03-hrbp',
    './batch-17/04-farseek',
    './batch-17/05-jobhunter',
    './batch-17/06-alibaba-supplier',
    './batch-17/07-fuku-sportsbook',
    './batch-17/08-sportsbook',
    './batch-17/09-crypto-payments',
    './batch-17/10-crypto-prices',
    './batch-17/11-deepclaw',
    './batch-17/12-krumpklaw',
    './batch-17/13-sap-journal-auditor',
    './batch-17/14-clawringhouse',
    './batch-17/15-clawville',
  ],
  18: Array.from({ length: 15 }, (_, i) => `./batch-18/${String(i + 1).padStart(2, '0')}`),
  19: Array.from({ length: 15 }, (_, i) => `./batch-19/${String(i + 1).padStart(2, '0')}`),
  20: Array.from({ length: 15 }, (_, i) => `./batch-20/${String(i + 1).padStart(2, '0')}`),
};

for (const [batch, modules] of Object.entries(BATCH_MODULES)) {
  const input = JSON.parse(fs.readFileSync(path.join(OUT_DIR, `batch-${batch}-input.json`), 'utf8'));
  const lines = [];
  for (let i = 0; i < input.length; i++) {
    const modPath = path.join(ZH_DIR, modules[i]);
    let t;
    try {
      t = require(modPath);
    } catch (e) {
      throw new Error(`Missing translation module ${modPath} for ${input[i].skillId}: ${e.message}`);
    }
    if (t.skillId !== input[i].skillId) {
      throw new Error(`skillId mismatch at batch ${batch} #${i + 1}: ${t.skillId} vs ${input[i].skillId}`);
    }
    lines.push(JSON.stringify({ skillId: t.skillId, descriptionZh: t.descriptionZh, bodyZh: t.bodyZh }));
  }
  const outFile = path.join(OUT_DIR, `batch-${batch}-output.jsonl`);
  fs.writeFileSync(outFile, lines.join('\n') + '\n', 'utf8');
  console.log(`Wrote ${lines.length} lines to ${outFile}`);
}
