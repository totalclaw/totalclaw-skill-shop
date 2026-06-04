'use strict';

const { escapeHtml } = require('./render');

const SOURCE_LABEL = {
  totalclaw: 'TotalClaw',
  openclaw: 'OpenClaw',
  hermes: 'Hermes',
  github: 'GitHub',
  tencent: '腾讯',
  clawskills: 'ClawSkills',
  skilldb: 'SkillDB',
};

// 前台来源筛选顺序（自研在前；镜像源/空源由首页按计数过滤展示）
const SOURCE_ORDER = ['totalclaw', 'openclaw', 'hermes', 'github', 'clawskills', 'tencent'];

function header(active) {
  const link = (href, label, key) =>
    `<a href="${href}" class="${active === key ? 'active' : ''}">${label}</a>`;
  return `<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/">
      <img src="/assets/img/logo-mark.png" alt="泰途AI" class="brand-mark">
      <span class="brand-text"><b>泰途AI</b><i>Skill 市场</i></span>
    </a>
    <nav>
      ${link('/skills', '全部', 'skills')}
      ${link('/roles', 'AI 角色', 'roles')}
      ${link('/skills?listingType=free', '免费', 'free')}
      ${link('/skills?listingType=paid', '收费', 'paid')}
      ${link('/categories', '分类', 'categories')}
      ${link('/developer', '开发者', 'developer')}
    </nav>
    <form class="search" action="/skills" method="get" role="search">
      <input type="search" name="q" placeholder="搜索 skill…" aria-label="搜索 skill">
      <button type="submit" aria-label="搜索">⌕</button>
    </form>
    <div class="auth-slot" id="authSlot">
      <a href="/login" class="auth-login">登录</a>
    </div>
  </div>
</header>`;
}

/** 来源筛选条：保留当前查询参数，切换 source。activeSource 为空表示「全部来源」。 */
function sourceFilter(activeSource, query) {
  const q = query || {};
  const build = (src) => {
    const o = { ...q, source: src || undefined, page: undefined };
    const qs = Object.entries(o)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return '/skills' + (qs ? '?' + qs : '');
  };
  const tab = (src, label) =>
    `<a class="src-tab ${(activeSource || '') === (src || '') ? 'active' : ''}" href="${build(src)}">${label}</a>`;
  return `<div class="src-filter">
    ${tab('', '全部来源')}
    ${SOURCE_ORDER.map((s) => tab(s, SOURCE_LABEL[s])).join('')}
  </div>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="foot-brand">
      <img src="/assets/img/logo-mark.png" alt="泰途AI" class="foot-mark">
      <div>
        <b>泰途AI · Skill 市场</b>
        <span>多源聚合 · 收费交易 · 一键下载</span>
      </div>
    </div>
    <div class="foot-meta">
      <span>来源：TotalClaw / OpenClaw / Hermes / GitHub / 腾讯</span>
      <span>© ${new Date().getFullYear()} 泰途科技</span>
    </div>
  </div>
</footer>`;
}

function badge(skill) {
  const src = SOURCE_LABEL[skill.source] || skill.source;
  const paid = skill.listingType === 'paid';
  const price = paid ? `¥${(skill.pricing && skill.pricing.price) || 0}` : '免费';
  const own = skill.ownership === 'totalclaw-proprietary'
    ? '<span class="tag tag-proprietary">自研闭源</span>'
    : skill.ownership === 'developer'
    ? '<span class="tag tag-dev">开发者</span>'
    : '';
  return `<span class="tag tag-source">${escapeHtml(src)}</span>
    <span class="tag ${paid ? 'tag-paid' : 'tag-free'}">${price}</span>${own}`;
}

function skillCard(skill) {
  const desc = skill.descriptionZh || skill.description || '';
  const dl = (skill.stats && skill.stats.downloads) || 0;
  const isRole = skill.kind === 'role';
  const emoji = isRole && skill.emoji ? `<span class="role-emoji">${escapeHtml(skill.emoji)}</span>` : '';
  return `<a class="skill-card${isRole ? ' role-card' : ''}" href="/skills/${encodeURIComponent(skill.skillId)}">
    <div class="skill-card-head">
      <h3>${emoji}${escapeHtml(skill.displayName || skill.name)}</h3>
    </div>
    <p class="skill-desc">${escapeHtml(desc.slice(0, 120))}</p>
    <div class="skill-meta">${badge(skill)}
      ${skill.category ? `<span class="tag tag-cat">${escapeHtml(skill.category)}</span>` : ''}
    </div>
    <div class="skill-card-foot">
      <span class="dl-count">↓ ${dl}</span>
      <span class="card-cta">${isRole ? '购买角色 →' : skill.listingType === 'paid' ? '购买下载 →' : '免费下载 →'}</span>
    </div>
  </a>`;
}

module.exports = { header, footer, sourceFilter, skillCard, badge, SOURCE_LABEL, SOURCE_ORDER };
