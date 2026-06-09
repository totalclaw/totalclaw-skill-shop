module.exports = {
  skillId: 'totalclaw:totalclaw~xdd-xund-chinese-llm-router',
  descriptionZh:
    '为 OpenClaw 提供统一的中国大模型路由接口，一键切换 DeepSeek、通义千问、GLM、Kimi、豆包等主流国产模型，支持智能推荐、自动降级与成本追踪。',
  bodyZh: `# Chinese LLM Router

将 OpenClaw 对话路由到最佳中国 AI 模型——无需繁琐配置，选好即用。

## 功能

通过单一统一接口，让你的 OpenClaw 即时访问所有主流中国大模型：

- **DeepSeek** (V3.2 / R1) — 最佳开源推理能力，价格极低
- **Qwen** (Qwen3-Max / Qwen3-Max-Thinking / Qwen3-Coder-Plus) — 阿里旗舰，全能型
- **GLM** (GLM-5 / GLM-4.7) — 智谱 AI，编码与智能体任务顶尖
- **Kimi** (K2.5 / K2.5-Thinking) — 月之暗面，长上下文与视觉优秀
- **Doubao Seed 2.0** (Pro / Lite / Mini) — 字节跳动，快速且便宜
- **MiniMax** (M2.5) — 轻量强者，也可本地运行
- **Step** (3.5 Flash) — 阶跃星辰，推理极快
- **Baichuan** (Baichuan4-Turbo) — 中文理解能力强
- **Spark** (v4.0 Ultra) — 科大讯飞，语音与中文 NLP 专长
- **Hunyuan** (Turbo-S) — 腾讯，微信生态集成

## 快速开始

告诉你的 OpenClaw：

\`\`\`
Use DeepSeek V3.2 for this conversation
\`\`\`

或让它选择最佳模型：

\`\`\`
Which Chinese model is best for coding? Switch to it.
\`\`\`

## 命令

| 命令 | 作用 |
|---------|-------------|
| \`list models\` | 显示所有可用中国 LLM 及状态 |
| \`use <model>\` | 切换到指定模型 |
| \`compare <models>\` | 对比能力与定价 |
| \`recommend <task>\` | 按任务类型推荐模型 |
| \`test <model>\` | 发送测试提示验证连通性 |
| \`status\` | 检查当前可访问的模型 |

## 模型选择指南

| 任务 | 推荐模型 | 原因 |
|------|------------------|-----|
| 通用对话 | Qwen3-Max | 最佳全能型，中文强 |
| 编码 | GLM-5 / Kimi K2.5 | 编码基准顶尖 |
| 数学与推理 | DeepSeek R1 | 专为推理设计 |
| 长文档 | Kimi K2.5 (128K) / DeepSeek V3.2 (1M) | 超大上下文窗口 |
| 快速且便宜 | Step 3.5 Flash / Doubao Seed 2.0 Mini | 亚秒级延迟 |
| 创意写作 | Qwen3-Max / Doubao Seed 2.0 Pro | 中文表达丰富 |
| 智能体任务 | GLM-5 / Qwen3-Max | 工具调用支持最佳 |

## 配置

技能从环境变量或 \`~/.chinese-llm-router/config.json\` 读取 API 密钥：

\`\`\`json
{
  "providers": {
    "deepseek": {
      "apiKey": "sk-xxx",
      "baseUrl": "https://api.deepseek.com/v1",
      "models": ["deepseek-chat", "deepseek-reasoner"]
    },
    "qwen": {
      "apiKey": "sk-xxx",
      "baseUrl": "https://dashscope.aliyuncs.com/compatible-mode/v1",
      "models": ["qwen3-max", "qwen3-max-thinking", "qwen3-coder-plus"]
    },
    "glm": {
      "apiKey": "xxx.xxx",
      "baseUrl": "https://open.bigmodel.cn/api/paas/v4",
      "models": ["glm-5", "glm-4-plus"]
    },
    "kimi": {
      "apiKey": "sk-xxx",
      "baseUrl": "https://api.moonshot.cn/v1",
      "models": ["kimi-k2.5", "kimi-k2.5-thinking"]
    },
    "doubao": {
      "apiKey": "xxx",
      "baseUrl": "https://ark.cn-beijing.volces.com/api/v3",
      "models": ["doubao-seed-2.0-pro", "doubao-seed-2.0-lite", "doubao-seed-2.0-mini"]
    },
    "minimax": {
      "apiKey": "xxx",
      "baseUrl": "https://api.minimax.chat/v1",
      "models": ["minimax-m2.5"]
    },
    "step": {
      "apiKey": "xxx",
      "baseUrl": "https://api.stepfun.com/v1",
      "models": ["step-3.5-flash"]
    },
    "baichuan": {
      "apiKey": "xxx",
      "baseUrl": "https://api.baichuan-ai.com/v1",
      "models": ["baichuan4-turbo"]
    },
    "spark": {
      "apiKey": "xxx",
      "baseUrl": "https://spark-api-open.xf-yun.com/v1",
      "models": ["spark-v4.0-ultra"]
    },
    "hunyuan": {
      "apiKey": "xxx",
      "baseUrl": "https://api.hunyuan.cloud.tencent.com/v1",
      "models": ["hunyuan-turbo-s"]
    }
  },
  "default": "qwen3-max",
  "fallback": ["deepseek-chat", "doubao-seed-2.0-pro"]
}
\`\`\`

## 安装

1. 从所需提供商获取 API 密钥（多数提供免费额度）：
   - DeepSeek: https://platform.deepseek.com
   - Qwen (Alibaba): https://dashscope.console.aliyun.com
   - GLM (Zhipu): https://open.bigmodel.cn
   - Kimi (Moonshot): https://platform.moonshot.cn
   - Doubao (ByteDance): https://console.volcengine.com/ark
   - MiniMax: https://platform.minimaxi.com
   - Step (StepFun): https://platform.stepfun.com
   - Baichuan: https://platform.baichuan-ai.com
   - Spark (iFlytek): https://console.xfyun.cn
   - Hunyuan (Tencent): https://cloud.tencent.com/product/hunyuan

2. 运行安装脚本：
   \`\`\`bash
   node scripts/setup.js
   \`\`\`

3. 完成！OpenClaw 现在可使用任意已配置模型。

## 定价参考（2026 年 2 月）

| 模型 | 输入 (¥/M tokens) | 输出 (¥/M tokens) | 备注 |
|-------|-------------------|---------------------|-------|
| DeepSeek V3.2 | ¥0.5 (cache ¥0.1) | ¥2.0 | 最便宜旗舰 |
| Qwen3-Max | ¥2.0 | ¥6.0 | 有免费额度 |
| GLM-5 | ¥5.0 | ¥5.0 | 刚发布，可能变动 |
| Kimi K2.5 | ¥2.0 | ¥6.0 | 开源，可自托管免费 |
| Doubao Seed 2.0 Pro | ¥0.8 | ¥2.0 | 字节补贴 |
| Doubao Seed 2.0 Mini | ¥0.15 | ¥0.3 | 超低价 |
| MiniMax M2.5 | ¥1.0 | ¥3.0 | 可本地运行 |
| Step 3.5 Flash | ¥0.7 | ¥1.4 | 推理最快 |

*价格截至 2026 年 2 月。所有提供商均向新用户提供免费额度或积分。*

## 所有 API 均兼容 OpenAI 格式

列出的每个提供商均使用 OpenAI chat/completions 格式。无需特殊 SDK——只需更改 \`baseUrl\` 和 \`apiKey\`。

## 特性

- **自动降级**：某提供商不可用时自动尝试下一个
- **成本追踪**：查看各模型 Token 用量与估算费用
- **智能路由**：描述任务即可获得最佳模型推荐
- **批量对比**：同一提示发送给多个模型，对比输出
- **上下文感知**：按对话主题记住模型偏好

## 链接

- 🦐 Try our AI Plaza: https://ai.xudd-v.com
- 📦 ClawHub: https://clawhub.ai/Xdd-xund/chinese-llm-router
- 💬 Feedback: https://ai.xudd-v.com/connect.html`,
};
