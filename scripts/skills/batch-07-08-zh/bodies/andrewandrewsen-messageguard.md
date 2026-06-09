### MessageGuard：出站消息过滤技能

**用途**：MessageGuard 过滤出站文本，通过模式检测与可配置动作（遮蔽、阻断或警告）防止密钥泄露与敏感数据外泄。

### 高级配置选项：

- **`mode`**：匹配模式的全局动作。选项：
  - `mask`：用 `mask_char` 替换敏感内容。
  - `block`：完全阻止发送。
  - `warn`：允许发送但生成警告。
- **`mask_char`**：当 `mode` 为 `mask` 时用于替换敏感内容的字符。
- **`patterns`**：定义或自定义基于正则的检测。内置 API 密钥、凭证等（如 AWS 密钥、JWT）。可按需新增模式。
- **`logging`**：将检测结果记录为结构化 JSON，便于监控、调试或合规。通过 `log_path` 配置输出位置。
- **自定义模式**：用户可定义自定义模式以覆盖内置或扩展功能，支持正则与细粒度动作控制（mask、block、warn）。

**安装**
1. 克隆仓库：`git clone git@github.com:AndrewAndrewsen/MessageGuard.git`。
2. 进入目录。本技能无外部依赖，仅使用 Python 标准库。
