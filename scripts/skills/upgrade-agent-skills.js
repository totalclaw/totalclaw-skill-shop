'use strict';

/**
 * Legacy agent-skill 升级为 complete 风格 frontmatter + 补齐章节。
 * 若同角色已有 8 条 complete 批次技能，则 agent-skill 标记 inactive（deprecated）。
 *
 *   node scripts/skills/upgrade-agent-skills.js --dry
 *   node scripts/skills/upgrade-agent-skills.js --apply
 *   node scripts/skills/upgrade-agent-skills.js --apply --limit 5000
 */

const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { fixEncoding, hasCorruption } = require('./lib/proofread-body');
const { patchBodyWithSections } = require('./patch-pilot-sections');
const { shortHash, slugify } = require('./polish-role-skills');
const { SUFFIXES } = require('./lib/proofread-audit');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const COMPLETE_BY = 'complete-totalclaw-agent-role-skills';
const AGENT_BY = 'agent-skill';

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i !== -1 && process.argv[i + 1] ? Number(process.argv[i + 1]) : d;
};

function yamlEscape(s) {
  return String(s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function extractRoleFromTags(tags) {
  if (!Array.isArray(tags)) return '';
  const candidate = tags.find((t) => t && t !== '岗位技能' && t !== 'totalclaw-agent' && t.length >= 2 && t.length <= 40) || '';
  return fixEncoding(candidate);
}

function wrapWithFrontmatter(doc, roleName, category) {
  const skillName = doc.name || '技能';
  const fmName = `${slugify(skillName)}-${shortHash(doc.skillId || skillName)}`;
  const desc = fixEncoding(doc.description || doc.descriptionZh || `${roleName}岗位技能：${skillName}`);
  const tags = ['totalclaw-agent', '岗位技能', category, roleName].filter(Boolean);
  let body = fixEncoding(String(doc.contentMd || '').trim());
  if (!body.startsWith('#')) body = `# ${skillName}\n\n${body}`;
  body = patchBodyWithSections(body, roleName) || body;

  const fm = [
    '---',
    `name: ${fmName}`,
    `description: "${yamlEscape(desc)}"`,
    'version: 1.5.2',
    'author: TotalClaw',
    'metadata:',
    '  totalclaw:',
    `    role: "${yamlEscape(roleName)}"`,
    `    category: "${yamlEscape(category)}"`,
    '    exposure:',
    '      runtime_visible: true',
    '      prompt_visible: true',
    '      user_invocable: true',
    '    tags:',
    ...tags.map((t) => `      - "${yamlEscape(t)}"`),
    '---',
  ].join('\n');

  return {
    contentMd: `${fm}\n\n${body}\n`,
    description: desc,
    descriptionZh: desc,
    tags: [...new Set([...(doc.tags || []).filter((t) => t !== 'openclaw'), ...tags])],
    source: 'totalclaw',
  };
}

async function loadComplete8Keys(col) {
  const keys = new Set();
  const cur = col.find({
    kind: 'skill',
    'securityAudit.programmatic.by': COMPLETE_BY,
  }, { projection: { name: 1, category: 1, contentMd: 1 } });
  const groups = new Map();
  while (await cur.hasNext()) {
    const d = await cur.next();
    const role = /role:\s*"([^"]+)"/.exec(d.contentMd || '')?.[1] || '';
    const cat = d.category || '';
    if (!role) continue;
    const key = `${role}@${cat}`;
    if (!groups.has(key)) groups.set(key, new Set());
    for (const suf of SUFFIXES) {
      if (d.name === `${role}${suf}`) groups.get(key).add(suf);
    }
  }
  for (const [key, suf] of groups) {
    if (suf.size >= 8) keys.add(key);
  }
  return keys;
}

async function roleHasComplete8(completeKeys, roleName, category) {
  return completeKeys.has(`${roleName}@${category}`);
}

async function main() {
  const apply = process.argv.includes('--apply');
  const limit = arg('limit', 0);

  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  console.log('加载 complete-8 角色索引…');
  const completeKeys = await loadComplete8Keys(col);
  console.log(`  complete-8 角色: ${completeKeys.size}`);

  const filter = {
    kind: 'skill',
    'securityAudit.programmatic.by': AGENT_BY,
    contentMd: { $not: /^---/ },
  };

  let upgraded = 0;
  let deprecated = 0;
  let skip = 0;
  let ops = [];

  const cur = col.find(filter, {
    projection: {
      skillId: 1, name: 1, category: 1, contentMd: 1, description: 1, descriptionZh: 1, tags: 1,
    },
  });

  while (await cur.hasNext()) {
    if (limit && upgraded + deprecated >= limit) break;
    const doc = await cur.next();
    const roleName = extractRoleFromTags(doc.tags);
    const category = doc.category || '';
    if (!roleName || !category) { skip++; continue; }

    if (await roleHasComplete8(completeKeys, roleName, category)) {
      deprecated++;
      if (apply) {
        ops.push({
          updateOne: {
            filter: { _id: doc._id },
            update: {
              $set: {
                listingType: 'inactive',
                reviewStatus: 'deprecated',
                lastUpdated: new Date(),
                'securityAudit.programmatic.by': 'agent-skill-deprecated',
                'securityAudit.programmatic.deprecatedReason': 'superseded-by-complete-batch',
                'securityAudit.programmatic.deprecatedAt': new Date().toISOString(),
              },
            },
          },
        });
      }
    } else {
      const wrapped = wrapWithFrontmatter(doc, roleName, category);
      if (hasCorruption(wrapped.contentMd)) { skip++; continue; }
      upgraded++;
      if (apply) {
        ops.push({
          updateOne: {
            filter: { _id: doc._id },
            update: {
              $set: {
                ...wrapped,
                source: 'totalclaw',
                version: '1.5.2',
                lastUpdated: new Date(),
                'securityAudit.programmatic.by': 'agent-skill-upgraded',
                'securityAudit.programmatic.upgradedAt': new Date().toISOString(),
                'securityAudit.programmatic.upgradedFrom': AGENT_BY,
              },
            },
          },
        });
      }
    }

    if (ops.length >= 200) {
      await col.bulkWrite(ops, { ordered: false });
      ops = [];
      if ((upgraded + deprecated) % 2000 === 0) console.log(`  …upgraded ${upgraded} deprecated ${deprecated}`);
    }
  }
  if (ops.length) await col.bulkWrite(ops, { ordered: false });

  console.log(JSON.stringify({ upgraded, deprecated, skip, applied: apply }, null, 2));
  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { wrapWithFrontmatter, extractRoleFromTags };
