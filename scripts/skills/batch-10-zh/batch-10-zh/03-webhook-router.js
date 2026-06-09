'use strict';
const fs = require('fs');
const path = require('path');
module.exports = {
  skillId: "totalclaw:totalclaw~yoder-bawt-webhook-router",
  descriptionZh: "OpenClaw 通用 webhook 接收与路由，集成 hooks 与 Tailscale Funnel，支持 GitHub/ClawHub 等处理器。",
  bodyZh: fs.readFileSync(path.join(__dirname, 'bodies', "03-webhook.bodyzh.md"), 'utf8'),
};
