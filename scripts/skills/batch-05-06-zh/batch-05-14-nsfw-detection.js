module.exports = {
  skillId: 'totalclaw:totalclaw~raghulpasupathi-nsfw-detection',
  descriptionZh: '检测成人/不当内容的技能集合，支持多类别分类与本地 ONNX 模型。',
  bodyZh: `# NSFW 检测技能

用于检测成人/不当内容的技能。

## 核心技能

### 1. NSFW Detector Pro
**技能 ID**：\`nsfw-detector-pro\`

**用途**：高级 NSFW 内容检测

**功能**：
- 多类别分类（色情、性感、hentai、绘画）
- 置信度评分（0-100%）
- 肤色检测
- 上下文感知（医疗、艺术例外）
- 本地 ONNX 模型（无需外部 API）

**安装**：
\`\`\`bash
npm install @clawhub/nsfw-detector
\`\`\`

**配置**：
\`\`\`javascript
{
  "skill": "nsfw-detector-pro",
  "settings": {
    "categories": ["porn", "sexy", "hentai"],
    "threshold": 0.7,
    "contextAware": true,
    "allowArt": true,
    "allowMedical": true,
    "localModel": true
  }
}
\`\`\`

**用法**：
\`\`\`javascript
import { detectNSFW } from '@clawhub/nsfw-detector';

const result = await detectNSFW(imageUrl);
// {
//   isNSFW: true,
//   confidence: 0.92,
//   categories: { porn: 0.92, sexy: 0.15 },
//   action: 'block'
// }
\`\`\`

**准确率**：露骨内容 92-95%，暗示性内容 75-80%

**使用场景**：
- 屏蔽色情与露骨图像
- 过滤成人网站
- 保护儿童上网安全

**故障排查**：
- 艺术作品误报？启用 \`allowArt\`
- 医疗图像被屏蔽？启用 \`allowMedical\`
- 提高阈值以减少误报

**相关技能**：\`url-reputation\`、\`content-blur\`

---

### 2. URL Reputation Checker
**技能 ID**：\`url-reputation\`

**用途**：检查域名是否为成人/不当网站

**功能**：
- 域名信誉数据库
- 成人网站检测
- 钓鱼/恶意软件检测
- 缓存查询

**安装**：
\`\`\`bash
npm install @clawhub/url-reputation
\`\`\`

**使用场景**：
- 按域名屏蔽成人网站
- 图像分析前的快速预过滤
- 补充视觉检测

---

## 安装

### 通过 ClawHub
\`\`\`
https://clawhub.ai/raghulpasupathi/nsfw-detection
\`\`\`

### 通过 npm
\`\`\`bash
npm install @raghulpasupathi/nsfw-detection
\`\`\`

## 配置示例

### 儿童保护（严格）
\`\`\`json
{
  "nsfw-detector-pro": {
    "threshold": 0.3,
    "blockAll": true,
    "allowArt": false,
    "allowMedical": false,
    "allowOverride": false
  }
}
\`\`\`

### 青少年保护（平衡）
\`\`\`json
{
  "nsfw-detector-pro": {
    "threshold": 0.7,
    "allowArt": true,
    "allowMedical": true,
    "allowOverride": false
  }
}
\`\`\`

### 成人过滤（宽松）
\`\`\`json
{
  "nsfw-detector-pro": {
    "threshold": 0.9,
    "warnOnly": true,
    "allowOverride": true
  }
}
\`\`\`

---

*暴力内容检测请参阅 [VIOLENCE_DETECTION.md](VIOLENCE_DETECTION.md)。*`,
};
