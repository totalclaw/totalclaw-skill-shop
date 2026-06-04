'use strict';

const path = require('path');
const { scanLocalDir } = require('./local-scanner');

/**
 * Hermes 社区（NousResearch/hermes-agent）。默认扫描三类 skill 目录：
 *   - ../hermes-agent/skills/<area>/<slug>/SKILL.md（核心，按领域分组）
 *   - ../hermes-agent/optional-skills/<area>/<slug>/SKILL.md（可选 vendor skill，量大）
 *   - ../hermes-agent/plugins/<name>/SKILL.md（插件自带 skill）
 */
function fetch(opts = {}) {
  const repoRoot = opts.repoRoot || path.resolve(__dirname, '../../../hermes-agent');
  const roots = [
    opts.rootDir || path.join(repoRoot, 'skills'),
    path.join(repoRoot, 'optional-skills'),
    path.join(repoRoot, 'plugins'),
    ...(opts.extraRoots || []),
  ];
  const all = [];
  for (const rootDir of roots) {
    const items = scanLocalDir({
      rootDir,
      source: 'hermes',
      maxDepth: 5,
      derive: (rel) => {
        const parts = rel.split(path.sep).filter(Boolean);
        const slug = parts[parts.length - 1] || 'unknown';
        return { category: parts.length >= 2 ? parts[0] : 'other', slug, owner: 'hermes' };
      },
    });
    all.push(...items);
  }
  return all;
}

module.exports = { fetch, source: 'hermes' };
