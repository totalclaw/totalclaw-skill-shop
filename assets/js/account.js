'use strict';

// 登录 / 注册 / 用户中心。依赖 app.js 暴露的 window.SM。
(function () {
  const SM = window.SM;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
  function fd(form) { return Object.fromEntries(new FormData(form).entries()); }
  function msg(id, text, ok) { const el = document.getElementById(id); if (el) { el.textContent = text; el.className = 'form-msg ' + (ok ? 'ok' : 'err'); } }

  // 登录
  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const d = await SM.api('/auth/login', { method: 'POST', body: fd(loginForm) });
      SM.setAuth(d.accessToken, d.user);
      location.href = '/me';
    } catch (err) { msg('loginMsg', '登录失败：' + err.message, false); }
  });

  // 注册
  const registerForm = document.getElementById('registerForm');
  if (registerForm) registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const d = await SM.api('/auth/register', { method: 'POST', body: fd(registerForm) });
      SM.setAuth(d.accessToken, d.user);
      location.href = '/me';
    } catch (err) { msg('registerMsg', '注册失败：' + err.message, false); }
  });

  // 用户中心
  const userCenter = document.getElementById('userCenter');
  if (userCenter) initUserCenter();

  async function initUserCenter() {
    if (!SM.token()) { location.href = '/login'; return; }
    let me;
    try { me = await SM.api('/auth/me'); } catch { SM.logout(); return; }
    const isDev = (me.roles || []).includes('developer');
    const profile = document.getElementById('profile');
    profile.innerHTML = `<div><strong>${esc(me.username)}</strong> · 角色：${esc((me.roles || []).join(', '))}</div>
      <div>开发者余额：¥${me.earningsBalance || 0}</div>
      ${!isDev ? '<button id="beDev">申请成为开发者</button>' : ''}`;
    const beDev = document.getElementById('beDev');
    if (beDev) beDev.addEventListener('click', async () => {
      try { await SM.api('/auth/become-developer', { method: 'POST' }); alert('已成为开发者，请重新登录刷新权限'); location.reload(); }
      catch (err) { alert(err.message); }
    });

    // 已购
    try {
      const owned = await SM.api('/entitlements/mine');
      const box = document.getElementById('ownedList');
      box.innerHTML = owned.length
        ? owned.map((o) => `<div class="row"><a href="/skills/${encodeURIComponent(o.skillId)}">${esc(o.skillId)}</a><span class="tag">${esc(o.source)}</span><button class="dl-btn" data-dl="${esc(o.skillId)}">下载</button></div>`).join('')
        : '<p class="muted">暂无已购</p>';
      box.addEventListener('click', async (e) => {
        const b = e.target.closest('[data-dl]');
        if (!b) return;
        b.disabled = true; const o = b.textContent; b.textContent = '下载中…';
        try { await SM.downloadSkill(b.dataset.dl, true); b.textContent = '已下载'; }
        catch (err) { alert('下载失败：' + err.message); b.textContent = o; }
        finally { b.disabled = false; setTimeout(() => { b.textContent = '下载'; }, 1500); }
      });
    } catch (e) { document.getElementById('ownedList').textContent = e.message; }

    // 订单
    try {
      const orders = await SM.api('/orders/mine');
      document.getElementById('orderList').innerHTML = orders.length
        ? orders.map((o) => `<div class="row"><span>${esc(o.orderId)}</span><span>${esc(o.skillId)}</span><span class="tag ${o.status === 'paid' ? 'tag-free' : 'tag-paid'}">${esc(o.status)}</span><span>¥${o.amountCny}</span></div>`).join('')
        : '<p class="muted">暂无订单</p>';
    } catch (e) { document.getElementById('orderList').textContent = e.message; }

    // 激活码兑换
    const redeemForm = document.getElementById('redeemForm');
    redeemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try { const r = await SM.api('/activation-codes/redeem', { method: 'POST', body: fd(redeemForm) }); msg('redeemMsg', '兑换成功：' + r.skillId, true); setTimeout(() => location.reload(), 800); }
      catch (err) { msg('redeemMsg', '兑换失败：' + err.message, false); }
    });

    // 开发者区
    if (isDev) {
      document.getElementById('devSection').hidden = false;
      const uploadForm = document.getElementById('uploadForm');
      uploadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = fd(uploadForm); data.price = Number(data.price) || 0;
        try { await SM.api('/developer/skills', { method: 'POST', body: data }); msg('uploadMsg', '已上传，进入审核', true); loadDev(); }
        catch (err) { msg('uploadMsg', '上传失败：' + err.message, false); }
      });
      loadDev();
    }
  }

  async function loadDev() {
    try {
      const skills = await SM.api('/developer/skills');
      document.getElementById('mySkills').innerHTML = skills.length
        ? skills.map((s) => `<div class="row"><span>${esc(s.name)}</span><span class="tag">${esc(s.reviewStatus)}</span><span class="tag ${s.listingType === 'paid' ? 'tag-paid' : 'tag-free'}">${s.listingType === 'paid' ? '¥' + (s.pricing && s.pricing.price) : '免费'}</span></div>`).join('')
        : '<p class="muted">暂无上传</p>';
    } catch (e) { document.getElementById('mySkills').textContent = e.message; }
    try {
      const earnings = await SM.api('/developer/earnings');
      document.getElementById('earnings').innerHTML = earnings.length
        ? earnings.map((e2) => `<div class="row"><span>${esc(e2.skillId)}</span><span>成交 ¥${e2.gross}</span><span>抽成 ¥${e2.platformFee}</span><span class="ok">净收 ¥${e2.net}</span></div>`).join('')
        : '<p class="muted">暂无收益</p>';
    } catch (e) { document.getElementById('earnings').textContent = e.message; }
  }
})();
