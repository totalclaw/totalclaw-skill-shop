module.exports = {
  skillId: 'totalclaw:totalclaw~underbench2-gif-ub2-api-health-checker',
  descriptionZh:
    '系统化 API 测试与监控技能，验证端点响应、测量性能并生成健康报告，支持多种认证方式。',
  bodyZh: `# API 健康检查器

使 Claw 能够测试 API 端点、验证响应、测量性能并生成健康报告的技能。

## 本技能做什么

本技能提供系统化的 API 测试与监控工作流：

1. **端点测试** — 向指定 API 端点发送 HTTP 请求（GET、POST、PUT、DELETE）
2. **响应验证** — 对照预期值检查状态码、响应时间与响应体结构
3. **认证支持** — 处理 API 密钥、Bearer 令牌与基本认证头
4. **性能测量** — 记录响应时间并标记缓慢端点
5. **健康报告** — 生成汇总所有已测试端点状态的综合报告

## 如何使用

提供 API 端点，Claw 将对其进行测试：

- "Check if https://api.example.com/v1/status is responding correctly"
- "Test all endpoints in this API and report which ones are failing"
- "Monitor these 5 endpoints and tell me their average response times"
- "Verify that the /users endpoint returns a JSON array with the expected fields"

## 配置

可指定：
- **Endpoints** — 要测试的 URL 列表
- **Expected status codes** — 每个端点应返回的 HTTP 状态（默认：200）
- **Timeout** — 每次请求的最大等待时间（默认：10 秒）
- **Headers** — 自定义头，含认证令牌
- **Request body** — 用于 POST/PUT 请求

## 输出

健康报告包括：
- **状态摘要** — 测试端点总数、通过、失败与超时
- **各端点详情** — URL、方法、状态码、响应时间与通过/失败结果
- **性能指标** — 平均、最小、最大与 p95 响应时间
- **建议** — 针对缓慢或返回错误的端点的改进建议`,
};
