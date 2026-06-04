'use strict';

const fs = require('fs');
const path = require('path');

/**
 * 递归扫描一个本地目录，找出所有 SKILL.md（不区分大小写），
 * 解析同目录 _meta.json，并据路径推断 owner / slug / category。
 *
 * @param {object} opts
 * @param {string} opts.rootDir      要扫描的根目录（如 ../totalclaw-skills）
 * @param {string} opts.source       来源标记
 * @param {number} [opts.maxDepth=4] 最大递归深度
 * @param {(relPath:string)=>{owner?:string,slug?:string,category?:string}} [opts.derive]
 *        从相对路径自定义推断；缺省用通用规则
 * @returns {Array<{source,owner,slug,category,content,meta,sourceUrl}>}
 */
function scanLocalDir(opts) {
  const { rootDir, source, maxDepth = 4, derive } = opts;
  if (!fs.existsSync(rootDir)) {
    console.warn(`[scan] 目录不存在，跳过: ${rootDir}`);
    return [];
  }
  const results = [];
  const skillFiles = [];
  walk(rootDir, 0, maxDepth, skillFiles);

  for (const skillPath of skillFiles) {
    try {
      const dir = path.dirname(skillPath);
      const rel = path.relative(rootDir, dir);
      const content = fs.readFileSync(skillPath, 'utf8');
      let meta = undefined;
      const metaPath = path.join(dir, '_meta.json');
      if (fs.existsSync(metaPath)) {
        try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch { /* ignore */ }
      }
      const d = derive ? derive(rel) : defaultDerive(rel, source);
      results.push({
        source,
        owner: d.owner,
        slug: d.slug,
        category: d.category,
        content,
        meta,
        sourceUrl: d.sourceUrl,
      });
    } catch (e) {
      console.warn(`[scan] 解析失败 ${skillPath}: ${e.message}`);
    }
  }
  return results;
}

function walk(dir, depth, maxDepth, out) {
  if (depth > maxDepth) return;
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name === '.git') continue;
      walk(full, depth + 1, maxDepth, out);
    } else if (e.isFile() && /^skill\.md$/i.test(e.name)) {
      out.push(full);
    }
  }
}

/** 通用推断：rel = "<category>/<slug>" 或 "<slug>" 或 "<area>/<slug>" */
function defaultDerive(rel, source) {
  const parts = rel.split(path.sep).filter(Boolean);
  if (parts.length >= 2) {
    return { category: parts[0], slug: parts[parts.length - 1], owner: source };
  }
  return { category: 'other', slug: parts[0] || 'unknown', owner: source };
}

module.exports = { scanLocalDir, defaultDerive };
