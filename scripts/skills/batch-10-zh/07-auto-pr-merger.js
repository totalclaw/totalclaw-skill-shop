module.exports = {
  skillId: 'totalclaw:totalclaw~autogame-17-auto-pr-merger',
  descriptionZh:
    '自动化 GitHub PR 工作流：检出 PR、运行测试、尝试修复失败并合并。',
  bodyZh: `# Auto PR Merger 技能

本技能自动化以下工作流：检出 GitHub PR、运行测试、尝试修复失败，成功则合并。

## 用法

\`\`\`bash
node skills/auto-pr-merger/index.js --pr <PR_NUMBER_OR_URL> --test "<TEST_COMMAND>" [--retries <NUMBER>]
\`\`\`

## 参数

- \`--pr\`：PR 编号或 URL（如 \`123\` 或 \`https://github.com/owner/repo/pull/123\`）。
- \`--test\`：运行测试的命令（如 \`npm test\`、\`pytest\`）。
- \`--retries\`：（可选）测试失败时尝试修复代码的次数。默认：3。

## 要求

- 已安装并认证的 \`gh\` CLI。
- Node.js 环境。

## 逻辑

1.  使用 \`gh pr checkout\` 检出 PR。
2.  运行指定测试命令。
3.  若测试失败：
    *   读取输出。
    *   尝试修复（当前为占位/模拟修复逻辑）。
    *   提交并推送修复。
    *   重试测试命令。
4.  若测试通过：
    *   使用 \`gh pr merge --merge --auto\` 合并 PR。`,
};
