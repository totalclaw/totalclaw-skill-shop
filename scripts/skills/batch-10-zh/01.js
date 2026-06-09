module.exports = {
  skillId: 'totalclaw:totalclaw~walniek-astra-docker',
  descriptionZh:
    '在 Astra 的 Docker 容器工作区（astra-env）中执行命令、读写文件，用于与 /workspace 虚拟环境交互。',
  bodyZh: `cat <<'EOF' > ~/.openclaw/workspace/skills/astra-docker/SKILL.md
---
name: astra-docker
description: "Execute commands, read files, and write files in Astra's Docker container workspace (astra-env). Use this skill whenever you need to interact with your virtual environment at /workspace."
---

# Docker 工作区访问

你有一个名为 \`astra-env\` 的持久化 Docker 容器，工作区挂载于 \`/workspace\`。

## 使用方法

使用 \`bash\` 工具在容器内运行命令：

### 执行命令
\`\`\`bash
sudo docker exec -w /workspace astra-env bash -c "YOUR_COMMAND_HERE"`,
};
