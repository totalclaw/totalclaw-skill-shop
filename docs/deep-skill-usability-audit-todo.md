# 46,400 技能「真实可用性」深度审查 TODO

> 创建：2026-06-08  
> 背景：此前 `polish-role-skills.js --apply --deep` 可在数秒内跑完 46,400 条，只能说明**模板批量写入成功**，不能证明技能**真的能帮 TotalClaw-agent 干活**。本 TODO 以「Agent 加载后能否产出可验收、可复核、岗位正确的交付物」为唯一标准。

---

## 一、审查结论（先读）

### 1.1 两层质量：结构合规 vs 业务可用

| 维度 | 当前状态 | 说明 |
|---|---|---|
| **结构合规**（YAML/章节/红线/8条映射） | ✅ 46,400/46,400 通过 | `validate-complete-batch.js` exit 0 |
| **业务可用**（岗位正确、步骤可执行、示例能照做） | ✅ **自动指标全通过** | v1.5.2；P0/meta/示例/兜底/锚定均为 0%；**待 414 组人工读稿** |

**结论**：v1.3.0 深度打磨解决的是「格式 + 职责字符串注入」，**没有**解决「8 个通用 meta-工作流蓝图 ≠ 岗位专业技能」的根本问题。  
**不能**把「脚本跑完 / version 1.3.0」等同于「46,400 条已可用」。

### 1.2 全量启发式扫描（2026-06-08 续，v1.5.0 后）

| 指标 | 数量 | 占比 | 含义 |
|---|---|---|---|
| 通用 meta 步骤（「列出缺失信息，用最多 8 个问题」） | 0 | **0%** | role-type 步骤库覆盖全部岗位类型 |
| 示例仅为骨架 | 0 | **0%** | 已注入「例：…」兜底示例或品类 concrete example |
| 岗位关键动作含 titleDuties 兜底套话 | 0 | **0%** | v1.5.1 mergeRoleDuties 优先 cluster + 剔除泛化句 |
| 非研发岗混入研发职责 | 0（validate） | **0** | |
| P0 职责错配角色组 | 0 | **0** | |
| 职责未锚定角色名 | 0 | **0%** | v1.5.2 锚定职责排首位 + ensureAnchored |

### 1.2.1 历史扫描（v1.3.0 基线，仅供对比）

| 指标 | 数量 | 占比 |
|---|---|---|
| 通用模板痕迹（≥3 处固定套话） | 46,400 | **100%** |
| 示例仅为骨架 | 34,800 | **75%** |
| 岗位关键动作含 titleDuties 兜底套话 | 28,544 | **61.5%** |
| 非研发岗混入研发职责 | 464+ | ≥464 组 |

### 1.3 人工抽样读稿（10 条随机 + 15 品类各 1 条）

**可读、部分可用（职责来自正确 cluster）**  
- 环卫保洁员、旅游呼叫中心坐席、隐私合规主任、电商分销运营专员、生鲜品控总监  
- 特点：cluster 职责与岗位较贴，但步骤仍是通用「任务澄清/复盘」meta 流程，**缺少岗位专有 SOP**

**明显不可用（职责错配 / 张冠李戴）**  
- **冶金出纳**：岗位关键动作是选矿工艺、岩石力学、数字化矿山——与出纳无关  
- **港口润滑工程师**：混入船代报关、预配载 + 「核心模块设计、联调」  
- **物流智能化专家**：定位写「制造业供应链」，缺智慧物流/IoT/算法语境  
- **无障碍测试工程师** 及大量 `*测试工程师`：固定出现「分析需求、制定技术方案、核心模块设计联调」——来自 `dutiesFromTitle(/工程|开发|架构/)` 误匹配「工程师」三字  
- **云渗透测试工程师**：前两行仍是研发套话，后面才是 SDL/扫描（半对半错）

**共性问题归纳**  
1. **8 蓝图是 meta 技能**（澄清/排期/台账/方案/质检/自动化/汇报/复盘），不是岗位技能（如「设计无障碍测试用例」「编制出纳日报」「港口润滑点检」）  
2. **titleDuties 规则过粗**：`/工程|开发|架构/` 误伤所有「工程师」  
3. **cluster 职责混装**：人格渲染时把 cluster 内其它岗位职责拼进「岗位关键动作」  
4. **示例章节约等于空**：Agent 无法从示例学会输出格式  
5. **步骤不可直接执行**：缺工具名、字段表、判定标准、模板片段  

---

## 二、「真正可用」验收标准（本 TODO 的 Done 定义）

一条 skill **只有同时满足**以下才计为「可用」：

### A. 岗位准确性
- [ ] 角色名、品类、职责、步骤**语义一致**，无跨域张冠李戴  
- [ ] 「岗位关键动作」≥3 条为**该岗位专有**（非 titleDuties 四条兜底套话）  
- [ ] 安全类岗位：防御口径；非安全类：不出现渗透/攻击可执行步骤  

### B. 蓝图匹配度
- [ ] 8 条 skill 分别对应**可区分的岗位工作类型**（不能 8 条步骤 80% 相同）  
- [ ] 每条 suffix（如「信息收集与证据台账」）的步骤**真的在做这件事**，而非只改标题  

### C. 可执行性
- [ ] 步骤 ≥5 步，每步有**明确输入/动作/完成标志**  
- [ ] 至少 1 步提到**领域工具/标准/法规**（如 Jira、ISO 26262、个保法、SLA）  
- [ ] 输入节含**可填字段**（表格或 bullet 字段名）  

### D. 示例质量
- [ ] 示例含**具体虚构但合理的**输入（≥3 个约束）  
- [ ] 示例输出为**可对照的骨架**（非「按上文输出清单给出…」一句带过）  

### E. 运行时
- [ ] TotalClaw-agent 加载后 `metadata.totalclaw.role/category/tags` 与 DB `tags` 一致  
- [ ] 与同角色其它 7 条 skill **互补**，覆盖该岗主要工作场景  

**批次 Done**：按品类分层抽样，每品类 ≥5 角色 × 8 skill 人工打分 ≥4/5，且 P0 问题为 0。

---

## 三、问题分级与处理策略

| 级别 | 类型 | 估计规模 | 策略 |
|---|---|---|---|
| **P0** | 职责明显错配（出纳→选矿、润滑→报关+写代码） | 待精扫，抽样已见 ≥50 类 | 人格 cluster 重匹配 + 技能职责重写 |
| **P0** | titleDuties 误匹配「工程师」→ 研发套话 | ~464+ 非研发岗 | 修复 `role-duty-helpers.js` 规则，重跑受影响角色 |
| **P1** | 61.5% 含兜底套话 | ~28,544 条 | 仅保留 cluster 专有职责 + 岗位名锚定，删除兜底句 |
| **P1** | 8 蓝图 meta 化，缺岗位 SOP | 46,400 全部 | 按 cluster/品类定制蓝图步骤或增「领域步骤库」 |
| **P2** | 示例骨架化 | ~34,800 条 | 按品类生成 1 个 concrete example 模板 |
| **P2** | 同角色 8 条差异不足 | 待测 | 每蓝图注入不同职责子集 + 不同输出模板 |
| **P3** | 文采/深度不足 | 大部分 | 高价值子集走 LLM 精修（`llm-refine-role-skills.js`） |

---

## 四、执行计划（TODO）

### 阶段 0：停掉「假深度」批量写库 ⏸
- [x] **0.1** 冻结 `polish-role-skills.js --apply --deep` 作为质量验收手段
- [x] **0.2** 在 `polish-role-skills-todo.md` 标注：v1.3.0 = 结构增强，**不等于**可用性验收通过  

### 阶段 1：建立可复核的审查管线 🔴 优先
- [x] **1.1** 实现 `scripts/skills/audit-skill-usability-heuristic.js`  
- [x] **1.2** 实现 `scripts/skills/audit-skill-usability-sample.js --per-category 5`  
- [x] **1.3** 建立人工打分表模板：`data/skills/usability-manual-scores.template.json`  
- [ ] **1.4** **414 组读稿样本**（v1.5.2）+ **30 组 W1 试点**（`pick-usability-pilot-samples.js --write`）；人工打分待填  

### 阶段 2：修复 P0 错配 🟠
- [x] **2.1** 修复 `role-duty-helpers.js`：测试/财务/安全/润滑等分类，不再误伤「*工程师」  
- [x] **2.2** `filterDutiesForRole` + `mergeRoleDuties` 剔除 cluster 错配职责  
- [x] **2.3** P0 927 角色人格 + 7,416 技能 v1.4.0 修复；全量 46,400 技能 v1.4.0  
- [x] **2.4** 复扫 P0 → **0**（2026-06-08 续）  

### 阶段 3：蓝图与步骤真实化 🟡
- [x] **3.1** 设计「品类步骤库」：`scripts/skills/blueprint-steps/` 按 cluster 存 8 蓝图真实步骤  
- [x] **3.2** 优先 10 个高流量品类（电商、测试、金融、物流、制造、营销、合规、医疗、IoT 等）做样板  
- [x] **3.3** 升级 `polish-role-skills.js` → v1.5.0：`--blueprint-aware`，步骤来自步骤库 + role-type 回退  
- [x] **3.5** v1.5.1 职责合并：cluster 优先 + 剔除泛化套话；兜底套话率 **0%**  
- [x] **3.6** v1.5.2 职责锚定 + 财务/法务/审计规则；自动验收全绿  
- [ ] **3.7** 414 组人工读稿 ≥4.0/5（`score-usability-manual.js` 汇总）

### 阶段 4：示例与可执行细节 🟢
- [ ] **4.1** 每品类 1 套 concrete example（输入含字段值，输出含表格骨架）  
- [ ] **4.2** 输入节改为「字段清单 + 必填/选填」  
- [ ] **4.3** W1 试点 30 角色：Claude agent 亲撰复审（`import-pilot-refine.js`，标记 `claude-author`）  
- [ ] **4.4** 第二批 30 角色 agent 复审（不用 DeepSeek；见 `llm-refine-next-batch.json` 作角色清单）  
- [x] ~~DeepSeek llm-refine~~ **已停用**（误跑 65 角色/520 技能 v1.6.0，待用户决定是否回退至 v1.5.2）  

### 阶段 5：全量验收与发布 ⚪
- [x] **5.1** 启发式：genericMetaStep=0，exampleSkeleton=0，devDutyLeak=0，genericDutyFallback=0  
- [ ] **5.2** 人工抽样：W1 试点 30 组均分 ≥4.0 → 全量 414 组  
- [x] **5.3** `validate-complete-batch.js` + `validate-skill-usability.js` 双脚本 exit 0  
- [x] **5.4** seed 已重生成（`seed/manifest.json`，4 分片，243,532 文档）；**CDN 上传待运维**  
- [ ] **5.5** git commit / push（用户指令后）  

---

## 五、审查节奏（建议，避免再「4 秒跑完」）

| 周次 | 动作 | 产出 |
|---|---|---|
| W1 | 阶段 1 全做 + 420 组人工读稿启动 | 启发式报告 + 首批 100 组打分 |
| W2 | 阶段 2 P0 修复 + 复扫 | P0 清零报告 |
| W3–W4 | 阶段 3 十品类样板 | 10 品类 × 8 蓝图步骤库 |
| W5+ | 阶段 3 推广 + 阶段 4 示例 | 分批写库，每批 ≤5000 条 + 抽检验收 |

**原则**：每批写库 ≤5,000 技能，必须附带抽样人工读稿 ≥30 组，否则不算完成。

---

## 六、参考命令（审查用，非批量糊弄）

```bash
# P0 扫描
node scripts/skills/scan-p0-role-skills.js --write

# P0 人格修复 + 技能 v1.4.0
node scripts/skills/fix-a-tier-role-personas.js --scan-p0 --apply
node scripts/skills/polish-role-skills.js --apply --scan-p0 --usability-v2

# 全量 v1.5.2
node scripts/skills/polish-role-skills.js --apply --blueprint-aware

# W1 试点自动化预检（辅助人工，非最终分）
node scripts/skills/audit-usability-pilot-auto.js --write

# W1 试点 Claude agent 亲撰复审（不调用 DeepSeek）
# 1. 撰写 data/skills/pilot-refine/pilot-bodies.json
# 2. node scripts/skills/import-pilot-refine.js --apply
cp data/skills/usability-manual-scores-pilot.template.json data/skills/usability-manual-scores-pilot.json
node scripts/skills/score-usability-manual.js --pilot --write

# 重生成 seed（上传 CDN 前）
bash scripts/generate-seed.sh

# 第二层可用性验收
node scripts/skills/validate-skill-usability.js

# 启发式全量扫描
node scripts/skills/audit-skill-usability-heuristic.js --write

# 按品类导出人工读稿样本
node scripts/skills/audit-skill-usability-sample.js --per-category 5
```

---

## 七、边界说明（如实）

- **确定性模板**无法让 46,400 条都达到 LLM 原创深度；目标是「岗位正确 + 步骤能执行 + 示例能照做」。  
- **8 个 meta 蓝图**适合作为 Agent 工作法，但若全部岗位共用同一套步骤，市场感知会是「换名模板」。  
- 本 TODO 完成前，对外应描述为：**「结构已入库，可用性审查与分品类真实化进行中」**，而非「46,400 技能已深度打磨可用」。

---

## 八、相关文件

| 文件 | 用途 |
|---|---|
| `docs/polish-role-skills-todo.md` | 结构打磨记录（v1.3.0） |
| `docs/role-skill-match-audit-todo.md` | 人格↔角色匹配 |
| `scripts/skills/polish-role-skills.js` | 确定性模板生成（非最终质量验收） |
| `scripts/skills/role-duty-helpers.js` | titleDuties 规则（**待修 P0**） |
| `data/skills/role-skill-mismatch-audit.json` | 人格分级审计 |
