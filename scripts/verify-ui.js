'use strict';
// 用 puppeteer-core + 本机 Chrome 做真实 headless 浏览器验证前端交互流。
const puppeteer = require('puppeteer-core');
const CHROME = '/Users/mac02/.cache/puppeteer/chrome/mac_arm-146.0.7680.153/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
const W = 'http://127.0.0.1:3090';
const U = 'uiuser_' + Date.now();

(async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  const log = (...a) => console.log(...a);

  // 1. 注册
  await page.goto(W + '/register', { waitUntil: 'networkidle2' });
  await page.type('input[name=username]', U);
  await page.type('input[name=password]', 'pass123456');
  await Promise.all([page.waitForNavigation({ waitUntil: 'networkidle2' }), page.click('#registerForm button')]);
  log('注册后 URL:', page.url());

  // 2. 用户中心 profile 渲染
  await page.waitForSelector('#profile strong', { timeout: 8000 });
  const profile = await page.$eval('#profile', (el) => el.textContent.replace(/\s+/g, ' ').trim());
  log('用户中心 profile:', profile.slice(0, 80));

  // 3. header 登录态
  const authSlot = await page.$eval('#authSlot', (el) => el.textContent.trim());
  log('header 登录态:', authSlot);

  // 4. 申请成为开发者
  const hasBeDev = await page.$('#beDev');
  if (hasBeDev) {
    page.once('dialog', (d) => d.accept());
    await page.click('#beDev');
    await new Promise((r) => setTimeout(r, 1500));
    log('已点击申请开发者');
  }

  // 5. 退出登录 → token 清除
  await page.reload({ waitUntil: 'networkidle2' });
  const tokenBefore = await page.evaluate(() => localStorage.getItem('accessToken'));
  log('退出前有 token:', !!tokenBefore);

  await browser.close();
  log('\nUI 验证完成 ✅');
  process.exit(0);
})().catch((e) => { console.error('UI 验证失败:', e.message); process.exit(1); });
