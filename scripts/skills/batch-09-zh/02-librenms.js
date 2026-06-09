module.exports = {
  skillId: 'totalclaw:totalclaw~florianbeer-librenms',
  descriptionZh:
    '通过 LibreNMS REST API 只读监控网络基础设施：设备状态、健康传感器、端口统计与告警。',
  bodyZh: `# LibreNMS 技能

通过 LibreNMS REST API 监控网络基础设施。只读监控技能，用于设备状态、健康传感器、端口统计与告警。

## 配置

创建 \`~/.openclaw/credentials/librenms/config.json\`：
\`\`\`json
{
  "url": "https://librenms.example.com",
  "api_token": "your-api-token-here"
}
\`\`\`

或设置环境变量：
- \`LIBRENMS_URL\` — LibreNMS 实例的基础 URL
- \`LIBRENMS_TOKEN\` — API 认证令牌

## 命令

### 快速概览
\`\`\`bash
librenms summary
\`\`\`
仪表盘视图：设备总数、在线/离线数量、活跃告警数。建议首先运行以快速了解整体状态。

### 设备管理
\`\`\`bash
librenms devices           # 列出所有设备及其状态、IP、OS、运行时间
librenms down             # 仅显示离线设备（告警关键）
librenms device <hostname> # 详细信息：硬件、序列号、位置、OS 版本
\`\`\`

### 健康监控
\`\`\`bash
librenms health <hostname> # 温度、CPU、内存、磁盘使用传感器
librenms ports <hostname>  # 网络接口及流量统计
\`\`\`

### 告警
\`\`\`bash
librenms alerts           # 显示活跃/未解决告警及严重级别与时间戳
\`\`\`

## 使用模式

**每日健康检查：**
\`\`\`bash
librenms summary && librenms down && librenms alerts
\`\`\`

**调查特定设备：**
\`\`\`bash
librenms device switch-core-01
librenms health switch-core-01
librenms ports switch-core-01
\`\`\`

**快速离线设备排查：**
\`\`\`bash
librenms down | grep -v "UP"
\`\`\`

## 重要说明

- 所有操作均为**只读** — 无法修改设备
- 脚本接受自签名证书（curl 使用 -sk 标志）
- 状态指示：● 绿色 = 在线，● 红色 = 离线
- 运行时间格式化为人类可读（天/小时，而非秒）
- 流量统计格式化为 KB/MB/GB 每秒

## 心跳集成

定期检查基础设施健康：
\`\`\`bash
# 在 heartbeat 脚本中
if librenms down | grep -q "Devices Down"; then
    # 对离线设备告警
    librenms down
fi

# 检查活跃告警
if librenms alerts | grep -q "Active Alerts"; then
    librenms alerts
fi
\`\`\`

## 依赖

- \`curl\` — API 调用
- \`jq\` — JSON 解析
- \`bc\` — 数值格式化（可选，用于字节转换）

## API 覆盖

已封装端点：
- \`/api/v0/devices\` — 所有设备
- \`/api/v0/devices/{hostname}\` — 单设备详情
- \`/api/v0/devices/{hostname}/health\` — 健康传感器
- \`/api/v0/devices/{hostname}/ports\` — 网络端口
- \`/api/v0/alerts?state=1\` — 未解决告警

完整 API 文档：https://docs.librenms.org/API/

## 故障排查

**"Config file not found"**
创建 \`~/.openclaw/credentials/librenms/config.json\` 或设置环境变量。

**"API returned HTTP 401"**
检查 API 令牌。在 LibreNMS 的 Settings → API 中生成新令牌。

**"Failed to connect"**
验证 URL 正确且 LibreNMS 实例可达。检查防火墙规则。

**自签名证书警告**
脚本使用 \`-sk\` 忽略证书验证（LibreNMS 部署中常见）。若需严格验证，编辑脚本并移除 \`-k\` 标志。`,
};
