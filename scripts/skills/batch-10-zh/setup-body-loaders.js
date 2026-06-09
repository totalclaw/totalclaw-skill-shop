const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'batch-10-zh');
const bodiesDir = path.join(dir, 'bodies');
fs.mkdirSync(bodiesDir, { recursive: true });

function mod(num, name, skillId, descriptionZh, bodyFile) {
  const bodyPath = path.join(bodiesDir, bodyFile);
  const rel = `path.join(__dirname, 'bodies', '${bodyFile}')`;
  const js = `'use strict';
const fs = require('fs');
const path = require('path');
module.exports = {
  skillId: ${JSON.stringify(skillId)},
  descriptionZh: ${JSON.stringify(descriptionZh)},
  bodyZh: fs.readFileSync(path.join(__dirname, 'bodies', ${JSON.stringify(bodyFile)}), 'utf8'),
};
`;
  fs.writeFileSync(path.join(dir, `${num}-${name}.js`), js);
  console.log('module', num, name, '->', bodyFile);
}

mod('03', 'webhook-router', 'totalclaw:totalclaw~yoder-bawt-webhook-router',
  'OpenClaw 通用 webhook 接收与路由，集成 hooks 与 Tailscale Funnel，支持 GitHub/ClawHub 等处理器。',
  '03-webhook.bodyzh.md');

mod('14', 'agent-protocol', 'totalclaw:totalclaw~agent-protocol',
  'C-suite 代理团队 inter-agent 通信协议：调用语法、循环预防、隔离规则与响应格式。',
  '14-agent-protocol.bodyzh.md');

mod('09', 'twenty-oauth-mastery', 'totalclaw:totalclaw~avirweb-twenty-oauth-mastery',
  'Twenty CRM OAuth 专家级技能：实现、故障排查、令牌刷新、域限制与 Gmail/Calendar 同步集成。',
  '09-twenty-oauth.bodyzh.md');

console.log('Run: fill bodies/*.bodyzh.md then node write-batch-09-10-output.js');
