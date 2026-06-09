module.exports = {
  skillId: 'totalclaw:totalclaw~xthezealot-xthezealot-stealth-browser',
  descriptionZh:
    '隐身浏览器技能，通过 Playwright Stealth 插件访问带高级 bot 防护的网站，支持抓取 HTML、截图、PDF 与并行多 URL 获取。',
  bodyZh: `# Stealth Browser（隐身浏览器）

使用 \`/stealth-browser\` 访问带高级 bot 防护的网站。

## 命令

- \`/stealth-browser open <url>\` - 获取页面 HTML
- \`/stealth-browser screenshot <url>\` - 全页截图
- \`/stealth-browser pdf <url>\` - 将页面保存为 PDF
- \`/stealth-browser parallel <url1> <url2> [url3...]\` - 并行获取多个 URL

## 示例

\`\`\`
/stealth-browser open https://www.bazaraki.com/adv/6203561_2-bedroom-detached-house-for-sale/
/stealth-browser screenshot https://example.com
/stealth-browser pdf https://example.com
/stealth-browser parallel https://site1.com https://site2.com https://site3.com
\`\`\`

## 并行浏览

\`parallel\` 命令使用隔离的浏览器上下文同时获取多个 URL：
- 每个 URL 拥有独立上下文（Cookie、存储等）
- 比顺序抓取快得多
- 结果以格式化 JSON 返回

## 工作原理

使用 Playwright Extra 与 Stealth 插件掩盖自动化特征：
- 移除 \`navigator.webdriver\` 标志
- 伪造 Chrome 插件与权限
- 伪造 WebGL/Canvas 指纹
- 模拟真实用户行为

可绕过 Cloudflare、reCAPTCHA 及大多数 bot 检测。
`,
};
