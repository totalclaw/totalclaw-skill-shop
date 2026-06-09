module.exports = {
  skillId: 'totalclaw:totalclaw~eth3rnit3-alexandrie',
  descriptionZh:
    '与 Alexandrie 笔记应用（https://notes.eth3rnit3.org）交互。支持登录、列出/搜索/创建/更新/删除笔记，通过 alexandrie.sh 脚本或 REST API 操作。',
  bodyZh: `# Alexandrie 技能

与 Alexandrie 笔记应用交互：https://notes.eth3rnit3.org

## 配置

- **API URL**：\`https://api-notes.eth3rnit3.org/api\`
- **前端**：\`https://notes.eth3rnit3.org\`
- **用户名**：\`eth3rnit3\`
- **用户 ID**：\`671423603690045441\`
- **密码**：存储在 \`/home/eth3rnit3/clawd/.env\` 中，键名为 \`ALEXANDRIE_PASSWORD\`

## 用法

所有操作使用 \`alexandrie.sh\` 脚本：

\`\`\`bash
/home/eth3rnit3/clawd/skills/alexandrie/alexandrie.sh <command> [args]
\`\`\`

## 命令

### 认证
\`\`\`bash
./alexandrie.sh login                    # 登录并获取 token
./alexandrie.sh logout                   # 登出
\`\`\`

### 笔记（节点）
\`\`\`bash
./alexandrie.sh list                     # 列出所有笔记/分类
./alexandrie.sh get <nodeId>             # 获取指定笔记及内容
./alexandrie.sh search <query>           # 搜索笔记
./alexandrie.sh create <name> [content] [parentId]  # 创建笔记
./alexandrie.sh update <nodeId> <name> [content]    # 更新笔记
./alexandrie.sh delete <nodeId>          # 删除笔记
\`\`\`

## 节点角色
- **role: 1** = 分类/工作区（容器）
- **role: 3** = 文档（含内容的笔记）

## 当前结构
- \`671425872858841091\` - **Perso**（分类）
- \`671426069886271492\` - **Test**（文档）

## 示例

### 列出所有笔记
\`\`\`bash
./alexandrie.sh login
./alexandrie.sh list
\`\`\`

### 读取笔记
\`\`\`bash
./alexandrie.sh get 671426069886271492
# 返回："Salut, ceci est un **test**"
\`\`\`

### 创建笔记
\`\`\`bash
./alexandrie.sh create "My Note" "# Title\\n\\nContent here" 671425872858841091
\`\`\`

### 搜索
\`\`\`bash
./alexandrie.sh search "test"
\`\`\`

## API 参考

基础 URL：\`https://api-notes.eth3rnit3.org/api\`

### 端点
- \`POST /auth\` - 登录（body：\`{"username": "...", "password": "..."}\`）
- \`POST /auth/logout\` - 登出
- \`GET /nodes/user/:userId\` - 列出用户节点
- \`GET /nodes/:nodeId\` - 按 ID 获取节点（含内容）
- \`GET /nodes/search?q=query\` - 搜索节点
- \`POST /nodes\` - 创建节点
- \`PUT /nodes/:nodeId\` - 更新节点
- \`DELETE /nodes/:nodeId\` - 删除节点

### 认证
登录后 JWT token 存储在 cookie 中（\`/tmp/alexandrie_cookies.txt\`）。`,
};
