module.exports = {
  skillId: 'totalclaw:totalclaw~underbench2-gif-ub2-api-health-checker',
  descriptionZh:
    '测试 API 端点、验证响应、测量性能并生成健康报告，支持多种 HTTP 方法与认证方式。',
  bodyZh: `# API 健康检查器

使 Claw 能够测试 API 端点、验证响应、测量性能并生成健康报告的技能。

## 本技能做什么

提供系统化的 API 测试与监控工作流：

1. **端点测试** — 向指定 API 端点发送 HTTP 请求（GET、POST、PUT、DELETE）
2. **响应验证** — 对照预期值检查状态码、响应时间与响应体结构
3. **认证支持** — 处理 API 密钥、Bearer 令牌与 Basic Auth 头
4. **性能测量** — 记录响应时间并标记慢端点
5. **健康报告** — 生成汇总所有已测端点状态的综合报告

## 如何使用

提供 API 端点，Claw 将执行测试：

- "检查 https://api.example.com/v1/status 是否正常响应"
- "测试此 API 的所有端点并报告哪些失败"
- "监控这 5 个端点并告诉我平均响应时间"
- "验证 /users 端点是否返回包含预期字段的 JSON 数组"

## 配置

可指定：
- **Endpoints** — 待测试 URL 列表
- **Expected status codes** — 各端点应返回的 HTTP 状态（默认：200）
- **Timeout** — 单次请求最大等待时间（默认：10 秒）
- **Headers** — 自定义头（含认证令牌）
- **Request body** — POST/PUT 请求体

## 输出

健康报告包含：
- **状态摘要** — 测试端点总数、通过、失败与超时
- **逐端点详情** — URL、方法、状态码、响应时间、通过/失败结果
- **性能指标** — 平均、最小、最大与 p95 响应时间
- **建议** — 针对慢端点或返回错误的改进建议`,
};
