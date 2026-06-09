module.exports = {
  skillId: 'totalclaw:totalclaw~vishalgojha-lead-extractor',
  descriptionZh:
    '从已解析的消息对象中提取结构化房产线索记录。适用于 WhatsApp 导出找线索、提取姓名-电话-预算、区分房源帖与需求帖。推荐链路：message-parser → lead-extractor → india-location-normalizer。不用于存储、摘要、外发消息或执行操作。',
  bodyZh: `# Lead Extractor（线索提取器）

识别已解析消息中的线索信号，并输出严格的线索对象。

## 快速触发

- 从该 WhatsApp 聊天中找出所有买家线索。
- 从这些消息中提取联系方式与预算。
- 从已解析消息中识别认真的房产咨询。

## 推荐链路

\`message-parser -> lead-extractor -> india-location-normalizer\`

## 执行工作流

1. 从 Supervisor 接收已解析消息。
2. 使用 \`references/parsed-message-input.schema.json\` 校验输入。
3. 应用 \`references/extraction-rules-re-india-v1.md\` 中的聊天专属提取规则。
4. 根据 Supervisor 上下文确定 \`dataset_mode\`：
   - 默认：\`broker_group\`
   - 允许：\`broker_group\`、\`buyer_inquiry\`、\`mixed\`
5. 根据咨询意图、联系方式与房产相关偏好检测候选线索消息。
6. 分类 \`record_type\`：
   - \`inventory_listing\`：经纪人库存/可售信息帖（经纪群默认）
   - \`buyer_requirement\`：明确「需要/chahiye/looking for」的需求帖
   - 丢弃非线索/系统噪音，不输出 \`noise_or_system\`
7. 当正文多行包含价格、面积或位置信息时，将多行 listing 视为一条候选记录。
8. 构建线索记录：
   - 必填：\`lead_id\`、\`name\`、\`phone\`、\`record_type\`
   - 可选：\`dataset_mode\`、\`property_type\`、\`budget\`、\`deal_type\`、\`asset_class\`、\`price_basis\`、\`area_sqft\`、\`area_basis\`、\`location_hint\`、\`raw_text\`、\`source\`、\`created_at\`
9. 规范化电话提取，支持 \`+91 98205 82462\`、\`98200 78845\` 等带空格变体。
10. 区分总价意图与单价意图：
    - 示例：\`3.5 Lakh rent\`（月租）、\`60K psf\`（每平方英尺）、\`4.25 Cr\`（总价）
11. 当记录明显指向同一人时，按稳定键去重。
12. 使用 \`references/output-leads.schema.json\` 校验输出。
13. 仅返回已校验的线索对象。

## 边界约束

- 绝不写入或更新持久化存储。
- 绝不修改源消息。
- 绝不生成摘要。
- 绝不建议或执行后续操作。
- 绝不发送通信或触发外部副作用。

## 错误处理

1. 拒绝无效的已解析消息输入。
2. 无线索证据时输出空数组。
3. 提取记录违反 schema 时返回字段级校验错误。
`,
};
