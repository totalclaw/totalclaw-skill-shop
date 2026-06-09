'use strict';

/**
 * 修复 contentMd 中字面量 \\n（应为真实换行）的数据问题。
 * 跳过 fenced code block 内的内容，避免破坏 JSON/代码示例。
 *
 *   node scripts/skills/fix-literal-backslash-n.js --dry
 *   node scripts/skills/fix-literal-backslash-n.js --apply
 */

const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';

function unescapeOutsideCodeFences(text) {
  const parts = String(text || '').split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (i % 2 === 1) return part;
    return part.replace(/\\n/g, '\n').replace(/\\t/g, '\t');
  }).join('');
}

function needsFix(md) {
  return /\\n/.test(md);
}

async function main() {
  const apply = process.argv.includes('--apply');
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  let scanned = 0;
  let matched = 0;
  let ops = [];

  const cur = col.find({ kind: 'skill', contentMd: /\\n/ }, {
    projection: { skillId: 1, contentMd: 1 },
  });

  while (await cur.hasNext()) {
    const doc = await cur.next();
    scanned++;
    const fixed = unescapeOutsideCodeFences(doc.contentMd);
    if (fixed === doc.contentMd || !needsFix(fixed)) continue;
    matched++;
    if (apply) {
      ops.push({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              contentMd: fixed,
              lastUpdated: new Date(),
              'securityAudit.programmatic.backslashNFixAt': new Date().toISOString(),
            },
          },
        },
      });
      if (ops.length >= 200) {
        await col.bulkWrite(ops, { ordered: false });
        ops = [];
      }
    }
  }
  if (ops.length) await col.bulkWrite(ops, { ordered: false });

  console.log(JSON.stringify({ scanned, matched, applied: apply }, null, 2));
  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { unescapeOutsideCodeFences };
