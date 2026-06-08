# Skill 库清理长期任务（252,607 条 skill）

> **用途**：本文件为 Cursor 长期记忆任务清单。执行时每完成一项即更新状态，直至全部清零。
>
> **最后更新**：2026-06-08（全部清零）  
> **MongoDB**：`mongodb://127.0.0.1:27018/totalclaw` · collection `skills`

---

## 任务总览

| # | 任务 | 规模 | 状态 | 完成时间 |
|---|------|------|------|----------|
| 1 | 新补 fillReason 技能 proofread（`--full`） | 36,504 条 / 4,563 角色 | ✅ 完成 | 2026-06-08 |
| 2 | Legacy agent-skill 升级 complete frontmatter | 43,594 条 | ✅ 完成 | 2026-06-08 |
| 3 | 乱码 U+FFFD 批量 fixEncoding | 74,740 条修复 | ✅ 完成 | 2026-06-08 |
| 4 | openclaw 错误 source/tags 清理 → totalclaw | 112 条 | ✅ 完成 | 2026-06-08 |
| 5 | 第三方 skill 隔离（github/clawskills 等下架） | 8,389 条 | ✅ 完成 | 2026-06-08 |

**清零条件**：✅ 上表 5 项全部为 ✅，且验收命令通过。

---

## 任务 1：fillReason 技能 proofread ✅

**结果**：
- 5 批 manifest：`batch-fill-001` ~ `batch-fill-005`（4,563 角色）
- **36,504/36,504** `proofreadValidated=true`
- 补跑：`batch-fill-fix-ransom`（勒索软件分析师 8 条，redline 误报已修复）

**验收**：`fillValidated === fillTotal === 36504` ✅

---

## 任务 2：Legacy agent-skill 升级 ✅

**结果**：
| 动作 | 数量 |
|------|------|
| 升级为 frontmatter v1.5.2 | 42,293 |
| 因已有 complete-8 标记 deprecated | 1,301 |
| 剩余无 frontmatter legacy | **0** |

**脚本**：`scripts/skills/upgrade-agent-skills.js`

---

## 任务 3：乱码 fixEncoding ✅

**结果**：扫描 252,607 · 修复 74,740 · **corrupt 剩余 0**

**脚本**：`scripts/skills/fix-all-skill-encoding.js`

---

## 任务 4：openclaw 清理 ✅

**结果**：112 条 → `source: totalclaw` + `totalclaw-agent` tags · **剩余 0**

**脚本**：`scripts/skills/fix-openclaw-source.js`

---

## 任务 5：第三方 skill 隔离 ✅

**结果**：8,389 条 → `listingType: inactive` + `reviewStatus: deprecated` · **active 剩余 0**

**脚本**：`scripts/skills/isolate-third-party-skills.js`

---

## 全局验收（2026-06-08）

```bash
node scripts/skills/validate-skill-usability.js   # ✅ 通过
node scripts/skills/scan-role-skill-coverage.js   # ✅ 100% 角色覆盖
```

| 指标 | 结果 |
|------|------|
| fillReason proofreadValidated | 36,504 / 36,504 |
| corrupt (U+FFFD) | 0 |
| openclaw source | 0 |
| 第三方 active | 0 |
| agent-skill 无 frontmatter | 0 |
| validate-skill-usability | ✅ |

---

## 执行日志

| 时间 | 动作 | 结果 |
|------|------|------|
| 2026-06-08 | 创建任务清单 | 5 项待执行 |
| 2026-06-08 | Task 4 openclaw 清理 | 112 条修复 |
| 2026-06-08 | Task 5 第三方隔离 | 8,389 条 inactive |
| 2026-06-08 | Task 3 乱码 fixEncoding | 74,740 条修复，corrupt=0 |
| 2026-06-08 | Task 2 agent-skill 升级 | 42,293 升级 + 1,301 deprecated |
| 2026-06-08 | Task 1 fill proofread 5 批 | 36,496 + 8 补跑 = 36,504 validated |
| 2026-06-08 | **全部任务清零** | 验收通过 |

---

## 相关脚本索引

| 脚本 | 用途 |
|------|------|
| `export-fill-reason-manifest.js` | 导出 fillReason 分批 manifest |
| `batch-proofread-roles.js` | 深度 proofread（`--full --redo`） |
| `upgrade-agent-skills.js` | agent-skill → complete frontmatter |
| `fix-all-skill-encoding.js` | 全库 U+FFFD 修复 |
| `fix-openclaw-source.js` | openclaw → totalclaw |
| `isolate-third-party-skills.js` | 第三方 skill 市场下架 |
| `validate-all-skills.js` | 全库 skill 分层校验 |
| `scan-role-skill-coverage.js` | 角色 skill 覆盖扫描 |
| `fill-role-skills-blueprint.js` | 蓝图补 8 条 skill |
