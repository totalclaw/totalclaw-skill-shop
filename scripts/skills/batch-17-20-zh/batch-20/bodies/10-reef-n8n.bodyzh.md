# n8n 自动化 — 快速构建与交付工作流

使用我们包含 2,061 个模板的库来构建、定制并交付 n8n 工作流。
参考：`~/projects/n8n-workflows/` — 按集成文件夹浏览。
我们的 n8n 实例：`localhost:5678`（启动前需执行 `fnm use 22`）。
所有输出保存至 `workspace/artifacts/`。

## 适用场景
- 为客户（Upwork、Alfred、直接客户）构建 n8n 工作流
- 针对特定用例定制库中模板
- 调试或优化现有 n8n 工作流
- 在构建前设计工作流架构
- 估算工作流项目的交付时间
- 导入/导出工作流 JSON

## 不适用场景
- 寻找 Upwork 工作（使用 upwork-hunting 技能）
- 撰写客户提案（使用 proposal-writing 技能）
- 与 n8n 无关的通用编码任务
- Zapier/Make.com 构建（不同平台、不同节点）

## 反例
- 「帮我在 Upwork 上找自动化工作」→ 否。请使用 upwork-hunting。
- 「帮我写个 Python 脚本」→ 否。本技能专用于 n8n。
- 「帮我搭建 n8n 服务器」→ 边界情况。基础设施搭建属于运维，但凭证配置适合本技能。

## 边界情况
- 工作流使用自定义 JavaScript（Code 节点）→ 是。n8n 支持内联 JS。
- 客户需要 Zapier→n8n 迁移 → 是。将 Zapier 触发器/动作映射到 n8n 等价物。
- 工作流需要没有 n8n 节点的外部 API → 是。使用 HTTP Request 节点。
- 多工作流编排 → 是。使用 Execute Workflow 节点。

---

## 模板库快速参考

**位置：** `~/projects/n8n-workflows/workflows/`
**结构：** `workflows/[IntegrationName]/[id]_[integration]_[action]_[trigger].json`

### 查找合适模板
```bash
# 列出某集成的所有模板
ls ~/projects/n8n-workflows/workflows/Twilio/

# 跨所有工作流搜索
find ~/projects/n8n-workflows/workflows/ -name "*.json" | grep -i "shopify"

# 统计各集成的模板数量
ls ~/projects/n8n-workflows/workflows/ | while read d; do echo "$(ls ~/projects/n8n-workflows/workflows/$d/ | wc -l) $d"; done | sort -rn | head -20
```

### 热门集成文件夹（按 Upwork 需求）
| 集成 | 路径 | 常见工作 |
|-------------|------|-------------|
| Gmail | workflows/Gmail/ | 自动回复、线索捕获、通知 |
| Google Sheets | workflows/Googlesheets/ | 数据记录、报表、同步 |
| Slack | workflows/Slack/ | 通知、机器人、CRM 同步 |
| Twilio | workflows/Twilio/ | SMS 自动化、呼叫路由、告警 |
| Telegram | workflows/Telegram/ | 聊天机器人、通知、AI 助手 |
| WhatsApp | workflows/Whatsapp/ | 商业消息、聊天机器人 |
| Shopify | workflows/Shopify/ | 订单通知、库存同步 |
| HubSpot | workflows/Hubspot/ | CRM 自动化、线索路由 |
| Calendly | workflows/Calendly/ | 预约确认、跟进 |
| OpenAI | workflows/Openai/ | AI 聊天机器人、内容生成 |
| Webhook | workflows/Webhook/ | 自定义触发器、API 集成 |
| Airtable | workflows/Airtable/ | 数据库同步、表单处理 |

---

## 工作流构建流程

### 步骤 1：评估需求
根据客户发现，回答：
- 什么**触发**工作流？（webhook、定时、表单、应用事件）
- 需要执行哪些**动作**？（发邮件、更新 CRM、创建记录）
- 需要流转哪些**数据**？（字段、格式、转换）
- 需要哪些**错误处理**？（重试、回退、告警）
- 需要哪些**凭证**？（API 密钥、OAuth 等）

### 步骤 2：查找匹配模板
```bash
# 搜索相关模板
find ~/projects/n8n-workflows/workflows/ -name "*.json" | xargs grep -l "keyword" 2>/dev/null
```

或按集成文件夹浏览。多数工作需拼接 2-3 个模板。

### 步骤 3：导入与定制
1. 复制模板 JSON
2. 在 n8n 中：菜单 → 从文件导入（或粘贴 JSON）
3. 更新凭证（客户的 API 密钥）
4. 更新字段映射（他们的数据结构）
5. 调整触发器设置（他们的 webhook URL、时间表等）
6. 添加错误处理节点（Error Trigger → 通知）

### 步骤 4：测试
- 使用 n8n 的**手动执行**逐步测试每个节点
- 验证节点间数据流转正确
- 测试错误路径（API 宕机时会发生什么？）
- 检查速率限制（尤其是批量操作）

### 步骤 5：文档与交付
每个交付的工作流包含：
```
## 工作流：[名称]
**触发器：** [启动条件]
**步骤：** [1. → 2. → 3.]
**所需凭证：** [列表]
**测试：** [如何验证可用]
**维护：** [可能出什么问题及如何修复]
```

---

## 常见工作流模式

### 模式 1：触发 → 转换 → 动作
最简单也最常用。事件发生 → 处理数据 → 执行操作。
```
[Webhook/表单/定时] → [Set/Code 节点：转换数据] → [发邮件/更新 CRM/创建记录]
```

### 模式 2：触发 → 分支 → 多动作
根据条件产生不同结果。
```
[触发器] → [IF 节点：检查条件] → True：[动作 A] / False：[动作 B]
```

### 模式 3：定时批量处理
周期性批量操作。
```
[Cron/定时] → [从 Sheet/DB 获取数据] → [循环：处理每项] → [每项执行动作]
```

### 模式 4：Webhook API 端点
n8n 作为其他服务调用的 API。
```
[Webhook：接收请求] → [处理] → [Respond to Webhook：返回数据]
```

### 模式 5：多步骤流水线
含多个阶段的复杂工作流。
```
[触发器] → [数据丰富] → [路由/拆分] → [多动作] → [聚合] → [最终动作]
```

### 模式 6：容错工作流
生产级，含错误处理。
```
[触发器] → [Try：主流程] → [Catch：Error Trigger] → [通过 Slack/邮件告警]
```

---

## 节点速查表

| 需求 | 节点 | 说明 |
|------|------|-------|
| 自定义逻辑 | Code | JavaScript，可访问全部数据 |
| API 调用（无原生节点） | HTTP Request | 适用于任意 REST API |
| 条件路由 | IF / Switch | 按数据分支 |
| 遍历项目 | Split In Batches | 逐项处理 |
| 等待/延迟 | Wait | 步骤间暂停 |
| 合并数据 | Merge | 合并分支数据 |
| 转换数据 | Set | 重命名/重构字段 |
| 定时 | Schedule Trigger | Cron 表达式 |
| Webhook | Webhook | 接收外部 HTTP 调用 |
| 响应 | Respond to Webhook | 向调用方返回数据 |
| 错误处理 | Error Trigger | 捕获工作流错误 |
| 子工作流 | Execute Workflow | 调用另一工作流 |

---

## 凭证设置清单

交付给客户前，确保：
- [ ] 所有凭证使用**他们的** API 密钥（绝不用我们的）
- [ ] OAuth 令牌已连接**他们的**账户
- [ ] Webhook URL 指向**他们的** n8n 实例（若我们托管则指向我们的）
- [ ] 节点中未硬编码敏感数据（使用凭证存储）
- [ ] 在生产环境测试凭证可用（不仅是沙箱）

---

## 交付清单

- [ ] 工作流已用真实数据端到端测试
- [ ] 已配置错误处理节点
- [ ] 已撰写文档（触发器、步骤、凭证、维护）
- [ ] 已导出工作流 JSON 作为备份
- [ ] 客户可独立导入并运行
- [ ] 已测试边界情况（空数据、API 错误、速率限制）
- [ ] 交付中包含工作流运行截图

---

## 估算指南

| 复杂度 | 描述 | 时间 | 价格区间 |
|------------|-------------|------|-------------|
| 简单 | 2-3 个节点，单触发→动作 | 1-2 小时 | $100-300 |
| 标准 | 4-8 个节点，分支、转换 | 2-4 小时 | $300-600 |
| 复杂 | 10+ 节点，多 API、错误处理 | 4-8 小时 | $600-1,200 |
| 企业级 | 多工作流、数据库、自定义代码 | 8-20 小时 | $1,200-3,000 |

**我们的速度优势：** 模板可将上述时间缩短 40-60%。

---

## n8n 实例管理

**启动 n8n：**
```bash
eval "$(fnm env)" && fnm use 22 && nohup n8n start > /tmp/n8n.log 2>&1 &
```

**访问：** http://localhost:5678

**通过 API 导入工作流：**
```bash
curl -X POST http://localhost:5678/api/v1/workflows \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: $N8N_API_KEY" \
  -d @workflow.json
```

**我们已配置的凭证：**
- Twilio API Auth（ID：2hP5kiyhResadXrF）
- 更多按客户添加
