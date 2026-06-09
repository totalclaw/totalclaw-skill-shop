module.exports = {
  skillId: 'totalclaw:totalclaw~yi-sir-document-creator-sophnet',
  descriptionZh: '集成文档创建技能，支持 DOCX/PPTX 并自动上传至 OSS 返回 URL。',
  bodyZh: `# 文档创建器（SophNet 自动上传）

## 描述

集成文档创建技能，支持创建 Word 文档（DOCX）和 PowerPoint 演示文稿（PPTX），并自动上传至 OSS 返回 URL。

## 用法

\`\`\`bash
# 使用技能创建文档
openclaw document-creator /path/to/your/file.txt

# 或通过会话调用
# 在 OpenClaw 会话中：Create document /path/to/file.png
\`\`\`

## 配置要求

- 设置 \`SOPH_API_KEY\` 环境变量
- 或在 OpenClaw 配置文件中配置 sophnet API 密钥

## 支持参数

- \`file_path\`：要上传的本地文件路径（必填）

## 返回值

- 成功：返回签名 URL 字符串
- 失败：抛出含错误信息的异常

## 依赖

- Python 3.7+
- requests 库
- OpenClaw 配置访问权限`,
};
