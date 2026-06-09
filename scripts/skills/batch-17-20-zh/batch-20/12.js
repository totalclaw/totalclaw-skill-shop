'use strict';
const fs = require('fs');
const path = require('path');

module.exports = {
  skillId: 'totalclaw:totalclaw~adamnaghs-safe-web',
  descriptionZh:
    '通过 PromptGuard 扫描实现安全网页抓取与搜索，在内容进入 AI 上下文前防护提示注入攻击。',
  bodyZh: fs.readFileSync(path.join(__dirname, 'bodies/12-safe-web.bodyzh.md'), 'utf8'),
};
