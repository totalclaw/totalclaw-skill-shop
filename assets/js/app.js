'use strict';

// 共享前端工具：token 管理、API 调用、登录态 header 渲染、购买/安装交互。
(function () {
  const TOKEN_KEY = 'accessToken';
  const USER_KEY = 'user';

  const SM = {
    token() { return localStorage.getItem(TOKEN_KEY) || ''; },
    user() { try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; } },
    setAuth(token, user) {
      localStorage.setItem(TOKEN_KEY, token);
      if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    },
    logout() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); location.href = '/'; },
    async api(path, opts) {
      opts = opts || {};
      const headers = Object.assign({}, opts.headers);
      if (opts.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
      if (SM.token()) headers['Authorization'] = 'Bearer ' + SM.token();
      const r = await fetch('/api' + path, {
        method: opts.method || 'GET',
        headers,
        body: opts.body ? JSON.stringify(opts.body) : undefined,
      });
      let data = null;
      try { data = await r.json(); } catch { /* no body */ }
      if (!r.ok) throw new Error((data && (data.message || data.error)) || ('HTTP ' + r.status));
      return data;
    },
  };
  window.SM = SM;

  // 渲染 header 登录态
  function renderAuthSlot() {
    const slot = document.getElementById('authSlot');
    if (!slot) return;
    const u = SM.user();
    if (SM.token() && u) {
      const adminLink = (u.roles || []).includes('admin') ? '<a href="/admin">管理后台</a>' : '';
      slot.innerHTML = `<a href="/me">${u.username}</a>${adminLink}<a href="#" id="logoutBtn">退出</a>`;
      const lo = document.getElementById('logoutBtn');
      if (lo) lo.addEventListener('click', (e) => { e.preventDefault(); SM.logout(); });
    } else {
      // 登录入口暂时隐藏，后续恢复：把下一行换回 slot.innerHTML = '<a href="/login" class="auth-login">登录</a>';
      slot.innerHTML = '';
    }
  }
  document.addEventListener('DOMContentLoaded', renderAuthSlot);

  // —— 下载（免费直下 / 收费走鉴权接口），统一用 blob 触发浏览器下载 ——
  async function downloadSkill(skillId, paid, msgEl) {
    const path = paid
      ? '/entitlements/download/' + encodeURIComponent(skillId)
      : '/skills/' + encodeURIComponent(skillId) + '/file';
    const headers = {};
    if (SM.token()) headers['Authorization'] = 'Bearer ' + SM.token();
    const r = await fetch('/api' + path, { headers });
    if (r.status === 401 || r.status === 403) {
      throw new Error(paid ? '请先购买并登录后再下载' : '该 skill 需要购买后下载');
    }
    if (!r.ok) throw new Error('下载失败 HTTP ' + r.status);
    const blob = await r.blob();
    // 文件名取自 Content-Disposition，回退到 skillId
    let fname = (skillId.split('/').pop() || 'skill') + '.md';
    const cd = r.headers.get('Content-Disposition') || '';
    const m = /filename\*=UTF-8''([^;]+)/i.exec(cd) || /filename="?([^";]+)"?/i.exec(cd);
    if (m) { try { fname = decodeURIComponent(m[1]); } catch { fname = m[1]; } }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = fname; document.body.appendChild(a); a.click();
    a.remove(); URL.revokeObjectURL(url);
    if (msgEl) setMsg(msgEl, '已开始下载 ' + fname, 'ok');
  }

  function setMsg(el, text, kind) {
    if (!el) return;
    el.textContent = text;
    el.className = 'action-msg' + (kind ? ' ' + kind : '');
  }

  function escHtml(s) { return String(s == null ? '' : s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

  // 详情页收费 skill：登录且已购 → 在本页只读展示正文（带水印），不提供下载
  async function initSkillDetail() {
    const actions = document.querySelector('.actions[data-skill]');
    if (!actions || actions.dataset.paid !== '1') return;
    if (!SM.token()) return;
    try {
      const { owned } = await SM.api('/entitlements/check/' + encodeURIComponent(actions.dataset.skill));
      if (owned) await unlockPaidContent(actions.dataset.skill, actions);
    } catch { /* 未登录或网络问题，保持购买态 */ }
  }
  // 已购：拉取带水印正文，只读注入到 .paid-content
  async function unlockPaidContent(skillId, actions) {
    const buy = actions.querySelector('.btn-buy');
    if (buy) buy.hidden = true;
    setMsg(document.getElementById('actionMsg'), '已购买 · 正文见下方（含买家专属水印，请勿外传）', 'ok');
    const box = document.querySelector('.paid-content[data-skill]');
    if (!box) return;
    try {
      const doc = await SM.api('/entitlements/content/' + encodeURIComponent(skillId));
      const md = (doc && doc.contentMd) || '';
      box.innerHTML = '<div class="wm-note">⚠ 本副本含买家专属隐形水印，仅限本人使用，转载 / 转售可溯源追责。</div>'
        + '<pre class="skill-content">' + escHtml(md) + '</pre>';
    } catch (e) {
      box.innerHTML = '<p class="locked">正文加载失败：' + escHtml(e.message) + '</p>';
    }
  }
  document.addEventListener('DOMContentLoaded', initSkillDetail);

  // 复制命令
  document.addEventListener('click', function (e) {
    const cp = e.target.closest('.copy-btn');
    if (!cp) return;
    const text = cp.dataset.copy || '';
    const done = () => { const o = cp.textContent; cp.textContent = '已复制'; cp.classList.add('copied'); setTimeout(() => { cp.textContent = o; cp.classList.remove('copied'); }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done).catch(done);
    else { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch {} t.remove(); done(); }
  });

  // 下载 / 购买
  document.addEventListener('click', async function (e) {
    const dl = e.target.closest('.btn-download');
    const buy = e.target.closest('.btn-buy');
    const msg = document.getElementById('actionMsg');

    if (dl) {
      const paid = dl.dataset.paid === '1';
      setMsg(msg, '准备下载…');
      try { await downloadSkill(dl.dataset.skill, paid, msg); }
      catch (err) { setMsg(msg, err.message, 'err'); }
      return;
    }

    if (buy) {
      if (!SM.token()) { alert('请先登录后再购买'); location.href = '/login'; return; }
      const skillId = buy.dataset.skill;
      try {
        setMsg(msg, '正在创建订单…');
        const order = await SM.api('/orders', { method: 'POST', body: { skillId } });
        // 开发演示：直接走模拟支付完成（生产应跳转真实收银台/支付渠道）
        if (!confirm('订单 ' + order.orderId + '，金额 ¥' + order.amountCny +
          '\n\n本地未接真实支付渠道，是否「模拟支付」完成本单以解锁下载？')) {
          setMsg(msg, '订单已创建（未支付），可在用户中心继续支付', 'ok');
          return;
        }
        setMsg(msg, '支付处理中…');
        await SM.api('/orders/' + encodeURIComponent(order.orderId) + '/simulate-pay', { method: 'POST' });
        // 解锁：在本页只读展示正文（带水印），不提供文件下载
        setMsg(msg, '支付成功 · 正在解锁正文…', 'ok');
        const actions = buy.closest('.actions[data-skill]') || document.querySelector('.actions[data-skill]');
        await unlockPaidContent(skillId, actions);
      } catch (err) { setMsg(msg, '失败：' + err.message, 'err'); }
    }
  });

  window.SM.downloadSkill = downloadSkill;
})();
