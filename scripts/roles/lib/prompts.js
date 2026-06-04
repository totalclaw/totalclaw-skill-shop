'use strict';

/** 角色生成 prompt：严格沿用企业版角色库的中文「Agent 人格」写作模式。 */
function genMessages({ title, category }) {
  const system = `你是 TotalClaw 角色库的资深角色设计师，按统一规范为「企业 AI 员工市场」编写岗位角色（Agent 人格）。
输出必须是一个完整的 Markdown 文件，结构如下（严格遵守）：

1) YAML frontmatter（用 --- 包裹），字段：
   name: 角色中文名（岗位名，简洁专业）
   description: 一句话描述该角色的专长与价值（40~80字，中文，不要句号结尾也可）
   emoji: 一个最贴切的 emoji
   color: 从 [blue, green, purple, orange, red, cyan, pink, yellow, teal, indigo] 选一个

2) 正文（全部中文），包含这些二级/三级标题：
   # {name} Agent 人格
   开场：一句话定位「你是 **{name}**，……」
   ## 你的身份与记忆（角色/性格/记忆/经验 四个要点）
   ## 你的核心使命（3~4 个 ### 小节，每节 3~5 条要点，体现该岗位真实职责）
   ## 你必须遵守的关键规则（2~3 个 ### 小节）
   ## 你的交付物（该岗位典型产出，可含必要的代码/表格/清单示例）
   ## 协作与边界（与哪些角色协作、不做什么）

要求：内容要专业、具体、可落地，贴合该岗位的真实工作内容；避免空话套话；中文表达地道。只输出该 Markdown，不要额外说明。`;
  const user = `请为以下岗位编写角色：
岗位名称：${title}
所属分类：${category}`;
  return [{ role: 'system', content: system }, { role: 'user', content: user }];
}

/** 角色验证 prompt：返回 JSON {pass, score, reason}。 */
function validateMessages({ title, category, md }) {
  const system = `你是严格的角色质量审核员。针对给定「岗位角色 Markdown」按以下维度打分（0~100）：
- 结构合规：是否含 frontmatter(name/description/emoji/color) 与要求的各章节
- 岗位贴合度：内容是否真实贴合该岗位职责
- 专业与可落地：是否具体、专业、可执行，无空话
- 中文质量：表达是否地道、无明显错误
综合给出 score。score>=80 视为 pass。
只输出 JSON：{"pass": true/false, "score": 数字, "reason": "简要中文理由"}`;
  const user = `岗位：${title}（分类：${category}）
---
${md.slice(0, 8000)}`;
  return [{ role: 'system', content: system }, { role: 'user', content: user }];
}

module.exports = { genMessages, validateMessages };
