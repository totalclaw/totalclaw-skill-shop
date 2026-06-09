module.exports = {
  skillId: 'totalclaw:totalclaw~jaschadub-schemapin',
  descriptionZh:
    'SchemaPin 开发指南：通过 ECDSA P-256 加密签名工具 Schema，防止 MCP Rug Pull 攻击。支持 TOFU 密钥固定、.well-known 公钥发现与 SkillSigner 目录签名。',
  bodyZh: `# SchemaPin 开发技能指南

**目的**：本指南帮助 AI 助手快速将 SchemaPin 集成到应用中，实现加密工具 Schema 验证。

**完整文档**：参见 [README](https://github.com/ThirdKeyAI/SchemaPin/blob/main/README.md)、[技术规范](https://github.com/ThirdKeyAI/SchemaPin/blob/main/TECHNICAL_SPECIFICATION.md)，以及各子目录中的语言专属 README。

## SchemaPin 做什么

SchemaPin 通过使开发者对其工具 Schema 进行加密签名（ECDSA P-256 + SHA-256），并使客户端验证 Schema 未被篡改，从而防止「MCP Rug Pull」攻击。它使用信任首次使用（TOFU）密钥固定和 RFC 8615 \`.well-known\` 端点进行公钥发现。

**ThirdKey 信任栈的一部分**：SchemaPin（工具完整性）→ AgentPin（代理身份）→ Symbiont（运行时）

---

## 按语言快速开始

### Python

\`\`\`bash
pip install schemapin
\`\`\`

\`\`\`python
from schemapin.crypto import KeyManager, SignatureManager
from schemapin.core import SchemaPinCore

# Generate keys
private_key, public_key = KeyManager.generate_keypair()

# Sign a schema
core = SchemaPinCore()
canonical = core.canonicalize_schema(schema_dict)
signature = SignatureManager.sign_schema(private_key, canonical)

# Verify
is_valid = SignatureManager.verify_signature(public_key, canonical, signature)
\`\`\`

### JavaScript

\`\`\`bash
npm install schemapin
\`\`\`

\`\`\`javascript
import { KeyManager, SignatureManager, SchemaPinCore } from 'schemapin';

// Generate keys
const { privateKey, publicKey } = KeyManager.generateKeypair();

// Sign a schema
const core = new SchemaPinCore();
const canonical = core.canonicalizeSchema(schema);
const signature = await SignatureManager.signSchema(privateKey, canonical);

// Verify
const isValid = await SignatureManager.verifySignature(publicKey, canonical, signature);
\`\`\`

### Go

\`\`\`bash
go get github.com/ThirdKeyAi/schemapin/go@v1.3.0
\`\`\`

\`\`\`go
import (
    "github.com/ThirdKeyAi/schemapin/go/pkg/core"
    "github.com/ThirdKeyAi/schemapin/go/pkg/crypto"
)

// Generate keys
km := crypto.NewKeyManager()
privKey, pubKey, _ := km.GenerateKeypair()

// Sign a schema
spc := core.NewSchemaPinCore()
canonical, _ := spc.CanonicalizeSchema(schema)
sig, _ := crypto.NewSignatureManager().SignSchema(privKey, canonical)

// Verify
valid, _ := crypto.NewSignatureManager().VerifySignature(pubKey, canonical, sig)
\`\`\`

### Rust

\`\`\`toml
[dependencies]
schemapin = "1.3"
\`\`\`

\`\`\`rust
use schemapin::crypto::{generate_key_pair, sign_data, verify_signature};
use schemapin::core::SchemaPinCore;

// Generate keys
let key_pair = generate_key_pair()?;

// Sign
let core = SchemaPinCore::new();
let canonical = core.canonicalize_schema(&schema)?;
let signature = sign_data(&key_pair.private_key_pem, &canonical)?;

// Verify
let is_valid = verify_signature(&key_pair.public_key_pem, &canonical, &signature)?;
\`\`\`

---

## 核心概念

### 1. Schema 规范化

Schema 在哈希前进行规范化（确定性 JSON 序列化，键排序）。确保相同 Schema 无论键顺序如何始终产生相同哈希。

### 2. \`.well-known\` 发现

开发者在 \`https://example.com/.well-known/schemapin.json\` 发布公钥：

\`\`\`python
from schemapin.utils import create_well_known_response

response = create_well_known_response(
    public_key_pem=public_key_pem,
    developer_name="Acme Corp",
    schema_version="1.2",
    revocation_endpoint="https://example.com/.well-known/schemapin-revocations.json"
)
\`\`\`

### 3. TOFU 密钥固定

首次验证时，开发者公钥指纹被固定。后续验证拒绝同一域的不同密钥 — 检测密钥替换攻击。

### 4. 验证工作流

**在线**（标准）：
\`\`\`python
workflow = SchemaVerificationWorkflow(pin_store)
result = workflow.verify_schema(schema, signature, "https://example.com")
\`\`\`

**离线**（v1.2.0 — 无需 HTTP）：
\`\`\`python
from schemapin.verification import verify_schema_offline, KeyPinStore

pin_store = KeyPinStore()
result = verify_schema_offline(
    schema, signature_b64, domain, tool_id,
    discovery_data, revocation_doc, pin_store
)
\`\`\`

---

## v1.2.0 特性

### 独立吊销文档

\`\`\`python
from schemapin.revocation import (
    build_revocation_document, add_revoked_key,
    check_revocation, RevocationReason
)

doc = build_revocation_document("example.com")
add_revoked_key(doc, fingerprint, RevocationReason.KEY_COMPROMISE)
check_revocation(doc, some_fingerprint)  # raises if revoked
\`\`\`

### 信任包（离线 / 气隙环境）

为无互联网环境预打包发现 + 吊销数据：

\`\`\`python
from schemapin.bundle import SchemaPinTrustBundle

bundle = SchemaPinTrustBundle.from_json(bundle_json_str)
discovery = bundle.find_discovery("example.com")
revocation = bundle.find_revocation("example.com")
\`\`\`

### 可插拔发现解析器

\`\`\`python
from schemapin.resolver import (
    WellKnownResolver,    # HTTP .well-known lookups
    LocalFileResolver,    # Local JSON files
    TrustBundleResolver,  # In-memory trust bundles
    ChainResolver,        # First-match fallthrough
)

# Chain: try bundle first, fall back to HTTP
resolver = ChainResolver([
    TrustBundleResolver.from_json(bundle_json),
    WellKnownResolver(timeout=10),
])
\`\`\`

### 基于解析器的验证

\`\`\`python
from schemapin.verification import verify_schema_with_resolver

result = verify_schema_with_resolver(
    schema, signature_b64, domain, tool_id,
    resolver, pin_store
)
\`\`\`

---

## v1.3.0 特性

### SkillSigner — 基于文件系统的技能目录签名

使用 ECDSA P-256 对整个技能目录（如含 \`SKILL.md\` 的文件夹）签名。在文件旁生成 \`.schemapin.sig\` 清单，证明无文件被篡改。

**Python：**
\`\`\`python
from schemapin.skill import sign_skill, verify_skill_offline

# Sign a skill directory
sig = sign_skill("./my-skill/", private_key_pem, "example.com")
# Writes .schemapin.sig into ./my-skill/

# Verify offline
from schemapin.verification import KeyPinStore
result = verify_skill_offline("./my-skill/", discovery_data, sig, revocation_doc, KeyPinStore())
\`\`\`

**JavaScript：**
\`\`\`javascript
import { signSkill, verifySkillOffline } from 'schemapin/skill';

const sig = await signSkill('./my-skill/', privateKeyPem, 'example.com');
const result = verifySkillOffline('./my-skill/', discoveryData, sig, revDoc, pinStore);
\`\`\`

**Go：**
\`\`\`go
import "github.com/ThirdKeyAi/schemapin/go/pkg/skill"

sig, err := skill.SignSkill("./my-skill/", privateKeyPEM, "example.com", "", "")
result := skill.VerifySkillOffline("./my-skill/", disc, sig, rev, pinStore, "")
\`\`\`

**Rust：**
\`\`\`rust
use schemapin::skill::{sign_skill, verify_skill_offline};

let sig = sign_skill("./my-skill/", &private_key_pem, "example.com", None, None)?;
let result = verify_skill_offline("./my-skill/", &disc, Some(&sig), rev.as_ref(), Some(&pin_store), None);
\`\`\`

### \`.schemapin.sig\` 格式

\`\`\`json
{
  "schemapin_version": "1.3",
  "skill_name": "my-skill",
  "skill_hash": "sha256:<root_hash>",
  "signature": "<base64_ecdsa_signature>",
  "signed_at": "2026-02-14T00:00:00Z",
  "domain": "example.com",
  "signer_kid": "sha256:<key_fingerprint>",
  "file_manifest": {
    "SKILL.md": "sha256:<file_hash>"
  }
}
\`\`\`

### 篡改检测

\`\`\`python
from schemapin.skill import detect_tampered_files, canonicalize_skill

_, current_manifest = canonicalize_skill("./my-skill/")
tampered = detect_tampered_files(current_manifest, sig.file_manifest)
# tampered.modified, tampered.added, tampered.removed
\`\`\`

---

## 服务端设置

### 发布 \`.well-known\` 端点

包含 Python CLI 工具：

\`\`\`bash
# Generate a keypair
schemapin-keygen --output-dir ./keys

# Sign a schema
schemapin-sign --key ./keys/private.pem --schema schema.json

# Verify a signature
schemapin-verify --key ./keys/public.pem --schema schema.json --signature sig.b64
\`\`\`

Go CLI 等效工具也可用（\`go install github.com/ThirdKeyAi/schemapin/go/cmd/...@v1.3.0\`）。

---

## 架构

\`\`\`
Developer                          Client (AI Platform)
─────────                          ────────────────────
1. Generate ECDSA P-256 keypair
2. Publish public key at           3. Discover public key from
   /.well-known/schemapin.json        /.well-known/schemapin.json
4. Sign tool schema                5. Verify signature
   (canonicalize → SHA-256            (canonicalize → SHA-256
    → ECDSA sign)                      → ECDSA verify)
                                   6. TOFU pin the key fingerprint
                                   7. Check revocation status
\`\`\`

---

## 语言 API 参考

| 操作 | Python | JavaScript | Go | Rust |
|-----------|--------|------------|----|----|
| 生成密钥 | \`KeyManager.generate_keypair()\` | \`KeyManager.generateKeypair()\` | \`km.GenerateKeypair()\` | \`generate_key_pair()\` |
| 签名 Schema | \`SignatureManager.sign_schema()\` | \`SignatureManager.signSchema()\` | \`sm.SignSchema()\` | \`sign_data()\` |
| 验证签名 | \`SignatureManager.verify_signature()\` | \`SignatureManager.verifySignature()\` | \`sm.VerifySignature()\` | \`verify_signature()\` |
| 规范化 | \`SchemaPinCore().canonicalize_schema()\` | \`new SchemaPinCore().canonicalizeSchema()\` | \`spc.CanonicalizeSchema()\` | \`SchemaPinCore::new().canonicalize_schema()\` |
| 发现密钥 | \`PublicKeyDiscovery.fetch_well_known()\` | \`PublicKeyDiscovery.fetchWellKnown()\` | \`FetchWellKnown()\` | \`WellKnownResolver\`（fetch 功能） |
| 离线验证 | \`verify_schema_offline()\` | \`verifySchemaOffline()\` | \`VerifySchemaOffline()\` | \`verify_schema_offline()\` |
| 解析器验证 | \`verify_schema_with_resolver()\` | \`verifySchemaWithResolver()\` | \`VerifySchemaWithResolver()\` | \`verify_schema_with_resolver()\` |
| 签名技能目录 | \`sign_skill()\` | \`signSkill()\` | \`skill.SignSkill()\` | \`sign_skill()\` |
| 验证技能 | \`verify_skill_offline()\` | \`verifySkillOffline()\` | \`skill.VerifySkillOffline()\` | \`verify_skill_offline()\` |
| 检测篡改 | \`detect_tampered_files()\` | \`detectTamperedFiles()\` | \`skill.DetectTamperedFiles()\` | \`detect_tampered_files()\` |

---

## 测试

\`\`\`bash
# Python
cd python && python -m pytest tests/ -v

# JavaScript
cd javascript && npm test

# Go
cd go && go test ./...

# Rust
cd rust && cargo test
\`\`\`

---

## AI 助手专业提示

1. **签名或验证前始终规范化** — 原始 JSON 比较会失败
2. **有预取发现数据时使用离线验证** — 避免 Schema 验证期间的 HTTP 调用
3. **信任包**适合 CI/CD 和气隙部署
4. **ChainResolver** 可分层解析器：信任包 → 本地文件 → HTTP 作为回退
5. **TOFU 固定**意味着某域首次见到的密钥被信任 — 密钥变更时警告用户
6. **所有语言使用相同加密** — ECDSA P-256 + SHA-256，跨语言验证可用
7. **应始终执行吊销检查** — 简单列表和独立文档均需
8. **SkillSigner** 签名整个目录 — 适合上传到 ClaWHub 等注册表的 SKILL.md 文件夹
9. **\`.schemapin.sig\`** 自动排除在哈希之外 — 可重新签名目录而无需先删除旧签名`,
};
