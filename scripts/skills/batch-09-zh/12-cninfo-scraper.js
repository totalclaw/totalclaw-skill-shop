module.exports = {
  skillId: 'totalclaw:totalclaw~ningjingzhiyuande-cninfo-announcement-scraper',
  descriptionZh:
    '抓取巨潮资讯（CNINFO）官方披露，提取 A 股监控所需的正面催化剂，支持时间与行业筛选。',
  bodyZh: `# cninfo-announcement-scraper

使用本技能抓取 CNINFO 官方披露，并提取 A 股监控所需的正面催化剂。

## 输入
- 时间窗口（默认：当前交易日）
- 事件筛选（默认：业绩预增、重大合同、政策扶持）
- 行业筛选（默认：新能源、消费）

## 流程
1. 获取最新 CNINFO 公告。
2. 解析并标准化：代码、公司、标题、announcement_time、url。
3. 分类公告类型。
4. 仅保留允许的事件类型与行业。
5. 返回结构化行供告警生成使用。

## 输出 Schema
- ticker
- company
- catalyst
- source_url
- timestamp
- confidence
- trigger_price
- invalidation_condition

## 安全
- 仅使用官方披露链接。
- 绝不提供自动交易指令。`,
};
