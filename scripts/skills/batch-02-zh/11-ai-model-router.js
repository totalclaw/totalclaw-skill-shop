module.exports = {
  skillId: 'totalclaw:totalclaw~skill',
  descriptionZh:
    '紧凑智能的 AI 模型路由技能，根据任务复杂度自动选择本地或云端模型，支持隐私检测、上下文追踪与约 200 行核心代码，开箱即用。',
  bodyZh: `# AI Model Router

紧凑、智能的模型路由，开箱即用。

## 快速开始

\`\`\`bash
# 安装
npx clawhub@latest install ai-model-router

# 首次运行 - 自动检测你的模型
python3 skill/core/router.py "What is Python?"

# 列出可用模型
python3 skill/core/router.py --list
\`\`\`

## 工作原理

\`\`\`
Your Request → Analyze → Select Model
                          ↓
                    Simple? → Primary (fast/cheap)
                    Complex? → Secondary (capable)
                    Private? → Primary (forced)
\`\`\`

## 评分（来自 model-router-premium）

| 模式 | 分数 |
|---------|--------|
| Microservices, architecture | +10 |
| Design, implement, optimize | +5 |
| Explain, analyze, compare | +3 |
| **Syntax, example, "what is"** | **-3** |

**阈值：5**（简单 vs 复杂）

## 功能

| 功能 | 状态 |
|---------|--------|
| 自动检测本地模型 | ✓ (Ollama, LM Studio) |
| 云端模型注册表 | ✓ (7 个内置) |
| 隐私检测 | ✓ (API keys, passwords) |
| 上下文追踪 | ✓ (conversations) |
| JSON 配置 | ✓ (optional) |
| CLI 接口 | ✓ |
| **核心代码量** | **~200 行** |

## CLI

\`\`\`bash
# 路由任务
python3 skill/core/router.py "Design a system"
python3 skill/core/router.py "What is a for loop?"

# 选项
--json                    # JSON 输出
--force primary           # 强制使用主模型
--list                    # 列出所有模型
--status                  # 显示状态
\`\`\`

## Python API

\`\`\`python
from skill.core.router import RouterCore

router = RouterCore()
result = router.route("Design microservices")

print(result.model_name)   # "Claude Opus 4"
print(result.reason)        # "complex_task(score=15)"
print(result.confidence)    # 0.75
\`\`\`

## 配置（可选）

创建 \`~/.model-router/models.json\`：

\`\`\`json
{
  "primary_model": {"id": "ollama:llama3:8b"},
  "secondary_model": {"id": "anthropic:claude-opus-4"},
  "models": [...]
}
\`\`\`

**无配置时**：自动检测本地模型 + 使用云端注册表。

## 隐私保护

检测到敏感数据时自动强制使用主模型（本地）：
- API 密钥（\`sk-...\`、\`api_key\`）
- 密码（\`password\`、\`passwd\`）
- Token（\`bearer\`、\`secret\`）
- 邮箱、SSN、信用卡

## 文件

- \`core/router.py\` - 核心路由引擎（约 200 行）
- \`modules/detector.py\` - 自动检测（可选）
- \`modules/context.py\` - 上下文追踪（可选）

## 灵感来源

- **model-router-premium**：简单评分逻辑、成本感知路由
- **Model Router v1**：完整功能集、文档

本版本结合：
- model-router-premium 的**简洁性**（约 200 行）
- ai-model-router 的**功能**（隐私、自动检测、上下文）`,
};
