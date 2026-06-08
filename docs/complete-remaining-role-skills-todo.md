# TODO：补齐剩余角色的 TotalClaw-agent 岗位技能

> 创建于 2026-06-08。本任务用于把当前 `skillsDone != true` 的剩余角色全部补齐配套 skill。

## 当前目标

- 主目标：清空 `{ kind: 'role', skillsDone: { $ne: true } }`。
- 生成目标：每个真实缺口角色生成 8 个面向 `totalclaw-agent` 的岗位 skill。
- 入库目标：所有新增 skill 必须是 `source: 'totalclaw'`，禁止写成其它来源。
- 运行时目标：每个 skill 正文包含 TotalClaw-agent 可识别的 `metadata.totalclaw`、`exposure` 和 `totalclaw-agent` 标签。

## 口径

- **未完成角色文档**：`kind:'role'` 且 `skillsDone != true`。
- **真缺口角色名**：未完成角色中，其 `name` 没有出现在任何 `kind:'skill'` 的 `tags` 中。
- **冗余同名角色**：同名角色已有技能覆盖，但某些重复 role 文档还没有 `skillsDone:true`；这类只需补标完成，不重复生成。

## 执行计划

1. 统计当前未完成角色、真缺口、分类分布。
2. 分批选择真缺口角色，避开已经有技能标签覆盖的角色名。
3. 每个角色生成 8 个稳定模板 skill：
   - 任务澄清与目标拆解
   - 工作流规划与里程碑排期
   - 信息收集与证据台账
   - 方案生成与备选比较
   - 质量检查与风险复核
   - 自动化提示词与工具调用清单
   - 交付物撰写与汇报
   - 复盘沉淀与知识库更新
4. 用稳定哈希生成唯一 `skillId`，避免中英文混合角色名产生冲突。
5. 入库后把对应角色名的所有 role 文档标记 `skillsDone:true`。
6. 循环直到真缺口为 0，再把所有“同名已有技能覆盖”的未完成文档补标完成。

## 验收标准

- [ ] `kind:'role', skillsDone:{$ne:true}` 为 0。
- [ ] 真缺口角色名为 0。
- [ ] 本任务新增 skill 的 `source` 全部为 `totalclaw`。
- [ ] 本任务新增 skill 的 `tags` 包含 `岗位技能`、角色名、`totalclaw-agent`。
- [ ] 不存在本任务角色名对应的错误来源记录。
- [ ] 导入脚本可重复运行，重复运行不会产生重复 skill。

## 参考命令

```bash
node scripts/skills/complete-totalclaw-agent-role-skills.js
```

