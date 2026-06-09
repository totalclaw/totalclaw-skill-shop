module.exports = {
  skillId: 'totalclaw:totalclaw~raghulpasupathi-image-detection',
  descriptionZh: '用于分析与检测 AI 生成图像的技能集合。',
  bodyZh: `# 图像检测技能

用于分析与检测 AI 生成图像的技能。

## 核心技能

### 1. Image Analyzer
**技能 ID**：\`image-analyzer\`

**用途**：无需外部 API 的本地图像分析

**功能**：
- EXIF 元数据提取
- AI 伪影检测（异常手部、模糊背景等）
- 视觉相似度比较
- 反向图像搜索集成

**安装**：
\`\`\`bash
npm install @clawhub/image-analyzer
\`\`\`

**配置**：
\`\`\`javascript
{
  "skill": "image-analyzer",
  "settings": {
    "detectArtifacts": true,
    "extractMetadata": true,
    "localOnly": true,
    "checkSignatures": ["DALL-E", "Midjourney", "Stable-Diffusion"]
  }
}
\`\`\`

**使用场景**：快速本地检测、元数据验证、伪影识别

---

### 2. HuggingFace Image Detector
**技能 ID**：\`hf-image-detector\`

**用途**：基于机器学习的 AI 图像检测

**功能**：
- 预训练模型（umm-maybe/AI-image-detector）
- 高准确率（90-95%）
- 支持 SD、Midjourney、DALL-E
- 本地推理（无需 API 调用）

**安装**：
\`\`\`bash
npm install @clawhub/hf-image-detector
\`\`\`

**使用场景**：高准确率检测、注重隐私的分析

---

### 3. Hive Moderation API
**技能 ID**：\`hive-api\`

**用途**：基于云的图像分析

**功能**：
- AI 生成内容检测
- NSFW 过滤
- 物体检测
- 快速推理（500ms）

**安装**：通过 REST 集成 API

**使用场景**：快速检测、多用途分析、NSFW 过滤

---

## 安装

### 通过 ClawHub
\`\`\`
https://clawhub.ai/raghulpasupathi/image-detection
\`\`\`

### 通过 npm
\`\`\`bash
npm install @raghulpasupathi/image-detection
\`\`\`

## 配置示例

### 高准确率组合
\`\`\`json
{
  "skills": ["image-analyzer", "hf-image-detector", "hive-api"],
  "votingStrategy": "majority"
}
\`\`\`

### 注重隐私组合
\`\`\`json
{
  "skills": ["image-analyzer", "hf-image-detector"],
  "externalAPIs": false
}
\`\`\`

### 快速检测组合
\`\`\`json
{
  "skills": ["hive-api"],
  "cacheResults": true
}
\`\`\`

---

*视频检测请参阅 [VIDEO_DETECTION.md](VIDEO_DETECTION.md)。*`,
};
