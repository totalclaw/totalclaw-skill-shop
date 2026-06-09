module.exports = {
  skillId: 'totalclaw:totalclaw~apenklit-waste-reminder',
  descriptionZh:
    '一个灵活、节省 token 的技能，用于自动化垃圾桶收运提醒。',
  bodyZh: `# Waste Reminder Skill

一个灵活、节省 token 的技能，用于自动化垃圾桶收运提醒。

## 概述

此技能帮助根据用户自定义的时间表自动化垃圾收运提醒。它使用简单的 JSON 配置，以实现最大灵活性和最小 token 占用。

**工作原理：**
技能读取你的配置和时间表，确定哪些提醒需要发送，并以你的 AI 助手能够处理的格式输出它们。随后由 AI 将实际消息发送到指定通道。

输出格式：
\`\`\`
SEND_TO:recipient_id
CHANNEL:whatsapp
Your message here
---
\`\`\`

这种方式让你的配置保持简单且节省 token——技能本身不需要 API key 或直接的网络访问。

## 功能特性

- 多种垃圾桶类型
- 自定义提醒时间表（每次收运最多 4 次）
- 灵活的目标定位（群组、个人、升级提醒）
- 多通道支持（WhatsApp、Telegram、Discord、Email）——消息由你的 AI 发送
- 确认机制（停止后续提醒）
- 单一时间表文件
- 节省 token——生成提醒时不占用 AI token

## 安装

\`\`\`bash
clawhub install waste-reminder
\`\`\`

## 用户设置

当你安装此技能时，AI 助手会向你发送一个配置模板。用任何语言回复即可——AI 会理解并将其转换为正确的格式！

### 示例模板（包含所有选项的完整示例）

\`\`\`
I want to set up waste reminders!

My containers:
- blue: Paper (🔵)
- gray: Residual (⚫)
- orange: Plastic (🟠)
- green: Garden (🟢)

Reminder times:
- 18:00: to group_whatsapp (day before, group notification)
- 22:00: to group_whatsapp (evening reminder to group)
- 06:30: to partner_whatsapp (morning, specific person)
- 09:30: to me_telegram (escalation, different channel)

My contacts:
- group_whatsapp: 123456789@g.us
- partner_whatsapp: +31600000001
- me_telegram: 222222222

Upcoming pickups:
- 2026-02-24: orange
- 2026-02-25: gray
- 2026-03-02: blue
\`\`\`

AI 会将其转换为正确的 JSON 格式并完成所有设置。

## 配置

技能将配置存储在：
\`/data/.openclaw/workspace/data/waste-reminder/\`

### 文件

\`\`\`
waste-reminder/
├── config.json      # Your containers, reminder times, targets
└── schedule.json   # Your pickup dates and status
\`\`\`

### 完整的 config.json 示例（展示所有选项）

\`\`\`json
{
  "config_version": "1.0",
  "containers": {
    "blue": {"name": "Paper", "color": "blue", "emoji": "🔵"},
    "gray": {"name": "Residual", "color": "gray", "emoji": "⚫"},
    "orange": {"name": "Plastic", "color": "orange", "emoji": "🟠"},
    "green": {"name": "Garden", "color": "green", "emoji": "🟢"}
  },
  "reminder_times": {
    "18:00": {
      "type": "group",
      "template": "Tomorrow: {container_emoji} {container_name} will be collected!",
      "target": "group_whatsapp"
    },
    "22:00": {
      "type": "group",
      "template": "Not confirmed yet - {container_emoji} needs to go out by 7am!",
      "target": "group_whatsapp"
    },
    "06:30": {
      "type": "personal",
      "template": "⚠️ {container_emoji} put out NOW!",
      "target": "partner_whatsapp"
    },
    "09:30": {
      "type": "escalation",
      "template": "Container still not outside!",
      "target": "me_telegram"
    }
  },
  "targets": {
    "group_whatsapp": {"id": "123456789@g.us", "channel": "whatsapp"},
    "partner_whatsapp": {"id": "+31600000001", "channel": "whatsapp"},
    "partner_telegram": {"id": "111111111", "channel": "telegram"},
    "me_whatsapp": {"id": "+31600000002", "channel": "whatsapp"},
    "me_telegram": {"id": "222222222", "channel": "telegram"},
    "me_discord": {"id": "https://discord.com/api/webhooks/...", "channel": "discord"}
  }
}
\`\`\`

### 完整的 schedule.json 示例

\`\`\`json
{
  "2026-02-24": {
    "orange": {
      "confirmed": false,
      "reminded_18:00": false,
      "reminded_22:00": false,
      "reminded_06:30": false,
      "reminded_09:30": false
    }
  },
  "2026-02-25": {
    "gray": {
      "confirmed": false,
      "reminded_18:00": false,
      "reminded_22:00": false,
      "reminded_06:30": false,
      "reminded_09:30": false
    }
  }
}
\`\`\`

## Cron 任务

添加一个每 15 分钟运行一次的 cron 任务：
- 名称："Waste Reminder Check"
- 时间表：每 15 分钟
- 脚本：\`/data/.openclaw/workspace/skills/waste-reminder/waste_cron.py\`

cron 脚本检查是否有提醒需要发送并输出它们。你的 AI 助手（由 cron 任务触发）读取该输出，并将实际消息发送到相应通道。

## 用户命令

- 确认："container is out"
- 查看："waste schedule" 或 "waste status"
- 添加："waste add [date] [container]"
- 删除："waste remove [date] [container]"

## 文件

\`\`\`
waste-reminder/
├── SKILL.md           # This file
├── waste_reminder.py # CLI tool (manual commands)
└── waste_cron.py      # Cron script (every 15 min)
\`\`\`

## 模板占位符

- \`{container_emoji}\` - 表情符号
- \`{container_name}\` - 名称
- \`{date}\` - 日期

## 通道支持

支持的通道：
- \`whatsapp\` - 使用电话号码或群组 ID 作为 ID
- \`telegram\` - 使用 chat ID
- \`discord\` - 使用 webhook URL
- \`email\` - 使用电子邮箱地址

每个目标都必须同时指定 \`id\` 和 \`channel\`。

## 目标命名约定

目标应以通道后缀命名：
- \`group_whatsapp\`、\`group_telegram\`、\`group_discord\`
- \`me_whatsapp\`、\`me_telegram\`、\`me_discord\`
- \`partner_whatsapp\`、\`partner_telegram\`、\`partner_discord\`

通道会自动从目标名称中提取。

## 许可证

MIT License`,
};
