'use strict';

/**
 * 导入企业版角色库（totalclaw-qiye-app/roles/community）为市场「AI 角色」。
 * 角色作为 kind='role' 的付费 skill 入库，复用交易/下载闭环。
 *
 *   node scripts/roles/import-existing.js
 *
 * skillId 规则：role:<category>~<slug>（URL 安全）。
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('./lib/env');

const ROLES_DIR = process.env.ROLES_DIR
  || path.resolve(__dirname, '../../../totalclaw-qiye-app/roles/community');
const DEFAULT_PRICE = Number(process.env.ROLE_PRICE || 29);

const SKIP_FILES = /^(README|CATALOG|AGENT-LIST|UPSTREAM|CONTRIBUTING|LICENSE|CHANGELOG)/i;

function listRoleFiles(root) {
  const out = [];
  for (const cat of fs.readdirSync(root, { withFileTypes: true })) {
    if (!cat.isDirectory() || cat.name.startsWith('.')) continue;
    const catDir = path.join(root, cat.name);
    for (const f of fs.readdirSync(catDir, { withFileTypes: true })) {
      if (!f.isFile() || !f.name.endsWith('.md') || SKIP_FILES.test(f.name)) continue;
      out.push({ category: cat.name, slug: f.name.replace(/\.md$/, ''), file: path.join(catDir, f.name) });
    }
  }
  return out;
}

function toRoleDoc({ category, slug, file }) {
  const raw = fs.readFileSync(file, 'utf8');
  let fm = {}, body = raw;
  try { const p = matter(raw); fm = p.data || {}; body = p.content || ''; } catch { /* keep raw */ }
  const name = (fm.name || slug).toString().trim();
  const skillId = `role:${category}~${slug}`.replace(/\//g, '~').replace(/\s+/g, '-');
  return {
    skillId,
    slug,
    name,
    displayName: name,
    description: (fm.description || '').toString().trim() || undefined,
    descriptionZh: (fm.description || '').toString().trim() || undefined,
    emoji: (fm.emoji || '').toString().trim() || undefined,
    color: (fm.color || '').toString().trim() || undefined,
    category,
    tags: ['AI角色', category],
    source: 'totalclaw',
    kind: 'role',
    contentMd: body.trim(),
    author: 'TotalClaw',
    syncedAt: new Date(),
    lastUpdated: new Date(),
  };
}

async function main() {
  loadEnv();
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/skill-market';
  if (!fs.existsSync(ROLES_DIR)) { console.error('角色目录不存在:', ROLES_DIR); process.exit(1); }

  const files = listRoleFiles(ROLES_DIR);
  console.log(`[roles] 发现 ${files.length} 个角色文件，来源 ${ROLES_DIR}`);

  const client = new MongoClient(uri);
  await client.connect();
  const skills = client.db().collection('skills');
  await skills.createIndex({ kind: 1 }).catch(() => {});

  let up = 0;
  for (const f of files) {
    const doc = toRoleDoc(f);
    if (!doc.contentMd) continue;
    // 市场字段：付费、闭源（购买后下载），仅首次插入写入，保留管理员后改
    await skills.updateOne(
      { skillId: doc.skillId },
      {
        $set: doc,
        $setOnInsert: {
          listingType: 'paid',
          ownership: 'totalclaw-proprietary',
          closedSource: true,
          pricing: { model: 'paid', price: DEFAULT_PRICE, currency: 'CNY' },
          reviewStatus: 'n/a',
          featured: false,
          stats: { downloads: 0, sales: 0, ratingAvg: 0, ratingCount: 0 },
        },
      },
      { upsert: true },
    );
    up++;
  }
  const total = await skills.countDocuments({ kind: 'role' });
  console.log(`[roles] 导入完成 upserted=${up}，角色总数=${total}`);
  await client.close();
}

main().catch((e) => { console.error('导入失败:', e); process.exit(1); });
