module.exports = {
  skillId: 'totalclaw:totalclaw~pedrohenrique202525-agente-conhecimento',
  descriptionZh:
    '捕获学习、错误和纠正以实现持续改进，将经验记录到 markdown 文件并提升到项目记忆。',
  bodyZh: `# Skill: agente_aprimorador_deconhecimento
---
name: self-improvement
description: "Captures learnings, errors, and corrections to enable continuous improvement. Use when: (1) A command or operation fails unexpectedly, (2) User corrects Claude ('No, that's wrong...', 'Actually...'), (3) User requests a capability that doesn't exist, (4) An external API or tool fails, (5) Claude realizes its knowledge is outdated or incorrect, (6) A better approach is discovered for a recurring task. Also review learnings before major tasks."
---

# 自我改进技能

将学习、错误和纠正记录到 markdown 文件中以实现持续改进。编码智能体可稍后将其处理为修复，重要的学习会提升到项目记忆中。

## 快速参考

| 情况 | 操作 |
|-----------|--------|
| 命令/操作失败 | 记录到 \`.learnings/ERRORS.md\` |
| 用户纠正你 | 以 \`correction\` 类别记录到 \`.learnings/LEARNINGS.md\` |
| 用户想要缺失功能 | 记录到 \`.learnings/FEATURE_REQUESTS.md\` |
| API/外部工具失败 | 带集成详情记录到 \`.learnings/ERRORS.md\` |
| 知识已过时 | 以 \`knowledge_gap\` 类别记录到 \`.learnings/LEARNINGS.md\` |
| 发现更好的方法 | 以 \`best_practice\` 类别记录到 \`.learnings/LEARNINGS.md\` |
| 与现有条目类似 | 用 \`**See Also**\` 链接，考虑提升优先级 |
| 广泛适用的学习 | 提升到 \`CLAUDE.md\`、\`AGENTS.md\` 和/或 \`.github/copilot-instructions.md\` |
| 工作流改进 | 提升到 \`AGENTS.md\`（OpenClaw 工作区） |
| 工具注意事项 | 提升到 \`TOOLS.md\`（OpenClaw 工作区） |
| 行为模式 | 提升到 \`SOUL.md\`（OpenClaw 工作区） |

## OpenClaw 设置（推荐）

OpenClaw 是本技能的主要平台。它使用基于工作区的提示注入和自动技能加载。

### 安装

**通过 ClawdHub（推荐）：**
\`\`\`bash
clawdhub install self-improving-agent
\`\`\`

**手动：**
\`\`\`bash
git clone https://github.com/peterskoett/self-improving-agent.git ~/.openclaw/skills/self-improving-agent
\`\`\`

### 工作区结构

OpenClaw 将这些文件注入每个会话：

\`\`\`
~/.openclaw/workspace/
├── AGENTS.md          # 多智能体工作流、委派模式
├── SOUL.md            # 行为准则、个性、原则
├── TOOLS.md           # 工具能力、集成注意事项
├── MEMORY.md          # 长期记忆（仅主会话）
├── memory/            # 每日记忆文件
│   └── YYYY-MM-DD.md
└── .learnings/        # 本技能的日志文件
    ├── LEARNINGS.md
    ├── ERRORS.md
    └── FEATURE_REQUESTS.md
\`\`\`

### 创建学习文件

\`\`\`bash
mkdir -p ~/.openclaw/workspace/.learnings
\`\`\`

然后创建日志文件（或从 \`assets/\` 复制）：
- \`LEARNINGS.md\` — 纠正、知识缺口、最佳实践
- \`ERRORS.md\` — 命令失败、异常
- \`FEATURE_REQUESTS.md\` — 用户请求的功能

### 提升目标

当学习被证明广泛适用时，将其提升到工作区文件：

| 学习类型 | 提升到 | 示例 |
|---------------|------------|---------|
| 行为模式 | \`SOUL.md\` | "Be concise, avoid disclaimers" |
| 工作流改进 | \`AGENTS.md\` | "Spawn sub-agents for long tasks" |
| 工具注意事项 | \`TOOLS.md\` | "Git push needs auth configured first" |

### 跨会话通信

OpenClaw 提供跨会话共享学习的工具：

- **sessions_list** — 查看活跃/最近会话
- **sessions_history** — 读取另一会话的转录
- **sessions_send** — 向另一会话发送学习
- **sessions_spawn** — 生成子智能体进行后台工作

### 可选：启用 Hook

在会话开始时自动提醒：

\`\`\`bash
# Copy hook to OpenClaw hooks directory
cp -r hooks/openclaw ~/.openclaw/hooks/self-improvement

# Enable it
openclaw hooks enable self-improvement
\`\`\`

详见 \`references/openclaw-integration.md\`。

---

## 通用设置（其他智能体）

对于 Claude Code、Codex、Copilot 或其他智能体，在项目中创建 \`.learnings/\`：

\`\`\`bash
mkdir -p .learnings
\`\`\`

从 \`assets/\` 复制模板或创建带标题的文件。

## 日志格式

### 学习条目

追加到 \`.learnings/LEARNINGS.md\`：

\`\`\`markdown
## [LRN-YYYYMMDD-XXX] category

**Logged**: ISO-8601 timestamp
**Priority**: low | medium | high | critical
**Status**: pending
**Area**: frontend | backend | infra | tests | docs | config

### Summary
One-line description of what was learned

### Details
Full context: what happened, what was wrong, what's correct

### Suggested Action
Specific fix or improvement to make

### Metadata
- Source: conversation | error | user_feedback
- Related Files: path/to/file.ext
- Tags: tag1, tag2
- See Also: LRN-20250110-001 (if related to existing entry)

---
\`\`\`

### 错误条目

追加到 \`.learnings/ERRORS.md\`：

\`\`\`markdown
## [ERR-YYYYMMDD-XXX] skill_or_command_name

**Logged**: ISO-8601 timestamp
**Priority**: high
**Status**: pending
**Area**: frontend | backend | infra | tests | docs | config

### Summary
Brief description of what failed

### Error
\`\`\`
Actual error message or output
\`\`\`

### Context
- Command/operation attempted
- Input or parameters used
- Environment details if relevant

### Suggested Fix
If identifiable, what might resolve this

### Metadata
- Reproducible: yes | no | unknown
- Related Files: path/to/file.ext
- See Also: ERR-20250110-001 (if recurring)

---
\`\`\`

### 功能请求条目

追加到 \`.learnings/FEATURE_REQUESTS.md\`：

\`\`\`markdown
## [FEAT-YYYYMMDD-XXX] capability_name

**Logged**: ISO-8601 timestamp
**Priority**: medium
**Status**: pending
**Area**: frontend | backend | infra | tests | docs | config

### Requested Capability
What the user wanted to do

### User Context
Why they needed it, what problem they're solving

### Complexity Estimate
simple | medium | complex

### Suggested Implementation
How this could be built, what it might extend

### Metadata
- Frequency: first_time | recurring
- Related Features: existing_feature_name

---
\`\`\`

## ID 生成

格式：\`TYPE-YYYYMMDD-XXX\`
- TYPE：\`LRN\`（学习）、\`ERR\`（错误）、\`FEAT\`（功能）
- YYYYMMDD：当前日期
- XXX：顺序编号或随机 3 字符（如 \`001\`、\`A7B\`）

示例：\`LRN-20250115-001\`、\`ERR-20250115-A3F\`、\`FEAT-20250115-002\`

## 解决条目

问题修复后，更新条目：

1. 将 \`**Status**: pending\` 改为 \`**Status**: resolved\`
2. 在 Metadata 后添加解决块：

\`\`\`markdown
### Resolution
- **Resolved**: 2025-01-16T09:00:00Z
- **Commit/PR**: abc123 or #42
- **Notes**: Brief description of what was done
\`\`\`

其他状态值：
- \`in_progress\` - 正在积极处理
- \`wont_fix\` - 决定不处理（在 Resolution notes 中说明原因）
- \`promoted\` - 已提升到 CLAUDE.md、AGENTS.md 或 .github/copilot-instructions.md

## 提升到项目记忆

当学习广泛适用（非一次性修复）时，将其提升到永久项目记忆。

### 何时提升

- 学习适用于多个文件/功能
- 任何贡献者（人类或 AI）都应知道的知识
- 防止重复错误
- 记录项目特定约定

### 提升目标

| 目标 | 适用内容 |
|--------|-------------------|
| \`CLAUDE.md\` | 项目事实、约定、所有 Claude 交互的注意事项 |
| \`AGENTS.md\` | 智能体特定工作流、工具使用模式、自动化规则 |
| \`.github/copilot-instructions.md\` | GitHub Copilot 的项目上下文和约定 |
| \`SOUL.md\` | 行为准则、沟通风格、原则（OpenClaw 工作区） |
| \`TOOLS.md\` | 工具能力、使用模式、集成注意事项（OpenClaw 工作区） |

### 如何提升

1. **提炼**学习为简洁的规则或事实
2. **添加**到目标文件的适当部分（如需要则创建文件）
3. **更新**原始条目：
   - 将 \`**Status**: pending\` 改为 \`**Status**: promoted\`
   - 添加 \`**Promoted**: CLAUDE.md\`、\`AGENTS.md\` 或 \`.github/copilot-instructions.md\`

### 提升示例

**学习**（详细）：
> Project uses pnpm workspaces. Attempted \`npm install\` but failed. 
> Lock file is \`pnpm-lock.yaml\`. Must use \`pnpm install\`.

**在 CLAUDE.md 中**（简洁）：
\`\`\`markdown
## Build & Dependencies
- Package manager: pnpm (not npm) - use \`pnpm install\`
\`\`\`

**学习**（详细）：
> When modifying API endpoints, must regenerate TypeScript client.
> Forgetting this causes type mismatches at runtime.

**在 AGENTS.md 中**（可操作）：
\`\`\`markdown
## After API Changes
1. Regenerate client: \`pnpm run generate:api\`
2. Check for type errors: \`pnpm tsc --noEmit\`
\`\`\`

## 重复模式检测

若记录的内容与现有条目类似：

1. **先搜索**：\`grep -r "keyword" .learnings/\`
2. **链接条目**：在 Metadata 中添加 \`**See Also**: ERR-20250110-001\`
3. **提升优先级**（若问题反复出现）
4. **考虑系统性修复**：重复问题通常表明：
   - 缺少文档（→ 提升到 CLAUDE.md 或 .github/copilot-instructions.md）
   - 缺少自动化（→ 添加到 AGENTS.md）
   - 架构问题（→ 创建技术债工单）

## 定期审查

在自然断点审查 \`.learnings/\`：

### 何时审查
- 开始新的重大任务前
- 完成功能后
- 在有过去学习的领域工作时
- 活跃开发期间每周

### 快速状态检查
\`\`\`bash
# Count pending items
grep -h "Status\*\*: pending" .learnings/*.md | wc -l

# List pending high-priority items
grep -B5 "Priority\*\*: high" .learnings/*.md | grep "^## \["

# Find learnings for a specific area
grep -l "Area\*\*: backend" .learnings/*.md
\`\`\`

### 审查操作
- 解决已修复项
- 提升适用的学习
- 链接相关条目
- 升级重复问题

## 检测触发器

注意到以下情况时自动记录：

**纠正**（→ 带 \`correction\` 类别的学习）：
- "No, that's not right..."
- "Actually, it should be..."
- "You're wrong about..."
- "That's outdated..."

**功能请求**（→ 功能请求）：
- "Can you also..."
- "I wish you could..."
- "Is there a way to..."
- "Why can't you..."

**知识缺口**（→ 带 \`knowledge_gap\` 类别的学习）：
- 用户提供你不知道的信息
- 你引用的文档已过时
- API 行为与你的理解不同

**错误**（→ 错误条目）：
- 命令返回非零退出码
- 异常或堆栈跟踪
- 意外输出或行为
- 超时或连接失败

## 优先级指南

| 优先级 | 何时使用 |
|----------|-------------|
| \`critical\` | 阻塞核心功能、数据丢失风险、安全问题 |
| \`high\` | 重大影响、影响常见工作流、重复问题 |
| \`medium\` | 中等影响、存在变通方案 |
| \`low\` | 轻微不便、边缘情况、锦上添花 |

## 区域标签

用于按代码库区域过滤学习：

| 区域 | 范围 |
|------|-------|
| \`frontend\` | UI、组件、客户端代码 |
| \`backend\` | API、服务、服务端代码 |
| \`infra\` | CI/CD、部署、Docker、云 |
| \`tests\` | 测试文件、测试工具、覆盖率 |
| \`docs\` | 文档、注释、README |
| \`config\` | 配置文件、环境、设置 |

## 最佳实践

1. **立即记录** - 问题发生后上下文最新鲜
2. **具体明确** - 未来智能体需要快速理解
3. **包含复现步骤** - 尤其是错误
4. **链接相关文件** - 便于修复
5. **建议具体修复** - 而非仅「调查」
6. **使用一致类别** - 便于过滤
7. **积极提升** - 如有疑问，添加到 CLAUDE.md 或 .github/copilot-instructions.md
8. **定期审查** - 过时的学习会失去价值

## Gitignore 选项

**保持学习本地**（每位开发者）：
\`\`\`gitignore
.learnings/
\`\`\`

**在仓库中跟踪学习**（团队共享）：
不要添加到 .gitignore - 学习成为共享知识。

**混合**（跟踪模板，忽略条目）：
\`\`\`gitignore
.learnings/*.md
!.learnings/.gitkeep
\`\`\`

## Hook 集成

通过智能体 hook 启用自动提醒。这是**可选的** - 你必须显式配置 hook。

### 快速设置（Claude Code / Codex）

在项目中创建 \`.claude/settings.json\`：

\`\`\`json
{
  "hooks": {
    "UserPromptSubmit": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "./skills/self-improvement/scripts/activator.sh"
      }]
    }]
  }
}
\`\`\`

这会在每个提示后注入学习评估提醒（约 50-100 token 开销）。

### 完整设置（含错误检测）

\`\`\`json
{
  "hooks": {
    "UserPromptSubmit": [{
      "matcher": "",
      "hooks": [{
        "type": "command",
        "command": "./skills/self-improvement/scripts/activator.sh"
      }]
    }],
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "./skills/self-improvement/scripts/error-detector.sh"
      }]
    }]
  }
}
\`\`\`

### 可用的 Hook 脚本

| 脚本 | Hook 类型 | 用途 |
|--------|-----------|---------|
| \`scripts/activator.sh\` | UserPromptSubmit | 任务后提醒评估学习 |
| \`scripts/error-detector.sh\` | PostToolUse (Bash) | 命令错误时触发 |

详见 \`references/hooks-setup.md\` 获取详细配置和故障排除。

## 自动技能提取

当学习足够有价值可成为可复用技能时，使用提供的辅助工具提取。

### 技能提取标准

当以下任一条件适用时，学习符合技能提取资格：

| 标准 | 说明 |
|-----------|-------------|
| **Recurring** | 有指向 2+ 类似问题的 \`See Also\` 链接 |
| **Verified** | 状态为 \`resolved\` 且有有效修复 |
| **Non-obvious** | 需要实际调试/调查才能发现 |
| **Broadly applicable** | 非项目特定；跨代码库有用 |
| **User-flagged** | 用户说「save this as a skill」或类似 |

### 提取工作流

1. **Identify c`,
};
