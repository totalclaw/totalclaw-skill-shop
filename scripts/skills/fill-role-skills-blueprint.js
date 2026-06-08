'use strict';

/**
 * 为缺 skill / 方向不匹配的角色补全 8 条 complete 批次技能（blueprint-aware v1.5.2）。
 * 不调用外部 LLM；职责来自 role-duty-helpers + blueprint-steps。
 *
 * 用法：
 *   node scripts/skills/fill-role-skills-blueprint.js --dry --limit 20
 *   node scripts/skills/fill-role-skills-blueprint.js --apply --from-gaps
 *   node scripts/skills/fill-role-skills-blueprint.js --apply --from-gaps --status no-skills,misaligned
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const {
  buildProfile, buildBody, enrichProfile, blueprints, slugify, hash36, BATCH_BY,
} = require('./polish-role-skills');
const { dutiesFromTitle } = require('./role-duty-helpers');
const { SUFFIXES } = require('./lib/proofread-audit');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const GAPS_PATH = path.resolve(__dirname, '../../data/skills/role-skill-coverage-gaps.jsonl');
const PRICE = Number(process.env.SKILL_PRICE || 9);

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : d;
};

function skillIdFor(role, suffix) {
  const slug = slugify(role.slug || role.name);
  const h = hash36(`${slug}:${role.name}:${role.category}:${suffix}:fill-v1`);
  return `totalclaw:roleskill~${slug}-${h}`;
}

function loadGaps() {
  if (!fs.existsSync(GAPS_PATH)) throw new Error(`缺缺口文件: ${GAPS_PATH}，先运行 scan-role-skill-coverage.js --write`);
  const statusFilter = (arg('status', 'no-skills,insufficient-skills,misaligned') || '').split(',').filter(Boolean);
  const lines = fs.readFileSync(GAPS_PATH, 'utf8').trim().split('\n').filter(Boolean);
  return lines
    .map((l) => JSON.parse(l))
    .filter((g) => statusFilter.includes(g.status));
}

function buildEightSkills(roleDoc) {
  let profile = buildProfile(roleDoc);
  profile = enrichProfile(profile, dutiesFromTitle(profile.name, profile.category));
  const opts = { blueprintAware: true, usabilityV2: true };
  const out = [];
  for (const blueprint of blueprints) {
    const skillId = skillIdFor(roleDoc, blueprint.suffix);
    const contentMd = buildBody(profile, blueprint, skillId, opts);
    out.push({
      skillId,
      suffix: blueprint.suffix,
      name: `${profile.name}${blueprint.suffix}`,
      description: blueprint.desc(profile),
      contentMd,
    });
  }
  return out;
}

async function main() {
  const apply = process.argv.includes('--apply');
  const dry = !apply;
  const fromGaps = process.argv.includes('--from-gaps');
  const limit = Number(arg('limit', 0));

  let targets = [];
  if (fromGaps) {
    targets = loadGaps().map((g) => ({ name: g.name, category: g.category, status: g.status }));
  } else {
    console.error('请使用 --from-gaps');
    process.exit(1);
  }
  if (limit) targets = targets.slice(0, limit);

  console.log(`${dry ? 'dry-run' : '写库'} | 目标角色 ${targets.length}`);

  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  let rolesOk = 0;
  let skillsWritten = 0;
  let skip = 0;
  const samples = [];

  for (const t of targets) {
    const roleDoc = await col.findOne({ kind: 'role', name: t.name, category: t.category });
    if (!roleDoc) { skip++; continue; }

    const existingComplete = await col.countDocuments({
      kind: 'skill',
      'securityAudit.programmatic.by': BATCH_BY,
      contentMd: new RegExp(`role:\\s*"${t.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`),
      category: t.category,
    });
    if (existingComplete >= 8 && t.status !== 'misaligned') { skip++; continue; }

    const specs = buildEightSkills(roleDoc);
    if (dry) {
      rolesOk++;
      if (samples.length < 2) samples.push({ role: t.name, category: t.category, firstSkill: specs[0].name, len: specs[0].contentMd.length });
      continue;
    }

    for (const spec of specs) {
      const slug = spec.skillId.replace(/^totalclaw:roleskill~/, '');
      await col.updateOne({ skillId: spec.skillId }, {
        $set: {
          skillId: spec.skillId,
          slug,
          name: spec.name,
          displayName: spec.name,
          description: spec.description,
          descriptionZh: spec.description,
          category: roleDoc.category,
          tags: ['totalclaw-agent', '岗位技能', roleDoc.category, roleDoc.name, spec.suffix],
          source: 'totalclaw',
          kind: 'skill',
          contentMd: spec.contentMd,
          author: 'TotalClaw',
          version: '1.5.2',
          syncedAt: new Date(),
          lastUpdated: new Date(),
          securityAudit: {
            programmatic: {
              score: 90,
              reason: 'blueprint fill from role duties',
              by: BATCH_BY,
              filledAt: new Date().toISOString(),
              fillReason: t.status,
              proofreadValidated: false,
            },
          },
        },
        $setOnInsert: {
          listingType: 'paid',
          ownership: 'totalclaw-proprietary',
          closedSource: true,
          pricing: { model: 'paid', price: PRICE, currency: 'CNY' },
          reviewStatus: 'n/a',
          featured: false,
          stats: { downloads: 0, sales: 0, ratingAvg: 0, ratingCount: 0 },
        },
      }, { upsert: true });
      skillsWritten++;
    }
    await col.updateOne({ _id: roleDoc._id }, { $set: { skillsDone: true, lastUpdated: new Date() } });
    rolesOk++;
  }

  console.log(JSON.stringify({ rolesOk, skillsWritten, skip, samples }, null, 2));
  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { buildEightSkills, skillIdFor };
