'use strict';

// 管理后台：统计 / 同步 / 审核 / 激活码。需 admin 角色。依赖 window.SM。
(function () {
  const SM = window.SM;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function fd(form) { return Object.fromEntries(new FormData(form).entries()); }
  function msg(id, text, ok) { const el = document.getElementById(id); if (el) { el.textContent = text; el.className = 'form-msg ' + (ok ? 'ok' : 'err'); } }

  if (!document.getElementById('adminConsole')) return;
  init();

  async function init() {
    if (!SM.token()) { location.href = '/login'; return; }
    const u = SM.user();
    if (!u || !(u.roles || []).includes('admin')) {
      document.getElementById('adminConsole').innerHTML = '<h1>无权限</h1><p>需要管理员账号。</p>';
      return;
    }
    loadStats(); loadRuns(); loadPending();

    document.getElementById('syncForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = fd(e.target);
      try { const r = await SM.api('/sources/sync', { method: 'POST', body: { source: data.source || undefined } }); msg('syncMsg', r.message, r.ok); setTimeout(loadRuns, 1500); }
      catch (err) { msg('syncMsg', err.message, false); }
    });

    document.getElementById('batchForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = fd(e.target); data.count = Number(data.count) || 1;
      try {
        const r = await SM.api('/admin/activation-codes/batch', { method: 'POST', body: data });
        document.getElementById('batchResult').innerHTML = r.codes.map((c) => `<div class="row"><code>${esc(c)}</code></div>`).join('');
        msg('batchMsg', '已签发 ' + r.count + ' 个', true);
      } catch (err) { msg('batchMsg', err.message, false); }
    });
  }

  async function loadStats() {
    try {
      const s = await SM.api('/admin/stats');
      document.getElementById('adminStats').innerHTML =
        `<div class="stat"><b>${s.total}</b><span>总 skill</span></div>
         <div class="stat"><b>${s.paid}</b><span>付费</span></div>
         <div class="stat"><b>${s.pending}</b><span>待审核</span></div>` +
        (s.bySource || []).map((b) => `<div class="stat"><b>${b.count}</b><span>${esc(b._id)}</span></div>`).join('');
    } catch (e) { document.getElementById('adminStats').textContent = e.message; }
  }

  async function loadRuns() {
    try {
      const runs = await SM.api('/sources/runs');
      document.getElementById('syncRuns').innerHTML = (runs || []).slice(0, 10)
        .map((r) => `<div class="row"><span>${esc(r.source)}</span><span class="tag ${r.status === 'success' ? 'tag-free' : r.status === 'error' ? 'tag-proprietary' : ''}">${esc(r.status)}</span><span>upserted ${r.upserted || 0}</span></div>`).join('') || '<p class="muted">暂无记录</p>';
    } catch (e) { document.getElementById('syncRuns').textContent = e.message; }
  }

  async function loadPending() {
    try {
      const list = await SM.api('/admin/reviews/pending');
      const box = document.getElementById('pendingList');
      box.innerHTML = list.length
        ? list.map((s) => `<div class="row review-row" data-id="${esc(s.skillId)}">
            <span>${esc(s.name)}</span>
            <span class="tag">${esc(s.category || '-')}</span>
            <span class="tag tag-paid">¥${(s.pricing && s.pricing.price) || 0}</span>
            <button class="approve">通过</button>
            <button class="reject">退回</button>
          </div>`).join('')
        : '<p class="muted">无待审核</p>';
    } catch (e) { document.getElementById('pendingList').textContent = e.message; }
  }

  document.addEventListener('click', async (e) => {
    const row = e.target.closest('.review-row');
    if (!row) return;
    const id = row.dataset.id;
    if (e.target.classList.contains('approve') || e.target.classList.contains('reject')) {
      const action = e.target.classList.contains('approve') ? 'approve' : 'reject';
      try { await SM.api('/admin/reviews/' + encodeURIComponent(id), { method: 'POST', body: { action } }); row.remove(); loadStats(); }
      catch (err) { alert(err.message); }
    }
  });
})();
