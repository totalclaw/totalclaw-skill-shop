module.exports = {
  skillId: 'totalclaw:totalclaw~gblockchainnetwork-ollama-model-tuner',
  descriptionZh:
    '使用本地数据集、评估指标和迭代调整来优化 Ollama 模型/提示。不需要云。',
  bodyZh: `# Ollama Model Tuner v1.0.0

## 🎯 用途
- 提示词工程与 A/B 测试
- Modelfile 自定义
- 使用本地数据的 LoRA 微调
- 性能基准测试

## 🚀 快速开始
\`\`\`
!ollama-model-tuner --model llama3 --dataset ./data.json --task classification
\`\`\`

## 文件
- \`scripts/tune.py\`：带评估循环的 Python 调优器
- \`prompts/system.md\`：基础系统提示词

## 支持环境
Ollama 0.3+、Python 3.10+、JSONL/CSV 格式数据集。`,
};
