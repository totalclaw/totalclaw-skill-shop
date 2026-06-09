module.exports = {
  skillId: 'totalclaw:totalclaw~shalomobongo-codex-conductor',
  descriptionZh:
    '面向 Codex CLI 的端到端软件交付编排器，支持绿地/棕地双项目模式与自主/门控双执行模式，含严格阶段门、规格驱动开发、测试矩阵与 AGENTS.md 工作流。',
  bodyZh: `# Codex Orchestrator

将 Codex 协调为纪律严明的交付系统，而非一次性生成器。

## 核心模式

同时选择：

- \`project_mode\`
  - \`greenfield\`：从零构建
  - \`brownfield\`：接入并现代化现有系统
- \`execution_mode\`
  - \`autonomous\`：门控通过后自动推进
  - \`gated\`：每个门控暂停等待用户批准

## 指导原则：规格驱动开发

**无规格不写代码。** 不可协商。

任何实现之前，必须有书面规格，包含：
- 构建什么
- 为何需要
- 验收标准（可测试）
- 约束与范围外项

编码智能体 **不得**：
- 猜测需求
- 假设行为
- 添加未请求的功能
- 发明规格中未有的抽象

规格不清晰 → 停止并询问。绝不猜测。

完整规格模板与执行规则见 \`references/spec-driven-development.md\`。

## 不可跳过的顺序

1.  intake + 规划问卷
2. **规格创建 + 批准**（任何代码之前先写规格）
3. 文档脚手架 + AGENTS.md 契约
4. 模式特定的架构前工作
5. 架构 + ADR 基线（引用规格）
6. 按垂直切片构建（每项任务引用规格）
7. 对照规格验收标准验证
8. 安全/质量门控
9. 发布就绪 + 交接

绝不静默跳过门控。无规格不实现。

## 必读资源

运行前阅读以下参考：

- \`references/spec-driven-development.md\`（**必须首先阅读** — 统领全部工作）
- \`references/planning-questionnaire.md\`
- \`references/modes.md\`
- \`references/gate-checklists.md\`
- \`references/testing-matrix.md\`
- \`references/manual-test-templates.md\`
- \`references/codex-runbook.md\`
- \`references/gate-prompts.md\`
- \`scripts/agent_exec.py\`
- \`references/research-playbook.md\`（若 \`research_mode=true\`）

## 脚手架

初始化项目产物：

\`\`\`bash
python scripts/init_project_docs.py --root <project-path> --mode <greenfield|brownfield>
\`\`\`

创建/更新：

- \`AGENTS.md\`（项目工作流契约）
- \`docs/*.md\` 规划/架构/测试/进度/变更文档
- 棕地文档（brownfield 模式时）
- \`.orchestrator/status.json\`（机器可读状态）
- \`.orchestrator/context.json\`（项目/执行/研究模式上下文）

## 规划规则

首先询问用户使用哪个编码智能体（\`codex\` | \`claude\` | \`opencode\` | \`pi\`）及备用智能体。
然后询问 \`references/planning-questionnaire.md\` 中的所有必答题。

最低必答项：

- mission
- top user journeys
- v1 scope
- hosting target
- stack preference（或明确要求推荐）
- \`project_mode\`
- \`execution_mode\`
- definition of done
- acceptance tests

若 \`research_mode=true\`，在 G2 之前产出 \`docs/research-notes.md\` 与架构推荐。

## 模式特定要求

### Greenfield

G2 之前必须完成：

- 需求 + DoD 清晰
- 架构基线
- ADR-0001 含备选方案
- CI/测试基线计划

### Brownfield

G2 之前必须完成（由编码智能体撰写，非编排器）：

- 现状架构与系统清单
- 依赖图与风险登记
- 特征化测试基线
- 迁移策略 + 回滚方案
- 兼容性边界文档化

## 门控引擎

使用 \`references/gate-checklists.md\` 中定义的 \`G0\` 至 \`G7\` 门控。

通过脚本更新门控状态：

\`\`\`bash
python scripts/gate_status.py set --root <project-path> --gate G3 --state PASS --note "slice-1 verified"
\`\`\`

验证状态 schema：

\`\`\`bash
python scripts/gate_status.py validate --root <project-path>
\`\`\`

允许状态：\`PENDING | IN_PROGRESS | PASS | FAIL | BLOCKED\`。
默认强制执行门控前置条件（顺序 + 模式感知文档检查）。

## 验证规则

使用 \`references/testing-matrix.md\`。

每次推进的强制检查：

- lint/type/build
- unit/integration/e2e（适用时）
- API 契约健全性（若有 API）
- 安全基线
- 文档同步验证

同时执行 \`references/manual-test-templates.md\` 中的手动测试脚本。

## 文档规则

每个有意义的步骤：

- 更新 \`docs/tasks.md\`
- 更新 \`docs/progress.md\`
- 追加 \`docs/change-log.md\`
- 更新 \`docs/traceability.md\`
- 在 \`docs/test-results.md\` 记录测试证据

用户请求的变更，运行：

\`\`\`bash
python scripts/change_impact.py --root <project-path> --request "<change request>"
\`\`\`

然后完成其输出的所有受影响文档 TODO。

## Codex 执行模式

长运行使用 PTY/后台。命令模式见 \`references/codex-runbook.md\`。

关键规则：每次运行执行 **一个** 任务，而非一次 prompt 完成整个项目。
G4 维护 \`docs/g4-task-plan.md\` 清单，逐条处理任务。

生成门控专用 prompt：

\`\`\`bash
python scripts/generate_gate_prompt.py --gate <G1..G7> --agent <codex|claude|opencode|pi> --project-mode <greenfield|brownfield> --execution-mode <autonomous|gated> --research-mode <true|false> --task "<single task summary>" --spec-ref "<spec ref when applicable>"
\`\`\`

\`update_docs_step.py\` 现为仅用于恢复/手动记账的备用工具。
主要期望：编码智能体在每个任务中直接更新文档。

必需循环：

1. 验证任务规格存在（无规格 = 不实现）
2. 用规格驱动 prompt 模板启动所选编码智能体
3. 任务完成后编码智能体立即更新文档（含交接清单）
4. 编码智能体唤醒 OpenClaw，附带任务摘要及验证步骤文档位置
5. OpenClaw 智能体自行运行验证：
   - 终端工具中的 CLI 检查
   - 浏览器工具中的浏览器/手动检查（Web 流程）
6. 验证输出符合规格验收标准
7. 验证失败时，OpenClaw 将确切失败信息发回编码智能体并重新运行修复循环
8. 验证通过后才写入最终门控状态（或标记 FAIL/BLOCKED）

执行约束：
- \`run_gate.py\` 对 G3/G4 任务要求 \`--spec-ref\`（实现门控）。
- \`run_gate.py\` 要求编码智能体 + 备用智能体上下文。
- 每项任务需要验证证据（\`--validate-cmd\` 和/或 \`--ui-review-note\`）。
- 标记 \`--requires-browser-check\` 的任务必须包含 \`--ui-review-note\`。
- \`status=PASS\` 至少需要一条 \`--validate-cmd\`。
- 使用 \`--agent-dry-run\` 时阻止 \`status=PASS\`。
- G4 的 PASS 在 \`docs/g4-task-plan.md\` 仍有未勾选任务时被阻止。
- 验证输出记录在 \`docs/validation-log.md\`。
- 编码智能体必须在每个任务后更新文档，含 \`docs/agent-handoff.md\`。
- 棕地模式下，若 onboarding 文档未由编码智能体更新，G1/G2 失败。
- 编码智能体 prompt **必须** 包含 \`references/spec-driven-development.md\` 的规格前言。
- 任何无规格引用的实现 = 自动 FAIL。
- 自主模式下，验证失败触发自动修复重试（默认：2 次），失败详情回传编码智能体。
- 可选严格模式：\`--auto-block-on-retry-exhaust\` 在重试用尽时自动将门控分类为 BLOCKED。

## 进度可见性

生成快速状态板：

\`\`\`bash
python scripts/progress_dashboard.py --root <project-path>
\`\`\`

汇总当前门控、完成百分比、阻塞项与近期活动。

单命令运行单任务门控步骤：

\`\`\`bash
python scripts/run_gate.py --root <project-path> --gate G2 --agent codex --fallback-agent claude --project-mode brownfield --execution-mode gated --research-mode true --task "architecture baseline refined for API routing" --status IN_PROGRESS --validate-cmd "npm run -s typecheck" --ui-review-note "N/A for architecture-only task"
\`\`\`

门控级清单全部完成后才标记 PASS：

\`\`\`bash
python scripts/run_gate.py --root <project-path> --gate G2 --agent codex --task "architecture gate complete" --status PASS --validate-cmd "npm run -s typecheck"
\`\`\`

Web/UI 任务需 OpenClaw 智能体浏览器验证：

\`\`\`bash
python scripts/run_gate.py ... --requires-browser-check --ui-review-note "Verified login + CRUD manually in browser via OpenClaw browser tools"
\`\`\`

打包可分发技能产物：

\`\`\`bash
python scripts/package_skill.py --skill-dir . --out dist
\`\`\`

## 终态交付物

完成时提供：

- \`docs/progress.md\` 100%
- 来自 \`.orchestrator/status.json\` 的最终门控摘要
- 测试结果摘要 + 未解决风险
- 部署 + 回滚说明
- 下一迭代 backlog

若仍有阻塞，标记为 \`PARTIAL_COMPLETE\`，并明确阻塞项与负责人。`,
};
