'use strict';

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { loadEnv } = require('../roles/lib/env');
const { extractEnglishBody } = require('./export-free-skill-translate-batch');

loadEnv();

const ROOT = path.resolve(__dirname, '../..');
const OUT_DIR = path.join(ROOT, 'data/skills/translate-batches');
const MONGO_URL = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';

const AUTO_ZH = new Set([
  'totalclaw:totalclaw~agentossoftware-agentos',
  'totalclaw:totalclaw~alienpingu-doctor-acid',
  'totalclaw:totalclaw~autogame-17-auto-test-generator',
  'totalclaw:totalclaw~brokenwatch24-jobtread-api',
]);

const AUTO_DESC = {
  'totalclaw:totalclaw~agentossoftware-agentos':
    '面向 Clawdbot 的完整 AgentOS SDK 集成：内存同步、Mesh 消息、语义搜索与 Brain Dashboard 心跳同步。',
  'totalclaw:totalclaw~alienpingu-doctor-acid':
    '将 OpenClaw 代理变为自主 acid techno 制作人，生成曲目并提交至 claw.fm 赚取 USDC。',
  'totalclaw:totalclaw~autogame-17-auto-test-generator':
    '自动为 OpenClaw 技能生成基本单元/集成测试，提高代码质量并防止回归。',
  'totalclaw:totalclaw~brokenwatch24-jobtread-api':
    '通过 Pave Query API 完整操作 JobTread：账户、工作、文档、自定义字段与 webhook。',
};

function loadDirModules(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => /^\d+\.js$/.test(f))
    .map((f) => require(path.join(dir, f)));
}

function splitZhSection(english) {
  const idx = english.search(/^##\s*中文说明/m);
  if (idx < 0) return null;
  return english.slice(idx).replace(/^##\s*中文说明\s*\n?/, '').trim();
}

async function fetchAutoZh(client, skillId) {
  const doc = await client.db().collection('skills').findOne({ skillId }, { projection: { contentMd: 1 } });
  const { english } = extractEnglishBody(doc?.contentMd || '');
  return splitZhSection(english);
}

async function buildBatch(batchNum, manualById, client) {
  const input = JSON.parse(
    fs.readFileSync(path.join(OUT_DIR, `batch-${String(batchNum).padStart(2, '0')}-input.json`), 'utf8'),
  );
  const rows = [];
  for (const item of input) {
    let t = manualById.get(item.skillId);
    if (!t && AUTO_ZH.has(item.skillId)) {
      const bodyZh = await fetchAutoZh(client, item.skillId);
      if (!bodyZh) throw new Error(`Missing auto zh for ${item.skillId}`);
      t = {
        skillId: item.skillId,
        descriptionZh: AUTO_DESC[item.skillId] || item.descriptionEn || '',
        bodyZh,
      };
    }
    if (!t) throw new Error(`Missing translation for ${item.skillId}`);
    rows.push({ skillId: t.skillId, descriptionZh: t.descriptionZh, bodyZh: t.bodyZh });
  }
  const out = path.join(OUT_DIR, `batch-${String(batchNum).padStart(2, '0')}-output.jsonl`);
  fs.writeFileSync(out, rows.map((r) => JSON.stringify(r)).join('\n') + '\n', 'utf8');
  console.log(`Wrote ${rows.length} lines → ${out}`);
  return rows.length;
}

async function main() {
  const manual = [...loadDirModules(path.join(__dirname, 'batch-09-zh')), ...loadDirModules(path.join(__dirname, 'batch-10-zh'))];
  const byId = new Map(manual.map((t) => [t.skillId, t]));
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const c9 = await buildBatch(9, byId, client);
  const c10 = await buildBatch(10, byId, client);
  await client.close();
  console.log(`Total: batch-09=${c9}, batch-10=${c10}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
