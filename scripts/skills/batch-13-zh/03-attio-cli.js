module.exports = {
  skillId: 'totalclaw:totalclaw~froemic-attio-cli',
  descriptionZh:
    '通过 attio-cli 与 Attio CRM 工作区交互。支持列出对象/记录、管理列表与管道、查询属性，并生成工作区 schema 文档。',
  bodyZh: `# attio-cli

通过 attio-cli 与 Attio CRM 工作区交互。

## 安装

1. 克隆并安装 CLI：
\`\`\`bash
git clone https://github.com/FroeMic/attio-cli
cd attio-cli
npm install
npm link
\`\`\`

2. 设置 \`ATTIO_API_KEY\` 环境变量（从 Attio Settings > Developers > API Keys 获取）：
   - **推荐：** 添加到 Claude Code 的 \`~/.claude/.env\`
   - **备选：** 添加到 \`~/.bashrc\` 或 \`~/.zshrc\`：\`export ATTIO_API_KEY="your-api-key"\`

**仓库：** https://github.com/FroeMic/attio-cli

## 命令

列出对象与记录：
\`\`\`bash
attio object list                      # 列出所有对象
attio record list people               # 列出人员记录
attio record list companies            # 列出公司记录
\`\`\`

操作列表（管道）：
\`\`\`bash
attio list list-all                    # 列出所有列表
attio entry list <list-slug>           # 列出列表中的条目
\`\`\`

获取详细信息：
\`\`\`bash
attio object get <object-slug>         # 获取对象详情
attio object attributes <object-slug>  # 获取对象属性
attio list attributes <list-slug>      # 获取列表条目属性
\`\`\`

## 生成工作区 Schema

生成工作区 markdown schema 供上下文使用：
\`\`\`bash
bash {baseDir}/scripts/generate-schema.sh > {baseDir}/workspace.schema.md
\`\`\`

这会创建参考文件，记录工作区中所有对象、属性、列表与字段选项。

## 核心概念

| 概念 | 用途 | 示例 |
|---------|---------|---------|
| **Objects** | 基础记录类型 | People、Companies、Deals |
| **Lists** | 管道/工作流管理 | Sales Pipeline、Hiring |
| **Records** | 对象中的单条记录 | 某个人或公司 |
| **Entries** | 添加到列表的记录 | 销售管道中的某笔交易 |

## API 参考

- **Base URL：** \`https://api.attio.com/v2\`
- **Auth：** \`Authorization: Bearer $ATTIO_API_KEY\`
- **Rate Limits：** 每工作区每 10 秒 100 次请求

## 常见 API 操作

搜索人员：
\`\`\`bash
curl -X POST https://api.attio.com/v2/objects/people/records/query \\
  -H "Authorization: Bearer $ATTIO_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"filter": {"email_addresses": {"contains": "john@example.com"}}}'
\`\`\`

创建记录：
\`\`\`bash
curl -X POST https://api.attio.com/v2/objects/<object-slug>/records \\
  -H "Authorization: Bearer $ATTIO_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"data": {"values": {"name": [{"value": "Record Name"}]}}}'
\`\`\`

添加条目到列表：
\`\`\`bash
curl -X POST https://api.attio.com/v2/lists/<list-slug>/entries \\
  -H "Authorization: Bearer $ATTIO_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"data": {"parent_record_id": "<record-id>"}}'
\`\`\`

## 备注

- 安装后运行 \`generate-schema.sh\` 创建工作区 schema 文件，包含所有对象、列表与字段选项。
- 列表常用于管理管道（销售阶段、招聘流程等）。
- CLI 在 schema 生成中需要 \`jq\` 处理 JSON。`,
};
