module.exports = {
  skillId: 'totalclaw:totalclaw~freestylefly-wechat-article-extractor-skill',
  descriptionZh:
    '从微信公众号文章提取元数据与内容。适用于解析 mp.weixin.qq.com 链接、提取标题/作者/正文/发布时间/封面图，或转换为结构化数据。支持图文、视频、图片、语音、转载等多种类型。',
  bodyZh: `# 微信公众号文章提取器

从微信公众号文章提取元数据与内容。

## 能力

- 解析微信公众号文章 URL（\`mp.weixin.qq.com\`）
- 提取文章元数据：标题、作者、摘要、发布时间
- 提取账号信息：名称、头像、微信号、简介
- 获取文章 HTML 正文
- 获取封面图 URL
- 支持多种文章类型：post、video、image、voice、text、repost
- 处理多种错误：内容已删、链接过期、访问受限等

## 用法

### 从 URL 基础提取

\`\`\`javascript
const { extract } = require('./scripts/extract.js');

const result = await extract('https://mp.weixin.qq.com/s?__biz=...');
// 返回：{ done: true, code: 0, data: {...} }
\`\`\`

### 从 HTML 提取

\`\`\`javascript
const html = await fetch(url).then(r => r.text());
const result = await extract(html, { url: sourceUrl });
\`\`\`

### 选项

\`\`\`javascript
const result = await extract(url, {
  shouldReturnContent: true,      // 返回 HTML 内容（默认：true）
  shouldReturnRawMeta: false,     // 返回原始元数据（默认：false）
  shouldFollowTransferLink: true, // 跟随迁移账号链接（默认：true）
  shouldExtractMpLinks: false,    // 提取嵌入的 mp.weixin 链接（默认：false）
  shouldExtractTags: false,       // 提取文章标签（默认：false）
  shouldExtractRepostMeta: false  // 提取转载来源信息（默认：false）
});
\`\`\`

## 响应格式

### 成功响应

\`\`\`javascript
{
  done: true,
  code: 0,
  data: {
    // 账号信息
    account_name: "公众号名称",
    account_alias: "微信号",
    account_avatar: "头像URL",
    account_description: "功能介绍",
    account_id: "原始ID",
    account_biz: "biz参数",
    account_biz_number: 1234567890,
    account_qr_code: "二维码URL",

    // 文章信息
    msg_title: "文章标题",
    msg_desc: "文章摘要",
    msg_content: "HTML内容",
    msg_cover: "封面图URL",
    msg_author: "作者",
    msg_type: "post", // post|video|image|voice|text|repost
    msg_has_copyright: true,
    msg_publish_time: Date,
    msg_publish_time_str: "2024/01/15 10:30:00",

    // 链接参数
    msg_link: "文章链接",
    msg_source_url: "阅读原文链接",
    msg_sn: "sn参数",
    msg_mid: 1234567890,
    msg_idx: 1
  }
}
\`\`\`

### 错误响应

\`\`\`javascript
{
  done: false,
  code: 1001,
  msg: "无法获取文章信息"
}
\`\`\`

## 错误码

| Code | Message | 说明 |
|------|---------|------|
| 1000 | 文章获取失败 | 通用失败 |
| 1001 | 无法获取文章信息 | 缺少标题或发布时间 |
| 1002 | 请求失败 | HTTP 请求失败 |
| 1003 | 响应为空 | 空响应 |
| 1004 | 访问过于频繁 | 触发限流 |
| 1005 | 脚本解析失败 | 脚本解析错误 |
| 1006 | 公众号已迁移 | 账号已迁移 |
| 2001 | 请提供文章内容或链接 | 缺少输入 |
| 2002 | 链接已过期 | 链接过期 |
| 2003 | 内容涉嫌侵权 | 内容已移除（版权） |
| 2004 | 无法获取迁移后的链接 | 迁移链接获取失败 |
| 2005 | 内容已被发布者删除 | 作者已删除 |
| 2006 | 内容因违规无法查看 | 内容被屏蔽 |
| 2007 | 内容发送失败 | 发送失败 |
| 2008 | 系统出错 | 系统错误 |
| 2009 | 不支持的链接 | 不支持的 URL |
| 2010 | 内容获取失败 | 内容获取失败 |
| 2011 | 涉嫌过度营销 | 营销/垃圾内容 |
| 2012 | 账号已被屏蔽 | 账号被屏蔽 |
| 2013 | 账号已自主注销 | 账号已注销 |
| 2014 | 内容被投诉 | 内容被举报 |
| 2015 | 账号处于迁移流程中 | 账号迁移中 |
| 2016 | 冒名侵权 | 冒充侵权 |

## 依赖

所需 npm 包：
- \`cheerio\` - HTML 解析
- \`dayjs\` - 日期格式化
- \`request-promise\` - HTTP 请求
- \`qs\` - 查询字符串解析
- \`lodash.unescape\` - HTML 实体

## 备注

- 处理多种微信页面结构与反爬措施
- 自动从页面内容检测文章类型
- 支持从搜狗微信搜索结果（\`weixin.sogou.com\`）提取
- 部分字段可能为 null，取决于文章类型与页面结构`,
};
