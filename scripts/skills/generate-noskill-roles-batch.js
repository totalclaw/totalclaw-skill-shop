'use strict';

/**
 * Generate complete-batch role skills for roles listed in noskill audit.
 *
 * Usage:
 *   node scripts/skills/generate-noskill-roles-batch.js [--dry-run]
 */
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { hash36 } = require('./generate-totalclaw-agent-batch');
const {
  buildProfile,
  enrichProfile,
  buildBody,
  hasRedLine,
  blueprints,
  BATCH_BY,
} = require('./polish-role-skills');
const { dutiesFromTitle } = require('./role-duty-helpers');

const PRICE = Number(process.env.SKILL_PRICE || 9);
const DRY_RUN = process.argv.includes('--dry-run');

const TARGET_ROLES = [
  { skillId: 'role:行政与组织~role-mwtkgb', name: '现场管理专员', category: '行政与组织' },
  { skillId: 'role:物流与仓储~role-mcrtd8', name: '堆场主管', category: '物流与仓储' },
  { skillId: 'role:消费电子~role-1qfowiu', name: '视觉定位工程师', category: '消费电子' },
  { skillId: 'role:新茶饮与咖啡~role-1s99yel', name: '礼品卡销售员', category: '新茶饮与咖啡' },
  { skillId: 'role:公关与危机管理~ai', name: '公关AI专员', category: '公关与危机管理' },
  { skillId: 'role:工程造价与监理~role-1yr9y9c', name: '制造信息化专员', category: '工程造价与监理' },
  { skillId: 'role:珠宝与奢侈品~role-1qvyp5q', name: '珠宝质检主管', category: '珠宝与奢侈品' },
  { skillId: 'role:食品研发与质检~role-x0xbxi', name: '食品研发项目总监', category: '食品研发与质检' },
  { skillId: 'role:心理与咨询服务~role-rwcqqx', name: '军事心理学家', category: '心理与咨询服务' },
  { skillId: 'role:高等教育与科研管理~role-1r7g4ar', name: '成绩管理员', category: '高等教育与科研管理' },
  { skillId: 'role:母婴与玩具~role-2nah41', name: '玩具品牌策划', category: '母婴与玩具' },
  { skillId: 'role:连锁餐饮运营~role-1wnsqlw', name: '数据分析助理', category: '连锁餐饮运营' },
  { skillId: 'role:法律科技~role-1bcey0c', name: '法律科技解决方案工程师', category: '法律科技' },
  { skillId: 'role:工业互联网~lora', name: '工业互联网LoRa工程师', category: '工业互联网' },
  { skillId: 'role:数据与算法~role-1i0bmlg', name: '数据标注专员', category: '数据与算法' },
  { skillId: 'role:数据与算法~role-1rnx0td', name: '自然语言处理工程师', category: '数据与算法' },
];

function skillIdFor(role, specName) {
  const suffix = hash36(`${role.slug}:${role.name}:${specName}:totalclaw-agent-complete-v1`);
  return `totalclaw:roleskill~${role.slug}-${suffix}`;
}

async function upsertRoleSkills(skills, roleDoc) {
  let profile = buildProfile(roleDoc);
  profile = enrichProfile(profile, dutiesFromTitle(profile.name, profile.category));
  const opts = { blueprintAware: true };
  let inserted = 0;
  let updated = 0;
  const redFlags = [];

  for (const blueprint of blueprints) {
    const specName = `${profile.name}${blueprint.suffix}`;
    const skillId = skillIdFor(roleDoc, specName);
    const body = buildBody(profile, blueprint, skillId, opts);
    const red = hasRedLine(body);
    if (red.length) redFlags.push({ skillId, red });

    if (DRY_RUN) {
      console.log(`  [dry-run] ${specName} (${body.length} chars)`);
      continue;
    }

    const existing = await skills.findOne({ skillId }, { projection: { _id: 1 } });
    const slug = skillId.replace(/^totalclaw:roleskill~/, '');
    await skills.updateOne({ skillId }, {
      $set: {
        skillId,
        slug,
        name: specName,
        displayName: specName,
        description: blueprint.desc(profile),
        descriptionZh: blueprint.desc(profile),
        category: roleDoc.category,
        tags: ['岗位技能', roleDoc.name, 'totalclaw-agent', roleDoc.category, blueprint.suffix],
        source: 'totalclaw',
        kind: 'skill',
        contentMd: body.trim(),
        author: 'TotalClaw',
        version: '1.5.2',
        syncedAt: new Date(),
        lastUpdated: new Date(),
        securityAudit: {
          programmatic: {
            score: red.length ? 70 : 92,
            reason: red.length ? `red-lines: ${red.join(',')}` : 'noskill roles batch',
            by: BATCH_BY,
            at: new Date(),
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
    if (existing) updated++;
    else inserted++;
  }

  if (!DRY_RUN) {
    await skills.updateOne({ _id: roleDoc._id }, { $set: { skillsDone: true } });
  }

  return { inserted, updated, redFlags };
}

async function verify(skills) {
  const results = [];
  for (const target of TARGET_ROLES) {
    const n = await skills.countDocuments({
      kind: 'skill',
      'securityAudit.programmatic.by': BATCH_BY,
      category: target.category,
      contentMd: { $regex: `role: "${target.name}"` },
    });
    results.push({ ...target, skillCount: n, ok: n === 8 });
  }
  return results;
}

async function main() {
  loadEnv();
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/totalclaw');
  await client.connect();
  const skills = client.db().collection('skills');

  const summary = {
    dryRun: DRY_RUN,
    roles: TARGET_ROLES.length,
    processed: 0,
    insertedSkills: 0,
    updatedSkills: 0,
    missingRoles: [],
    redFlags: [],
  };

  for (const target of TARGET_ROLES) {
    const roleDoc = await skills.findOne(
      { skillId: target.skillId, kind: 'role' },
      { projection: { _id: 1, skillId: 1, name: 1, slug: 1, category: 1, description: 1, descriptionZh: 1, contentMd: 1, tags: 1 } },
    );
    if (!roleDoc) {
      summary.missingRoles.push(target);
      console.log(`[noskill-batch] ✗ role not found: ${target.skillId}`);
      continue;
    }
    console.log(`[noskill-batch] → ${roleDoc.name} (${roleDoc.category})`);
    const result = await upsertRoleSkills(skills, roleDoc);
    summary.processed++;
    summary.insertedSkills += result.inserted;
    summary.updatedSkills += result.updated;
    if (result.redFlags.length) summary.redFlags.push({ role: roleDoc.name, flags: result.redFlags });
    console.log(`  inserted=${result.inserted} updated=${result.updated}`);
  }

  if (!DRY_RUN) {
    summary.verification = await verify(skills);
    summary.allOk = summary.verification.every((r) => r.ok);
  }

  console.log(JSON.stringify(summary, null, 2));
  await client.close();
  if (!DRY_RUN && !summary.allOk) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
