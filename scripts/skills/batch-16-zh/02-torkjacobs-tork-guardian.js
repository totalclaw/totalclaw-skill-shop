module.exports = {
  skillId: 'totalclaw:totalclaw~torkjacobs-tork-guardian',
  descriptionZh:
    'Tork Guardian 企业级安全与治理层：检测 PII、执行策略、生成合规凭证、控制工具访问，并在安装前扫描技能漏洞。',
  bodyZh: `# Tork Guardian

> 智能体能力强大，Tork 使其更安全。

面向智能体的企业级安全与治理层。检测 PII、执行策略、生成合规凭证、控制工具访问，并在安装前扫描技能漏洞。

## 安装

\`\`\`bash
npm install @torknetwork/guardian
\`\`\`

## 快速开始

\`\`\`typescript
import { TorkGuardian } from '@torknetwork/guardian';

const guardian = new TorkGuardian({
  apiKey: process.env.TORK_API_KEY!,
});

// 发送前治理 LLM 请求
const result = await guardian.governLLM({
  messages: [
    { role: 'user', content: 'Email john@example.com about the project' },
  ],
});
// PII 已脱敏："Email [EMAIL_REDACTED] about the project"

// 检查工具调用是否允许
const decision = guardian.governTool({
  name: 'shell_execute',
  args: { command: 'rm -rf /' },
});
// { allowed: false, reason: 'Blocked shell command pattern: "rm -rf"' }
\`\`\`

## 网络安全

Tork Guardian 治理所有网络活动——端口绑定、出站连接与 DNS 查询——具备 SSRF 防护、反弹 shell 检测与按技能限速。

### 使用 network handler

\`\`\`typescript
const guardian = new TorkGuardian({
  apiKey: process.env.TORK_API_KEY!,
  networkPolicy: 'default',
});

const network = guardian.getNetworkHandler();

// 校验端口绑定
const bind = network.validatePortBind('my-skill', 3000, 'tcp');
// { allowed: true, reason: 'Port 3000/tcp bound' }

// 校验出站连接
const egress = network.validateEgress('my-skill', 'api.openai.com', 443);
// { allowed: true, reason: 'Egress to api.openai.com:443 allowed' }

// 校验 DNS 查询（标记原始 IP）
const dns = network.validateDNS('my-skill', 'api.openai.com');
// { allowed: true, reason: 'DNS lookup for api.openai.com allowed' }

// 获取完整活动日志用于合规
const log = network.getActivityLog();

// 获取含异常检测的网络报告
const report = network.getMonitor().getNetworkReport();
\`\`\`

### 独立函数

\`\`\`typescript
import { validatePortBind, validateEgress, validateDNS } from '@torknetwork/guardian';

const config = { apiKey: 'tork_...', networkPolicy: 'strict' as const };

validatePortBind(config, 'my-skill', 3000, 'tcp');
validateEgress(config, 'my-skill', 'api.openai.com', 443);
validateDNS(config, 'my-skill', 'api.openai.com');
\`\`\`

### 切换策略

\`\`\`typescript
// Default — 开发与生产平衡
const guardian = new TorkGuardian({
  apiKey: 'tork_...',
  networkPolicy: 'default',
});

// Strict — 企业锁定（仅 443，显式域名白名单）
const guardian = new TorkGuardian({
  apiKey: 'tork_...',
  networkPolicy: 'strict',
});

// Custom — 覆盖任意设置
const guardian = new TorkGuardian({
  apiKey: 'tork_...',
  networkPolicy: 'custom',
  allowedOutboundPorts: [443, 8443],
  allowedDomains: ['api.myservice.com'],
  maxConnectionsPerMinute: 30,
});
\`\`\`

详见 [docs/NETWORK-SECURITY.md](docs/NETWORK-SECURITY.md) 了解威胁覆盖、策略对比与合规凭证。

## 示例配置

常见环境的预置配置：

\`\`\`typescript
import {
  MINIMAL_CONFIG,
  DEVELOPMENT_CONFIG,
  PRODUCTION_CONFIG,
  ENTERPRISE_CONFIG,
} from '@torknetwork/guardian';
\`\`\`

| 配置 | 策略 | 网络 | 说明 |
|--------|--------|---------|-------------|
| \`MINIMAL_CONFIG\` | standard | default | 仅 API Key，全部默认 |
| \`DEVELOPMENT_CONFIG\` | minimal | default | 宽松策略，完整日志 |
| \`PRODUCTION_CONFIG\` | standard | default | 阻止外泄域名（pastebin、ngrok、burp） |
| \`ENTERPRISE_CONFIG\` | strict | strict | 显式域名白名单，20 连接/分钟，仅 TLS |

\`\`\`typescript
import { TorkGuardian, PRODUCTION_CONFIG } from '@torknetwork/guardian';

const guardian = new TorkGuardian({
  ...PRODUCTION_CONFIG,
  apiKey: process.env.TORK_API_KEY!,
});
\`\`\`

## 配置

\`\`\`typescript
const guardian = new TorkGuardian({
  // 必填
  apiKey: 'tork_...',

  // 可选
  baseUrl: 'https://www.tork.network',   // API 端点
  policy: 'standard',                     // 'strict' | 'standard' | 'minimal'
  redactPII: true,                        // 启用 PII 脱敏

  // Shell 命令治理
  blockShellCommands: [
    'rm -rf', 'mkfs', 'dd if=', 'chmod 777',
    'shutdown', 'reboot',
  ],

  // 文件访问控制
  allowedPaths: [],                        // 空 = 允许全部（除 blocked）
  blockedPaths: [
    '.env', '.env.local', '~/.ssh',
    '~/.aws', 'credentials.json',
  ],

  // 网络治理
  networkPolicy: 'default',               // 'default' | 'strict' | 'custom'
  allowedInboundPorts: [3000, 8080],       // 技能可绑定的端口
  allowedOutboundPorts: [443],             // 出站连接端口
  allowedDomains: ['api.openai.com'],      // 非空时仅允许这些域名
  blockedDomains: ['evil.com'],            // 始终阻止的域名
  maxConnectionsPerMinute: 60,             // 每技能出站速率限制
});
\`\`\`

## 策略

| 策略 | PII | Shell | 文件 | 网络 |
|--------|-----|-------|-------|---------|
| **strict** | 检测即拒绝 | 阻止全部 | 仅白名单 | 阻止全部 |
| **standard** | 脱敏 | 阻止危险命令 | 阻止敏感路径 | 允许 |
| **minimal** | 脱敏 | 允许全部 | 允许全部 | 允许全部 |

## 独立函数

\`\`\`typescript
import { redactPII, generateReceipt, governToolCall } from '@torknetwork/guardian';

// 从文本脱敏 PII
const result = await redactPII('tork_...', 'Call 555-123-4567');

// 生成合规凭证
const receipt = await generateReceipt('tork_...', 'Processed user data');

// 按策略检查工具调用
const decision = governToolCall(
  { name: 'file_write', args: { path: '.env' } },
  { policy: 'standard', blockedPaths: ['.env'] }
);
\`\`\`

## 安全扫描器

**安装前**扫描任意技能漏洞。扫描器检查代码与网络类别的 14 种安全模式。

### CLI

\`\`\`bash
# 扫描技能目录
npx tork-scan ./my-skill

# 每个发现的完整详情
npx tork-scan ./my-skill --verbose

# CI/CD 用 JSON 输出
npx tork-scan ./my-skill --json

# 任何 high 或 critical 发现即失败
npx tork-scan ./my-skill --strict
\`\`\`

### 编程方式

\`\`\`typescript
import { SkillScanner, generateBadge } from '@torknetwork/guardian';

const scanner = new SkillScanner();
const report = await scanner.scanSkill('./my-skill');

console.log(\`Risk: \${report.riskScore}/100\`);
console.log(\`Verdict: \${report.verdict}\`); // 'verified' | 'reviewed' | 'flagged'
\`\`\`

详见 [docs/SCANNER.md](docs/SCANNER.md) 了解完整规则参考、严重度权重与示例输出。

## Tork Verified 徽章

通过安全扫描的技能获得 Tork Verified 徽章：

| 徽章 | 分数 | 含义 |
|-------|-------|---------|
| **Tork Verified**（绿色） | 0 - 29 | 可安全安装 |
| **Tork Reviewed**（黄色） | 30 - 49 | 建议人工审查 |
| **Tork Flagged**（红色） | 50 - 100 | 检测到安全风险 |

\`\`\`typescript
import { SkillScanner, generateBadge, generateBadgeMarkdown } from '@torknetwork/guardian';

const scanner = new SkillScanner();
const report = await scanner.scanSkill('./my-skill');
const badge = generateBadge(report);

// 添加到 README
console.log(generateBadgeMarkdown(badge));
\`\`\`

## 获取 API Key

在 [tork.network](https://tork.network) 注册获取 API Key。
`,
};
