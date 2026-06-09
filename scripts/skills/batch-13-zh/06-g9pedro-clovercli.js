module.exports = {
  skillId: 'totalclaw:totalclaw~g9pedro-clovercli',
  descriptionZh:
    'Clover POS API 命令行工具，支持库存、订单、支付、客户、员工、折扣与报表分析。v1.2.0 含 90 天分块、重试逻辑与周期快捷方式。',
  bodyZh: `# CloverCLI 技能

用于 Clover POS API 的命令行工具 — 库存、订单、支付、客户、员工、折扣和分析。

**版本**：1.2.0（90 天分块、重试逻辑、周期快捷方式、折扣、税费、付款方式）

## 安装设置

\`\`\`bash
# 从 npm 安装
npm i -g @versatly/clovercli

# 或克隆并构建
cd ~/Projects
git clone https://github.com/Versatly/clovercli.git
cd clovercli && npm install && npm run build

# 设置凭据（添加到 ~/.bashrc）
export CLOVER_ACCESS_TOKEN="your-token"
export CLOVER_MERCHANT_ID="your-merchant-id"

# 可选别名
alias clover='clovercli'
\`\`\`

## 快速参考

\`\`\`bash
# 检查连接
clovercli auth status
clovercli merchant get

# 业务仪表盘
clovercli reports summary
\`\`\`

## 带周期快捷方式的报表 ✨

\`\`\`bash
# 使用 --period（v1.2.0 新增）
clovercli reports sales --period today
clovercli reports sales --period yesterday
clovercli reports sales --period this-week
clovercli reports sales --period last-week
clovercli reports sales --period this-month
clovercli reports sales --period last-month
clovercli reports sales --period mtd          # 月初至今
clovercli reports sales --period ytd          # 年初至今

# 或使用显式日期
clovercli reports sales --from 2026-01-01 --to 2026-01-31
clovercli reports daily --period this-month
clovercli reports hourly --date 2026-02-03
clovercli reports top-items --limit 20
clovercli reports payments
clovercli reports refunds
clovercli reports taxes
clovercli reports categories
clovercli reports employees
clovercli reports compare --period1-from ... --period2-from ...

# 导出数据
clovercli reports export orders --output orders.csv --format csv
clovercli reports export items --output items.json
\`\`\`

## 商户设置

\`\`\`bash
# 商户信息
clovercli merchant get

# 税率
clovercli merchant taxes list

# 付款方式
clovercli merchant tenders list
\`\`\`

## 折扣（v1.2.0+）

\`\`\`bash
clovercli discounts list
clovercli discounts get <id>
clovercli discounts create --name "10% Off" --percentage 10
clovercli discounts create --name "$5 Off" --amount 500
clovercli discounts delete <id>
\`\`\`

## 库存

\`\`\`bash
clovercli inventory items list
clovercli inventory items get <id>
clovercli inventory categories list
clovercli inventory stock list
\`\`\`

## 订单与支付

\`\`\`bash
clovercli orders list --limit 50
clovercli orders get <id>

clovercli payments list --limit 50
clovercli payments get <id>
\`\`\`

## 客户与员工

\`\`\`bash
clovercli customers list
clovercli customers get <id>

clovercli employees list
clovercli employees get <id>
\`\`\`

## 原始 API 访问

\`\`\`bash
clovercli api get '/v3/merchants/{mId}/tax_rates'
clovercli api get '/v3/merchants/{mId}/modifiers'
\`\`\`

## 输出格式

所有 list 命令都支持：
- \`--output table\`（默认）— 格式化表格
- \`--output json\` — 原始 JSON
- \`--quiet\` — 仅输出 ID

## 可靠性特性（v1.2.0+）

- **90 天自动分块**：较长的日期范围会自动拆分为多个块
- **指数退避**：触发速率限制时按退避策略自动重试
- **Retry-after 支持**：遵循 Clover 的 retry-after 响应头

## 地区

| 地区 | 用途 |
|--------|-----|
| \`us\` | 美国商户（默认） |
| \`eu\` | 欧洲 |
| \`la\` | 拉丁美洲 |
| \`sandbox\` | 开发/测试 |

通过以下方式设置：\`export CLOVER_REGION=eu\`

## 已知客户

| 客户 | Merchant ID | 备注 |
|--------|-------------|-------|
| REMEMBR | 6KF70H0B6E041 | Mauricio 的巴西餐厅（Pedro 的父亲） |

## 来源

- npm: https://www.npmjs.com/package/@versatly/clovercli
- GitHub: https://github.com/Versatly/clovercli`,
};
