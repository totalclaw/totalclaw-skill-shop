# ArXiv 智能体验证器

**来源论文：** [Scaling Agentic Verifier for Competitive Coding](https://arxiv.org/abs/2602.09012)（ID：4a4c4dae6a5145ebc4d62eb2d64b0f0f）
**类型：** 代码验证 / 测试生成

## 描述

本技能实现了一种「智能体验证器」（Agentic Verifier），通过生成有针对性的「判别性」测试用例，主动推理代码正确性。它不再随机采样，而是分析问题约束与代码逻辑，以发现边界情况或逻辑缺陷。

## 功能特性

- **分析代码：** 理解 Python/JS 代码逻辑。
- **生成测试：** 创建特定输入以暴露代码缺陷。
- **执行与验证：** 针对生成的测试运行代码（生产环境建议使用沙箱）。

## 用法

```javascript
const AgenticVerifier = require('./index');
const verifier = new AgenticVerifier(process.env.OPENAI_API_KEY);

const problem = "Given two integers A and B, output their sum.";
const code = "print(int(input().split()[0]) + int(input().split()[1]))";

verifier.verify(problem, code, 'python')
  .then(result => console.log(result))
  .catch(err => console.error(err));
```

## 配置

- **OPENAI_API_KEY：** LLM 推理所必需。

## 安全警告

本技能会执行传入的代码。请在受限环境或沙箱中使用。
