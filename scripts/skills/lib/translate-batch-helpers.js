'use strict';

function extractZh(body) {
  const m = body.match(/\n---\n\n## (?:中文说明|中文)\n\n([\s\S]+)$/);
  if (m) return m[1].trim();
  const m2 = body.match(/\n## (?:中文说明|中文)\n\n([\s\S]+)$/);
  if (m2) return m2[1].trim();
  return null;
}

function extractEn(body) {
  const idx = body.search(/\n---\n\n## (?:中文说明|中文)\n\n/);
  if (idx >= 0) return body.slice(0, idx).trim();
  return body.trim();
}

function firstLineSummary(bodyZh, fallback) {
  const line = bodyZh.split('\n').find((l) => l.trim() && !l.startsWith('#'));
  return line ? line.replace(/^[-*>\s]+/, '').trim().slice(0, 200) : fallback;
}

module.exports = { extractZh, extractEn, firstLineSummary };
