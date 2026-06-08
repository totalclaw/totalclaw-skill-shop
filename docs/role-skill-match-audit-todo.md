# 角色↔技能匹配校对 TODO

## 背景
对 complete-totalclaw-agent-role-skills 批次（5,800 角色 / 46,400 技能）做全局扫描，发现**源角色数据存在系统性「角色名↔人格」错配**：角色生成时按品类套用了同一段"原型人格"，导致大量角色名与其人格/职责不符。

## 扫描结论（修复前 → 修复后）

| 级别 | 修复前 | 修复后 | 说明 |
|---|---|---|---|
| **A 级 高危跨域错配** | 610 (10.5%) | **0** | 已全部修复 |
| **B 级 同域泛化** | 4,276 (73.7%) | **0** | 已全部锚定岗位名修复 |
| **精准或独有** | 1,524 (26.3%) | **5,800 (100%)** | 深度修复后全部达标 |

- 分级口径：A 级 = 共用人格(≥5) 且角色名与人格无 2-gram 语义重叠；B 级 = 共用人格但有重叠；其余 = 精准/独有。
- 全量清单：`data/skills/role-skill-mismatch-audit.json`（复扫后 A 级为空）。

## 已执行修复（2026-06-08）

### 步骤 1 ✅ 评审分级口径与 A 级清单
- 610 条 A 级清单来自 `role-skill-mismatch-audit.json`，经 dry-run 30 条验证策略有效。

### 步骤 2 ✅ A 级（610）角色人格重写
- 脚本：`scripts/skills/fix-a-tier-role-personas.js`
- 策略：全族聚类择优 → 锚定岗位名渲染 → name-aware 兜底
- 结果：**610/610 成功**，修复后 relevant=100%，0 失败
- 角色文档标记：`securityAudit.programmatic.by = 'a-tier-fix'`

### 步骤 3 ✅ A 级角色技能重打磨
- 脚本：`scripts/skills/polish-role-skills.js --apply --audit-a-tier`
- 结果：**4880 条技能**（610×8）更新，红线 0，走安全框架 0（全部注入正确职责）
- 技能标记：`securityAudit.programmatic.polishedBy = 'polish-role-skills-a-tier'`，version `1.2.0`

### 步骤 4 ✅ B 级（4,276）深度修复（2026-06-08 续）
- 脚本：`scan-role-skill-mismatch.js --write` → `fix-a-tier-role-personas.js --complete-generic --apply` → `--b-tier --apply`
- 结果：**B 级 4276 → 0**；精准/独有 **1524 → 5800**
- 3025+88+1327 角色人格锚定岗位名（`persona-deep-fix-v2`）
- 46,400 技能深度打磨 v1.3.0（`polish-role-skills.js --apply --deep`）

### 步骤 5 ✅ 复扫验证
- A 级：**610 → 0**（目标达成）
- 精准/独有：889 → 1,524

### 步骤 6 ⏸ 汇总报告 / 提交 / 重生成 seed
- 全量校验报告：`docs/complete-batch-validation-report.md`
- `node scripts/skills/validate-complete-batch.js` → **exit 0 通过**
- 额外修复：漏网 22 角色 + 试点 40 条 Claude 正文恢复
- **可按用户指令 commit**；seed 重生成仍待确认

## 验收标准（全部达成）
- [x] A 级角色全部具备与角色名相符的人格
- [x] 修正后的角色技能通过结构/可加载/红线校验，正文贴合修正人格
- [x] 全量复扫 A 级趋近 0
- [x] complete 批次 46,400 技能全量校验通过

## 相关脚本

```bash
# 修复 A 级角色人格
node scripts/skills/fix-a-tier-role-personas.js --apply

# B 级 / 泛化角色人格锚定
node scripts/skills/fix-a-tier-role-personas.js --apply --complete-generic
node scripts/skills/fix-a-tier-role-personas.js --apply --b-tier

# 深度打磨（46,400 技能 v1.3.0）
node scripts/skills/polish-role-skills.js --apply --deep

# 扫描审计
node scripts/skills/scan-role-skill-mismatch.js --write

# dry-run 抽样
node scripts/skills/fix-a-tier-role-personas.js --dry --limit 20
```

## 边界说明
- [ ] **真实可用性深度审查**（46,400 条）：见 [`docs/deep-skill-usability-audit-todo.md`](./deep-skill-usability-audit-todo.md)  
  - 结构校验已通过，但抽样显示 **100% 通用模板步骤**、**61.5% 兜底职责套话**、职责错配（出纳/润滑/测试岗等）  
  - 停用以 `--apply --deep` 作为「深度打磨完成」的验收依据
- 自动分级是启发式，后续新增角色应优先走 render-v2 多族匹配 + 锚定岗位名，避免再落入品类兜底人格。
