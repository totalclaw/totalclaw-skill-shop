'use strict';

const fs = require('fs');
const path = require('path');

/**
 * 轻量 SSR 渲染辅助（仿 totalclaw-web/server/render.js 的思路：
 * 统一注入 canonical / OG / JSON-LD，组装页面骨架）。
 */

const PUBLIC_ORIGIN = (process.env.PUBLIC_ORIGIN || 'http://localhost:3090').replace(/\/$/, '');

// 静态资源版本指纹：/assets/* 文件长缓存（nginx 7 天 + 浏览器），同名 URL 内容更新后
// 会被旧缓存挡住。给 URL 追加 ?v=<文件 mtime 指纹>，内容一变 URL 即变，自动绕开 nginx/浏览器缓存；
// 内容不变则 URL 不变、继续命中长缓存。进程内缓存指纹，按需惰性计算。
const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const _fpCache = new Map();
function assetUrl(urlPath) {
  let fp = _fpCache.get(urlPath);
  if (fp === undefined) {
    try {
      const rel = urlPath.replace(/^\/assets\//, '').split('?')[0];
      const st = fs.statSync(path.join(ASSETS_DIR, rel));
      fp = Math.floor(st.mtimeMs).toString(36);
    } catch {
      fp = ''; // 取不到就不加版本（不影响功能）
    }
    _fpCache.set(urlPath, fp);
  }
  return fp ? `${urlPath}?v=${fp}` : urlPath;
}

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
    .map((s) => `<script src="${s.startsWith('/assets/') ? assetUrl(s) : s}" defer></script>`)
    .join('\n');
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<meta name="theme-color" content="#0c6ed0">
<link rel="canonical" href="${escapeHtml(canonical)}">
<link rel="icon" type="image/png" href="/assets/img/favicon.png">
<link rel="apple-touch-icon" href="/assets/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Newsreader:opsz,wght@6..72,500;6..72,600&family=JetBrains+Mono:wght@400;500&display=swap" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Newsreader:opsz,wght@6..72,500;6..72,600&family=JetBrains+Mono:wght@400;500&display=swap"></noscript>
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:url" content="${escapeHtml(canonical)}">
<meta property="og:type" content="website">
<meta property="og:image" content="${escapeHtml(PUBLIC_ORIGIN)}/assets/img/logo-full.png">
<link rel="stylesheet" href="${assetUrl('/assets/css/main.css')}">
${jsonLd}
</head>
<body>
<div class="bg-fx" aria-hidden="true"></div>
<div class="grid-lines" aria-hidden="true"></div>
${o.body}
<script src="${assetUrl('/assets/js/app.js')}" defer></script>
${extraScripts}
</body>
</html>`;
}

module.exports = { renderPage, escapeHtml, PUBLIC_ORIGIN };
