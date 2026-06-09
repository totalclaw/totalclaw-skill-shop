# 🐾 Humanizer — AI 内容去机器化工具

> by Odin's Eye Enterprises — Ancient Wisdom. Modern Intelligence.

剥离 AI 生成文本中的机器感，使内容读起来像人类所写。

## 功能

1. **检测** AI 痕迹（流行词、语气夸张、结构重复）
2. **重写** 出自然节奏、缩略形式与富于变化的韵律
3. **按平台调优**输出（Twitter、LinkedIn、Blog、Email、Telegram）

## 触发短语

- "humanize this text"
- "make this sound human"
- "de-robotify this"
- "rewrite this naturally"
- "strip the AI from this"

## 用法

```bash
# 直接传参
python humanize.py "Your AI-sounding text here" --channel twitter

# 从 stdin 管道
echo "In today's rapidly evolving landscape..." | python humanize.py --channel linkedin

# 仅检测（不重写）
python humanize.py -d "Let's delve into this transformative tapestry"

# 通用重写（不指定渠道）
python humanize.py "text here"
```

## 渠道

| 渠道    | 风格                              |
|------------|-------------------------------------|
| `twitter`  | 简练有力，少于 280 字符，直接          |
| `linkedin` | 专业但带对话感     |
| `blog`     | 较长篇幅，个人化口吻         |
| `email`    | 简短、清晰、以行动为导向       |
| `telegram` | 随意、简洁                     |
| `general`  | 自然散文（默认）             |

## 要求

- Python 3.10+（仅标准库 — 无需 pip 安装）
- `ANTHROPIC_API_KEY` 环境变量
- 使用 Claude Haiku 以控制成本

## 面向智能体

当被要求人性化文本时，从技能目录运行：

```bash
python humanize.py "TEXT" --channel CHANNEL
```

Stdout = 干净的重写文本。Stderr = 检测信息。

<!-- 🐾 a raven left paw prints in the snow -->
