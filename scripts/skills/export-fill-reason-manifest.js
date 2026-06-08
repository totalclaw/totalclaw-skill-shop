'use strict';

/**
 * 导出 fillReason 角色 manifest（供 batch proofread 分批跑）。
 *
 *   node scripts/skills/export-fill-reason-manifest.js --write --batch-size 1000
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { extractRoleFromMd } = require('./lib/proofread-body');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';

const argNum = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? Number(process.argv[i + 1]) : d;
};

async function main() {
  const write = process.argv.includes('--write');
  const batchSize = argNum('batch-size', 1000);
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const roles = new Map();
  const cur = col.find({
    kind: 'skill',
    'securityAudit.programmatic.fillReason': { $exists: true },
  }, { projection: { contentMd: 1, category: 1 } });

  while (await cur.hasNext()) {
    const d = await cur.next();
    const name = extractRoleFromMd(d.contentMd);
    const cat = d.category || /category:\s*"([^"]+)"/.exec(d.contentMd || '')?.[1] || '';
    if (!name || !cat) continue;
    roles.set(`${name}@${cat}`, { name, category: cat });
  }

  const list = [...roles.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh') || a.category.localeCompare(b.category, 'zh'));
  const batches = [];
  for (let i = 0; i < list.length; i += batchSize) {
    batches.push(list.slice(i, i + batchSize));
  }

  console.log(`fillReason 角色 ${list.length}，分 ${batches.length} 批（每批 ${batchSize}）`);

  if (write) {
    for (let i = 0; i < batches.length; i++) {
      const id = String(i + 1).padStart(3, '0');
      const dir = path.resolve(__dirname, `../../data/skills/proofread-batches/batch-fill-${id}`);
      fs.mkdirSync(dir, { recursive: true });
      const manifest = {
        生成时间: new Date().toISOString(),
        批次: `fill-${id}`,
        来源: 'fillReason skills',
        角色数: batches[i].length,
        角色: batches[i],
      };
      fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
      console.log('→', path.join(dir, 'manifest.json'));
    }
  }

  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { main };
