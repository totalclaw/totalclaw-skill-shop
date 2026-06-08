'use strict';

/**
 * 从 MongoDB proofreadBatch 字段导出 manifest.json
 *
 * 用法：
 *   node scripts/skills/export-proofread-manifest.js --batch 002
 *   node scripts/skills/export-proofread-manifest.js --batch 002 --write
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { extractRoleFromMd } = require('./lib/proofread-body');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const BATCH_BY = 'complete-totalclaw-agent-role-skills';

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

async function exportManifest(batchNo, write) {
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const roles = new Map();
  const cur = col.find({
    kind: 'skill',
    'securityAudit.programmatic.by': BATCH_BY,
    'securityAudit.programmatic.proofreadBatch': batchNo,
  }, { projection: { contentMd: 1, category: 1 } });

  while (await cur.hasNext()) {
    const d = await cur.next();
    const name = extractRoleFromMd(d.contentMd);
    const category = d.category || /category:\s*"([^"]+)"/.exec(d.contentMd || '')?.[1] || '';
    if (!name || !category) continue;
    roles.set(`${name}@${category}`, { name, category });
  }

  const list = [...roles.values()].sort((a, b) => a.name.localeCompare(b.name, 'zh') || a.category.localeCompare(b.category, 'zh'));
  const manifest = {
    生成时间: new Date().toISOString(),
    批次: batchNo,
    角色数: list.length,
    来源: `MongoDB proofreadBatch=${batchNo}`,
    角色: list,
  };

  const outDir = path.resolve(__dirname, `../../data/skills/proofread-batches/batch-${batchNo}`);
  const outPath = path.join(outDir, 'manifest.json');

  if (write) {
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2), 'utf8');
  }

  await client.close();
  return { manifest, outPath, count: list.length };
}

async function main() {
  const batchNo = arg('batch', '002');
  const write = process.argv.includes('--write');
  const { manifest, outPath, count } = await exportManifest(batchNo, write);
  console.log(`batch-${batchNo}: ${count} 角色`);
  if (write) console.log('→', outPath);
  else console.log('（dry-run，加 --write 写文件）');
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { exportManifest };
