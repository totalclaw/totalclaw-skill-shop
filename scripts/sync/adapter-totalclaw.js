'use strict';

const path = require('path');
const { scanLocalDir } = require('./local-scanner');

/** TotalClaw 自有社区：../totalclaw-skills/<category>/<slug>/{SKILL.md,_meta.json} */
function fetch(opts = {}) {
  const rootDir = opts.rootDir || path.resolve(__dirname, '../../../totalclaw-skills');
  return scanLocalDir({
    rootDir,
    source: 'totalclaw',
    maxDepth: 3,
    derive: (rel) => {
      const parts = rel.split(path.sep).filter(Boolean);
      // <category>/<slug>
      const category = parts[0] || 'other';
      const slug = parts[parts.length - 1] || 'unknown';
      return { category, slug, owner: 'totalclaw' };
    },
  });
}

module.exports = { fetch, source: 'totalclaw' };
