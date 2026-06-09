module.exports = {
  skillId: 'totalclaw:totalclaw~chris6970barbarian-hue-glitch-homeassistant',
  descriptionZh:
    '通过 Home Assistant API 控制智能家居设备，包括灯光、开关、窗帘、气候、场景与脚本。',
  bodyZh: `# Home Assistant Skill

通过 Home Assistant API 控制智能家居设备。

## 技能元数据

- **名称**: homeassistant
- **类型**: Skill
- **用途**: 通过 HA API 控制灯光、开关、窗帘、气候、场景、脚本

## 设置命令

### 前置条件

1. 本地网络运行 Home Assistant
2. 从 HA 个人资料页获取长期访问令牌（Long-Lived Access Token）

### 配置（单命令）

\`\`\`bash
# 运行以配置
ha-cli setup <HA_URL> <TOKEN>

# 示例：
ha-cli setup 192.168.1.100 your_long_lived_token_here
\`\`\`

或设置环境变量：

\`\`\`bash
export HA_URL="http://homeassistant.local:8123"
export HA_TOKEN="your_token_here"
\`\`\`

## 使用命令

### 基础控制

\`\`\`bash
# 打开设备（任意类型）
ha-cli on <device_name>
ha-cli <device_name> on

# 关闭设备
ha-cli off <device_name>
ha-cli <device_name> off
\`\`\`

### 亮度与颜色

\`\`\`bash
# 设置亮度（0-100）
ha-cli brightness <0-100> <device_name>
ha-cli <device_name> brightness 75

# 设置 RGB 颜色
ha-cli rgb #RRGGBB <device_name>
ha-cli rgb #FF5500 "Living Room"
\`\`\`

### 温度

\`\`\`bash
# 设置温度
ha-cli <temperature> <thermostat_name>
ha-cli 22 thermostat
\`\`\`

### 场景与脚本

\`\`\`bash
# 激活场景
ha-cli scene <scene_name>
ha-cli scene movie

# 运行脚本
ha-cli script <script_name>
ha-cli script morning
\`\`\`

### 状态与发现

\`\`\`bash
# 检查 HA 状态
ha-cli status
ha-cli info

# 列出所有实体
ha-cli list
ha-cli list entities

# 按域列出
ha-cli list light
ha-cli list switch
ha-cli list climate
\`\`\`

## 支持的设备类型

| 域 | 命令 | 示例 |
|--------|----------|----------|
| light | on, off, brightness, rgb | \`ha-cli on living room\` |
| switch | on, off | \`ha-cli off tv\` |
| cover | open, close, stop | \`ha-cli open blinds\` |
| climate | temperature, mode | \`ha-cli 22 thermostat\` |
| lock | lock, unlock | \`ha-cli lock front door\` |
| scene | activate | \`ha-cli scene movie\` |
| script | run | \`ha-cli script morning\` |

## 实体匹配

- 不区分大小写
- 部分名称匹配（bed → Bedroom Light）
- 启用模糊匹配

## 错误处理

- 连接错误：显示 HA URL 与令牌设置说明
- 未找到实体：显示相似实体建议
- 无效命令：显示用法帮助

## 相关技能

- openhue (Philips Hue)
- sonoscli (Sonos 音箱)
- eightctl (Eight Sleep)

## 文件

\`\`\`
homeassistant/
├── SKILL.md      # 本文件
├── README.md     # 用户文档
├── ha-cli        # 主 CLI 可执行文件
├── ha            # Bash 包装器
└── config.json   # 保存的配置
\`\`\``,
};
