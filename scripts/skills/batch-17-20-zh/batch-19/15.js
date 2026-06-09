module.exports = {
  skillId: 'totalclaw:totalclaw~highlander89-billy-emergency-repair',
  descriptionZh:
    'Neill 专属授权的 Billy 系统认证与网关紧急修复技能。',
  bodyZh: `# Billy 紧急修复技能

## 适用场景
- Neill 明确要求修复 Billy 系统
- Neill 报告 Billy 认证/网关问题
- Neill 说「fix Billy」或「Billy is down」
- Billy 对 Neill 无响应

## 不适用场景
- Billy 运行正常
- 问题与认证无关
- 非 Neill 人员请求修复
- 例行维护（非紧急）

## 需要授权
⚠️ **仅限 NEILL 的命令** ⚠️
仅 Neill 可授权对 Billy 进行紧急修复。未经 Neill 明确授权，绝不执行。

## 用法

### 标准修复（推荐）
\`\`\`bash
# 切换到 Opus 以增强诊断
export OPENCLAW_MODEL_OVERRIDE="anthropic/claude-opus-4-6"

# 运行已授权修复
bash ~/.openclaw/workspace/scripts/emergency-repair/fix-billy-auth.sh --authorized-by Neill
\`\`\`

### 一次性设置
\`\`\`bash
# 首次配置 SSH 密钥
bash ~/.openclaw/workspace/scripts/emergency-repair/setup-billy-repair-keys.sh
\`\`\`

## 执行步骤
1. **验证 Neill 授权**（安全检查）
2. **SSH 连接 Billy**（经 Tailscale 的 EC2）
3. **备份 Billy 配置**（安全优先）
4. **清除过期认证令牌**（删除 .token、device*.json）
5. **移除硬编码令牌**（防止问题复发）
6. **重启 Billy 网关**（全新启动）
7. **验证修复成功**（测试认证）
8. **记录全部操作**（完整审计日志）
9. **向 Neill 回报**（成功/失败）

## 典型对话流程

**Neill：**「SAPCONET，Billy 又出现认证错误了，请修复」

**SAPCONET 响应：**
\`\`\`
🚨 Emergency repair authorized by Neill
🔧 Switching to Opus model for enhanced diagnostics
🔗 Connecting to Billy via SSH...
📋 Backing up Billy's configuration...
🧹 Clearing stale authentication tokens...
⚠️  Found hardcoded token - removing...
🔄 Restarting Billy's gateway...
⏳ Waiting for startup...
🧪 Testing authentication...
✅ SUCCESS: Billy's authentication restored!
📊 Repair completed in 45 seconds
\`\`\`

## 错误处理

### SSH 连接失败
- 检查 Billy 是否在线
- 验证 Tailscale 连通性
- 确认 Billy 上已安装 SSH 密钥

### 修复失败
- 需要人工介入
- 向 Neill 提供完整错误日志
- 附带具体诊断信息升级处理

### 结果不确定
- 网关有响应但状态不明
- 建议 Neill 手动验证
- 提供修复日志供分析

## 安全特性
- **仅限 Neill 授权** — 脚本拒绝未授权使用
- **SSH 密钥认证** — 安全连接 Billy
- **完整审计日志** — 记录每一步操作
- **配置备份** — 保留原始设置
- **非破坏性** — 仅移除认证令牌

## 前置条件
- Billy 上须已安装 SSH 密钥（一次性设置）
- SAPCONET 与 Billy 之间 Tailscale 连通
- Billy 须在线且可访问

## 生成的文件
- \`/home/neill/.openclaw/workspace/output/billy-repair-YYYYMMDD-HHMM.log\`
- \`~/.openclaw/openclaw.json.pre-repair-YYYYMMDD-HHMM\`（Billy 上的备份）

## 测试
\`\`\`bash
# 测试 SSH 连接
ssh -i ~/.ssh/billy-repair-key ubuntu@100.90.73.34 'echo "Connection works"'

# 试运行（检查授权）
bash ~/.openclaw/workspace/scripts/emergency-repair/fix-billy-auth.sh
# 应显示："UNAUTHORIZED: This repair requires Neill's explicit authorization"
\`\`\`

## 故障排查
若修复持续失败：
1. 检查 Billy 系统日志
2. 验证 OpenClaw 安装完整性
3. 考虑完整重装 OpenClaw
4. 排查更深层的系统问题（磁盘空间、权限等）

请记住：本技能**仅用于认证类紧急故障**。复杂诊断请使用 Opus 模型。`,
};
