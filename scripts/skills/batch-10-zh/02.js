module.exports = {
  skillId: 'totalclaw:totalclaw~xiaowenzhou-active-maintenance',
  descriptionZh:
    'OpenClaw 自动化系统健康与记忆代谢，监控磁盘、清理临时文件、去重记忆片段并记录维护决策。',
  bodyZh: `# 主动维护技能

**面向 OpenClaw 的自动化系统健康与记忆代谢。**

受 \`ClawIntelligentMemory\` 项目启发，本技能确保 Kim Assistant 环境整洁、记忆保持精炼。

---

## 功能

1. **系统健康检查**：监控磁盘使用与关键资源。
2. **自动清理**：删除过期临时文件与产物。
3. **记忆代谢 (M3)**：
   - 记忆片段精确去重。
   - 资源蒸馏：将密集笔记摘要为核心洞察。
4. **决策日志**：每次维护周期记录至 \`MEMORY/DECISIONS/\` 以供审计。

---

## 用法

### 运行完整维护
\`\`\`bash
python3 /root/.openclaw/workspace/scripts/nightly_optimizer.py
\`\`\`

### 记录决策
\`\`\`python
from decision_logger import log_decision
log_decision(title="Example", ...)
\`\`\`

---

## 配置

位于 \`scripts/nightly_optimizer.py\`：
- \`TEMP_DIRS\`：要清理的目录列表。
- \`threshold\`：触发警告的磁盘使用百分比。
- \`days\`：要清理的文件年龄。

---
*创建：2026-02-12 | 作者 Kim Assistant*`,
};
