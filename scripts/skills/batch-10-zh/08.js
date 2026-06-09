module.exports = {
  skillId: 'totalclaw:totalclaw~autogame-17-auto-test-generator',
  descriptionZh:
    '自动为 OpenClaw 技能生成基本单元/集成测试，提高代码质量并防止演进过程中的回归。',
  bodyZh: `# 自动测试生成器

自动为 OpenClaw 技能生成基本的单元/集成测试。
用于提高代码质量并在演进过程中防止回归。

## 用法

\`\`\`bash
node skills/auto-test-generator/index.js <skill-name>
\`\`\`

## 工作原理

1. 扫描目标技能目录。
2. 分析 \`index.js\` 中的导出。
3. 生成带基本断言的 \`test.js\` 文件（模块加载、--help 可用）。
4. 立即运行生成的测试。

## 示例

\`\`\`bash
node skills/auto-test-generator/index.js skill-health-monitor
\`\`\`

输出：
- 创建 \`skills/skill-health-monitor/test.js\`
- 运行它
- 报告成功/失败`,
};
