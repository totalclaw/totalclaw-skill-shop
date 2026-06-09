'use strict';

/**
 * 导出待翻译 free skill 批次（供 agent 离线翻译，不用 DeepSeek）。
 *
 *   node scripts/skills/export-free-skill-translate-batch.js
 *   node scripts/skills/export-free-skill-translate-batch.js --batch-size 40
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const OUT_DIR = path.resolve(__dirname, '../../data/skills/translate-batches');

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i !== -1 && process.argv[i + 1] ? Number(process.argv[i + 1]) : d;
};

function extractEnglishBody(contentMd) {
  const md = String(contentMd || '');
  const fmMatch = /^---\n[\s\S]*?\n---\n/.exec(md);
  const fm = fmMatch ? fmMatch[0] : '';
  const rest = fmMatch ? md.slice(fm.length) : md;
  const origIdx = rest.search(/^##\s*原文/m);
  const english = origIdx >= 0 ? rest.slice(origIdx).replace(/^##\s*原文\s*\n?/, '').trim() : rest.trim();
  return { fm, english };
}

async function main() {
  const batchSize = arg('batch-size', 40);
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const filter = {
    kind: 'skill',
    source: 'totalclaw',
    listingType: { $ne: 'inactive' },
    $or: [{ listingType: 'free' }, { 'pricing.model': 'free' }],
    $or: [
      { descriptionZh: { $in: [null, ''] } },
      { descriptionZh: { $exists: false } },
    ],
  };

  // Fix duplicate $or - use $and
  const query = {
    kind: 'skill',
    source: 'totalclaw',
    listingType: { $ne: 'inactive' },
    $and: [
      { $or: [{ listingType: 'free' }, { 'pricing.model': 'free' }] },
      { $or: [{ descriptionZh: { $in: [null, ''] } }, { descriptionZh: { $exists: false } }] },
    ],
  };

  const items = [];
  const cur = col.find(query, {
    projection: { skillId: 1, name: 1, category: 1, description: 1, contentMd: 1 },
  });

  while (await cur.hasNext()) {
    const d = await cur.next();
    const { fm, english } = extractEnglishBody(d.contentMd);
    items.push({
      skillId: d.skillId,
      name: d.name,
      category: d.category || '',
      descriptionEn: (d.description || '').trim(),
      hasFrontmatter: Boolean(fm),
      englishBody: english.slice(0, 14000),
      englishTruncated: english.length > 14000,
    });
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const batches = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const id = String(Math.floor(i / batchSize) + 1).padStart(2, '0');
    const file = path.join(OUT_DIR, `batch-${id}-input.json`);
    fs.writeFileSync(file, JSON.stringify(batch, null, 2), 'utf8');
    batches.push({ id, file, count: batch.length });
  }

  fs.writeFileSync(path.join(OUT_DIR, 'manifest.json'), JSON.stringify({
    total: items.length,
    batchSize,
    batches,
    exportedAt: new Date().toISOString(),
  }, null, 2));

  console.log(JSON.stringify({ total: items.length, batches: batches.length, outDir: OUT_DIR }, null, 2));
  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { extractEnglishBody };
