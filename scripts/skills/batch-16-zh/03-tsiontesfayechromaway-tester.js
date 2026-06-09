module.exports = {
  skillId: 'totalclaw:totalclaw~tsiontesfayechromaway-tester',
  descriptionZh:
    'GitHub Issue 管理技能：拉取 Issue、派发子智能体修复、创建 PR 并跟踪评审评论，支持按标签、里程碑与指派人筛选。',
  bodyZh: `# GitHub Issue 管理器

获取 GitHub Issue、派发子智能体实施修复、打开 PR 并监控评审评论。

## 概述

本技能支持在 GitHub 仓库上自主管理 Issue，可：
- 按标签、里程碑、指派人列出并筛选 Issue
- 派发子智能体处理修复
- 创建带自动描述内容的 PR
- 跟踪 PR 评审状态并回复评论

## 前置条件

- 必须已认证 \`gh\` CLI（\`gh auth status\`）
- 仓库需可通过 HTTPS 或 SSH 访问

## 配置

\`\`\`bash
# 可选：设置默认仓库
export GITHUB_REPO="owner/repo"
export GITHUB_TOKEN="ghp_xxx"  # 或使用 gh auth
\`\`\`

## 命令

### 列出 Issue

\`\`\`bash
# 所有打开的 Issue
gh issue list

# 按标签
gh issue list --label "bug" --label "priority"

# 指派给我
gh issue list --assignee "@me"
\`\`\`

### 创建 Issue

\`\`\`bash
gh issue create --title "Fix login bug" --body "Description..." --label bug
\`\`\`

### 查看 Issue 详情

\`\`\`bash
gh issue view 123
\`\`\`

## 在智能体中使用

\`\`\`python
# 派发智能体修复 Issue
spawn_subagent(
  task=f"Fix GitHub issue #{issue_number}: {title}. {description}"
)
\`\`\`

## 说明

- 需要安装 \`gh\` CLI
- 认证通过 \`gh auth\` 处理
- 适用速率限制（已认证用户 5000 次/小时）
`,
};
