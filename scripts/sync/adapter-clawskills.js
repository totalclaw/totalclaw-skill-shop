'use strict';

const path = require('path');
const { scanLocalDir } = require('./local-scanner');

/**
 * claw-skills（gitee jlzdyx/claw-skills）本地副本：workspace/<category>/<slug>/SKILL.md。
 * 内容与 totalclaw 高度重合（~99%），配合 run-sync 的 --dedup 只入库净新增 slug。
 * failspace/（构建失败件）不计入。
 */
function fetch(opts = {}) {
  const rootDir = opts.rootDir || path.resolve(__dirname, '../../../claw-skills/workspace');
  return scanLocalDir({
    rootDir,
    source: 'clawskills',
    maxDepth: 4,
    derive: (rel) => {
      const parts = rel.split(path.sep).filter(Boolean);
      const slug = parts[parts.length - 1] || 'unknown';
      return { category: parts.length >= 2 ? parts[0] : 'other', slug, owner: 'clawskills' };
    },
  });
}

module.exports = { fetch, source: 'clawskills' };
