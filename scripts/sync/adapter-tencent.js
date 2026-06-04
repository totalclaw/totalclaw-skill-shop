'use strict';

const path = require('path');
const { scanLocalDir } = require('./local-scanner');

/**
 * 腾讯 skill 社区。
 * 当前以本地镜像目录为主（TENCENT_SKILLS_DIR 指向已克隆/下载的镜像）；
 * 远程 API 端点确定后在此补 HTTP 拉取逻辑。无镜像则软降级返回空。
 */
function fetch(opts = {}) {
  const rootDir = opts.rootDir || process.env.TENCENT_SKILLS_DIR;
  if (!rootDir) {
    console.warn('[tencent] 未配置 TENCENT_SKILLS_DIR 本地镜像，跳过（远程 API 待接入）');
    return [];
  }
  return scanLocalDir({
    rootDir,
    source: 'tencent',
    maxDepth: 4,
    derive: (rel) => {
      const parts = rel.split(path.sep).filter(Boolean);
      const slug = parts[parts.length - 1] || 'unknown';
      return { category: parts.length >= 2 ? parts[0] : 'other', slug, owner: 'tencent' };
    },
  });
}

module.exports = { fetch, source: 'tencent' };
