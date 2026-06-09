module.exports = {
  skillId: 'totalclaw:totalclaw~org-health-diagnostic',
  descriptionZh:
    '跨职能组织健康检查，汇总各 C-Suite 角色信号。8 个维度红绿灯评分并附钻取建议。适用于评估整体公司健康、准备董事会评审、识别高风险职能，或用户提及组织健康、健康检查、健康仪表盘。',
  bodyZh: `# 组织健康诊断

八个维度。红绿灯。真实基准。发现你还不知道的问题。

## 关键词
组织健康、健康诊断、健康仪表盘、健康检查、公司健康、职能健康、团队健康、初创健康、健康记分卡、健康评估、风险仪表盘

## 快速开始

\`\`\`bash
python scripts/health_scorer.py        # 引导式 CLI — 输入指标，获评分仪表盘
python scripts/health_scorer.py --json # 输出原始 JSON 供集成
\`\`\`

或描述你的指标：
\`\`\`
/health [粘贴关键指标或回答提示]
/health:dimension [financial|revenue|product|engineering|people|ops|security|market]
\`\`\`

## 8 个维度

### 1. 💰 财务健康（CFO）
**衡量什么：** 能否支撑运营并投资增长？

关键指标：
- **跑道（Runway）** — 按当前烧钱可维持月数（绿：>12，黄：6–12，红：<6）
- **烧钱倍数** — 净烧钱 / 净新增 ARR（绿：<1.5x，黄：1.5–2.5x，红：>2.5x）
- **毛利率** — SaaS 目标：>65%（绿：>70%，黄：55–70%，红：<55%）
- **月环比增长** — 按阶段 contextual（见基准）
- **收入集中度** — 最大客户占 ARR %（绿：<15%，黄：15–25%，红：>25%）

### 2. 📈 收入健康（CRO）
**衡量什么：** 客户是否留存、扩张并推荐我们？

关键指标：
- **NRR（净收入留存）** — 绿：>110%，黄：100–110%，红：<100%
- **Logo 流失率（年化）** — 绿：<5%，黄：5–10%，红：>10%
- **下季度管线覆盖** — 绿：>3x，黄：2–3x，红：<2x
- **CAC 回收期** — 绿：<12 月，黄：12–18，红：>18 月
- **平均 ACV 趋势** — 方向：增长、持平、下降

### 3. 🚀 产品健康（CPO）
**衡量什么：** 客户是否喜爱并使用产品？

关键指标：
- **NPS** — 绿：>40，黄：20–40，红：<20
- **DAU/MAU** — 参与度代理（绿：>40%，黄：20–40%，红：<20%）
- **核心功能采用** — 使用主价值功能的用户 %（绿：>60%）
- **价值实现时间** — 注册到首次核心行为天数（越短越好）
- **CSAT** — 绿：>4.2/5，黄：3.5–4.2，红：<3.5

### 4. ⚙️ 工程健康（CTO）
**衡量什么：** 能否可靠交付并维持速度？

关键指标：
- **部署频率** — 绿：每日，黄：每周，红：每月或更少
- **变更失败率** — 导致事故的部署 %（绿：<5%，红：>15%）
- **MTTR** — 绿：<1 小时，黄：1–4 小时，红：>4 小时
- **技术债比例** — Sprint 容量中用于还债 %（绿：<20%，黄：20–35%，红：>35%）
- **事故频率** — 每月 P0/P1（绿：<2，黄：2–5，红：>5）

### 5. 👥 人员健康（CHRO）
**衡量什么：** 团队是否稳定、投入并成长？

关键指标：
- **遗憾流失（年化）** — 绿：<10%，黄：10–20%，红：>20%
- **敬业度** — eNPS 等（绿：>30，黄：0–30，红：<0）
- **招聘周期（平均天）** — 绿：<45，黄：45–90，红：>90
- **经理与 IC 比例** — 绿：1:5–1:8，黄：1:3–1:5 或 1:8–1:12，红：超出范围
- **内部晋升率** — 高级岗位至少 25–30% 内部填补

### 6. 🔄 运营健康（COO）
**衡量什么：** 是否纪律化执行战略？

关键指标：
- **OKR 完成率** — 关键结果达标 %（绿：>70%，黄：50–70%，红：<50%）
- **决策周期** — 从需决策到做出决策天数（绿：<48h，黄：48h–1 周）
- **会议有效性** — 有明确结果的会议 %（定性）
- **流程成熟度** — 1–5 级（见 COO 顾问）
- **跨职能项目完成** — 按时按范围 %

### 7. 🔒 安全健康（CISO）
**衡量什么：** 是否保护客户并维持合规？

关键指标：
- **安全事件（近 90 天）** — 绿：0，黄：1–2 轻微，红：1+ 重大
- **合规状态** — 认证有效/进行中 vs 逾期
- **漏洞修复 SLA** — 关键 CVE 在 SLA 内修复 %（绿：100%）
- **安全培训完成** — 团队完成 %（绿：>95%）
- **渗透测试时效** — 绿：<12 月，黄：12–24，红：>24 月

### 8. 📣 市场健康（CMO）
**衡量什么：** 是否在市场获胜并高效增长？

关键指标：
- **CAC 趋势** — 环比改善、持平或恶化
- **自然 vs 付费线索占比** — 自然越多越健康
- **赢单率** — 合格机会成交 %（绿：>25%，黄：15–25%，红：<15%）
- **对主要竞品赢单率**
- **品牌 NPS** — ICP 中的认知与偏好

---

## 评分与红绿灯

每维度 1–10 分配红绿灯：
- 🟢 **绿（7–10）：** 健康 — 维持并优化
- 🟡 **黄（4–6）：** 关注 — 看趋势；改善还是恶化？
- 🔴 **红（1–3）：** 需行动 — 30 天内处理

**整体健康分：**
按公司阶段加权平均（权重见 \`references/health-benchmarks.md\`）。

---

## 维度联动（一个问题如何引发下一个）

| 若此维度为红... | 接下来关注这些维度 |
|-----------------------------|----------------------------|
| 财务健康 | 人员（冻结招聘）→ 工程（冻结基建）→ 产品（削减范围） |
| 收入健康 | 财务（现金缺口）→ 人员（流失风险）→ 市场（定位失守） |
| 人员健康 | 工程（速度下降）→ 产品（质量下降）→ 收入（流失上升） |
| 工程健康 | 产品（功能延期）→ 收入（交易因产品停滞） |
| 产品健康 | 收入（NRR 降、流失升）→ 市场（CAC 升；推荐枯竭） |
| 运营健康 | 各维度随时间全面恶化（执行失败级联） |

---

## 仪表盘输出格式

\`\`\`
ORG HEALTH DIAGNOSTIC — [Company] — [Date]
Stage: [Seed/A/B/C]   Overall: [Score]/10   Trend: [↑ Improving / → Stable / ↓ Declining]

DIMENSION SCORES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💰 Financial    🟢 8.2  Runway 14mo, burn 1.6x — strong
📈 Revenue      🟡 5.8  NRR 104%, pipeline thin (1.8x coverage)
🚀 Product      🟢 7.4  NPS 42, DAU/MAU 38%
⚙️  Engineering  🟡 5.2  Debt at 30%, MTTR 3.2h
👥 People       🔴 3.8  Attrition 24%, eng morale low
🔄 Operations   🟡 6.0  OKR 65% completion
🔒 Security     🟢 7.8  SOC 2 Type II complete, 0 incidents
📣 Market       🟡 5.5  CAC rising, win rate dropped to 22%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TOP PRIORITIES
🔴 [1] People: attrition at 24% — engineering velocity will drop in 60 days
   Action: CHRO + CEO to run retention audit; target top 5 at-risk this week
🟡 [2] Revenue: pipeline coverage at 1.8x — Q+1 miss risk is high
   Action: CRO to add 3 qualified opps within 30 days or shift forecast down
🟡 [3] Engineering: tech debt at 30% of sprint — shipping will slow by Q3
   Action: CTO to propose debt sprint plan; COO to protect capacity

WATCH
→ People → Engineering cascade risk if attrition continues (see dimension interactions)
\`\`\`

---

## 优雅降级

不必具备全部指标即可诊断。工具处理部分数据：
- 缺失指标 → 不计入分数，标记为「[需数据]」
- 可用维度分数仍有效
- 报告标明下次需补全的缺口

## 参考
- \`references/health-benchmarks.md\` — 各阶段基准（Seed、A、B、C）
- \`scripts/health_scorer.py\` — 带红绿灯输出的 CLI 评分工具`,
};
