'use strict';

/**
 * 轻量 SSR 渲染辅助（仿 totalclaw-web/server/render.js 的思路：
 * 统一注入 canonical / OG / JSON-LD，组装页面骨架）。
 */

const PUBLIC_ORIGIN = (process.env.PUBLIC_ORIGIN || 'http://localhost:3090').replace(/\/$/, '');

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * 组装完整 HTML 文档。
 * @param {object} o
 * @param {string} o.title
 * @param {string} [o.description]
 * @param {string} o.body          页面正文 HTML
 * @param {string} [o.canonicalPath]
 * @param {object} [o.jsonLd]       结构化数据对象
 */
function renderPage(o) {
  const title = o.title || 'TotalClaw Skill 市场';
  const desc = o.description || '聚合多社区 Skill，免费浏览安装，支持收费 Skill 交易。';
  const canonical = PUBLIC_ORIGIN + (o.canonicalPath || '/');
  const jsonLd = o.jsonLd
    ? `<script type="application/ld+json">${JSON.stringify(o.jsonLd)}</script>`
    : '';
  const extraScripts = (o.scripts || [])
    .map((s) => `<script src="${s}" defer></script>`)
    .join('\n');
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<meta name="theme-color" content="#070b16">
<link rel="canonical" href="${escapeHtml(canonical)}">
<link rel="icon" type="image/png" href="/assets/img/favicon.png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:type" content="website">
<meta property="og:image" content="${escapeHtml(PUBLIC_ORIGIN)}/assets/img/logo-full.png">
<link rel="stylesheet" href="/assets/css/main.css">
${jsonLd}
</head>
<body>
<div class="bg-fx" aria-hidden="true"></div>
${o.body}
<script src="/assets/js/app.js" defer></script>
${extraScripts}
</body>
</html>`;
}

module.exports = { renderPage, escapeHtml, PUBLIC_ORIGIN };
