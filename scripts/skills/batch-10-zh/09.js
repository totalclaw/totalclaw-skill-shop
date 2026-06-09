module.exports = {
  skillId: 'totalclaw:totalclaw~avirweb-twenty-oauth-mastery',
  descriptionZh:
    'Twenty CRM OAuth 专家级技能，涵盖 Google/Microsoft OAuth 实现、令牌刷新、域限制与故障排除。',
  bodyZh: `# Twenty CRM OAuth 精通技能

**作者**：从 OpenCode 中大量 OAuth 调试会话生成
**最后更新**：2026-02-08
**版本**：1.0

---

## 技能元数据

\`\`\`yaml
name: twenty-oauth-mastery
description: Expert-level OAuth authentication knowledge for Twenty CRM including implementation, troubleshooting, and best practices
expertise_level: Expert/Mastery
category: Authentication
applicable_to:
  - Twenty CRM authentication
  - Google/Microsoft OAuth
  - Token refresh management
  - Domain restrictions
  - Email/Calendar sync integration
\`\`\`

---

## 快速开始

### 何时使用本技能

在以下场景使用：

✅ **实现** 新 OAuth 提供商
✅ **修复** OAuth 登录问题
✅ **设置** OAuth 后自动 Gmail/Calendar 同步
✅ **调试** 令牌刷新失败
✅ **配置** 域限制
✅ **排除** 重定向循环

### 常见问题快速参考

| 问题 | 检查文件 | 快速修复 |
|-------|---------------|-----------|
| 重定向循环 | \`auth.service.ts\` | 重建：\`npx nx build twenty-server\` |
| .co 域被阻止 | \`google-auth.controller.ts\` | 添加到白名单：\`['company.com', 'company.co']\` |
| 同步未启动 | \`google.auth.strategy.ts\` | 在 validate() 中返回令牌 |
| Cookie 不可读 | Controller cookie 设置 | 设置 \`httpOnly: false\` |
| 无限循环 | \`SignInUpGlobalScopeFormEffect.tsx\` | 跟踪已处理令牌签名 |

---

## 核心知识

### 1. Twenty CRM OAuth 架构

**关键文件**：\`twenty/packages/twenty-server/src/engine/core-modules/auth/\`

**结构**：
\`\`\`
auth/
├── strategies/         # Passport 策略（Google、Microsoft）
├── controllers/        # OAuth 端点与回调
├── services/          # 认证逻辑、同步设置、令牌管理
├── guards/            # 认证守卫与验证
└── utils/             # 作用域配置、工具
\`\`\`

### 2. OAuth 流程要点

- Google/Microsoft 策略在 \`validate()\` 中必须返回完整令牌对象
- 回调控制器负责设置会话 cookie 并触发同步
- 令牌刷新由专用服务处理，失败时记录并提示重新认证

### 3. 域限制

在 \`google-auth.controller.ts\` 中配置允许域列表。支持多域与 \`.co\` 等 TLD。

### 4. 同步集成

OAuth 成功后自动启动 Gmail/Calendar 同步：
- 检查 \`google.auth.strategy.ts\` 的 validate 返回值
- 确认 sync 服务收到 refresh_token
- 验证 webhook/轮询配置

### 5. 前端陷阱

- 重定向循环：检查 token 处理是否重复触发
- Cookie 设置：\`httpOnly: false\` 供前端读取（若需要）
- 令牌签名去重：防止同一 OAuth 响应多次处理

---

## 调试清单

1. 检查服务器日志中的 OAuth 回调错误
2. 验证 Google Cloud / Azure 控制台中的重定向 URI
3. 确认环境变量：\`AUTH_GOOGLE_CLIENT_ID\`、\`AUTH_GOOGLE_CLIENT_SECRET\` 等
4. 重建 twenty-server 后重试
5. 清除浏览器 cookie 与会话后重新登录

---

## 最佳实践

- 始终在 validate() 返回完整令牌集（access + refresh）
- 为生产环境配置严格域白名单
- 实现令牌刷新失败时的优雅降级
- 记录 OAuth 事件但不记录令牌明文
- 定期轮换客户端密钥

---

## 关键词

oauth, authentication, twenty-crm, google-oauth, microsoft-oauth, token-refresh, sync-integration, domain-restriction`,
};
