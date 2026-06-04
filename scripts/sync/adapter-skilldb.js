'use strict';

const path = require('path');
const { scanLocalDir } = require('./local-scanner');

/**
 * skill-database 本地聚合库：cangku/<source>/.../SKILL.md（按来源镜像）。
 * 与 totalclaw 100% 重合，配合 --dedup 通常入库 0 个；保留接入以便将来该库新增独有内容时自动补齐。
 */
function fetch(opts = {}) {
  const rootDir = opts.rootDir || path.resolve(__dirname, '../../../skill-database/cangku');
  return scanLocalDir({
    rootDir,
    source: 'skilldb',
    maxDepth: 5,
    derive: (rel) => {
      const parts = rel.split(path.sep).filter(Boolean);
      const slug = parts[parts.length - 1] || 'unknown';
      // parts[0] 是来源镜像名（openclaw-master-skills 等），用次级目录作分类，缺则 other
      return { category: parts.length >= 3 ? parts[1] : 'other', slug, owner: 'skilldb' };
    },
  });
}

module.exports = { fetch, source: 'skilldb' };
