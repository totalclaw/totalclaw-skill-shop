#!/usr/bin/env node
/**
 * Generate batch-13..16-output.jsonl from input JSON + per-skill translation modules.
 * Run: node scripts/skills/translate-batch-13-16.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { stripMultipartBody } from './lib/strip-multipart-body.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../../data/skills/translate-batches');

function hasCJK(s) {
  return /[\u4e00-\u9fff]/.test(s);
}

function cjkRatio(s) {
  const cjk = (s.match(/[\u4e00-\u9fff]/g) || []).length;
  const letters = (s.match(/[a-zA-Z\u4e00-\u9fff]/g) || []).length;
  return letters ? cjk / letters : 0;
}

function descFromBody(body, descriptionEn) {
  if (descriptionEn && descriptionEn.trim()) return descriptionEn.trim();
  const clean = stripMultipartBody(body).replace(/^---[\s\S]*?---\n/, '');
  const h1 = clean.match(/^#\s+(.+)$/m);
  const para = clean
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l && !l.startsWith('#') && !l.startsWith('>') && !l.startsWith('```') && !l.startsWith('|'));
  if (para && hasCJK(para)) return para.slice(0, 200);
  if (h1) return `${h1[1]} 技能：${(para || '').slice(0, 120)}`.slice(0, 200);
  return (para || h1?.[1] || '技能说明').slice(0, 200);
}

/** Preserve code fences / URLs; translate obvious EN section headers in already-Chinese docs */
function normalizeBodyZh(body) {
  let b = stripMultipartBody(body);
  if (cjkRatio(b) > 0.25) return b;
  return b; // caller must supply real translation
}

async function loadOverrides(batch) {
  const dir = path.join(__dirname, `batch-${batch}-zh`);
  if (!fs.existsSync(dir)) return new Map();
  const map = new Map();
  for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.js'))) {
    const mod = await import(pathToFileURL(path.join(dir, f)).href);
    const m = mod.default || mod;
    if (m.skillId) map.set(m.skillId, m);
  }
  return map;
}

async function main() {
  let total = 0;
  for (const n of [13, 14, 15, 16]) {
    const input = JSON.parse(fs.readFileSync(path.join(ROOT, `batch-${n}-input.json`), 'utf8'));
    const overrides = await loadOverrides(n);
    const lines = [];
    for (const skill of input) {
      let t = overrides.get(skill.skillId);
      if (!t) {
        const body = skill.englishBody || '';
        const bodyZh = normalizeBodyZh(body);
        if (!hasCJK(bodyZh) || cjkRatio(bodyZh) < 0.15) {
          throw new Error(`batch-${n} missing ZH translation: ${skill.skillId}`);
        }
        t = {
          skillId: skill.skillId,
          descriptionZh: descFromBody(body, skill.descriptionEn),
          bodyZh,
        };
      }
      if (!hasCJK(t.descriptionZh) || !hasCJK(t.bodyZh)) {
        throw new Error(`batch-${n} invalid ZH for ${skill.skillId}`);
      }
      lines.push(JSON.stringify({ skillId: t.skillId, descriptionZh: t.descriptionZh, bodyZh: t.bodyZh }));
    }
    fs.writeFileSync(path.join(ROOT, `batch-${n}-output.jsonl`), lines.join('\n') + '\n', 'utf8');
    console.log(`batch-${n}: ${lines.length} skills`);
    total += lines.length;
  }
  console.log(`TOTAL: ${total}`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
