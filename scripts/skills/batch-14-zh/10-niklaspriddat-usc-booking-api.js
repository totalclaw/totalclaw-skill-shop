module.exports = {
  skillId: 'totalclaw:totalclaw~niklaspriddat-usc-booking-api',
  descriptionZh:
    '扫描 Urban Sports Club 场馆、显示带直接预订链接的课程，并支持预订与取消课程。',
  bodyZh: `# Urban Sports Scanner

扫描你的 Urban Sports Club 场馆，显示带直接预订链接的课程，并支持预订与取消课程。

## 设置

### 1. Python 环境

\`\`\`bash
cd /pfad/zu/urban-sports
python3 -m venv venv
venv/bin/pip install playwright
venv/bin/playwright install chromium
venv/bin/playwright install-deps chromium
\`\`\`

### 2. 登录凭证

填写你的 USC 登录信息：

\`\`\`json
{
  "email": "deine-email@beispiel.de",
  "password": "dein-passwort"
}
\`\`\`

\`credentials.json\` 已加入 \`.gitignore\`，不会被提交。
凭证仅在 \`--book\`、\`--cancel\` 和 \`--bookings\` 时需要。

### 3. 配置场馆

在 \`config.py\` 中填写场馆。场馆 ID 可在 urbansportsclub.com 的 URL 中找到：

\`\`\`
https://urbansportsclub.com/de/venues/20818
                                       ^^^^^
\`\`\`

示例：

\`\`\`python
VENUES = {
    "storm": {
        "name": "STORM Cycling Berlin - Mitte",
        "url": "https://urbansportsclub.com/de/venues/20818",
        "type": "cycling",
        "keywords": ["Performance", "Groove", "Cycling"],
    },
    "fitboxing": {
        "name": "Brooklyn Fitboxing",
        "url": "https://urbansportsclub.com/de/venues/27355",
        "type": "boxing",
        "keywords": ["Boxing", "Fitboxing", "HIIT"],
    },
}
\`\`\`

- \`name\`：显示名称
- \`url\`：urbansportsclub.com 上的场馆页面
- \`type\`：可自由填写，会在输出中显示
- \`keywords\`：帮助在页面文本中识别课程名称

### URL 参数

扫描器会自动将以下参数附加到场馆 URL：

- \`plan_type\`：会员等级。决定显示哪些课程（仅显示对应等级可预订的课程）。个人：1=Essential，2=Classic，3=Premium，6=Max。企业：1=S，2=M，3=L，6=XL。默认值：\`3\`。
- \`business_type\`：\`b2c\`（个人会员）或 \`b2b\`（企业会员）。默认值：\`b2c\`。
- 这些值在 \`config.py\` 中作为 \`PLAN_TYPE\` 和 \`BUSINESS_TYPE\` 配置。

## 用法

### 扫描课程

\`\`\`bash
# 今天所有场馆
venv/bin/python scan.py

# 指定日期
venv/bin/python scan.py --date 2026-02-10

# 仅一个场馆
venv/bin/python scan.py --venue storm

# JSON 输出（用于后续处理）
venv/bin/python scan.py --json
\`\`\`

每个课程都会返回直接预订链接：
\`\`\`
  07:30  STORM Cycling Berlin - Mitte    45 Min STORM Ride - Performance
         https://www.urbansportsclub.com/de/activities?class=98049323
\`\`\`

### 预订

\`\`\`bash
venv/bin/python scan.py --book 98049323
\`\`\`

### 取消

\`\`\`bash
venv/bin/python scan.py --cancel 98049323
\`\`\`

### 即将到来的预订

\`\`\`bash
venv/bin/python scan.py --bookings
venv/bin/python scan.py --bookings --json
\`\`\`

## 文件

\`\`\`
urban-sports/
├── SKILL.md                  # 本文档
├── scan.py                   # 扫描器 + 预订 + CLI
├── config.py                 # 场馆配置
├── credentials.json          # 登录数据（不在仓库中）
├── credentials.example.json  # 模板
├── .gitignore
└── venv/                     # Python virtualenv（不在仓库中）
\`\`\`

## 故障排除

### 「Keine Venues konfiguriert」（未配置场馆）
在 \`config.py\` 中至少添加一个场馆。

### 「credentials.json nicht gefunden」（未找到 credentials.json）
将 \`credentials.example.json\` 复制为 \`credentials.json\` 并填写你的信息。

### 扫描器找不到课程
- 检查日期是否正确（不能是过去）
- 某些场馆在特定日期没有课程
- Chromium 依赖：\`venv/bin/playwright install-deps chromium\``,
};
