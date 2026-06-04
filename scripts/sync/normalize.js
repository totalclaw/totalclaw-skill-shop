'use strict';

const matter = require('gray-matter');

/**
 * 把各源解析出的原始 frontmatter + _meta + 正文，规范化为统一元数据模型。
 * 见 ceshi/skill市场/architecture.md。
 *
 * @param {object} raw
 * @param {string} raw.source     来源：github|tencent|openclaw|hermes|totalclaw
 * @param {string} raw.owner      作者/所有者（用于拼 skillId）
 * @param {string} raw.slug       目录名/slug
 * @param {string} raw.content    SKILL.md 原文（含 frontmatter）
 * @param {object} [raw.meta]     _meta.json（可选）
 * @param {string} [raw.category] 目录推断的分类
 * @param {string} [raw.sourceUrl]
 * @returns {object|null} 统一元数据；无法解析返回 null
 */
function normalize(raw) {
  if (!raw || !raw.content) return null;
  let fm = {};
  let body = raw.content;
  try {
    const parsed = matter(raw.content);
    fm = parsed.data || {};
    body = parsed.content || '';
  } catch {
    // frontmatter 解析失败：退化为纯正文
    fm = {};
    body = raw.content;
  }

  const meta = raw.meta || {};
  const slug = raw.slug || fm.name || meta.slug;
  if (!slug) return null;
  // 真作者优先取 _meta.json（totalclaw/claw-skills 源带），否则用路径推断的 owner。
  const owner = meta.owner || meta.ownerId || raw.owner || 'unknown';
  // skillId 必须 URL 安全（作为路径参数）：去掉 '/'，统一用 '~' 分隔，避免路由被 '/' 截断。
  const skillId = `${raw.source}:${owner}/${slug}`.replace(/\//g, '~').replace(/\s+/g, '-');

  // 兼容各源 metadata 子结构
  const mdMeta = fm.metadata || {};
  const oc = mdMeta.openclaw || {};
  const hm = mdMeta.hermes || {};

  const tags = dedupe([
    ...(toArray(hm.tags)),
    ...(toArray(fm.tags)),
    ...(toArray(mdMeta.tags)),
  ]);

  const requires = oc.requires || fm.requires || {};

  const publishedAt = numToDate(meta?.latest?.publishedAt || meta?.publishedAt);

  return {
    skillId,
    slug,
    name: fm.name || meta.displayName || slug,
    displayName: meta.displayName || fm.name || slug,
    description: clean(fm.description),
    descriptionZh: clean(fm.descriptionZh),
    version: String(fm.version || meta?.latest?.version || meta?.version || '').trim() || undefined,
    author: clean(fm.author || mdMeta.author || owner),
    license: clean(fm.license),
    homepage: clean(fm.homepage),
    repository: clean(fm.repository || meta?.latest?.commit),
    category: raw.category || clean(mdMeta.categories) || 'other',
    tags,
    platforms: toArray(fm.platforms),
    keywords: dedupe(toArray(fm.keywords)),
    source: raw.source,
    sourceUrl: raw.sourceUrl,
    installCommand: clean(fm.installCommand),
    contentMd: body.trim(),
    requires: typeof requires === 'object' ? requires : {},
    publishedAt,
    lastUpdated: publishedAt,
    syncedAt: new Date(),
    // 市场字段默认：聚合源 = 免费社区
    listingType: 'free',
    ownership: raw.source === 'totalclaw' ? 'community' : 'community',
    pricing: { model: 'free', price: 0, currency: 'CNY' },
    reviewStatus: 'n/a',
    closedSource: false,
    featured: false,
  };
}

function toArray(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (typeof v === 'string') return v.split(/[,，]/).map((x) => x.trim()).filter(Boolean);
  return [];
}
function dedupe(arr) {
  return [...new Set(arr)];
}
function clean(v) {
  if (v == null) return undefined;
  const s = String(v).trim();
  return s || undefined;
}
function numToDate(n) {
  const num = Number(n);
  if (!Number.isFinite(num) || num <= 0) return undefined;
  return new Date(num);
}

module.exports = { normalize };
