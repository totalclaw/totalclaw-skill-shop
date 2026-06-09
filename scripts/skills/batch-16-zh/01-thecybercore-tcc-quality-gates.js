module.exports = {
  skillId: 'totalclaw:totalclaw~thecybercore-tcc-quality-gates',
  descriptionZh:
    '为典型 Web + API 应用定义并应用 6 个通用质量门（构建、测试、安全、性能、可维护性、发布就绪），通过 .defs/quality-gateway-definition.json 配置，生成 Markdown/JSON 报告与证据引用。',
  bodyZh: `# 质量门技能（通用 Web + API 应用）

## 目的
本技能为典型的应用项目定义并应用**6 个通用质量门**，这些项目包括：
- 后端 API 服务（任意技术栈）
- Web 前端（任意技术栈）
- CI/CD 流水线（任意提供商）

这些质量门以**对 LLM 友好的操作性语言**编写：如何一致地**检查**、**计算**、**评估**并**记录**结果。

本技能**与语言无关**，可用于任何代码仓库。它依赖一个中央配置文件：
- \`.defs/quality-gateway-definition.json\`（必须存储在代码仓库中，而非工作区中）

## 不可协商的存储规则
- 质量门定义文件必须放置在：\`REPO_ROOT/.defs/quality-gateway-definition.json\`
- 临时文件必须放到：\`REPO_ROOT/.tmp/quality-gates/\`（不要创建或删除其他工作区目录）
- 报告必须写入 JSON 配置中定义的仓库路径（下文给出建议的默认值）

## 输入
- 仓库根路径（REPO_ROOT）
- 可选的 CI 产物路径（如运行时提供）
- 可选的提交范围（用于聚焦于 PR 的评估）
- 可选的环境说明（目标负载、环境、风险等级）

## 输出
1. 人类可读的报告（Markdown）
2. 机器可读的报告（JSON），包含原始指标 + 各项检查的得分
3. 证据引用（路径、片段、CI 链接（如有））

建议的默认输出路径（可通过 JSON 配置覆盖）：
- \`docs/quality/quality-gate-report.md\`
- \`docs/quality/quality-gate-report.json\`
- 证据目录：\`docs/quality/evidence/\`

---

# 6 个质量门

每个质量门产出：
- **得分（Score）**：0–100
- **状态（Status）**：PASS / WARN / FAIL
- **阻塞行为**：某些质量门是"阻塞性的"（FAIL 会阻止发布）

所有质量门的阈值和权重都来自：
- \`.defs/quality-gateway-definition.json\`

---

## 质量门 1 —— 构建与依赖健康度
### 目标
确保系统能够可靠地构建和打包，且依赖项可管理、可安全交付。

### 需要检查的内容（典型检查）
- CI 流水线状态（默认分支 / PR 上为绿色）
- 可复现的构建或确定性打包指标
- 依赖新鲜度（陈旧/过时的依赖）
- 许可证策略合规性（白名单/黑名单）
- SBOM 是否存在（如有要求）

### 如何度量 / 计算
- 布尔检查：PASS=100，FAIL=0
- 比率检查（例如"过时依赖百分比"）：使用阈值缩放到 0–100
- 策略检查：如检测到禁用许可证则硬性 FAIL（若已启用）

### 需要收集的证据
- CI 任务摘要（或本地构建日志）
- 依赖清单报告输出（视工具而定，但保留报告文件）
- SBOM 产物路径（如有）
- 许可证扫描输出（如使用）

### 如何记录
在报告中包含：
- 构建命令/流水线名称
- 产物标识符 / 版本
- 依赖变更摘要与策略结果

---

## 质量门 2 —— 自动化测试与覆盖率
### 目标
通过自动化测试证明正确性并防止回归。

### 需要检查的内容
- 单元测试通过
- 集成/API 测试通过（或契约测试）
- E2E/冒烟测试通过（Web 应用）
- 代码覆盖率满足阈值（整体 + 关键组件）
- 不稳定测试率受控（若 CI 提供重试/不稳定标记）

### 如何度量 / 计算
- 测试通过：布尔值
- 覆盖率：数值百分比
  - 得分映射示例：
    - >= 目标：100
    - warn 与目标之间：线性 70–99
    - 低于 warn：线性 0–69
- 可选"关键路径覆盖率"额外加权

### 需要收集的证据
- 测试运行输出（JUnit/TRX 等）
- 覆盖率摘要文件
- 失败测试列表（如有）+ 链接

### 如何记录
- 执行的测试套件
- 覆盖率数值（整体 + 关键区域）
- 跳过测试说明（如允许）及理由

---

## 质量门 3 —— 安全与供应链
### 目标
防止已知漏洞、密钥泄露、不安全配置与供应链风险。

### 需要检查的内容
- 依赖漏洞（Critical/High/Medium 数量）
- 密钥扫描结果（泄露密钥必须为 0）
- 基本安全配置检查（CSP、TLS、认证边界等，如适用）
- SAST 发现严重度计数（如有工具）
- 容器镜像扫描（如有容器）

### 如何度量 / 计算
- 漏洞门控（典型）：
  - Critical = 0 必填（否则 FAIL）
  - High = 0 必填（或 <= allowedHigh）
  - Medium 允许在预算内（超出 warn 则 WARN）
- 密钥：任何密钥发现 => FAIL（阻塞）
- 得分：从 100 起按严重度与数量扣分（配置驱动）

### 需要收集的证据
- 漏洞扫描报告文件
- 密钥扫描输出（含文件路径与指纹 ID，非实际密钥）
- SAST 报告片段/摘要

### 如何记录
- 严重度计数及是否存在例外
- 任何例外必须包含：原因、负责人、过期日期（若组织使用豁免）

---

## 质量门 4 —— 性能与效率（API + Web）
### 目标
确保系统满足基线性能与用户体验目标。

### 需要检查的内容
API（典型）：
- p95 延迟低于目标
- 错误率低于目标
- 吞吐量满足预期负载（如已知）

Web（典型）：
- 参考设备/配置上的 Core Web Vitals（LCP、CLS、INP）
- 包体积 / 资源重量阈值（可选）

### 如何度量 / 计算
- 延迟得分：
  - p95 <= 目标：100
  - 目标与 warn 之间：线性 70–99
  - > warn：0–69（线性），超出"max"则硬性 FAIL
- 错误率：
  - <= 目标：100
  - <= warn：70–99
  - > warn：0–69，超出 max 则 FAIL
- Web vitals：
  - 各指标独立评分；加权合成 web 得分

### 需要收集的证据
- 负载测试或基准输出（k6/JMeter 等）
- APM 快照（如有）
- Lighthouse 或 Web Vitals 报告导出

### 如何记录
- 测试条件：环境、数据集大小、并发、设备配置
- 关键 p95 / 错误率 / vitals 数值
- 相对基线的显著回归

---

## 质量门 5 —— 可维护性与代码健康度
### 目标
保持代码库长期可理解、可变更、可审查。

### 需要检查的内容
- 静态分析质量（lint 错误、规则违规）
- 复杂度阈值（圈复杂度、过大函数/类）
- 重复率
- "变更风险"信号（热点：频繁变更 + 高复杂度）
- 公共 API 文档覆盖率（如端点文档、组件文档）

### 如何度量 / 计算
- 问题密度：每 KLOC 发现数（或小仓库按文件）
- 复杂度得分：超出复杂度阈值的单元百分比
- 重复：重复行百分比
- 得分：归一化子得分的加权平均（配置驱动）

### 需要收集的证据
- 静态分析摘要
- 复杂度与重复报告（任意工具均可；保存输出）
- 热点列表及原因（文件 + 指标）

### 如何记录
- 按影响排序的前 10 个问题
- 仅在被要求时给出具体重构建议；否则仅列出发现

---

## 质量门 6 —— 发布就绪与可操作性（可观测性 + Runbook）
### 目标
确保系统可在生产环境安全运行。

### 需要检查的内容
- 健康检查端点存在且有意义
- 日志结构化并包含关联 ID
- 关键信号（延迟、错误率、饱和度）有指标与仪表盘
- 为 SLO 违规 / 错误预算消耗配置告警（如适用）
- 主要故障模式有 Runbook（部署回滚、事件分诊）
- 存在版本管理与 changelog/发布说明

### 如何度量 / 计算
主要为"存在性 + 完整度"评分：
- 每个必需产物为布尔检查
- 可选成熟度量表：0（缺失）、50（部分）、100（完整）
- 未满足"最低可操作性"则阻塞（配置驱动）

### 需要收集的证据
- Runbook、仪表盘即代码、告警配置的路径
- 日志/指标/追踪文档样例
- 值班/运维说明（如有）

### 如何记录
- 列出缺失的运维产物
- 最低上线检查清单状态

---

# 标准评估算法（LLM 可执行）

## 步骤 1：加载配置
- 读取 \`REPO_ROOT/.defs/quality-gateway-definition.json\`
- 按 schema 描述校验（见下文）
- 若字段缺失，使用 JSON 中的 documented defaults

## 步骤 2：按检查项收集指标
对每个门：
- 对每项检查：
  - 识别数据源：
    - 优先使用 CI 产物（如提供）
    - 否则使用仓库文件与本地命令（若运行时允许）
  - 产出指标值（数字/布尔/字符串）与证据引用

## 步骤 3：为每项检查评分（0–100）
使用每项检查定义的评分方法：
- \`boolean\`：通过 => 100，失败 => 0
- \`threshold_range\`：warn 与 target 之间线性评分
- \`penalty_by_count\`：从 100 起按问题数扣分
- \`rubric\`：将 {missing/partial/complete} 映射为 {0/50/100}

## 步骤 4：为每个质量门评分
- 计算其检查的加权平均
- 用配置阈值确定门状态：
  - Score >= passScore => PASS
  - Score >= warnScore => WARN
  - 否则 => FAIL
- 若门标记 \`blockingOnFail=true\`，任何 FAIL 阻塞发布

## 步骤 5：生成报告
写入：
1) Markdown 报告（人类）
2) JSON 报告（机器）
包含：
- 各门得分/状态
- 各检查指标 + 证据路径
- 总体得分与总体状态
- 如有则列出 explicit "BLOCKERS"

---

# 报告模板（Markdown）
在 \`docs/quality/quality-gate-report.md\` 中使用以下大纲（除非 JSON 覆盖路径）：

## 摘要
- 总体得分：
- 总体状态：
- 阻塞性失败：
- 日期/提交：

## 质量门结果
| Gateway | Score | Status | Key Metrics | Evidence |
|---|---:|---|---|---|

## 详情（按质量门）
### <Gateway Name>
- 得分/状态
- 检查项：
  - <Check>：metric=..., score=..., evidence=...
- 备注 / 例外

---

# quality-gateway-definition.json — JSON Schema 描述

配置文件为普通 JSON 文档，包含：

## Root
- \`schemaVersion\` (string) — 本配置布局版本
- \`projectProfile\` (object) — 用于默认值的上下文
- \`scoring\` (object) — 全局 pass/warn 阈值与聚合规则
- \`reporting\` (object) — 输出路径与证据目录
- \`gates\` (array) — 质量门定义列表（本技能恰好 6 个）

## projectProfile (object)
- \`applicationType\` (string) — 如 \`"web_api_and_web"\`
- \`riskLevel\` (string) — \`"low"|"medium"|"high"\`
- \`releaseCadence\` (string) — 如 \`"daily"|"weekly"|"monthly"\`
- \`expectedLoad\` (object, optional)
  - \`apiRps\` (number)
  - \`concurrency\` (number)

## scoring (object)
- \`passScore\` (number 0–100)
- \`warnScore\` (number 0–100)
- \`overallAggregation\` (string) — \`"weighted_average"\`
- \`blockIfAnyBlockingGateFails\` (boolean)

## reporting (object)
- \`markdownReportPath\` (string, 相对仓库)
- \`jsonReportPath\` (string, 相对仓库)
- \`evidenceDir\` (string, 相对仓库)
- \`tempDir\` (string, 相对仓库；必须在 \`.tmp/quality-gates/\` 内)

## gates (array of objects)
每个门：
- \`id\` (string) — 稳定标识符
- \`name\` (string)
- \`description\` (string)
- \`weight\` (number) — 总体得分中的相对权重
- \`blockingOnFail\` (boolean)
- \`checks\` (array)

## checks (array of objects)
每项检查：
- \`id\` (string)
- \`name\` (string)
- \`description\` (string)
- \`weight\` (number)
- \`metricType\` (string) — \`"boolean"|"percentage"|"count"|"duration_ms"|"rubric"\`
- \`scoringMethod\` (string) — \`"boolean"|"threshold_range"|"penalty_by_count"|"rubric"\`
- \`thresholds\` (object) — 取决于 scoringMethod：
  - \`threshold_range\`：
    - \`target\` (number)
    - \`warn\` (number)
    - \`max\` (number, optional hard-fail)
    - \`direction\` (string) — \`"higher_is_better"|"lower_is_better"\`
  - \`penalty_by_count\`：
    - \`allowed\` (number)
    - \`warnAbove\` (number)
    - \`failAbove\` (number)
    - \`penaltyPerUnit\` (number)
- \`evidenceHints\` (array of strings) — 在通用仓库/CI 中查找证据的位置
- \`notes\` (string, optional)

---

# 操作说明
- 若无法度量某指标，不要编造数字。
  - 在 JSON 报告中将该检查标记为 \`"unknown"\`，并按配置的 fallback 规则评分（建议：unknown 为 WARN 得分 70，除非为 security/secrets 检查，unknown 应为 FAIL）。
- 始终包含证据引用（路径或 CI 产物名称）。
- 所有临时工作保持在 \`.tmp/quality-gates/\` 内。

# JSON 参考
- \`templ/quality-gateway-definition-template.json\`（模板设置文件。缺失时可复制到 \`REPO_ROOT/.defs/quality-gateway-definition.json\`）
`,
};
