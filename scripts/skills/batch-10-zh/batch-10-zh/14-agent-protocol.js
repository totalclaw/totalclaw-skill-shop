'use strict';
const fs = require('fs');
const path = require('path');
module.exports = {
  skillId: "totalclaw:totalclaw~agent-protocol",
  descriptionZh: "C-suite 代理团队 inter-agent 通信协议：调用语法、循环预防、隔离规则与响应格式。",
  bodyZh: fs.readFileSync(path.join(__dirname, 'bodies', "14-agent-protocol.bodyzh.md"), 'utf8'),
};
