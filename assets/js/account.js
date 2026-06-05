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

  // 注册（用户名 + 密码 + 确认密码 + 选填昵称；接口代理到 totalclaw-web）
  const registerForm = document.getElementById('registerForm');
  if (registerForm) registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const d = fd(registerForm);
    if ((d.username || '').trim().length < 3) { msg('registerMsg', '用户名至少 3 个字符', false); return; }
    if ((d.password || '').length < 6) { msg('registerMsg', '密码至少 6 位', false); return; }
    if (d.password !== d.password2) { msg('registerMsg', '两次输入的密码不一致', false); return; }
    const body = { username: d.username.trim(), password: d.password };
    if ((d.nickname || '').trim()) body.nickname = d.nickname.trim();
    try {
      const r = await SM.api('/auth/register', { method: 'POST', body });
      SM.setAuth(r.accessToken, r.user);
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
      // 收费 skill 不提供文件下载，改为「查看」进入详情页只读阅读（带水印）
      box.innerHTML = owned.length
        ? owned.map((o) => `<div class="row"><a href="/skills/${encodeURIComponent(o.skillId)}">${esc(o.skillId)}</a><span class="tag">${esc(o.source)}</span><a class="dl-btn" href="/skills/${encodeURIComponent(o.skillId)}">查看</a></div>`).join('')
        : '<p class="muted">暂无已购</p>';
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
