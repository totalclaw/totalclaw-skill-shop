'use strict';

/**
 * 将 openclaw 错误 source/tags 修复为 totalclaw（仅限误标为 openclaw 的自研记录）。
 * ⚠️ source=openclaw 的第三方镜像请用 isolate-third-party-skills.js 下架，勿用本脚本改 source。
 * 标签清理请用 fix-openclaw-tags.js。
 *
 *   node scripts/skills/fix-openclaw-source.js --dry
 *   node scripts/skills/fix-openclaw-source.js --apply
 */

const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';

function normalizeTags(tags, category, roleName) {
  const out = Array.isArray(tags) ? [...tags] : [];
  const drop = new Set(['openclaw', 'OpenClaw']);
  const filtered = out.filter((t) => !drop.has(t));
  for (const t of ['totalclaw-agent', '岗位技能']) {
    if (!filtered.includes(t)) filtered.push(t);
  }
  if (category && !filtered.includes(category)) filtered.push(category);
  if (roleName && !filtered.includes(roleName)) filtered.push(roleName);
  return filtered;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const filter = {
    kind: 'skill',
    $or: [
      { source: 'openclaw' },
      { tags: 'openclaw' },
      { tags: 'OpenClaw' },
    ],
  };

  const cur = col.find(filter, { projection: { skillId: 1, tags: 1, category: 1, contentMd: 1 } });
  let n = 0;
  let ops = [];

  while (await cur.hasNext()) {
    const doc = await cur.next();
    n++;
    const roleName = /role:\s*"([^"]+)"/.exec(doc.contentMd || '')?.[1] || '';
    const tags = normalizeTags(doc.tags, doc.category, roleName);
    if (apply) {
      ops.push({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              source: 'totalclaw',
              tags,
              lastUpdated: new Date(),
              'securityAudit.programmatic.sourceFix': 'openclaw-to-totalclaw',
              'securityAudit.programmatic.sourceFixAt': new Date().toISOString(),
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

  console.log(JSON.stringify({ matched: n, applied: apply }, null, 2));
  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
