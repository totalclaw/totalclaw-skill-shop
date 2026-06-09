module.exports = {
  skillId: 'totalclaw:totalclaw~ukraecho-todo-boss',
  descriptionZh:
    'Telegram 任务捕获、委派跟踪与每日剩余工作报告，无需网页浏览或外部查询。',
  bodyZh: `# todo-boss

## 用途
在 Telegram 中完成任务捕获、委派跟踪与每日剩余工作报告。
禁止网页浏览、网页搜索及任何外部查询。

## 数据存储
仅追加日志：\`~/.openclaw/workspace/data/todo/tasks.jsonl\`
派生状态缓存（可选）：\`~/.openclaw/workspace/data/todo/state.json\`

## 命令（Telegram）
- /todo <text>：根据自由文本创建任务草稿
- /todo_done <id>：标记完成
- /todo_list：列出未完成任务（按负责人分组，再按截止日期）
- /todo_delegated：列出我委派给他人且仍未完成的任务（含历史）
- /todo_report：每日报告（与列表相同，但更简洁）

## 提取规则（非常重要）
当用户发送 /todo <text> 时：
1) 提取：title、owner、due_date（YYYY-MM-DD 或自然语言）、priority（可选）、notes。
2) 若 owner 或 due_date 缺失/不明确：
   - 在 Telegram 中追问。
   - 以 status="draft" 存储，并记录 missing_fields=[...]。
   - 在两者均确认前，不要最终定为 "open"。
3) 若 owner/due_date 已齐全：
   - 创建 status="open"
4) 始终回显确认摘要：id、title、owner、due_date、status。

## 默认假设
- 若缺少 owner：询问「누가 담당할까요? (본인/팀원 이름)」
- 若缺少 due_date：询问「납기는 언제로 할까요?」
- 时区：Asia/Seoul。

## 历史记录
任何更新都必须向 tasks.jsonl 追加事件：
- created / finalized / updated / done / reopened
包含：timestamp、actor(user)、previous values、new values。

## 硬性约束
- 绝不调用网页工具。
- 绝不要求 API 密钥。
- 回复保持简短、以行动为导向。

## 执行
收到 /todo 时：
- 调用：\`~/.openclaw/workspace/skills/todo-boss/add_task.sh "<full user text after /todo>"\`
- 将脚本输出回复给用户。

## 跟进策略（严格）
仅在缺失时询问以下两个问题：
1) 「담당자(owner)는 누구로 할까요?」
2) 「납기(due)는 언제로 할까요?」

不要询问内容细节、背景、会议上下文或邮件结构。
本技能是任务跟踪器，不是规划助手。

若用户请求规划或起草，可简要回答，但仍需捕获任务；若缺少 owner/due，继续追问。`,
};
