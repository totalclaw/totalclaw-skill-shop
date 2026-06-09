module.exports = {
  skillId: 'totalclaw:jaschadub~jaschadub-agentpin',
  descriptionZh:
    'AgentPin 开发指南：基于域锚定的加密 AI 代理身份验证协议，支持 JWT 凭证签发、TOFU 密钥固定、吊销检查与委托链验证。ThirdKey 信任栈组件。',
  bodyZh: `# AgentPin 开发技能指南

**目的**：本指南帮助 AI 助手使用 AgentPin 进行基于域锚定的加密代理身份验证。

**完整文档**：参见 [README](https://github.com/ThirdKeyAI/agentpin/blob/main/README.md) 和 [技术规范](https://github.com/ThirdKeyAI/agentpin/blob/main/AGENTPIN_TECHNICAL_SPECIFICATION.md)。

## AgentPin 做什么

AgentPin 是面向 AI 代理的基于域锚定的加密身份协议。它使组织能够为其代理发布可验证的身份文档、签发短期 JWT 凭证，并通过包含 TOFU 密钥固定、吊销检查和委托链验证的多步协议验证代理身份。

**ThirdKey 信任栈的一部分**：SchemaPin（工具完整性）→ AgentPin（代理身份）→ Symbiont（运行时）

---

## 架构

\`\`\`
Organization                         Verifying Party
────────────                         ───────────────
1. Generate ECDSA P-256 keypair
2. Publish agent identity at          3. Discover identity from
   /.well-known/agent-identity.json      /.well-known/agent-identity.json
4. Issue JWT credential               5. Verify credential (12-step flow)
   (ES256 signed, short-lived)           - JWT parsing & ES256 verification
                                         - Domain binding check
                                         - TOFU key pinning
                                         - Revocation checking
                                         - Capability validation
                                         - Delegation chain verification
\`\`\`

---

## 项目结构

\`\`\`
crates/
├── agentpin/          Core library (no mandatory HTTP dep)
├── agentpin-cli/      CLI binary (keygen, issue, verify, bundle)
└── agentpin-server/   Axum server for .well-known endpoints
\`\`\`

---

## 按语言快速开始

### Rust（CLI）

\`\`\`bash
# Generate keys
cargo run -p agentpin-cli -- keygen \\
    --output-dir ./keys --agent-name "my-agent"

# Issue a credential (ES256 JWT, 1-hour TTL)
cargo run -p agentpin-cli -- issue \\
    --key ./keys/my-agent.private.pem \\
    --issuer "https://example.com" \\
    --agent-id "my-agent" \\
    --capabilities read,write --ttl 3600

# Verify offline
cargo run -p agentpin-cli -- verify \\
    --credential ./credential.jwt \\
    --discovery ./agent-identity.json

# Verify online (fetches from .well-known)
cargo run -p agentpin-cli -- verify \\
    --credential ./credential.jwt --domain example.com

# Create trust bundle for air-gapped environments
cargo run -p agentpin-cli -- bundle \\
    --discovery ./agent-identity.json \\
    --revocation ./revocations.json --output ./bundle.json
\`\`\`

### Rust（库）

\`\`\`rust
use agentpin::{
    crypto,
    credential::CredentialBuilder,
    verification::verify_credential,
    pinning::KeyPinStore,
};

let (private_key, public_key) = crypto::generate_keypair()?;

let credential = CredentialBuilder::new()
    .issuer("https://example.com")
    .agent_id("my-agent")
    .capability("read")
    .capability("write")
    .ttl_secs(3600)
    .sign(&private_key)?;

let result = verify_credential(&credential, &discovery_doc, &pin_store)?;
\`\`\`

### JavaScript

\`\`\`bash
npm install agentpin
\`\`\`

\`\`\`javascript
import {
    generateKeypair, issueCredential, verifyCredential,
    KeyPinStore
} from 'agentpin';

// Generate ECDSA P-256 keypair
const { privateKey, publicKey } = await generateKeypair();

// Issue a credential
const credential = await issueCredential(privateKey, {
    issuer: 'https://example.com',
    agentId: 'my-agent',
    capabilities: ['read', 'write'],
    ttlSecs: 3600,
});

// Verify
const pinStore = new KeyPinStore();
const result = await verifyCredential(credential, discoveryDoc, pinStore);
\`\`\`

### Python

\`\`\`bash
pip install agentpin
\`\`\`

\`\`\`python
from agentpin.crypto import generate_keypair
from agentpin.credential import issue_credential
from agentpin.verification import verify_credential
from agentpin.pinning import KeyPinStore

private_key, public_key = generate_keypair()

credential = issue_credential(
    private_key,
    issuer="https://example.com",
    agent_id="my-agent",
    capabilities=["read", "write"],
    ttl_secs=3600,
)

pin_store = KeyPinStore()
result = verify_credential(credential, discovery_doc, pin_store)
\`\`\`

### 提供 .well-known 端点

\`\`\`bash
cargo run -p agentpin-server -- \\
    --identity ./agent-identity.json \\
    --revocation ./revocations.json \\
    --port 3000
\`\`\`

提供：
- \`GET /.well-known/agent-identity.json\`（Cache-Control: max-age=3600）
- \`GET /.well-known/agent-identity-revocations.json\`（Cache-Control: max-age=300）
- \`GET /health\`

---

## 核心库 API

### 关键模块

| 模块 | 用途 |
|--------|---------|
| \`crypto\` | ECDSA P-256 签名/验证（无外部 JWT crate） |
| \`types\` | 核心数据结构（代理、凭证、能力） |
| \`credential\` | JWT 签发与解析 |
| \`discovery\` | 发布与解析代理身份文档 |
| \`verification\` | 12 步凭证验证流程 |
| \`revocation\` | 检查已吊销凭证/代理/密钥 |
| \`pinning\` | 带 JWK 指纹的 TOFU 密钥固定 |
| \`delegation\` | 委托链验证 |
| \`mutual\` | 质询-响应双向认证（128 位 nonce） |
| \`jwk\` | JWK 处理与指纹计算 |
| \`resolver\` | 可插拔发现解析器 |

### 语言 API 参考

| 操作 | Rust | JavaScript | Python |
|-----------|------|------------|--------|
| 生成密钥 | \`crypto::generate_keypair()\` | \`generateKeypair()\` | \`generate_keypair()\` |
| 签发凭证 | \`CredentialBuilder::new().sign()\` | \`issueCredential()\` | \`issue_credential()\` |
| 验证凭证 | \`verify_credential()\` | \`verifyCredential()\` | \`verify_credential()\` |
| 密钥固定 | \`KeyPinStore\` | \`KeyPinStore\` | \`KeyPinStore\` |
| 信任包 | \`TrustBundle::from_json()\` | \`TrustBundle.fromJson()\` | \`TrustBundle.from_json()\` |
| 双向认证 | \`MutualAuth::challenge()\` | \`createChallenge()\` | \`create_challenge()\` |

### 功能标志

| 功能 | 用途 |
|---------|---------|
| \`fetch\` | 通过 reqwest 启用 HTTP 以进行在线发现 |
| （默认） | 无 HTTP 依赖的核心库 |

---

## 关键概念

### 仅 ES256

AgentPin 仅使用 ES256（ECDSA P-256）。拒绝所有其他算法。在内联层面强制执行，不依赖外部 JWT crate。

### 12 步验证

凭证验证流程包括：
1. JWT 结构解析
2. 头部算法验证（仅 ES256）
3. 签名验证
4. 颁发者域提取
5. 发现文档解析
6. 域绑定验证
7. 密钥匹配（颁发者密钥 vs 发现文档）
8. TOFU 密钥固定检查
9. 过期验证
10. 吊销检查
11. 能力验证
12. 委托链验证（若存在）

### TOFU 密钥固定

首次验证某域的凭证时，代理公钥（JWK 指纹）被固定。后续验证拒绝同一域的不同密钥 — 检测密钥替换攻击。

### 委托链

代理可将能力委托给子代理。委托链验证确保：
- 每个环节由委托方签名
- 能力仅沿链收窄（永不扩大）
- 遵守链深度限制

### 双向认证

带 128 位 nonce 的质询-响应协议，用于双向代理身份验证。

---

## 发现文档格式

发布于 \`/.well-known/agent-identity.json\`：

\`\`\`json
{
    "schema_version": "0.2",
    "domain": "example.com",
    "agents": [
        {
            "agent_id": "my-agent",
            "display_name": "My Agent",
            "description": "A helpful agent",
            "capabilities": ["read", "write"],
            "public_key_jwk": { ... },
            "constraints": {
                "max_ttl_secs": 86400,
                "allowed_scopes": ["api"]
            }
        }
    ],
    "revocation_endpoint": "https://example.com/.well-known/agent-identity-revocations.json",
    "directory_listing": true
}
\`\`\`

---

## v0.2.0 特性

### 信任包（离线 / 气隙环境）

为无互联网环境预打包发现 + 吊销数据：

\`\`\`python
from agentpin.bundle import TrustBundle

bundle = TrustBundle.from_json(bundle_json_str)
discovery = bundle.find_discovery("example.com")
revocation = bundle.find_revocation("example.com")
\`\`\`

### 可插拔发现解析器

\`\`\`python
from agentpin.discovery import (
    WellKnownResolver,    # HTTP .well-known lookups
    DnsTxtResolver,       # DNS TXT record lookups
    ManualResolver,       # Pre-configured discovery data
)
\`\`\`

### 目录列表

域可通过发现文档中的 \`"directory_listing": true\` 公布所有代理。验证方可在发起质询前枚举可用代理。

---

## 开发

### 构建与测试

\`\`\`bash
# Build all crates
cargo build --workspace

# Run all tests
cargo test --workspace

# Lint
cargo clippy --workspace

# Format check
cargo fmt --check
\`\`\`

### 约定

- Rust edition 2021，MSRV 1.70
- \`cargo clippy --workspace\` 须零警告通过
- \`cargo fmt --check\` 须通过
- 源文件内联测试（\`#[cfg(test)] mod tests\`）
- 仅 ES256 — 拒绝所有其他算法
- 功能门控 HTTP：\`fetch\` 功能启用 reqwest

---

## AI 助手专业提示

1. **仅 ES256** — 绝不接受 RS256、HS256 或任何其他算法
2. **短期凭证** — TTL 优先以小时计，而非天
3. **信任凭证前始终检查吊销**
4. **TOFU 固定**意味着首次见到的密钥被信任 — 密钥变更时发出警告
5. **委托链**应收窄能力，永不扩大
6. **无外部 JWT crate** — 算法验证在内联控制以防止算法混淆攻击
7. **功能门控 HTTP** — 仅在需要在线发现时使用 \`fetch\` 功能；默认为离线能力
8. **与 SchemaPin 跨兼容** — 均使用 ECDSA P-256，相同加密原语
9. **信任包**适合 CI/CD 和气隙部署 — 预打包发现 + 吊销数据
10. **JavaScript 和 Python SDK** 提供与 Rust crate 相同的验证保证`,
};
