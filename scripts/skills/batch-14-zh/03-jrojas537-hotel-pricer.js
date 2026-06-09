module.exports = {
  skillId: 'totalclaw:totalclaw~jrojas537-hotel-pricer',
  descriptionZh:
    '基于 Go 的 CLI，通过 Amadeus API 搜索酒店空房与价格。支持按城市、入住/退房日期和宾客人数查询，安全管理 API 凭证并输出格式化 JSON。',
  bodyZh: `# hotel-pricer 技能

基于 Go 的 CLI，通过 Amadeus API 搜索酒店空房与价格。

## 描述

本技能允许智能体按城市、入住/退房日期和宾客人数查找酒店优惠。它安全管理 Amadeus API 凭证，并提供格式化的 JSON 输出。

## 前置条件

- \`go\`（用于安装）
- Amadeus for Developers 账户，以及 API Key 和 Secret。

## 安装

\`hotel-pricer\` 二进制文件必须编译并放入系统 PATH。

\`\`\`bash
# 在 hotel-pricer 源码目录中
go build
sudo mv hotel-pricer /usr/local/bin/
\`\`\`

## 配置

使用前必须设置凭证。

\`\`\`bash
hotel-pricer config set --api-key YOUR_API_KEY --api-secret YOUR_API_SECRET
\`\`\`

## 用法

### 搜索酒店

\`\`\`bash
hotel-pricer search --city <IATA_CODE> --check-in <YYYY-MM-DD> --check-out <YYYY-MM-DD> [flags]
\`\`\`

**示例：**
\`hotel-pricer search --city NYC --check-in 2024-12-24 --check-out 2024-12-28 --guests 2\`

### 标志（Flags）

- \`--city, -c\`：城市代码（IATA）（必填）
- \`--check-in, -i\`：入住日期（YYYY-MM-DD）（必填）
- \`--check-out, -o\`：退房日期（YYYY-MM-DD）（必填）
- \`--guests, -g\`：宾客人数（默认：1）
- \`--radius, -r\`：搜索半径（公里）（默认：20）`,
};
