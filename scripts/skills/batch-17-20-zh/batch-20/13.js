'use strict';
const fs = require('fs');
const path = require('path');

module.exports = {
  skillId: 'totalclaw:totalclaw~agentossoftware-agentos-sdk',
  descriptionZh:
    'AgentOS SDK 完整指南：持久记忆、项目管理、看板、活动日志、Mesh 通信与自我进化协议。',
  bodyZh: fs.readFileSync(path.join(__dirname, 'bodies/13-agentos-sdk.bodyzh.md'), 'utf8'),
};
