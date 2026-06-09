module.exports = {
  skillId: 'totalclaw:totalclaw~d-wwei-local-task-runner',
  descriptionZh:
    '在宿主机本地执行 Node.js 代码片段或完整脚本。当子代理生成不可用或效率低下时的默认执行方式，支持超时与自动清理。',
  bodyZh: `# 本地任务运行器

本技能提供在宿主机本地执行 Node.js 代码片段或完整脚本的机制。
当子代理生成不可用或效率低下时，这是**默认执行方式**。

## 用途

- **替代子代理**：简单任务无需生成完整子代理，直接用本技能运行代码。
- **安全**：隔离执行逻辑、处理清理并强制执行超时。
- **便捷**：无需手动管理文件（\`write\` + \`exec\` + \`rm\`）。

## 用法

当你需要执行计算、检查系统状态或运行工具脚本时：

1.  将 Node.js 代码构造为字符串。
2.  调用 \`run_task\`（或通过 CLI 执行）并传入代码。

### 命令行界面

\`\`\`bash
# 执行任务
node skills/local-task-runner/index.js run --code "console.log('Hello World')"

# 带超时执行（毫秒）
node skills/local-task-runner/index.js run --code "while(true){}" --timeout 5000
\`\`\`

### 响应格式

成功：
\`\`\`
[TASK: <id>] Completed in 123ms
--- STDOUT ---
...
\`\`\`

错误：
\`\`\`
[TASK: <id>] Failed in 123ms
Error: ...
--- STDERR ---
...
\`\`\``,
};
