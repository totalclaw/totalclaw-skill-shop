'use strict';
const fs = require('fs');
const path = require('path');

const bodiesDir = path.join(__dirname, 'bodies');

function preserveCodeTranslate(enPath, outPath, translateProse) {
  const en = fs.readFileSync(enPath, 'utf8');
  const parts = en.split(/(```[\s\S]*?```)/g);
  const zh = parts
    .map((part, i) => (i % 2 === 1 ? part : translateProse(part)))
    .join('');
  fs.writeFileSync(outPath, zh, 'utf8');
  console.log('Wrote', outPath, zh.length, 'chars');
}

// --- agent-protocol ---
preserveCodeTranslate(
  path.join(bodiesDir, '14-agent-protocol.en-full.txt'),
  path.join(bodiesDir, '14-agent-protocol.bodyzh.md'),
  (prose) =>
    prose
      .replace(/^# Inter-Agent Protocol/m, '# Inter-Agent 协议')
      .replace(
        /How C-suite agents talk to each other\. Rules that prevent chaos, loops, and circular reasoning\./,
        'C-suite 代理如何相互沟通。防止混乱、循环与 circular reasoning 的规则。',
      )
      .replace(/^## Keywords/m, '## 关键词')
      .replace(/^## Invocation Syntax/m, '## 调用语法')
      .replace(/Any agent can query another using:/, '任意代理可使用以下语法查询另一代理：')
      .replace(/\*\*Examples:\*\*/g, '**示例：**')
      .replace(/\*\*Valid roles:\*\*/g, '**有效角色：**')
      .replace(/^## Response Format/m, '## 响应格式')
      .replace(/Invoked agents respond using this structure:/, '被调用代理使用以下结构响应：')
      .replace(/^## Loop Prevention \(Hard Rules\)/m, '## 循环预防（硬性规则）')
      .replace(
        /These rules are enforced unconditionally\. No exceptions\./,
        '这些规则无条件执行。无例外。',
      )
      .replace(/^### Rule 1: No Self-Invocation/m, '### 规则 1：禁止自我调用')
      .replace(/An agent cannot invoke itself\./, '代理不能调用自身。')
      .replace(/^### Rule 2: Maximum Depth = 2/m, '### 规则 2：最大深度 = 2')
      .replace(/Chains can go A→B→C\. The third hop is blocked\./, '链可为 A→B→C。第三跳被阻止。')
      .replace(/^### Rule 3: No Circular Calls/m, '### 规则 3：禁止循环调用')
      .replace(
        /If agent A called agent B, agent B cannot call agent A in the same chain\./,
        '若代理 A 调用了代理 B，则代理 B 不能在同一链中回调代理 A。',
      )
      .replace(/^### Rule 4: Chain Tracking/m, '### 规则 4：链跟踪')
      .replace(/Each invocation carries its call chain\. Format:/, '每次调用携带其调用链。格式：')
      .replace(
        /Agents check this chain before responding with another invocation\./,
        '代理在响应另一调用前检查此链。',
      )
      .replace(/\*\*When blocked:\*\* Return this instead of invoking:/, '**被阻止时：** 返回以下内容而非调用：')
      .replace(/^## Isolation Rules/m, '## 隔离规则')
      .replace(/^### Board Meeting Phase 2 \(Independent Analysis\)/m, '### 董事会会议阶段 2（独立分析）')
      .replace(
        /\*\*NO invocations allowed\.\*\* Each role forms independent views before cross-pollination\./,
        '**禁止调用。** 各角色在交叉传播前形成独立观点。',
      )
      .replace(/- Reason: prevent anchoring and groupthink/, '- 原因：防止锚定效应与群体思维')
      .replace(/- Duration: entire Phase 2 analysis period/, '- 持续时间：整个阶段 2 分析期')
      .replace(
        /- If an agent needs data from another role: state explicit assumption, flag it with `\[ASSUMPTION: \.\.\.\]`/,
        '- 若代理需要另一角色数据：陈述明确假设，用 `[ASSUMPTION: ...]` 标记',
      )
      .replace(/^### Board Meeting Phase 3 \(Critic Role\)/m, '### 董事会会议阶段 3（Critic 角色）')
      .replace(
        /Executive Mentor can \*\*reference\*\* other roles' outputs but \*\*cannot invoke\*\* them\./,
        'Executive Mentor 可**引用**其他角色输出但**不能调用**它们。',
      )
      .replace(/- Reason: critique must be independent of new data requests/, '- 原因：critique 须独立于新数据请求')
      .replace(/- Allowed:/, '- 允许：')
      .replace(/- Not allowed:/, '- 不允许：')
      .replace(/^### Outside Board Meetings/m, '### 董事会会议之外')
      .replace(
        /Invocations are allowed freely, subject to loop prevention rules above\./,
        '可自由调用，但须遵守上述循环预防规则。',
      )
      .replace(/^## When to Invoke vs When to Assume/m, '## 何时调用 vs 何时假设')
      .replace(/\*\*Invoke when:\*\*/g, '**调用 when：**')
      .replace(/\*\*Assume when:\*\*/g, '**假设 when：**')
      .replace(/\*\*When assuming, always state it:\*\*/g, '**假设时，始终声明：**')
      .replace(/^## Conflict Resolution/m, '## 冲突解决')
      .replace(/When two invoked agents give conflicting answers:/, '当两个被调用代理给出冲突答案时：')
      .replace(/\*\*Flag the conflict explicitly:\*\*/g, '**明确标记冲突：**')
      .replace(/\*\*State the resolution approach:\*\*/g, '**说明解决方式：**')
      .replace(/- Conservative: use the worse case/, '- 保守：采用更差情况')
      .replace(/- Probabilistic: weight by confidence scores/, '- 概率：按置信度加权')
      .replace(/- Escalate: flag for human decision/, '- 升级：标记供人类决策')
      .replace(
        /\*\*Never silently pick one\*\* — surface the conflict to the user\./,
        '**绝不静默择一** — 向用户呈现冲突。',
      )
      .replace(/^## Broadcast Pattern \(Crisis \/ CEO\)/m, '## 广播模式（危机 / CEO）')
      .replace(/CEO can broadcast to all roles simultaneously:/, 'CEO 可同时向所有角色广播：')
      .replace(
        /Responses come back independently \(no agent sees another's response before forming its own\)\. Aggregate after all respond\./,
        '响应独立返回（代理在形成自己观点前不见其他响应）。全部响应后汇总。',
      )
      .replace(/^## Quick Reference/m, '## 快速参考')
      .replace(/\| Rule \| Behavior \|/g, '| 规则 | 行为 |')
      .replace(/\| Self-invoke \|/g, '| 自我调用 |')
      .replace(/\| Depth > 2 \|/g, '| 深度 > 2 |')
      .replace(/\| Circular \|/g, '| 循环 |')
      .replace(/\| Phase 2 isolation \|/g, '| 阶段 2 隔离 |')
      .replace(/\| Phase 3 critique \|/g, '| 阶段 3 critique |')
      .replace(/\| Conflict \|/g, '| 冲突 |')
      .replace(/\| Assumption \|/g, '| 假设 |')
      .replace(/^## Internal Quality Loop \(before anything reaches the founder\)/m, '## 内部质量循环（到达 founder 之前）')
      .replace(
        /No role presents to the founder without passing through this verification loop\. The founder sees polished, verified output — not first drafts\./,
        '任何角色向 founder 呈现前须通过此验证循环。Founder 看到的是 polished、已验证的输出 — 非初稿。',
      )
      .replace(/^### Step 1: Self-Verification \(every role, every time\)/m, '### 步骤 1：自我验证（每角色、每次）')
      .replace(/Before presenting, every role runs this internal checklist:/, '呈现前，每角色运行此内部检查清单：')
      .replace(/^### Step 2: Peer Verification \(cross-functional validation\)/m, '### 步骤 2：Peer 验证（跨职能验证）')
      .replace(
        /When a recommendation impacts another role's domain, that role validates BEFORE presenting\./,
        '当建议影响另一角色领域时，该角色在呈现前验证。',
      )
      .replace(
        /\| If your recommendation involves\.\.\. \| Validate with\.\.\. \| They check\.\.\. \|/,
        '| 若建议涉及... | 验证方 | 检查内容 |',
      )
      .replace(/\*\*Peer validation format:\*\*/g, '**Peer 验证格式：**')
      .replace(/\*\*Skip peer verification when:\*\*/g, '**跳过 peer 验证 when：**')
      .replace(/^### Step 3: Critic Pre-Screen \(high-stakes decisions only\)/m, '### 步骤 3：Critic 预筛（仅高风险决策）')
      .replace(
        /For decisions that are \*\*irreversible, high-cost, or bet-the-company\*\*, the Executive Mentor pre-screens before the founder sees it\./,
        '对于**不可逆、高成本或 bet-the-company** 的决策，Executive Mentor 在 founder 看到前预筛。',
      )
      .replace(/\*\*Triggers for pre-screen:\*\*/g, '**预筛触发条件：**')
      .replace(/\*\*Pre-screen output:\*\*/g, '**预筛输出：**')
      .replace(/^### Step 4: Course Correction \(after founder feedback\)/m, '### 步骤 4：路线修正（founder 反馈后）')
      .replace(/The loop doesn't end at delivery\. After the founder responds:/, '循环不在交付时结束。Founder 响应后：')
      .replace(/^### Verification Level by Stakes/m, '### 按风险级别的验证')
      .replace(/\| Stakes \| Self-Verify \| Peer-Verify \| Critic Pre-Screen \|/g, '| 风险 | 自我验证 | Peer 验证 | Critic 预筛 |')
      .replace(/^### What Changes in the Output Format/m, '### 输出格式的变化')
      .replace(/The verified output adds confidence and source information:/, '验证后的输出增加置信度与来源信息：')
      .replace(/^## User Communication Standard/m, '## 用户沟通标准')
      .replace(
        /All C-suite output to the founder follows ONE format\. No exceptions\. The founder is the decision-maker — give them results, not process\./,
        '所有 C-suite 对 founder 的输出遵循一种格式。无例外。Founder 是决策者 — 给结果，不给过程。',
      )
      .replace(/^### Standard Output \(single-role response\)/m, '### 标准输出（单角色响应）')
      .replace(/^### Proactive Alert \(unsolicited — triggered by context\)/m, '### 主动告警（非请求 — 由上下文触发）')
      .replace(/^### Board Meeting Output \(multi-role synthesis\)/m, '### 董事会会议输出（多角色综合）')
      .replace(/^### Communication Rules \(non-negotiable\)/m, '### 沟通规则（不可妥协）')
      .replace(/^## Reference/m, '## 参考')
      .replace(
        /- `references\/invocation-patterns\.md` — common cross-functional patterns with examples/,
        '- `references/invocation-patterns.md` — 常见跨职能模式与示例',
      )
      .replace(/- The question requires domain-specific data you don't have/, '- 问题需要你没有的领域特定数据')
      .replace(/- An error here would materially change the recommendation/, '- 此处错误会 materially 改变建议')
      .replace(/- The question is cross-functional by nature \(e\.g\., hiring impact on both budget and capacity\)/, '- 问题本质跨职能（如 hiring 对 budget 与 capacity 的影响）')
      .replace(/- The data is directionally clear and precision isn't critical/, '- 数据方向清晰且精度非关键')
      .replace(/- You're in Phase 2 isolation \(always assume, never invoke\)/, '- 你处于阶段 2 隔离（始终假设，永不调用）')
      .replace(/- The chain is already at depth 2/, '- 链已达深度 2')
      .replace(/- The question is minor compared to your main analysis/, '- 与主分析相比问题较 minor')
      .replace(/- Single-domain question with no cross-functional impact/, '- 单领域问题无跨职能影响')
      .replace(/- Time-sensitive proactive alert \(send alert, verify after\)/, '- 时间敏感主动告警（先发告警，后验证）')
      .replace(/- Founder explicitly asked for a quick take/, '- Founder 明确要求 quick take')
      .replace(/- Involves spending > 20% of remaining runway/, '- 涉及花费 > 剩余 runway 的 20%')
      .replace(/- Affects >30% of the team \(layoffs, reorg\)/, '- 影响 >30% 团队（layoffs、reorg）')
      .replace(/- Changes company strategy or direction/, '- 改变公司战略或方向')
      .replace(/- Involves external commitments \(fundraising terms, partnerships, M&A\)/, '- 涉及外部承诺（融资条款、合作、M&A）')
      .replace(/- Any recommendation where all roles agree \(suspicious consensus\)/, '- 所有角色一致的建议（可疑共识）'),
);

// --- twenty-oauth ---
preserveCodeTranslate(
  path.join(bodiesDir, '09-twenty-oauth.en-full.txt'),
  path.join(bodiesDir, '09-twenty-oauth.bodyzh.md'),
  (prose) =>
    prose
      .replace(/^# Twenty CRM OAuth Mastery Skill/m, '# Twenty CRM OAuth Mastery 技能')
      .replace(/\*\*Author\*\*: Generated from extensive OAuth debugging sessions in OpenCode/, '**作者**：源自 OpenCode 中大量 OAuth 调试会话')
      .replace(/\*\*Last Updated\*\*: 2026-02-08/, '**最后更新**：2026-02-08')
      .replace(/\*\*Version\*\*: 1\.0/, '**版本**：1.0')
      .replace(/^## Skill Metadata/m, '## 技能元数据')
      .replace(/^## Quick Start/m, '## 快速开始')
      .replace(/^### When to Use This Skill/m, '### 何时使用本技能')
      .replace(/You should use this skill when working on:/, '在以下场景使用本技能：')
      .replace(/^### Quick Reference for Common Issues/m, '### 常见问题快速参考')
      .replace(/\| Issue \| File to Check \| Quick Fix \|/g, '| 问题 | 检查文件 | 快速修复 |')
      .replace(/^## Core Knowledge/m, '## 核心知识')
      .replace(/^### 1\. Twenty CRM OAuth Architecture/m, '### 1. Twenty CRM OAuth 架构')
      .replace(/\*\*Key Files\*\*:/g, '**关键文件**：')
      .replace(/\*\*Structure\*\*:/g, '**结构**：')
      .replace(/^### 2\. Critical Code Patterns/m, '### 2. 关键代码模式')
      .replace(/#### Passport Strategy Pattern \(MUST FOLLOW\)/g, '#### Passport Strategy 模式（必须遵循）')
      .replace(/\*\*Why This Matters\*\*:/g, '**为何重要**：')
      .replace(/^### 3\. Common Issues & Solutions/m, '### 3. 常见问题与解决方案')
      .replace(/#### Issue 1: Redirect Loop After OAuth/g, '#### 问题 1：OAuth 后重定向循环')
      .replace(/\*\*Symptoms\*\*:/g, '**症状**：')
      .replace(/\*\*Root Causes\*\*:/g, '**根本原因**：')
      .replace(/\*\*Fix\*\*:/g, '**修复**：')
      .replace(/\*\*Check\*\*:/g, '**检查**：')
      .replace(/#### Issue 2: Domain Enforcement Blocking \.co Users/g, '#### 问题 2：域 enforcement 阻止 .co 用户')
      .replace(/#### Issue 3: Automatic Sync Not Triggered/g, '#### 问题 3：自动同步未触发')
      .replace(/\*\*Root Cause\*\*:/g, '**根本原因**：')
      .replace(/\*\*Additional Checks\*\*:/g, '**额外检查**：')
      .replace(/#### Issue 4: Frontend Token Processing Loop/g, '#### 问题 4：前端 Token 处理循环')
      .replace(/^### 4\. OAuth Sync Integration/m, '### 4. OAuth 同步集成')
      .replace(/\*\*When to Use\*\*:/g, '**何时使用**：')
      .replace(/\*\*Implementation\*\*:/g, '**实现**：')
      .replace(/\*\*Critical\*\*:/g, '**关键**：')
      .replace(/^### 5\. Token Refresh Management/m, '### 5. Token 刷新管理')
      .replace(/\*\*Token Refresh Pattern\*\*:/g, '**Token 刷新模式**：')
      .replace(/\*\*Error Handling\*\*:/g, '**错误处理**：')
      .replace(/^### 6\. Testing Strategies/m, '### 6. 测试策略')
      .replace(/#### Unit Testing \(Token Refresh\)/g, '#### 单元测试（Token 刷新）')
      .replace(/#### Cookie Injection Test \(Playwright\)/g, '#### Cookie 注入测试（Playwright）')
      .replace(/^### 7\. Configuration/m, '### 7. 配置')
      .replace(/\*\*Required Environment Variables\*\*:/g, '**必需环境变量**：')
      .replace(/\*\*Google Cloud Console\*\*:/g, '**Google Cloud Console**：')
      .replace(/^### 8\. Deployment Checklist/m, '### 8. 部署检查清单')
      .replace(/\*\*Before Deploying\*\*:/g, '**部署前**：')
      .replace(/\*\*After Deploying\*\*:/g, '**部署后**：')
      .replace(/^### 9\. Troubleshooting Workflow/m, '### 9. 故障排查工作流')
      .replace(/^### 10\. Common Pitfalls ❌/m, '### 10. 常见陷阱 ❌')
      .replace(/OAuth completes but user stuck on welcome page/, 'OAuth 完成但用户卡在 welcome 页')
      .replace(/Tokens lost in validate\(\) method/, 'validate() 方法中 token 丢失')
      .replace(/Same token processed multiple times/, '同一 token 被多次处理')
      .replace(/Users should have Gmail\/Calendar auto-connected after OAuth login/, '用户 OAuth 登录后应自动连接 Gmail/Calendar')
      .replace(/Implementing/g, '实现')
      .replace(/Fixing/g, '修复')
      .replace(/Setting up/g, '设置')
      .replace(/Debugging/g, '调试')
      .replace(/Configuring/g, '配置')
      .replace(/Troubleshooting/g, '故障排查'),
);

console.log('body zh files generated');
