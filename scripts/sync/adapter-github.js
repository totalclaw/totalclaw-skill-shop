'use strict';

const https = require('https');
const axios = require('axios');
const { loadCaBundle } = require('./ca-bundle');

// 自带 CA 集在部分机器缺根证书会报 unable to get local issuer certificate，
// 这里补上系统根证书（仍校验，安全）。GITHUB_INSECURE_TLS=1 可显式跳过校验（不推荐）。
const httpsAgent = new https.Agent({
  ca: loadCaBundle(),
  rejectUnauthorized: process.env.GITHUB_INSECURE_TLS !== '1',
});
const gh = axios.create({ httpsAgent });

/**
 * GitHub 源：从配置的仓库列表用 Git Trees API 拉取所有 SKILL.md。
 * 配置来自环境变量 GITHUB_SKILL_REPOS（逗号分隔 owner/repo[@branch]），
 * 可选 GITHUB_TOKEN 提高限额。无配置则返回空（软降级）。
 *
 * 示例：GITHUB_SKILL_REPOS="openclaw/skills,VoltAgent/awesome-openclaw-skills"
 */
async function fetch(opts = {}) {
  const reposEnv = opts.repos || process.env.GITHUB_SKILL_REPOS || '';
  const repos = reposEnv.split(',').map((s) => s.trim()).filter(Boolean);
  if (repos.length === 0) {
    console.warn('[github] 未配置 GITHUB_SKILL_REPOS，跳过');
    return [];
  }
  const token = process.env.GITHUB_TOKEN;
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const out = [];

  for (const repoSpec of repos) {
    const [repo, branch] = repoSpec.split('@');
    const [owner, name] = repo.split('/');
    if (!owner || !name) continue;
    try {
      const ref = branch || (await defaultBranch(owner, name, headers));
      const tree = await gh.get(
        `https://api.github.com/repos/${owner}/${name}/git/trees/${ref}?recursive=1`,
        { headers, timeout: 30000 },
      );
      const skillPaths = (tree.data.tree || [])
        .filter((n) => n.type === 'blob' && /(^|\/)SKILL\.md$/i.test(n.path))
        .map((n) => n.path);

      for (const p of skillPaths) {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${owner}/${name}/${ref}/${p}`;
          const content = await getRawWithRetry(rawUrl);
          const parts = p.split('/');
          const slug = parts[parts.length - 2] || parts[0];
          const category = parts.length >= 3 ? parts[parts.length - 3] : 'other';
          out.push({
            source: 'github',
            owner: `${owner}/${name}`,
            slug,
            category,
            content: typeof content === 'string' ? content : String(content),
            sourceUrl: `https://github.com/${owner}/${name}/blob/${ref}/${p}`,
          });
        } catch (e) {
          console.warn(`[github] 拉取失败 ${p}: ${e.message}`);
        }
      }
      console.log(`[github] ${owner}/${name}@${ref} 收集 ${skillPaths.length} 个 skill`);
    } catch (e) {
      console.warn(`[github] 仓库失败 ${repoSpec}: ${e.message}`);
    }
  }
  return out;
}

/** 拉取单个 raw 文件，带轻量重试（应对 raw.githubusercontent 偶发瞬断）。 */
async function getRawWithRetry(rawUrl, tries = 3) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      return (await gh.get(rawUrl, { timeout: 20000, responseType: 'text' })).data;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 400 * (i + 1)));
    }
  }
  throw lastErr;
}

async function defaultBranch(owner, name, headers) {
  try {
    const r = await gh.get(`https://api.github.com/repos/${owner}/${name}`, { headers, timeout: 15000 });
    return r.data.default_branch || 'main';
  } catch {
    return 'main';
  }
}

module.exports = { fetch, source: 'github' };
