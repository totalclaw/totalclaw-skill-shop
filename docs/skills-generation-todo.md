# 待办：为 1.4 万无技能角色补生成配套技能（SKILL.md）

> 创建于 2026-06-05。本文件是后续批量实现的任务清单与操作手册。

## 背景

市场是**两层数据**（都存在 `skills` 集合，用 `kind` 区分）：

| kind | 数量 | 说明 |
|---|---|---|
| `role` | 27,397 | 岗位人格画像（前 6 轮已用真实 JD 重建为 profile-v2，覆盖 99 个分类、331 个方向） |
| `skill` | ~102,945 | 每个角色配套的「可执行技能」SKILL.md，通过 `tags` 含角色名来关联 |

角色文档用 `skillsDone:true` 标记「已生成配套技能」。**前 6 轮只重建了角色画像（role.contentMd），没动技能管线**，导致重建出来的角色绝大多数是「有画像、没技能」的空壳。

## 当前缺口（2026-06-05 实测）

- **待补技能的角色：14,160 个**（`{kind:'role', skillsDone:{$ne:true}}`）
  - profile-v2 重建角色：13,563
  - 剩余 template 角色：594
  - DeepSeek 富内容角色：3
- 按每角色 ~8 个技能估算，需生成 **≈ 11.3 万个 SKILL.md**。
- 待补角色 Top 分类：政务605 / 航空航天266 / 零售247 / 汽车243 / 科研225 / 农业219 / 体育218 / 生物制药217 / 餐饮215 / 医疗214 / 能源212 / 影视206 …（覆盖全部 99 分类）。

## 为什么不用原 DeepSeek 管线

原管线 `scripts/skills/generate.js` 依赖 DeepSeek（岗位→拆技能清单→写 SKILL.md→验证）。**DeepSeek 账号当前余额不足（Insufficient Balance）**，正是当初 ~1.4 万角色没技能的同一根因。余额恢复后该脚本仍可用（断点续跑，认领 `skillsDone≠true` 的角色）。

## 已验证的替代方案：Claude agent 自产（不依赖 DeepSeek）

已落地并跑通试水（游戏项目经理 + Blender艺术家，各 8 技能，16 个 SKILL.md 入库成功、定价/付费标记正确、角色打标 done）。

### 管线

```
Claude agent（按岗位生成 8 个 SKILL.md → 返回 JSON 数组）
        ↓ 组装成 batch JSON
scripts/skills/import-agent-skills.js  ← 不依赖 DeepSeek，按原 genSkill 同款 schema 入库
        ↓
skills 集合（kind:skill）+ 角色打 skillsDone:true
```

### 入库脚本（已就位）

`scripts/skills/import-agent-skills.js` —— 吃 batch JSON，逐技能 upsert（按 skillId 去重，已存在跳过），整角色处理完打 `skillsDone:true`。

- skillId 格式：`totalclaw:roleskill~{role-slug}-{skill-slug}`（与原 generate.js 完全一致）
- schema 字段：`skillId/slug/name/displayName/description/descriptionZh/category/tags(['岗位技能',角色名,...])/source/kind/contentMd/author/version/securityAudit.programmatic(by:'agent-skill')`，`$setOnInsert` 写 `listingType:'paid'/ownership/closedSource/pricing/reviewStatus/stats`
- 付费规则：`paid:false` → 免费(price 0)，否则收费(默认 ¥9，可用 `SKILL_PRICE` 覆盖)
- 程序化校验：正文 ≥200 字、含「何时使用」段、含步骤段；不过写 `data/skills/failed-agent-skills.jsonl`

### batch JSON 输入格式

```json
[{ "role": "游戏项目经理", "category": "游戏策划与美术",
   "skills": [
     { "name": "研发里程碑排期表生成", "desc": "一句话", "paid": false,
       "body": "# 研发里程碑排期表生成\n\n## 何时使用 ...(完整 Markdown，换行用 \\n)" },
     ... 共 ~8 个
   ]}]
```

### agent prompt 模板（每个 agent 处理 1 个角色 = 8 个技能）

> 你是技能体系设计师，为「{角色名}」（分类：{分类}）生成 8 个**可执行技能**(SKILL.md)。每个技能是具体、可复用的工作能力（不要泛泛而谈）。每份 SKILL.md 含：`## 何时使用 / ## 输入 / ## 步骤(编号可执行) / ## 输出 / ## 注意事项`，贴合岗位场景。输出严格为 JSON 数组（8 对象）：`{"name","desc","paid":true/false,"body":"完整Markdown,换行用\\n"}`。只返回 JSON，body ≥250 字。

## 执行计划（后续实现）

总量 14,160 角色。按 **16 agent 并行 / 每 agent 1 角色 = 一轮 16 角色**，需 ~885 轮。可分阶段：

1. **优先级**：先做高价值/高频分类（政务、医疗、汽车、科研、影视…），或按家族分批与前 6 轮对应。
2. **每轮**：选 16 个 `skillsDone≠true` 角色 → 16 agent 并行产 JSON → 组装 batch → `import-agent-skills.js` 入库 → 自动打 done。
3. **断点续跑**：每轮只选 `skillsDone≠true`，天然幂等；技能按 skillId 去重，重复跑不会重复写。
4. **进度核对**：`db.skills.countDocuments({kind:'role', skillsDone:{$ne:true}})` 应持续下降到 0。
5. **成本意识**：11 万 SKILL.md 是大额 token 操作，建议分多个会话 / 多天推进，每阶段汇报。

### 备选：DeepSeek 恢复后

充值后直接 `node scripts/skills/generate.js --roles=500 --perRole=8 --concurrency=8 --roleConcurrency=4`，自动认领未完成角色。两条管线可混用（都按 skillId 去重）。

## 注意事项 / 坑

- **保 DeepSeek 富内容角色**：渲染角色时用过 `--all-roles` 才全量覆盖；技能这边无此问题（只新增 skill、按 skillId 去重）。
- 角色按 `name` 精确匹配 role 文档以取真实 slug，保证 skillId 一致；重名角色需注意（当前按 name 取第一个）。
- 已有 13,235 个角色的旧 DeepSeek 技能**未被破坏**，仍在。
- 校验偏宽松（程序化），如需更高质量可加一轮 agent 互评。

## 进度

- [x] 建入库脚本 `scripts/skills/import-agent-skills.js`（不依赖 DeepSeek）
- [x] 试水：游戏项目经理 + Blender艺术家 共 16 技能入库成功
- [ ] 批量推进 14,158 剩余角色（≈11.3 万 SKILL.md）—— 后续实现
