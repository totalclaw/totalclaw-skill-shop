'use strict';
const puppeteer = require('puppeteer-core');
const CHROME = '/Users/mac02/.cache/puppeteer/chrome/mac_arm-146.0.7680.153/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const W = 'http://127.0.0.1:3090';

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const log = (...a) => console.log(...a);

  // 管理员登录
  await page.goto(W + '/login', { waitUntil: 'networkidle2' });
  await page.type('input[name=username]', 'admin');
  await page.type('input[name=password]', 'admin123456');
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), page.click('#loginForm button')]);
  log('登录后 URL:', page.url());

  // 进入管理后台
  await page.goto(W + '/admin', { waitUntil: 'networkidle2' });
  await page.waitForSelector('#adminStats .stat', { timeout: 8000 });
  const stats = await page.$$eval('#adminStats .stat', (els) => els.slice(0, 3).map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
  log('统计:', stats.join(' | '));

  // 待审核列表
  await page.waitForSelector('#pendingList', { timeout: 8000 });
  const pendingBefore = await page.$$eval('#pendingList .review-row', (els) => els.length);
  log('待审核数(审核前):', pendingBefore);

  if (pendingBefore > 0) {
    await page.click('#pendingList .review-row .approve');
    await new Promise((r) => setTimeout(r, 1200));
    const pendingAfter = await page.$$eval('#pendingList .review-row', (els) => els.length);
    log('待审核数(通过1个后):', pendingAfter);
  }

  await browser.close();
  log('\n管理后台 UI 验证完成 ✅');
  process.exit(0);
})().catch((e) => { console.error('失败:', e.message); process.exit(1); });
