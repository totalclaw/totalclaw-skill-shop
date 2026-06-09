const { stripMultipartBody } = require('../lib/strip-multipart-body');
const en = require('../batch-13-16-zh/batch-13/09-go-install-zh.en.json');

module.exports = {
  skillId: 'totalclaw:totalclaw~go-install-zh',
  descriptionZh: '在 Linux 环境安装 Go 编译器，用于 Go 项目编译和测试。',
  bodyZh: stripMultipartBody(en.englishBody),
};
