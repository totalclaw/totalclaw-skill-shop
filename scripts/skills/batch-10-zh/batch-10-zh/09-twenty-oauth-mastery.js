'use strict';
const fs = require('fs');
const path = require('path');
module.exports = {
  skillId: "totalclaw:totalclaw~avirweb-twenty-oauth-mastery",
  descriptionZh: "Twenty CRM OAuth 专家级技能：实现、故障排查、令牌刷新、域限制与 Gmail/Calendar 同步集成。",
  bodyZh: fs.readFileSync(path.join(__dirname, 'bodies', "09-twenty-oauth.bodyzh.md"), 'utf8'),
};
