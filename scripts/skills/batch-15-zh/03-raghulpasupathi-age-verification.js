module.exports = {
  skillId: 'totalclaw:totalclaw~raghulpasupathi-age-verification',
  descriptionZh:
    '年龄验证与适龄内容过滤技能，支持证件核验、人脸年龄估计、第三方验证（Yoti、Jumio）及家长同意流程，适用于 COPPA 合规与年龄限制内容。',
  bodyZh: `# 年龄验证技能

用于年龄验证与适龄内容过滤的技能。

## 核心技能

### 1. Age Guard
**技能 ID**：\`age-guard\`

**用途**：验证用户年龄并执行年龄限制

**功能**：
- 证件验证（身份证、护照）
- 基于人脸的年龄估计
- 第三方验证（Yoti、Jumio）
- 年龄门控 UI 组件
- 家长同意工作流

**安装**：
\`\`\`bash
npm install @clawhub/age-guard
\`\`\`

**方法**：
1. **自报年龄**：荣誉制度（基础）
2. **证件验证**：身份证扫描
3. **人脸估计**：计算机视觉
4. **第三方**：Yoti、Jumio API
5. **家长 PIN**：适用于儿童

**使用场景**：
- COPPA 合规（13 岁以下儿童）
- 年龄限制内容
- 家长控制执行

---

*地理封锁相关内容，请参阅 [GEO_BLOCKING.md](GEO_BLOCKING.md)。*`,
};
