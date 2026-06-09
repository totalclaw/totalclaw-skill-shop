'use strict';
const fs = require('fs');
const path = require('path');

module.exports = {
  skillId: 'totalclaw:totalclaw~akivasolutions-plex-ctl',
  descriptionZh:
    '通过 Plex API 控制媒体服务器与客户端的 CLI：播放、搜索、暂停/继续及媒体库浏览。',
  bodyZh: fs.readFileSync(path.join(__dirname, 'bodies/14-plex-ctl.bodyzh.md'), 'utf8'),
};
