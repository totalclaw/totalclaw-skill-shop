module.exports = {
  skillId: 'totalclaw:totalclaw~sounderliu-gpu-cluster-monitor',
  descriptionZh:
    '高性能深度网页抓取工具，基于 Docker + Crawlee (Playwright) 容器化环境，可穿透 YouTube、X/Twitter 等复杂网站的防护，提供拦截级原始数据。',
  bodyZh: `# 技能：deep-scraper

## 概述
面向深度网页抓取的高性能工程工具。使用容器化的 Docker + Crawlee (Playwright) 环境，穿透 YouTube、X/Twitter 等复杂网站的防护，提供「拦截级」原始数据。

## 要求
1. **Docker**：主机必须已安装并运行 Docker。
2. **镜像**：构建环境并打上标签 \`clawd-crawlee\`。
   * 构建命令：\`docker build -t clawd-crawlee skills/deep-scraper/\`

## 集成指南
将 \`skills/deep-scraper\` 目录复制到你的 \`skills/\` 文件夹即可。确保 Dockerfile 保留在技能目录内，以实现自包含部署。

## 标准接口 (CLI)
\`\`\`bash
docker run -t --rm -v $(pwd)/skills/deep-scraper/assets:/usr/src/app/assets clawd-crawlee node assets/main_handler.js [TARGET_URL]
\`\`\`

## 输出规范 (JSON)
抓取结果以 JSON 字符串输出到 stdout：
- \`status\`：SUCCESS | PARTIAL | ERROR
- \`type\`：TRANSCRIPT | DESCRIPTION | GENERIC
- \`videoId\`：（YouTube）已验证的视频 ID。
- \`data\`：核心文本内容或字幕。

## 核心规则
1. **ID 验证**：所有 YouTube 任务必须验证 Video ID，防止缓存污染。
2. **隐私**：严禁抓取受密码保护或非公开个人信息。
3. **Alpha 优先**：自动剥离广告与噪声，输出针对 LLM 处理优化的纯数据。`,
};
