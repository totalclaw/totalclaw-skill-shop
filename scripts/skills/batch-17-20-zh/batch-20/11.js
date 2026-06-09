'use strict';
const fs = require('fs');
const path = require('path');

module.exports = {
  skillId: 'totalclaw:totalclaw~staybased-upwork-hunting',
  descriptionZh:
    '系统化在 Upwork 上发现、评估并赢得 n8n/自动化工作，以模板库速度优势制定投标与 Connect 花费策略。',
  bodyZh: fs.readFileSync(path.join(__dirname, 'bodies/11-upwork-hunting.bodyzh.md'), 'utf8'),
};
