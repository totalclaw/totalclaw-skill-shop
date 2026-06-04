'use strict';

const express = require('express');
const axios = require('axios');
const { renderPage, escapeHtml, PUBLIC_ORIGIN } = require('./render');
const { header, footer, sourceFilter, skillCard, badge, catLabel, SOURCE_LABEL, SOURCE_ORDER } = require('./partials');

const API_BASE = (process.env.API_BASE || 'http://127.0.0.1:3091').replace(/\/$/, '');

function api() {
  return axios.create({ baseURL: `${API_BASE}/api`, timeout: 15000 });
}

function createMarketRouter() {
  const router = express.Router();

  // 首页
  router.get('/', async (req, res) => {
    try {
      const [featured, cats, srcSummary] = await Promise.all([
        api().get('/skills', { params: { sort: 'downloads', pageSize: 12 } }),
        api().get('/skills/categories'),
        api().get('/skills/sources-summary').catch(() => ({ data: [] })),
      ]);
      const items = featured.data.items || [];
      const categories = (cats.data || []).slice(0, 14);
      const srcCount = {};
      (srcSummary.data || []).forEach((s) => { srcCount[s._id] = s.count; });
      const sourceCards = SOURCE_ORDER.filter((s) => (srcCount[s] || 0) > 0).map((s) =>
        `<a class="source-card" href="/skills?source=${s}">
          <b>${escapeHtml(SOURCE_LABEL[s])}</b>
          <span>${srcCount[s]} 个 skill</span>
        </a>`).join('');
      const body = `${header('home')}
<main class="wrap">
  <section class="hero">
    <div class="hero-inner">
      <div class="hero-copy">
        <span class="hero-kicker">多社区聚合 · 收费交易 · 一键下载</span>
        <h1>泰途AI <span class="grad">Skill 市场</span></h1>
        <p>聚合 TotalClaw · OpenClaw · Hermes · GitHub · 腾讯 多社区 Skill，统一检索安装，支持收费 Skill 在线交易与下载。</p>
        <form class="hero-search" action="/skills" method="get" role="search">
          <input type="search" name="q" placeholder="搜索 skill 名称 / 关键词 / 能力…" aria-label="搜索 skill">
          <button type="submit">搜索</button>
        </form>
        <p class="hero-stat">已收录 <strong>${featured.data.total || 0}</strong> 个 skill · 覆盖 ${(srcSummary.data || []).length || 5} 个来源</p>
      </div>
      <div class="hero-logo"><img src="/assets/img/logo-full.png" alt="泰途AI"></div>
    </div>
  </section>
  <section>
    <h2>按来源浏览</h2>
    <div class="source-grid">${sourceCards}</div>
  </section>
  <section>
    <h2>热门 Skill</h2>
    <div class="grid">${items.length ? items.map(skillCard).join('') : '<p class="empty">暂无数据，去管理后台触发一次同步即可。</p>'}</div>
  </section>
  <section>
    <h2>分类</h2>
    <div class="chips">${categories.map((c) =>
      `<a class="chip" href="/skills?category=${encodeURIComponent(c._id || 'other')}">${escapeHtml(catLabel(c._id))} <i>${c.count}</i></a>`).join('')}</div>
  </section>
</main>
${footer()}`;
      res.send(renderPage({ title: '泰途AI Skill 市场', body, canonicalPath: '/' }));
    } catch (e) {
      res.status(502).send(renderPage({ title: '加载失败', body: `${header()}<main class="wrap"><p>API 不可用：${escapeHtml(e.message)}</p></main>${footer()}` }));
    }
  });

  // 列表 / 搜索
  router.get('/skills', async (req, res) => {
    try {
      const params = {
        q: req.query.q,
        category: req.query.category,
        source: req.query.source,
        tag: req.query.tag,
        listingType: req.query.listingType,
        sort: req.query.sort,
        page: req.query.page || 1,
        pageSize: 24,
      };
      const { data } = await api().get('/skills', { params });
      const items = data.items || [];
      const q = req.query.q ? `“${escapeHtml(req.query.q)}” ` : '';
      const pager = buildPager(data.page, data.totalPages, req.query);
      const sortVal = req.query.sort || 'latest';
      const sortOpt = (v, label) => `<option value="${v}"${sortVal === v ? ' selected' : ''}>${label}</option>`;
      // 隐藏字段：切换 sort 时保留其它筛选条件
      const hidden = ['q', 'category', 'source', 'tag', 'listingType']
        .filter((k) => req.query[k])
        .map((k) => `<input type="hidden" name="${k}" value="${escapeHtml(req.query[k])}">`)
        .join('');
      const body = `${header(req.query.listingType || 'skills')}
<main class="wrap">
  <h1>${q || ''}Skill 列表 <small>${data.total} 个</small></h1>
  <form class="list-search" action="/skills" method="get" role="search">
    ${['category', 'source', 'tag', 'listingType'].filter((k) => req.query[k]).map((k) => `<input type="hidden" name="${k}" value="${escapeHtml(req.query[k])}">`).join('')}
    <input type="search" name="q" value="${escapeHtml(req.query.q || '')}" placeholder="搜索 skill 名称 / 关键词…" aria-label="搜索">
    <button type="submit">搜索</button>
  </form>
  ${sourceFilter(req.query.source, req.query)}
  <div class="list-toolbar">
    <span class="active-filters">${activeFilterChips(req.query)}</span>
    <form class="sort-form" action="/skills" method="get">
      ${hidden}
      <label>排序
        <select name="sort" onchange="this.form.submit()">
          ${sortOpt('latest', '最新')}${sortOpt('downloads', '下载量')}${sortOpt('sales', '销量')}${sortOpt('rating', '评分')}
        </select>
      </label>
    </form>
  </div>
  <div class="grid">${items.length ? items.map(skillCard).join('') : '<p class="empty">没有匹配的 skill。</p>'}</div>
  ${pager}
</main>
${footer()}`;
      res.send(renderPage({ title: `${q}Skill 列表`, body, canonicalPath: '/skills' }));
    } catch (e) {
      res.status(502).send(renderPage({ title: '加载失败', body: `${header()}<main class="wrap"><p>API 不可用：${escapeHtml(e.message)}</p></main>${footer()}` }));
    }
  });

  // AI 员工岗位库（kind=role）：专属浏览页
  router.get('/roles', async (req, res) => {
    try {
      const params = {
        kind: 'role',
        q: req.query.q,
        category: req.query.category,
        sort: req.query.sort,
        page: req.query.page || 1,
        pageSize: 24,
      };
      const [{ data }, cats] = await Promise.all([
        api().get('/skills', { params }),
        api().get('/skills/categories', { params: { kind: 'role' } }).catch(() => ({ data: [] })),
      ]);
      const items = data.items || [];
      const categories = cats.data || [];
      const q = req.query.q ? `“${escapeHtml(req.query.q)}” ` : '';
      const activeCat = req.query.category || '';
      const catChip = (c, label) =>
        `<a class="src-tab ${activeCat === c ? 'active' : ''}" href="/roles${c ? '?category=' + encodeURIComponent(c) : ''}">${escapeHtml(label)}</a>`;
      const pager = buildPager(data.page, data.totalPages, { ...req.query });
      const body = `${header('roles')}
<main class="wrap">
  <section class="hero roles-hero">
    <div class="hero-inner">
      <div class="hero-copy">
        <span class="hero-kicker">TotalClaw AI 员工岗位库 · 即买即用的岗位人格</span>
        <h1>AI <span class="grad">员工岗位库</span></h1>
        <p>覆盖研发、设计、营销、销售、金融、法律等岗位的专家级 Agent 人格，购买后即可下载部署，让 AI 按真实岗位标准工作。</p>
        <form class="hero-search" action="/roles" method="get" role="search">
          <input type="search" name="q" value="${escapeHtml(req.query.q || '')}" placeholder="搜索员工 / 岗位…" aria-label="搜索员工">
          <button type="submit">搜索</button>
        </form>
        <p class="hero-stat">已上架 <strong>${data.total || 0}</strong> 个 AI 员工岗位</p>
      </div>
    </div>
  </section>
  <div class="src-filter">${catChip('', '全部分类')}${categories.map((c) => catChip(c._id || 'other', `${catLabel(c._id)} (${c.count})`)).join('')}</div>
  <h2>${q || ''}AI 员工岗位 <small>${data.total} 个</small></h2>
  <div class="grid">${items.length ? items.map(skillCard).join('') : '<p class="empty">暂无员工岗位，运行 scripts/roles 生成。</p>'}</div>
  ${pager}
</main>
${footer()}`;
      res.send(renderPage({ title: 'TotalClaw AI 员工岗位库', body, canonicalPath: '/roles' }));
    } catch (e) {
      res.status(502).send(renderPage({ title: '加载失败', body: `${header('roles')}<main class="wrap"><p>API 不可用：${escapeHtml(e.message)}</p></main>${footer()}` }));
    }
  });

  // 分类导航
  router.get('/categories', async (req, res) => {
    try {
      const { data } = await api().get('/skills/categories');
      const body = `${header('categories')}
<main class="wrap">
  <h1>分类</h1>
  <div class="chips">${(data || []).map((c) =>
    `<a class="chip" href="/skills?category=${encodeURIComponent(c._id || 'other')}">${escapeHtml(catLabel(c._id))} (${c.count})</a>`).join('')}</div>
</main>
${footer()}`;
      res.send(renderPage({ title: '分类', body, canonicalPath: '/categories' }));
    } catch (e) {
      res.status(502).send(renderPage({ title: '加载失败', body: `${header()}<main class="wrap"><p>${escapeHtml(e.message)}</p></main>${footer()}` }));
    }
  });

  // 详情
  router.get('/skills/:skillId', async (req, res) => {
    try {
      const id = req.params.skillId;
      const { data: s } = await api().get(`/skills/${encodeURIComponent(id)}`);
      const desc = s.descriptionZh || s.description || '';
      const paid = s.listingType === 'paid';
      const price = (s.pricing && s.pricing.price) || 0;
      const content = s.contentMd
        ? `<pre class="skill-content">${escapeHtml(s.contentMd.slice(0, 8000))}</pre>`
        : paid
        ? '<p class="locked">🔒 该 skill 为收费内容，购买后可查看 / 下载完整正文。</p>'
        : '';
      // 操作区：付费走「购买 → 模拟支付 → 下载」（owned 状态由 app.js 客户端校验后切换）
      const actions = paid
        ? `<button class="btn btn-primary btn-buy" data-skill="${escapeHtml(s.skillId)}" data-price="${price}">购买 ¥${price}</button>
           <button class="btn btn-primary btn-download" data-skill="${escapeHtml(s.skillId)}" data-paid="1" hidden>下载 SKILL.md</button>`
        : `<button class="btn btn-primary btn-download" data-skill="${escapeHtml(s.skillId)}" data-paid="0">下载 SKILL.md</button>`;

      // 多种命令下载模式
      const enc = encodeURIComponent(s.skillId);
      const slugName = (s.slug || s.skillId).replace(/[^a-zA-Z0-9._-]+/g, '-');
      const cliCmd = `totalclaw install ${s.skillId}`;
      const curlFree = `curl -fsSL ${PUBLIC_ORIGIN}/api/skills/${enc}/file -o ${slugName}.md`;
      const curlPaid = `curl -fsSL -H "Authorization: Bearer $TOTALCLAW_TOKEN" \\
  ${PUBLIC_ORIGIN}/api/entitlements/download/${enc} -o ${slugName}.md`;
      const cmdRow = (label, cmd, note) =>
        `<div class="cmd-row">
          <div class="cmd-label">${escapeHtml(label)}${note ? `<i>${escapeHtml(note)}</i>` : ''}</div>
          <div class="cmd-box"><code>${escapeHtml(cmd)}</code><button class="copy-btn" data-copy="${escapeHtml(cmd)}">复制</button></div>
        </div>`;
      const installPanel = `<section class="install-panel">
        <h2>安装 / 下载方式</h2>
        ${cmdRow('TotalClaw CLI', cliCmd, paid ? '需先购买并登录 CLI' : '推荐')}
        ${paid
          ? cmdRow('cURL（已购）', curlPaid, '$TOTALCLAW_TOKEN 为登录后的访问令牌')
          : cmdRow('cURL', curlFree, '直接下载，无需登录')}
        ${s.repository ? cmdRow('Git 仓库', `git clone ${s.repository}`, '获取源码') : ''}
        ${s.installCommand ? cmdRow('原始命令', s.installCommand, '来源自带') : ''}
      </section>`;

      const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: s.displayName || s.name,
        description: desc,
        applicationCategory: s.category,
        offers: { '@type': 'Offer', price: paid ? price : 0, priceCurrency: 'CNY' },
      };
      const body = `${header()}
<main class="wrap skill-detail">
  <nav class="crumbs"><a href="/skills">Skill</a> / <a href="/skills?source=${escapeHtml(s.source)}">${escapeHtml(SOURCE_LABEL[s.source] || s.source)}</a> / ${escapeHtml(s.category || 'other')}</nav>
  <h1>${escapeHtml(s.displayName || s.name)}</h1>
  <div class="skill-meta">${badge(s)}
    ${s.author ? `<span class="tag">作者 ${escapeHtml(s.author)}</span>` : ''}
    ${s.version ? `<span class="tag">v${escapeHtml(s.version)}</span>` : ''}
    <span class="tag">↓ ${(s.stats && s.stats.downloads) || 0}</span>
  </div>
  <p class="lead">${escapeHtml(desc)}</p>
  <div class="actions" data-skill="${escapeHtml(s.skillId)}" data-paid="${paid ? 1 : 0}">${actions}
    ${s.repository ? `<a class="btn btn-ghost" href="${escapeHtml(s.repository)}" target="_blank" rel="noopener">源码 ↗</a>` : ''}
    <span class="action-msg" id="actionMsg"></span>
  </div>
  ${installPanel}
  ${content}
</main>
${footer()}`;
      res.send(renderPage({ title: s.displayName || s.name, description: desc, body, canonicalPath: `/skills/${encodeURIComponent(id)}`, jsonLd }));
    } catch (e) {
      const code = e.response && e.response.status === 404 ? 404 : 502;
      res.status(code).send(renderPage({ title: code === 404 ? '未找到' : '加载失败', body: `${header()}<main class="wrap"><p>${code === 404 ? 'Skill 不存在' : escapeHtml(e.message)}</p></main>${footer()}` }));
    }
  });

  // 登录页
  router.get('/login', (req, res) => {
    const body = `${header()}
<main class="wrap auth-page">
  <div class="auth-head">
    <img src="/assets/img/logo-mark.png" alt="泰途AI" class="auth-logo">
    <h1>登录</h1>
    <p class="auth-sub">登录 TotalClaw Skill 市场，购买与下载你的 AI 员工岗位与技能</p>
  </div>
  <form id="loginForm" class="card-form">
    <label>用户名<input name="username" required minlength="3"></label>
    <label>密码<input name="password" type="password" required minlength="6"></label>
    <button type="submit">登录</button>
    <p class="form-msg" id="loginMsg"></p>
  </form>
  <p class="auth-alt">还没有账号？<a href="/register">去注册</a></p>
</main>
${footer()}`;
    res.send(renderPage({ title: '登录', body, canonicalPath: '/login', scripts: ['/assets/js/account.js'] }));
  });

  // 注册页
  router.get('/register', (req, res) => {
    const body = `${header()}
<main class="wrap auth-page">
  <div class="auth-head">
    <img src="/assets/img/logo-mark.png" alt="泰途AI" class="auth-logo">
    <h1>注册</h1>
    <p class="auth-sub">创建账号，即刻拥有你的 AI 员工岗位与技能库</p>
  </div>
  <form id="registerForm" class="card-form">
    <label>用户名<input name="username" required minlength="3"></label>
    <label>密码（≥6 位）<input name="password" type="password" required minlength="6"></label>
    <button type="submit">注册并登录</button>
    <p class="form-msg" id="registerMsg"></p>
  </form>
  <p class="auth-alt">已有账号？<a href="/login">去登录</a></p>
</main>
${footer()}`;
    res.send(renderPage({ title: '注册', body, canonicalPath: '/register', scripts: ['/assets/js/account.js'] }));
  });

  // 用户中心（客户端渲染，需登录）
  router.get('/me', (req, res) => {
    const body = `${header()}
<main class="wrap user-center" id="userCenter">
  <h1>用户中心</h1>
  <div id="profile" class="profile-box">加载中…</div>

  <section>
    <h2>兑换激活码</h2>
    <form id="redeemForm" class="inline-form">
      <input name="code" placeholder="TC-XXXXXX-XXXXXX-XXXX" required>
      <button type="submit">兑换</button>
      <span class="form-msg" id="redeemMsg"></span>
    </form>
  </section>

  <section>
    <h2>我的已购</h2>
    <div id="ownedList" class="list-box">加载中…</div>
  </section>

  <section>
    <h2>我的订单</h2>
    <div id="orderList" class="list-box">加载中…</div>
  </section>

  <section id="devSection" hidden>
    <h2>开发者 · 上传 Skill</h2>
    <form id="uploadForm" class="card-form">
      <label>slug<input name="slug" required></label>
      <label>名称<input name="name" required></label>
      <label>中文描述<input name="descriptionZh"></label>
      <label>分类<input name="category" value="engineering"></label>
      <label>价格（元，0 为免费）<input name="price" type="number" value="0" min="0"></label>
      <label>SKILL.md 正文<textarea name="contentMd" rows="6" required></textarea></label>
      <button type="submit">上传（进入审核）</button>
      <span class="form-msg" id="uploadMsg"></span>
    </form>
    <h2>开发者 · 我上传的</h2>
    <div id="mySkills" class="list-box">加载中…</div>
    <h2>开发者 · 收益账本</h2>
    <div id="earnings" class="list-box">加载中…</div>
  </section>
</main>
${footer()}`;
    res.send(renderPage({ title: '用户中心', body, canonicalPath: '/me', scripts: ['/assets/js/account.js'] }));
  });

  // 管理后台（客户端渲染，需 admin）
  router.get('/admin', (req, res) => {
    const body = `${header()}
<main class="wrap admin-console" id="adminConsole">
  <h1>管理后台</h1>
  <div id="adminStats" class="stat-row">加载中…</div>

  <section>
    <h2>多源同步</h2>
    <form id="syncForm" class="inline-form">
      <input name="source" placeholder="留空=全部，或 totalclaw,openclaw,hermes">
      <button type="submit">触发同步</button>
      <span class="form-msg" id="syncMsg"></span>
    </form>
    <div id="syncRuns" class="list-box"></div>
  </section>

  <section>
    <h2>待审核 Skill</h2>
    <div id="pendingList" class="list-box">加载中…</div>
  </section>

  <section>
    <h2>批量签发激活码</h2>
    <form id="batchForm" class="inline-form">
      <input name="skillId" placeholder="skillId" required>
      <input name="count" type="number" value="5" min="1" style="width:80px">
      <button type="submit">签发</button>
      <span class="form-msg" id="batchMsg"></span>
    </form>
    <div id="batchResult" class="list-box"></div>
  </section>
</main>
${footer()}`;
    res.send(renderPage({ title: '管理后台', body, canonicalPath: '/admin', scripts: ['/assets/js/admin.js'] }));
  });

  // 开发者入口（占位）
  router.get('/developer', (req, res) => {
    const body = `${header('developer')}
<main class="wrap">
  <h1>开发者中心</h1>
  <p>上传你的 skill，定价收费，平台按比例分账。</p>
  <ul>
    <li>注册/登录后申请成为开发者</li>
    <li>上传 SKILL.md + 元数据 + 定价</li>
    <li>管理员审核通过后上架</li>
    <li>成交后在收益账本查看分账</li>
  </ul>
  <p><a class="btn-link" href="/api/docs" target="_blank">查看 API 文档</a></p>
</main>
${footer()}`;
    res.send(renderPage({ title: '开发者中心', body, canonicalPath: '/developer' }));
  });

  return router;
}

// 当前生效筛选的可移除小标签
function activeFilterChips(query) {
  const labels = { q: '搜索', category: '分类', source: '来源', tag: '标签', listingType: '类型' };
  const ltLabel = { free: '免费', paid: '收费' };
  const chips = [];
  for (const k of ['q', 'category', 'source', 'tag', 'listingType']) {
    const v = query[k];
    if (!v) continue;
    const rest = { ...query };
    delete rest[k];
    delete rest.page;
    const qs = Object.entries(rest).filter(([, x]) => x != null && x !== '')
      .map(([kk, x]) => `${kk}=${encodeURIComponent(x)}`).join('&');
    const shown = k === 'source' ? (SOURCE_LABEL[v] || v) : k === 'listingType' ? (ltLabel[v] || v) : v;
    chips.push(`<a class="filter-chip" href="/skills${qs ? '?' + qs : ''}">${escapeHtml(labels[k])}：${escapeHtml(shown)} ✕</a>`);
  }
  return chips.join('');
}

function buildPager(page, totalPages, query) {
  if (!totalPages || totalPages <= 1) return '';
  const qs = (p) => {
    const o = { ...query, page: p };
    return '?' + Object.entries(o).filter(([, v]) => v != null && v !== '').map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');
  };
  const prev = page > 1 ? `<a href="${qs(page - 1)}">上一页</a>` : '';
  const next = page < totalPages ? `<a href="${qs(page + 1)}">下一页</a>` : '';
  return `<div class="pager">${prev}<span>${page} / ${totalPages}</span>${next}</div>`;
}

module.exports = { createMarketRouter };
