'use strict';
const fs = require('fs');
const path = require('path');

const MOD_DIR = path.resolve(__dirname, 'batch-05-06-zh');
const OUT_DIR = path.resolve(__dirname, '../../data/skills/translate-batches');
function extractZhSection(body) {
  const idx = body.indexOf('## 中文说明');
  if (idx === -1) return null;
  return body.slice(idx).replace(/^## 中文说明\n\n?/, '').trim();
}

function loadModules() {
  const map = new Map();
  for (const f of fs.readdirSync(MOD_DIR).filter((x) => x.endsWith('.js'))) {
    const m = require(path.join(MOD_DIR, f));
    if (m.skillId) map.set(m.skillId, m);
  }
  return map;
}

function buildBatch(batchNum, modules) {
  const inputPath = path.join(OUT_DIR, `batch-${String(batchNum).padStart(2, '0')}-input.json`);
  const items = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  const entries = [];

  for (const item of items) {
    let entry = modules.get(item.skillId);
    if (!entry && item.englishBody) {
      const zh = extractZhSection(item.englishBody);
      if (zh) {
        const descMatch = /^#\s+(.+)/m.exec(zh) || /^(.{10,120})/m.exec(zh);
        entry = {
          skillId: item.skillId,
          descriptionZh: item.descriptionEn
            ? translateDescription(item.descriptionEn)
            : (descMatch ? descMatch[1].replace(/[#*`]/g, '').trim().slice(0, 120) : '技能说明'),
          bodyZh: zh,
        };
      } else if (/[\u4e00-\u9fff]/.test(item.englishBody) && !/[a-zA-Z]{20,}/.test(item.englishBody.slice(0, 200))) {
        const title = /^#\s+(.+)/m.exec(item.englishBody);
        entry = {
          skillId: item.skillId,
          descriptionZh: title ? title[1].trim().slice(0, 120) : '技能说明',
          bodyZh: item.englishBody.trim(),
        };
      }
    }
    if (!entry) {
      console.error(`Missing translation: ${item.skillId}`);
      continue;
    }
    entries.push({
      skillId: entry.skillId,
      descriptionZh: entry.descriptionZh,
      bodyZh: entry.bodyZh,
    });
  }
  return entries;
}

function translateDescription(en) {
  const map = {
    'Build, fill, stress-test, and iterate on a Business Model Canvas for a solopreneur. Use when designing or redesigning how a business creates, delivers, and captures value — covering all nine BMC blocks plus solopreneur-specific adaptations like the "Time & Energy" block and unit economics validation. Trigger on "business model canvas", "design my business model", "how will I make money", "business model", "BMC", "value proposition canvas", "how does my business work", "monetize my idea".':
      '为独立创业者构建、填写、压力测试并迭代商业模式画布（BMC），涵盖九大模块、时间与精力预算及单位经济验证。',
  };
  return map[en] || en;
}

function writeJsonl(batchNum, entries) {
  const out = path.join(OUT_DIR, `batch-${String(batchNum).padStart(2, '0')}-output.jsonl`);
  fs.writeFileSync(out, entries.map((e) => JSON.stringify(e)).join('\n') + '\n', 'utf8');
  console.log(`Wrote ${entries.length} lines → ${out}`);
  return entries.length;
}

const modules = loadModules();
const b5 = buildBatch(5, modules);
const b6 = buildBatch(6, modules);
const c5 = writeJsonl(5, b5);
const c6 = writeJsonl(6, b6);
console.log(`Total: batch-05=${c5}, batch-06=${c6}, combined=${c5 + c6}`);
