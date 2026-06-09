module.exports = {
  skillId: 'totalclaw:bowen31337~bowen31337-identity-resolver',
  descriptionZh:
    '跨消息渠道（Telegram、WhatsApp、Discord 等）的规范用户身份解析，将多渠道身份映射至单一 canonical user ID。',
  bodyZh: `# identity-resolver

**跨消息渠道的规范用户身份解析**

## 描述

将多渠道用户身份（Telegram、WhatsApp、Discord、web 等）解析为 canonical user ID，防止用户通过多个渠道交互时状态碎片化。

**解决的问题：** 无身份解析时，通过 Telegram 与 WhatsApp 发消息的用户会被视为两个不同用户，导致记忆、访问控制与各技能的 per-user 状态碎片化。

**解决方案：** 自动将所有渠道身份映射至一个 canonical user ID。

## 安装

**前置条件：** 若未安装 \`uv\`：
\`\`\`bash
curl -LsSf https://astral.sh/uv/install.sh | sh
\`\`\`

**安装技能：**
\`\`\`bash
cd /path/to/openclaw/workspace

# 通过 ClawHub（推荐）
clawhub install identity-resolver

# 或通过 Git
git clone https://github.com/clawinfra/identity-resolver skills/identity-resolver
\`\`\`

## 快速开始

### 终端用户

\`\`\`bash
# 初始化身份映射（从 USER.md 自动检测 owner）
cd /path/to/workspace
uv run python skills/identity-resolver/scripts/identity_cli.py init

# 验证你的身份
uv run python skills/identity-resolver/scripts/identity_cli.py resolve \\
  --channel telegram --user-id YOUR_TELEGRAM_ID
# 输出：your-canonical-id

# 列出所有已注册身份
uv run python skills/identity-resolver/scripts/identity_cli.py list
\`\`\`

### 技能开发者

添加到你的技能 Python 代码：

\`\`\`python
import sys
from pathlib import Path

# 导入 identity resolver
sys.path.insert(0, str(Path.cwd() / "skills" / "identity-resolver" / "scripts"))
from identity import resolve_canonical_id

# 从 session 上下文获取 canonical user ID
import os
channel = os.getenv("OPENCLAW_CHANNEL")  # e.g., "telegram"
user_id = os.getenv("OPENCLAW_USER_ID")   # e.g., "123456789"

canonical_id = resolve_canonical_id(channel, user_id)
# 所有用户特定操作使用 canonical_id

# 示例：用户特定记忆文件
memory_file = f"data/users/{canonical_id}/memory.json"
\`\`\`

## 功能

✅ **从 USER.md 自动注册 owner**  
✅ **线程安全** 身份映射存储，fcntl 锁定  
✅ **CLI + Python API** 面向用户与开发者  
✅ **路径遍历防护** — 净化所有 canonical ID  
✅ **零依赖** — 纯 Python stdlib  
✅ **多渠道支持** — Telegram、WhatsApp、Discord、web 及未来渠道

## 使用场景

### 多用户记忆系统
\`\`\`python
# tiered-memory 技能集成
canonical_id = resolve_canonical_id(channel, user_id)
memory_tree = f"memory/users/{canonical_id}/tree.json"
\`\`\`

### 访问控制
\`\`\`python
# agent-access-control 技能集成
canonical_id = resolve_canonical_id(channel, user_id)
if is_owner(canonical_id):
    # 完全访问
else:
    # 受限访问
\`\`\`

### 跨平台用户跟踪
\`\`\`python
# Discord + Telegram 同一用户
discord_id = resolve_canonical_id("discord", "user#1234")
telegram_id = resolve_canonical_id("telegram", "987654321")
# 若已注册，两者解析为同一 canonical ID
\`\`\`

## API 参考

### 核心函数

**\`resolve_canonical_id(channel, provider_user_id, workspace=None, owner_numbers=None) -> str\`**

将渠道身份解析为 canonical user ID。

- 从 USER.md 自动注册 owner 号码
- 返回 canonical ID（如 "alice"）或未映射用户的 "stranger:{channel}:{user_id}"

**\`add_channel(canonical_id, channel, provider_user_id, workspace=None, display_name=None)\`**

为 canonical 用户添加渠道映射（不存在则创建用户）。

**\`remove_channel(canonical_id, channel, provider_user_id, workspace=None)\`**

从 canonical 用户移除渠道映射。

**\`list_identities(workspace=None) -> dict\`**

返回所有身份映射。

**\`get_channels(canonical_id, workspace=None) -> list\`**

获取 canonical 用户的所有渠道。

**\`is_owner(canonical_id, workspace=None) -> bool\`**

检查 canonical ID 是否为 owner。

### CLI 命令

\`\`\`bash
# 初始化
identity init [--force]

# 解析（从 env 自动检测或显式参数）
identity resolve [--channel CH] [--user-id ID]

# 添加映射
identity add --canonical ID --channel CH --user-id ID [--display-name NAME]

# 移除映射
identity remove --canonical ID --channel CH --user-id ID

# 列出全部
identity list [--json]

# 获取渠道
identity channels --canonical ID [--json]

# 检查 owner
identity is-owner --canonical ID [--json]
\`\`\`

## 身份映射格式

位置：\`data/identity-map.json\` 或 \`memory/identity-map.json\`

\`\`\`json
{
  "version": "1.0",
  "identities": {
{
  "version": "1.0",
  "identities": {
    "alice": {
      "canonical_id": "alice",
      "is_owner": true,
      "display_name": "Alice Johnson",
      "channels": [
        "telegram:123456789",
        "whatsapp:+1234567890",
        "whatsapp:+9876543210",
        "whatsapp:+5555555555"
      ],
      "created_at": "2026-01-15T10:00:00Z",
      "updated_at": "2026-01-15T10:05:00Z"
    },
    "bob": {
      "canonical_id": "bob",
      "is_owner": false,
      "display_name": "Bob Smith",
      "channels": [
        "discord:bob#1234",
        "telegram:987654321"
      ],
      "created_at": "2026-01-15T10:10:00Z",
      "updated_at": "2026-01-15T10:10:00Z"
    }
  }
}
    }
  }
}
\`\`\`

## 安全

- **路径遍历防护**：Canonical ID 仅净化为 \`[a-z0-9-_]\`
- **线程安全操作**：所有读写使用 fcntl 文件锁
- **输入验证**：所有用户输入均验证并净化
- **Owner 自动注册**：仅 USER.md 中的号码自动注册为 owner

## 集成示例

见 \`docs/TIERED_MEMORY_INTEGRATION_EXAMPLE.md\` 获取完整工作示例。

## 许可证

MIT - 见 LICENSE 文件

## 作者

OpenClaw Agent <agent@openclaw.local>

## 链接

- GitHub: https://github.com/clawinfra/identity-resolver
- Issues: https://github.com/clawinfra/identity-resolver/issues
- ClawHub: https://clawhub.com/skills/identity-resolver`,
};
