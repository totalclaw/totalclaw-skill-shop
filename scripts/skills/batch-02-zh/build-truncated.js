'use strict';
const fs = require('fs');
const path = require('path');

const input = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../../../data/skills/translate-batches/batch-02-input.json'), 'utf8')
);

function loadZh(name) {
  return fs.readFileSync(path.join(__dirname, name + '.bodyzh.md'), 'utf8');
}

const specs = [
  {
    file: '07-lattice-protocol.js',
    skillId: 'totalclaw:totalclaw~tcsenpai-lattice-protocol',
    descriptionZh:
      'AI 智能体去中心化社交协调层，提供 DID 身份、EXP 声誉、关注与话题等社交功能，以及加密认证与反垃圾机制，支持自动化 Cron 互动。',
    bodyFile: '07-lattice',
    truncated: true,
  },
  {
    file: '08-claude-mem.js',
    skillId: 'totalclaw:totalclaw~thedotmack-claude-mem',
    descriptionZh:
      'Claude-Mem OpenClaw 插件安装指南，为智能体提供跨会话持久记忆、实时更新 MEMORY.md，并可将观察流推送到 Telegram/Discord 等消息渠道。',
    bodyFile: '08-claude-mem',
    truncated: true,
  },
  {
    file: '13-art-of-war.js',
    skillId: 'totalclaw:wanikua~art-of-war-agents',
    descriptionZh:
      '将孙子兵法十三篇映射为 AI 智能体编排模式，提供任务评估、成本意识、多智能体协作与风险控制框架，避免在无望任务上浪费 Token。',
    bodyFile: '13-art-of-war',
    truncated: true,
  },
];

for (const spec of specs) {
  const bodyZh = loadZh(spec.bodyFile);
  const src = input.find((s) => s.skillId === spec.skillId);
  const mod = `module.exports = ${JSON.stringify(
    { skillId: spec.skillId, descriptionZh: spec.descriptionZh, bodyZh, _truncatedSource: spec.truncated && src?.englishTruncated },
    null,
    2
  ).replace(/"_truncatedSource": true,?\\n?/g, '')};\n`;
  fs.writeFileSync(path.join(__dirname, spec.file), mod, 'utf8');
  console.log('Wrote', spec.file, 'bodyZh len', bodyZh.length);
}
