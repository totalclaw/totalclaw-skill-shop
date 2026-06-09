module.exports = {
  skillId: 'totalclaw:totalclaw~raghulpasupathi-geo-blocking',
  descriptionZh:
    '地理封锁与区域合规技能，支持 IP 地理定位、VPN/代理检测、Tor 出口节点识别及 GDPR 等区域法规合规与自定义地理规则。',
  bodyZh: `# 地理封锁技能

用于地理限制与区域合规的技能。

## 核心技能

### 1. Geo Shield
**技能 ID**：\`geo-shield\`

**用途**：基于国家/地区的内容过滤与合规

**功能**：
- IP 地理定位
- VPN/代理检测
- Tor 出口节点检测
- 区域法规合规（GDPR、本地审查等）
- 自定义地理规则

**安装**：
\`\`\`bash
npm install @clawhub/geo-shield
\`\`\`

**使用场景**：
- GDPR 合规（欧盟）
- 本地内容法规（如德国仇恨言论规则等）
- 区域限制
- 政府强制要求

**示例**：
- 欧盟：封锁不符合 GDPR 的网站
- 德国：更严格的仇恨言论规则
- 中国：政府强制封锁
- 澳大利亚：极端暴力内容过滤

---

*家长控制相关内容，请参阅 [PARENTAL_CONTROLS.md](PARENTAL_CONTROLS.md)。*`,
};
