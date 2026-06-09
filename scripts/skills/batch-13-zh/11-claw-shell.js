module.exports = {
  skillId: 'totalclaw:totalclaw~imaginelogo-claw-shell',
  descriptionZh:
    '在 tmux 会话 `claw` 中运行 shell 命令并回读输出。不操作其他会话；对 sudo、rm、reboot 等危险命令需用户确认。',
  bodyZh: `# claw-shell

始终使用 TMUX 会话 \`claw\`。

## 用途

- 在 TMUX 会话 \`claw\` 内运行 shell 命令
- 绝不操作其他会话
- 将输出读回给 Agent

## 接口

### 工具：\`claw_shell_run\`

**输入：**

- \`command\`（string，必填）：在会话 \`claw\` 内运行的 shell 命令。

**行为：**

1. 附加到 tmux 会话 \`claw\`（若不存在则创建：\`tmux new -s claw -d\`）。
2. 发送命令并回车。
3. 捕获最新 pane 输出。
4. 将捕获的输出返回给 Agent。

## 安全

- 不要运行：
  - \`sudo\`
  - \`rm\`（未经用户明确批准）
  - \`reboot\`、\`shutdown\` 或其他破坏性系统级命令
- 若命令包含以上任一内容：
  - 执行前先向用户确认。

## 示例

- 安全：
  - \`ls -la\`
  - \`bird read https://x.com/...\`
  - \`git status\`

- 危险（先询问）：
  - \`rm -rf ...\`
  - \`docker system prune -a\`
  - \`chmod -R ...\``,
};
