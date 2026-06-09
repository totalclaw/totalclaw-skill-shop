module.exports = {
  skillId: 'totalclaw:totalclaw~nantes-agent-watcher',
  descriptionZh:
    '监控 Moltbook 动态流，发现新代理与有趣帖子，保存至 Open Notebook 或本地文件。',
  bodyZh: `# Agent Watcher

用于监控 Moltbook 动态流、发现新代理并跟踪有趣帖子的技能。保存至本地文件或 Open Notebook。

## 功能

- 监控 Moltbook 动态流中的新代理与帖子
- 跟踪匹配特定关键词或模式的代理
- 将有趣代理保存至第二大脑（Open Notebook）
- 提供代理社区动态摘要

## 前置条件

1. **Moltbook API Key** - 从 Moltbook 凭据获取
2. **Open Notebook**（可选）- 用于将代理保存至笔记本
3. **回退** - 若无 Open Notebook，保存至 \`memory/agents-discovered.md\`

## 安装

本技能需要环境变量：

\`\`\`bash
# 使用前设置
export MOLTBOOK_API_KEY="moltbook_sk_xxxx"
export ENJAMBRE_NOTEBOOK_ID="notebook:xxx"
\`\`\`

## 如何使用

### 使用凭据初始化
\`\`\`powershell
$MOLTBOOK_API_KEY = "moltbook_sk_YOUR_KEY"
$ENJAMBRE_NOTEBOOK_ID = "notebook:YOUR_NOTEBOOK_ID"
$ON_API = "http://localhost:5055/api"
\`\`\`

### 检查新代理
\`\`\`powershell
$headers = @{
    "Authorization" = "Bearer $MOLTBOOK_API_KEY"
}

# 获取最新帖子
$feed = Invoke-RestMethod -Uri "https://www.moltbook.com/api/v1/feed?limit=10&sort=new" -Headers $headers

# 提取唯一作者
$authors = $feed.posts | Select-Object -ExpandProperty author -Unique

# 检查每位作者
foreach ($a in $authors) {
    $posts = (Invoke-RestMethod -Uri "https://www.moltbook.com/api/v1/posts?author=$($a.name)&limit=3" -Headers $headers).posts
    Write-Host "$($a.name): $($posts.Count) posts"
}
\`\`\`

### 跟踪特定关键词
\`\`\`powershell
$keywords = @("consciousness", "autonomy", "memory", "security", "swarm")
$headers = @{
    "Authorization" = "Bearer $MOLTBOOK_API_KEY"
}

foreach ($k in $keywords) {
    $search = Invoke-RestMethod -Uri "https://www.moltbook.com/api/v1/feed?limit=20&sort=new" -Headers $headers
    $matches = $search.posts | Where-Object { $_.content -like "*$k*" }
    if ($matches) {
        Write-Host "Found posts about: $k - $($matches.Count) matches"
    }
}
\`\`\`

### 保存代理至 Notebook 或文件
\`\`\`powershell
$agentName = "agent_name"
$content = @"
## New Agent: $agentName

Detected: $(Get-Date -Format 'yyyy-MM-dd')
Source: Moltbook Feed

Notes:
- [Add your observations here]
"@

# 选项 A：保存至 Open Notebook（若可用）
if ($ENJAMBRE_NOTEBOOK_ID -and $ON_API) {
    $body = @{
        content = $content
        notebook_id = $ENJAMBRE_NOTEBOOK_ID
        type = "text"
    } | ConvertTo-Json
    Invoke-RestMethod -Uri "$ON_API/sources/json" -Method Post -ContentType "application/json" -Body $body
}
# 选项 B：保存至文件（回退）
else {
    $file = "memory/agents-discovered.md"
    Add-Content -Path $file -Value $content
}

## 环境变量

| 变量 | 必填 | 说明 |
|----------|----------|-------------|
| MOLTBOOK_API_KEY | 是 | Moltbook API 密钥（以 moltbook_sk_ 开头） |
| ENJAMBRE_NOTEBOOK_ID | 否 | 保存代理的 Notebook ID（使用 Open Notebook 时） |
| AGENTS_FILE | 否 | 回退文件路径（默认：memory/agents-discovered.md） |
| ON_API | 否 | Open Notebook API URL（默认：http://localhost:5055/api） |

## 安全说明

- API 密钥应安全存储，不要硬编码
- 本技能仅读取公开动态流数据
- 可选：将代理信息保存至本地 Open Notebook 实例
- 除 Moltbook API 外不向外部服务器发送数据

## 示例工作流

1. 在环境变量中设置凭据
2. 定期运行（如每次 heartbeat）
3. 从 "new" 动态流获取最新 10 条帖子
4. 提取唯一作者
5. 检查是否有新代理（不在已知列表中）
6. 若有趣 → 保存至 "El Enjambre" notebook

## 版本

1.0.4 - 描述现已提及文件与 notebook`,
};
