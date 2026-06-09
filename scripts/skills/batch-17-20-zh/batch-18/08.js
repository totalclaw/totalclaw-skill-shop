module.exports = {
  skillId: 'totalclaw:totalclaw~fty4-memos',
  descriptionZh:
    '通过 Memos API 创建、读取、删除与列出备忘录的简单接口，支持 OpenClaw 集成与个人知识管理。',
  bodyZh: `# Memos 技能 SKILL.md

## 用途

本技能提供 Memos API（https://usememos.com/docs/api）的简单接口，让你从 OpenClaw 创建、读取、删除和列出备忘录。

## 工作原理

- 技能用 Python 实现，使用 \`requests\` 库。
- 需要两个环境变量：
  - \`MEMOS_URL\` – **必填**。Memos 实例的基础 URL（如 \`https://demo.usememos.com\`）。
  - \`MEMOS_TOKEN\` – **必填**。用于认证的个人访问令牌。
- 若 \`MEMOS_URL\` 或 \`MEMOS_TOKEN\` 未设置，技能将中止并给出明确错误。

## 命令

| 命令                         | 说明                                                                                                                                | 使用示例                                      |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| \`create <content> [visibility]\` | 创建新备忘录。\`visibility\` 默认为 \`PUBLIC\`（选项：PRIVATE、PROTECTED、PUBLIC）。自动追加标签 \`#openclaw\`。 | \`openclaw skill-run create "Hello world" "PUBLIC"\` |
| \`get <id>\`                      | 按 ID 检索备忘录。ID 可为 \`memos/123\` 或仅 \`123\`。                                                                  | \`openclaw skill-run get 123\`                       |
| \`delete <id> [force]\`           | 删除备忘录。可选 \`force\`（true/false）即使有相关数据也会删除。                                                   | \`openclaw skill-run delete 123 true\`               |
| \`list [pageSize]\`               | 分页列出备忘录。\`pageSize\` 默认为 20（最大 1000）。                                                                          | \`openclaw skill-run list 50\`                       |

## 直接 Python 用法

也可直接用 Python 运行命令：

\`\`\`bash
# 创建备忘录
python3 skills/memos/memos.py create "My memo content" "PUBLIC"

# 按 ID 获取备忘录
python3 skills/memos/memos.py get j9THXDmYtueosTTeHcC5NA

# 删除备忘录
python3 skills/memos/memos.py delete j9THXDmYtueosTTeHcC5NA

# 强制删除
python3 skills/memos/memos.py delete j9THXDmYtueosTTeHcC5NA true

# 列出备忘录（默认 20）
python3 skills/memos/memos.py list

# 自定义分页大小
python3 skills/memos/memos.py list 50
\`\`\`

所有命令成功时返回 JSON 输出，错误时向 stderr 输出 JSON 错误信息。

## 在 OpenClaw 中引用备忘录

创建或检索备忘录时，API 返回带 \`uid\` 字段的备忘录对象。在 OpenClaw 输出中引用备忘录，格式为 markdown 链接：

\`\`\`markdown
[memo description](https://demo.usememos.com/memos/{uid})
\`\`\`

**示例：**
若 API 返回 \`{"uid": "ABC123xyz", "name": "memos/ABC123xyz", ...}\`，引用为：

\`\`\`markdown
Created [your memo](https://demo.usememos.com/memos/ABC123xyz)
\`\`\`

URL 格式为：\`{MEMOS_URL}/memos/{uid}\`，其中 \`uid\` 从响应中提取。

## 错误处理

技能包含全面的错误处理：

- **API 错误**：返回详细错误信息，含 HTTP 状态码与 API 响应详情
- **网络错误**：处理超时（默认 30 秒）与连接失败
- **验证**：在 API 调用前验证参数（如 visibility 选项、pageSize 范围）
- **退出码**：命令行运行时成功返回 0，错误返回 1
- **错误输出**：所有错误以 JSON 格式输出到 stderr，便于解析

示例错误响应：

\`\`\`json
{
  "error": "Memos API Error",
  "message": "HTTP 404: Not Found - Memo not found",
  "status_code": 404
}
\`\`\`

## 扩展技能

- 按现有命令模式添加新命令。
- 若 Memos API 新增端点，可创建对应函数。

---

**注意：** 本技能仅供个人使用；切勿公开分享你的 \`MEMOS_TOKEN\`。`,
};
