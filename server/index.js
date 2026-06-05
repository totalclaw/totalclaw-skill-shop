'use strict';

const path = require('path');
const { spawn } = require('child_process');
const express = require('express');
const compression = require('compression');
const axios = require('axios');
const cron = require('node-cron');
const { createMarketRouter } = require('./market-routes');
const { PUBLIC_ORIGIN } = require('./render');

const app = express();
const PORT = parseInt(process.env.PORT || '3090', 10);
const IS_PROD = process.env.NODE_ENV === 'production';
const API_BASE = (process.env.API_BASE || 'http://127.0.0.1:3091').replace(/\/$/, '');

// gzip 压缩：HTML/CSS/JS/JSON 体积压掉 ~70-80%，是「每次点击都卡」最直接的提速点。
app.use(compression());

// SSR 页面浏览器缓存：仅 private（只缓存到本人浏览器、不进共享代理 → 即便登录态也安全），
// 公开内容页（首页 / 技能库 / 员工库 / 详情）缓存 60s，前进/后退与短时间内重复导航秒开；
// 用户态 / 管理 / 登录注册 不缓存。
app.use((req, res, next) => {
  if (req.method === 'GET'
    && !req.path.startsWith('/api')
    && !/^\/(me|admin|login|register|logout)(\/|$)/.test(req.path)) {
    res.setHeader('Cache-Control', 'private, max-age=60');
  }
  next();
});

// /api 反向代理到 NestJS（开发用；生产由 nginx 反代）。透传 method/headers/body/状态码。
app.use('/api', express.raw({ type: () => true, limit: '5mb' }), async (req, res) => {
  try {
    const headers = { ...req.headers };
    delete headers.host;
    delete headers['content-length'];
    const r = await axios({
      method: req.method,
      url: API_BASE + req.originalUrl,
      headers,
      data: req.body && req.body.length ? req.body : undefined,
      responseType: 'arraybuffer',
      validateStatus: () => true,
      timeout: 30000,
    });
    res.status(r.status);
    const ct = r.headers['content-type'];
    if (ct) res.type(ct);
    res.send(Buffer.from(r.data));
  } catch (e) {
    res.status(502).json({ message: 'api proxy error: ' + e.message });
  }
});

// 静态资源
app.use('/assets', express.static(path.join(__dirname, '..', 'assets'), {
  maxAge: IS_PROD ? '7d' : 0,
}));

// robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain').send(`User-agent: *\nAllow: /\nSitemap: ${PUBLIC_ORIGIN}/sitemap.xml\n`);
});

// 市场前台路由（SSR）
app.use('/', createMarketRouter());

// 404
app.use((req, res) => {
  res.status(404).type('text/plain').send('404 Not Found');
});

app.listen(PORT, () => {
  console.log(`Skill 市场前台启动: http://localhost:${PORT}  (API_BASE=${process.env.API_BASE || 'http://127.0.0.1:3091'})`);
});

// 定时自动同步多源 skill。周期可配 SYNC_CRON（默认每日 03:00），SKIP_CRON_SYNC=1 关闭。
if (process.env.SKIP_CRON_SYNC !== '1') {
  const schedule = process.env.SYNC_CRON || '0 3 * * *';
  if (cron.validate(schedule)) {
    const runSync = () => {
      const script = path.join(__dirname, '..', 'scripts', 'sync', 'run-sync.js');
      console.log('[cron] 触发多源 skill 同步');
      const child = spawn('node', [script], { cwd: path.join(__dirname, '..'), env: process.env, stdio: 'inherit' });
      child.on('close', (code) => console.log(`[cron] 同步结束 code=${code}`));
    };
    cron.schedule(schedule, runSync);
    console.log(`[cron] 已注册定时同步: ${schedule}`);
    // SYNC_ON_BOOT=1 时启动后立即跑一次（首次部署/空库快速填充）
    if (process.env.SYNC_ON_BOOT === '1') setTimeout(runSync, 3000);
  } else {
    console.warn(`[cron] SYNC_CRON 非法，跳过定时同步: ${schedule}`);
  }
}
