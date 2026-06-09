module.exports = {
  skillId: 'totalclaw:totalclaw~raghulpasupathi-parental-controls',
  descriptionZh:
    '家长/监护人管理与监控技能，提供家长门户、活动报告、实时告警、PIN 锁与屏幕时间管理。',
  bodyZh: `# 家长控制技能

用于家长/监护人管理与监控的技能。

## 核心技能

### 1. 家长门户
**技能 ID**：\`parent-portal\`

**用途**：监护人监控与配置界面

**功能**：
- 每周活动报告
- 实时告警（高风险内容）
- 设置锁定（PIN 保护）
- 屏幕时间管理
- 内容审查仪表盘
- 白名单/黑名单管理

**安装**：从 ClawHub 下载

**配置**：
\`\`\`javascript
{
  "skill": "parent-portal",
  "settings": {
    "pinProtection": true,
    "weeklyReports": true,
    "realTimeAlerts": true,
    "categories": ["csam", "self-harm", "high-nsfw"],
    "alertEmail": "parent@example.com"
  }
}
\`\`\`

**功能**：
- **活动仪表盘**：查看被拦截内容及时间
- **PIN 锁**：儿童无法关闭保护
- **报告**：每周摘要邮件（可选）
- **告警**：关键内容即时通知

**使用场景**：
- 家庭网络安全
- 学校监控（需 consent）
- 儿童保护

---

*完整技能索引见 [RECOMMENDED_SKILLS.md](../RECOMMENDED_SKILLS.md)。*`,
};
