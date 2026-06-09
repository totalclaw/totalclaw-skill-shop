'use strict';
const fs = require('fs');
const path = require('path');

module.exports = {
  skillId: 'totalclaw:totalclaw~staybased-reef-n8n-automation',
  descriptionZh:
    '使用 2,061 个 n8n 模板库快速构建、定制并交付工作流，涵盖模板检索、构建流程、常见模式与客户交付清单。',
  bodyZh: fs.readFileSync(path.join(__dirname, 'bodies/10-reef-n8n.bodyzh.md'), 'utf8'),
};
