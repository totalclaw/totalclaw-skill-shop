'use strict';

const path = require('path');
const { scanLocalDir } = require('./local-scanner');

/**
 * OpenClaw 社区。默认扫描仓库内两类 skill 目录：
 *   - ../openclaw/skills/<slug>/SKILL.md（核心，扁平/偶嵌套）
 *   - ../openclaw/extensions/**\/SKILL.md（扩展，含 extensions/feishu/skills/* 等嵌套）
 * 另可叠加镜像源（opts.extraRoots）。注：.agents 为 agent 配置、node_modules 为依赖，均不计入。
 */
function fetch(opts = {}) {
  const repoRoot = opts.repoRoot || path.resolve(__dirname, '../../../openclaw');
  const roots = [
    opts.rootDir || path.join(repoRoot, 'skills'),
    path.join(repoRoot, 'extensions'),
    ...(opts.extraRoots || []),
  ];
  const all = [];
  for (const rootDir of roots) {
    const items = scanLocalDir({
      rootDir,
      source: 'openclaw',
      maxDepth: 5,
      derive: (rel) => {
        const parts = rel.split(path.sep).filter(Boolean);
        const slug = parts[parts.length - 1] || 'unknown';
        return { category: parts.length >= 2 ? parts[0] : 'other', slug, owner: 'openclaw' };
      },
    });
    all.push(...items);
  }
  return all;
}

module.exports = { fetch, source: 'openclaw' };
