module.exports = {
  skillId: 'totalclaw:totalclaw~ishsharm0-alert-system',
  descriptionZh:
    '可自定义触发条件的智能监控：价格提醒（股票、加密货币、商品）、事件监控、自定义条件告警，并通过 Telegram 推送通知。',
  bodyZh: `# 告警系统

支持可自定义触发条件的智能监控 — 价格提醒（股票、加密货币、商品）、事件监控、自定义条件告警，并通过 Telegram 通知。

## 用法
\`\`\`python
from alert_system.alerts import AlertSystem

system = AlertSystem("<username>")
system.add_alert("price", "BTC", "above", 100000)
triggered = system.check_all()
\`\`\`

## 功能
- 价格提醒（股票 via yfinance、加密货币）
- 网站/事件变更监控
- 自定义条件触发
- 与 Cron 集成的定时检查
- 触发时 Telegram 通知`,
};
