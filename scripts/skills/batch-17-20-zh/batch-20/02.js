'use strict';
const fs = require('fs');
const path = require('path');

module.exports = {
  skillId: 'totalclaw:totalclaw~wanng-ide-arxiv-agentic-verifier',
  descriptionZh:
    '基于 ArXiv 论文的智能体验证器：分析代码逻辑、生成判别性测试用例并执行验证，用于竞赛编程场景的代码正确性检查。',
  bodyZh: fs.readFileSync(path.join(__dirname, 'bodies/02-arxiv-agentic-verifier.bodyzh.md'), 'utf8'),
};
