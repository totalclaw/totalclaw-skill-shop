'use strict';

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../../roles/lib/env');
const { extractEnglishBody } = require('../export-free-skill-translate-batch');
const { hasCJK } = require('../audit-free-skill-zh');

loadEnv();

const ROOT = path.resolve(__dirname, '../..');
const REPO = path.resolve(ROOT, '..');
const OUT_DIR = path.join(REPO, 'data/skills/translate-batches');
const ZH_DIR = __dirname;
const EN_DIR = path.join(ZH_DIR, 'en');
const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';

function fmDesc(md) {
  const m = /^---\n[\s\S]*?\n---\n/.exec(md || '');
  if (!m) return '';
  const block = m[0];
  const dm =
    block.match(/(?:^|\n)description:\s*\|\s*\n([\s\S]*?)(?=\n[a-zA-Z#-]|\n---)/) ||
    block.match(/(?:^|\n)description:\s*["']?([^\n"']+)/);
  return dm ? dm[1].replace(/^  /gm, '').trim() : '';
}

function extractZhSection(body) {
  const idx = body.search(/\n---\n\n## 中文说明\n|^## 中文说明\n/m);
  if (idx < 0) return null;
  return body
    .slice(idx)
    .replace(/^---\n\n## 中文说明\n|^## 中文说明\n/, '')
    .trim();
}

function loadModuleFiles() {
  const map = new Map();
  function walk(dir) {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) {
        if (f !== 'en') walk(p);
      } else if (/^\d{2}-.+\.js$/.test(f)) {
        const m = require(p);
        map.set(m.skillId, m);
      }
    }
  }
  walk(ZH_DIR);
  return map;
}

function pickDescription(skill, doc, bodyZh) {
  const candidates = [
    skill.descriptionEn,
    doc?.descriptionZh,
    doc?.description,
    fmDesc(doc?.contentMd),
  ].map((s) => String(s || '').trim());

  for (const c of candidates) {
    if (c && hasCJK(c)) return c.replace(/\s+/g, ' ').slice(0, 500);
  }
  for (const c of candidates) {
    if (c) return c.replace(/\s+/g, ' ').slice(0, 500);
  }
  const first = (bodyZh || '').split('\n').find((l) => l.trim() && !l.startsWith('#'));
  return (first || skill.name).slice(0, 200);
}

async function main() {
  const modules = loadModuleFiles();
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  let total = 0;
  for (const batch of [17, 18, 19, 20]) {
    const input = JSON.parse(fs.readFileSync(path.join(OUT_DIR, `batch-${batch}-input.json`), 'utf8'));
    const lines = [];

    for (let i = 0; i < input.length; i++) {
      const skill = input[i];
      let t = modules.get(skill.skillId);

      if (!t) {
        const metaFile = fs
          .readdirSync(EN_DIR)
          .find((f) => f.startsWith(`batch-${String(batch).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}-`) && f.endsWith('.meta.json'));
        if (!metaFile) throw new Error(`Missing en meta for batch ${batch} #${i + 1}`);
        const meta = JSON.parse(fs.readFileSync(path.join(EN_DIR, metaFile), 'utf8'));
        let body = fs.readFileSync(path.join(EN_DIR, metaFile.replace('.meta.json', '.en.txt')), 'utf8');
        const doc = await col.findOne({ skillId: skill.skillId }, { projection: { contentMd: 1, description: 1, descriptionZh: 1 } });
        if (skill.englishTruncated && doc) body = extractEnglishBody(doc.contentMd).english;

        const zhSec = extractZhSection(body);
        let bodyZh = zhSec;
        if (!bodyZh) {
          const cjk = (body.match(/[\u4e00-\u9fff]/g) || []).length / Math.max(body.length, 1);
          if (cjk > 0.25) bodyZh = body;
        }
        if (!bodyZh) throw new Error(`No translation for ${skill.skillId} (batch ${batch} #${i + 1})`);

        t = {
          skillId: skill.skillId,
          descriptionZh: pickDescription(skill, doc, bodyZh),
          bodyZh,
        };
      }

      if (!hasCJK(t.descriptionZh) || !hasCJK(t.bodyZh)) {
        throw new Error(`Invalid ZH for ${skill.skillId}`);
      }

      lines.push(JSON.stringify({ skillId: t.skillId, descriptionZh: t.descriptionZh, bodyZh: t.bodyZh }));
    }

    fs.writeFileSync(path.join(OUT_DIR, `batch-${batch}-output.jsonl`), lines.join('\n') + '\n', 'utf8');
    console.log(`batch-${batch}: ${lines.length} skills`);
    total += lines.length;
  }

  await client.close();
  console.log(`TOTAL: ${total}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
