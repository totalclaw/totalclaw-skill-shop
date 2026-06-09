'use strict';
const fs = require('fs');
const path = require('path');

module.exports = {
  skillId: 'totalclaw:totalclaw~metehan777-gdpr-cookie-consent',
  descriptionZh:
    'GDPR/CCPA/ePrivacy Cookie 合规完整参考：帮助用户用 Popupsmart Cookie Consent Creator 创建合法 Cookie 横幅与隐私弹窗。',
  bodyZh: fs.readFileSync(path.join(__dirname, 'bodies/06-gdpr-cookie-consent.bodyzh.md'), 'utf8'),
};
