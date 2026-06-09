'use strict';

/**
 * 审计 TotalClaw free skill 中文翻译覆盖。
 *
 *   node scripts/skills/audit-free-skill-zh.js --write
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');

loadEnv();

const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const OUT = path.resolve(__dirname, '../../data/skills/free-skill-zh-audit.json');
const OUT_GAP = path.resolve(__dirname, '../../data/skills/free-skill-zh-gaps.jsonl');

function hasCJK(t) {
  return /[\u4e00-\u9fff]/.test(String(t || ''));
}

function mostlyEnglish(t) {
  const s = String(t || '').replace(/[\s\d\W]/g, '');
  if (!s.length) return true;
  const cjk = (s.match(/[\u4e00-\u9fff]/g) || []).length;
  const latin = (s.match(/[a-zA-Z]/g) || []).length;
  return latin > cjk * 2;
}

function stripFrontmatter(md) {
  return String(md || '').replace(/^---[\s\S]*?---\n?/, '');
}

async function main() {
  const write = process.argv.includes('--write');
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const filter = {
    kind: 'skill',
    source: 'totalclaw',
    $or: [{ listingType: 'free' }, { 'pricing.model': 'free' }],
    listingType: { $ne: 'inactive' },
  };

  const stats = {
    总数: 0,
    有descriptionZh: 0,
    描述含中文: 0,
    正文含中文: 0,
    名称含中文: 0,
    描述正文均含中文: 0,
    完全未中文化: 0,
    缺descriptionZh: 0,
    正文偏英文: 0,
  };
  const gaps = [];

  const cur = col.find(filter, {
    projection: {
      skillId: 1, name: 1, description: 1, descriptionZh: 1, contentMd: 1, category: 1,
    },
  });

  while (await cur.hasNext()) {
    const d = await cur.next();
    stats.总数++;
    const desc = d.descriptionZh || d.description || '';
    const body = stripFrontmatter(d.contentMd || '');

    if (d.descriptionZh) stats.有descriptionZh++;
    else stats.缺descriptionZh++;

    const cjkDesc = hasCJK(desc);
    const cjkBody = hasCJK(body);
    const cjkName = hasCJK(d.name);

    if (cjkDesc) stats.描述含中文++;
    if (cjkBody) stats.正文含中文++;
    if (cjkName) stats.名称含中文++;
    if (cjkDesc && cjkBody) stats.描述正文均含中文++;
    if (mostlyEnglish(body)) stats.正文偏英文++;

    const issues = [];
    if (!d.descriptionZh) issues.push('missing-descriptionZh');
    if (!cjkDesc) issues.push('desc-no-chinese');
    if (!cjkBody) issues.push('body-no-chinese');
    if (!cjkName) issues.push('name-no-chinese');

    if (!cjkDesc && !cjkBody) stats.完全未中文化++;

    if (issues.length && write) {
      gaps.push(JSON.stringify({
        skillId: d.skillId,
        name: d.name,
        category: d.category,
        issues,
        desc: desc.slice(0, 120),
      }));
    }
  }

  stats.中文化率 = `${((stats.描述正文均含中文 / stats.总数) * 100).toFixed(1)}%`;
  stats.生成时间 = new Date().toISOString();

  if (write) {
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, JSON.stringify(stats, null, 2), 'utf8');
    if (gaps.length) fs.writeFileSync(OUT_GAP, gaps.join('\n') + '\n', 'utf8');
    console.log('报告 →', OUT);
    console.log('缺口 →', OUT_GAP, `(${gaps.length} 条)`);
  }

  console.log(JSON.stringify(stats, null, 2));
  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { hasCJK, mostlyEnglish, stripFrontmatter };
