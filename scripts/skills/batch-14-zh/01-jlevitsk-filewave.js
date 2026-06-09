module.exports = {
  skillId: 'totalclaw:totalclaw~jlevitsk-filewave',
  descriptionZh:
    '通过 REST API 查询和管理 FileWave UEM 设备清单，支持多服务器配置、库存查询、批量更新与舰队分析。',
  bodyZh: `# FileWave UEM API 技能

通过 REST API 查询和管理 FileWave UEM 设备清单。

> **⚠️ 免责声明：** 本技能是智能体端点管理（AEM）——AI 智能体直接与 UEM 平台交互以协助 IT 管理员——的**技术演示**。按原样提供，仅供教育目的，探索 AI 与端点管理结合的可能性。作者和 FileWave 均不对在生产或任何其他环境中使用本技能所产生的使用、误用或后果承担任何责任。**使用风险自负。** 请始终先在实验环境中测试，并在应用到生产系统前审查所有操作。

## 概述

FileWave 是面向 macOS、Windows、ChromeOS、Android、tvOS、iPadOS 和 iOS 的统一端点管理平台。本技能提供对设备清单和状态信息的程序化访问。

### 许可

FileWave（ https://www.filewave.com ）提供灵活的部署选项：

- **Community Edition** — 免费，最多管理 **15 台计算机 + 15 台移动设备**
  - 适合测试和小规模部署
  - 所有 API 功能可用
  - 无高级功能（部署、策略、MDM 命令）

- **Commercial License** — 超过 15 台设备，含高级功能
  - TeamViewer 远程控制
  - 部署管理、策略执行、MDM 命令
  - 技术支持

本技能适用于两种许可模式。

## 设置

### 前置条件

- FileWave 服务器主机名/DNS
- FileWave API 令牌（来自 FileWave Central → Manage Administrators → API Token）

### 配置

通过 \`filewave setup\` 进行交互式设置：

\`\`\`bash
filewave setup
\`\`\`

这会在 \`~/.filewave/config\` 中创建服务器配置文件。凭证安全存储（chmod 600，从不在脚本中硬编码）。

对于 **CI/CD 环境**，使用环境变量：

\`\`\`bash
export FILEWAVE_SERVER="filewave.company.com"
export FILEWAVE_TOKEN="your_api_token_here"
\`\`\`

切勿在脚本或文档中硬编码令牌。

## 用法

### 基本命令

\`\`\`bash
# 设置配置文件（首次）
filewave setup

# 列出已配置的服务器
filewave profiles

# 查询清单
filewave query --query-id 1

# 带过滤器查询
filewave query --query-id 1 --filter "last_seen > 30 days"

# 搜索设备（现在返回多个匹配项）
filewave device-search "iPad"

# 按产品类型查找所有设备（权威硬件查找）
filewave find-devices iPad
filewave find-devices iPhone

# 查看设备层级和组
filewave hierarchy 123

# 触发模型更新
filewave update-model

# 舰队分析
filewave insights --type platform
filewave insights --type stale --days 30

# 缓存管理
filewave warm-cache
filewave cache-status

# 批量设备更新（学校工作流）
filewave bulk-template --output ~/devices.csv
filewave bulk-update --csv ~/devices.csv

# 会话比较
filewave query --query-id 1 --reference lab
filewave query --query-id 1 --profile production --reference prod
filewave compare lab prod
\`\`\`

## API 架构

**多服务器支持：** 配置多个 FileWave 服务器（实验、生产、测试），使用命名配置文件。

### 使用的主要端点

- \`GET /api/inv/api/v1/query_result/{query_id}\` — 查询设备清单
- \`GET /filewave/api/devices/v1/devices/{id}\` — 设备详情
- \`GET /filewave/api/devices/internal/devices/{id}/groups\` — 设备组成员关系
- \`PATCH /filewave/api/devices/v1/devices/{id}\` — 更新设备（名称、认证用户）
- \`POST /filewave/api/fwserver/update_model\` — 批量更新后刷新模型

### 可用设备字段（按清单查询）

在清单查询中配置要包含的字段：
- 设备名称、型号、序列号、UDID/IMEI
- 操作系统名称、版本、构建号
- 最后签入时间戳
- 注册日期、用户分配
- 设备组、管理状态、合规状态
- 以及 50+ 更多字段（可配置）

### 支持的平台
- macOS
- Windows
- ChromeOS
- Android
- iOS
- iPadOS
- tvOS

## 示例查询

\`\`\`bash
# 从清单查询（返回所有设备）
filewave query --query-id 1

# 过滤 30+ 天未出现的设备
filewave query --query-id 1 --filter "last_seen > 30 days"

# 获取 JSON 格式用于脚本
filewave query --query-id 1 --format json

# 多个过滤器（AND 逻辑）
filewave query --query-id 1 \\
  --filter "last_seen > 30 days" \\
  --filter "platform = iOS"

# 比较实验与生产
filewave query --query-id 1 --profile lab --reference lab_inventory
filewave query --query-id 1 --profile prod --reference prod_inventory
filewave compare lab_inventory prod_inventory
\`\`\`

## 认证

FileWave API 使用 Bearer 令牌认证：

\`\`\`
Authorization: Bearer <token>
\`\`\`

## 响应格式

FileWave 清单查询返回列导向数据：

\`\`\`json
{
  "offset": 0,
  "fields": [
    "Client_device_name",
    "OperatingSystem_name",
    "OperatingSystem_version",
    "Client_last_connected_to_fwxserver"
  ],
  "values": [
    ["MacBook-Pro-John", "macOS 15 Sequoia", "15.1.0", "2026-02-12T14:30:00Z"],
    ["iPad-Student-001", "iPadOS", "17.3", "2026-02-10T10:22:00Z"]
  ],
  "filter_results": 2,
  "total_results": 2,
  "version": 7
}
\`\`\`

CLI 会自动将此转换为设备对象。

## 当前功能

- ✅ 多服务器配置文件支持
- ✅ 清单查询集成
- ✅ 自然语言过滤（last_seen > 30 days）
- ✅ 设备层级分析（原始 vs 克隆）
- ✅ 批量设备更新（学校部署工作流）
- ✅ 舰队分析：平台分布、过期设备报告、字段摘要
- ✅ 会话跟踪和服务器比较
- ✅ JSON 导出用于脚本
- ✅ 7 天设备缓存提升性能

## 文档

- **README.md** — 概述和快速入门
- **CLI_REFERENCE.md** — 完整命令参考（含舰队分析、缓存命令）
- **BULK_UPDATE.md** — 学区工作流
- **API_CAPABILITIES.md** — API 参考和分析模块
- **CREDENTIAL_ARCHITECTURE.md** — 安全设计
- **SESSION_DATA_MANAGER.md** — 会话跟踪内部机制
- **ONBOARDING.md** — 设置向导详情`,
};
