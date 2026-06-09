module.exports = {
  skillId: 'totalclaw:totalclaw~kesslerio-stripe-cli',
  descriptionZh:
    '封装 Stripe CLI 的通用技能，用于支付处理、Webhook 测试与 API 操作，可选 ShapeScale 诊所管理扩展。',
  bodyZh: `# Stripe CLI 技能 🧾

封装 Stripe CLI 的通用 Moltbot 技能，用于支付处理、Webhook 测试与 API 操作。包含可选的 ShapeScale 诊所管理扩展。

## 功能

- 处理支付、退款与订阅
- 管理客户与发票
- 本地测试 Webhook
- 执行 Stripe 通用 API 调用
- **ShapeScale 扩展**（可选）：诊所预设、订阅计划、订单集成

## 安装

### 1. 安装 Stripe CLI

**macOS：**
\`\`\`bash
brew install stripe/stripe-cli/stripe
\`\`\`

**Linux：**
\`\`\`bash
# 从 https://github.com/stripe/stripe-cli/releases 下载
wget https://github.com/stripe/stripe-cli/releases/download/v1.34.0/stripe_1.34.0_linux_amd64.deb
sudo dpkg -i stripe_1.34.0_linux_amd64.deb
\`\`\`

**认证：**
\`\`\`bash
stripe login
\`\`\`

### 2. 设置环境变量

\`\`\`bash
export STRIPE_SECRET_KEY=sk_test_your_key_here
\`\`\`

或使用 1Password：
\`\`\`bash
op read "op://Stripe/Secret Key" --vault Personal
\`\`\`

### 3. 克隆到 Skills

\`\`\`bash
cd ~/.moltbot/skills/
git clone https://github.com/mkessler/stripe-cli-moltbot-skill.git stripe
\`\`\`

## 用法

### 通用命令

| 调用方式 | 说明 |
|------------|-------------|
| \`Create a test customer for $50\` | 创建客户 + $50 支付意图 |
| \`List my recent payments\` | 列出最近 10 条支付意图 |
| \`Check payment status for pi_xxx\` | 获取支付意图详情 |
| \`Refund payment pi_xxx\` | 全额退款 |
| \`Trigger payment_intent.succeeded webhook\` | 模拟 Webhook 事件 |
| \`Listen for webhooks for 30s\` | 将 Webhook 转发至 localhost |
| \`Get customer details for cus_xxx\` | 获取客户记录 |

### ShapeScale 扩展（可选）

需要 \`config/shapescale-presets.json\`：

| 调用方式 | 说明 |
|------------|-------------|
| \`Create clinic deposit for PracticeXYZ\` | 创建客户 + 定金模板 |
| \`Create monthly subscription for clinic\` | 从预设创建周期性支付 |
| \`Generate invoice for order #1234\` | 从模板创建发票 |
| \`Check order status 1234\` | 与 shapescale-db 交叉引用 |

## 配置

### 通用

无需配置文件。使用 \`STRIPE_SECRET_KEY\` 环境变量。

### ShapeScale 预设（可选）

创建 \`config/shapescale-presets.json\`：

\`\`\`json
{
  "clinic_templates": {
    "standard": { "deposit": 5000, "terms": "net30" },
    "premium": { "deposit": 10000, "terms": "net30" }
  },
  "subscription_plans": {
    "monthly": { "amount": 39900, "interval": "month" },
    "annual": { "amount": 399000, "interval": "year" }
  },
  "tax_rate": 0.0875,
  "default_currency": "usd"
}
\`\`\`

### 环境变量

| 变量 | 必填 | 说明 |
|----------|----------|-------------|
| \`STRIPE_SECRET_KEY\` | 是 | Stripe 密钥（测试或生产） |
| \`STRIPE_WEBHOOK_ENDPOINT\` | 否 | Webhook 转发 URL（默认：http://localhost:4242） |
| \`SHAPESCALE_PRESETS_PATH\` | 否 | shapescale-presets.json 路径 |

## 文件结构

\`\`\`
stripe/
├── SKILL.md                    # 本文件
├── scripts/
│   ├── stripe.sh               # 通用 CLI 封装
│   └── shapescale-ext.sh       # ShapeScale 扩展（可选）
├── config/
│   └── shapescale-presets.json # 诊所/订阅模板
├── patterns/
│   └── examples.md             # 使用示例
└── README.md                   # 安装指南（自动生成）
\`\`\`

## 状态

**无状态** — 纯函数式输入输出。所有状态存储在 Stripe 中。

## 与其他技能的集成

| 技能 | 集成 |
|-------|-------------|
| \`shapescale-crm\` | 将 Stripe 客户 ID 关联到 CRM 记录 |
| \`shapescale-sales\` | 订单 → 支付意图创建 |
| \`campaign-orchestrator\` | 支付失败 → 跟进活动 |
| \`shapescale-db\` | 将支付匹配到数据库订单 |

## 发布

本技能已发布至 ClawdHub，地址：
https://github.com/mkessler/stripe-cli-moltbot-skill

## 许可证

MIT License - 详见 LICENSE 文件。`,
};
