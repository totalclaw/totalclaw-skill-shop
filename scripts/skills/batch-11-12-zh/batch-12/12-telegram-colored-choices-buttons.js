module.exports = {
  skillId: 'totalclaw:totalclaw~dandysuper-telegram-colored-choices-buttons',
  descriptionZh:
    '为 Telegram 机器人选择按钮自动分配颜色样式。根据选项关键性、不可逆性与优先级分类为 default/destructive/secondary。',
  bodyZh: `# Telegram 机器人 — 彩色选择按钮技能

## 目的
每当机器人向用户展示选项时，**必须**根据各选项的关键性、不可逆性或差异自动为每个按钮着色。机器人绝不发送无样式/纯文本选择按钮——颜色始终应用。

## 核心规则
**每当机器人向用户发送 2 个以上选项时，必须对每个选项分类并自动分配 \`style\`。这不是可选项。**

---

## Telegram Bot API — 按钮样式

\`InlineKeyboardButton\` 与 \`KeyboardButton\` 上的两个字段：

- **\`style\`**（String，可选）— 按钮颜色：
  - *（省略）* — 默认强调色/蓝色。**推荐 / 安全 / 主要操作。**
  - \`"destructive"\` — 红色。**不可逆、危险或高风险操作。**
  - \`"secondary"\` — 灰色/弱化。**低优先级、关闭、跳过或中性操作。**

- **\`icon_custom_emoji_id\`**（String，可选）— 按钮上的自定义表情图标。

---

## 自动分类规则

机器人构建一组选择按钮时，**必须**在发送前将每个选项分为三个层级之一：

### 层级 1 — 默认（强调色/蓝色）：推荐路径
适用于：
- 最安全或最常见的操作
- 积极确认（"Yes"、"Continue"、"Accept"、"Start"）
- 机器人会推荐的操作
- 流程中向前推进

**做法：** 省略 \`style\` 字段（或设为 \`null\`）。

### 层级 2 — 破坏性（红色）：高风险或不可逆
适用于：
- 删除、移除或永久更改某物
- 取消进行中的操作并丢失工作
- 封禁、拉黑或限制用户
- 拒绝、婉拒重要事项
- 花费金钱、代币或积分
- 难以轻易撤销

**做法：** 设置 \`"style": "destructive"\`。

### 层级 3 — 次要（灰色）：低优先级或逃生口
适用于：
- 跳过、关闭或推迟（"Maybe later"、"Not now"）
- 中性退路（"Back"、无损失时的 "Cancel"）
- 展示更多信息而不承诺（"Details"、"Help"）
- 选项集中最不重要的项

**做法：** 设置 \`"style": "secondary"\`。

---

## 如何决策 — 对比很重要

当选项关键性不同时，颜色**必须**反映该对比：

**高对比** — 选项后果差异很大：
\`\`\`
 "Delete my account" → destructive（红色）
 "Keep my account"   → default（蓝色）
\`\`\`

**中对比** — 一个主操作，一个逃生：
\`\`\`
 "Subscribe"   → default（蓝色）
 "Not now"     → secondary（灰色）
\`\`\`

**低对比** — 选项大致平等：
\`\`\`
 "Option A" → default（蓝色）
 "Option B" → default（蓝色）
 "Skip"     → secondary（灰色）
\`\`\`

**一组内多个层级：**
\`\`\`
 "Confirm purchase"  → default（蓝色）     — 推荐
 "Change amount"     → secondary（灰色）   — 中性/返回
 "Cancel order"      → destructive（红色）  — 丢失进度
\`\`\`

---

## 分类示例

机器人问："Approve this document?"
\`\`\`json
[
  [{"text": "✅ Approve", "callback_data": "approve"},
   {"text": "❌ Reject", "callback_data": "reject", "style": "destructive"}],
  [{"text": "⏭ Review later", "callback_data": "skip", "style": "secondary"}]
]
\`\`\`

机器人问："Pick a plan:"
\`\`\`json
[
  [{"text": "Free Plan", "callback_data": "free"},
   {"text": "Pro Plan", "callback_data": "pro"}],
  [{"text": "Compare plans", "callback_data": "compare", "style": "secondary"}]
]
\`\`\`
（平等选项 = 均为默认；信息链接 = 次要）

机器人问："Delete all messages in this chat?"
\`\`\`json
[
  [{"text": "🗑 Delete all", "callback_data": "delete_all", "style": "destructive"}],
  [{"text": "Keep messages", "callback_data": "keep"}]
]
\`\`\`
（破坏性操作为红色；安全操作为默认蓝色）

机器人问："Transfer 500 tokens to @user?"
\`\`\`json
[
  [{"text": "Send 500 tokens", "callback_data": "send", "style": "destructive"},
   {"text": "Cancel", "callback_data": "cancel", "style": "secondary"}]
]
\`\`\`
（花费 = 破坏性，因为有成本；取消 = 次要）

---

## 实现 — Python 自动分类器

机器人**必须**使用分类函数确定样式。参考实现如下：

\`\`\`python
import re

# 各层级信号关键词（不区分大小写，匹配按钮文本 + callback_data）
DESTRUCTIVE_SIGNALS = [
    r"\\bdelete\\b", r"\\bremove\\b", r"\\bban\\b", r"\\bblock\\b",
    r"\\breject\\b", r"\\bdecline\\b", r"\\brevoke\\b", r"\\bterminate\\b",
    r"\\bcancel order\\b", r"\\bcancel subscription\\b",
    r"\\bunsubscribe\\b", r"\\bdestroy\\b", r"\\bpurge\\b",
    r"\\bspend\\b", r"\\btransfer\\b", r"\\bpay\\b", r"\\bsend.*tokens?\\b",
    r"\\breset\\b", r"\\bclear all\\b", r"\\bwipe\\b",
    r"\\bleave\\b", r"\\bquit\\b", r"\\bdisconnect\\b",
]

SECONDARY_SIGNALS = [
    r"\\bskip\\b", r"\\bnot now\\b", r"\\bmaybe later\\b", r"\\blater\\b",
    r"\\bback\\b", r"\\bdismiss\\b", r"\\bclose\\b",
    r"\\bdetails\\b", r"\\bmore info\\b", r"\\bhelp\\b", r"\\babout\\b",
    r"\\bno thanks\\b", r"\\bnevermind\\b",
    r"\\bcancel$",  # 纯 "cancel"（无工作损失）= 次要，非破坏性
]


def classify_button_style(text: str, callback_data: str = "", context_hint: str = "") -> str | None:
    """
    根据文本与上下文自动确定按钮样式。

    返回：
        "destructive" — 红色按钮（不可逆 / 高风险）
        "secondary"   — 灰色按钮（低优先级 / 关闭）
        None          — 默认蓝色按钮（主要 / 推荐）

    context_hint: 可选额外上下文，如 "this action costs money"
    """
    combined = f"{text} {callback_data} {context_hint}".lower()

    # 先检查破坏性（更高优先级）
    for pattern in DESTRUCTIVE_SIGNALS:
        if re.search(pattern, combined):
            return "destructive"

    # 再检查次要
    for pattern in SECONDARY_SIGNALS:
        if re.search(pattern, combined):
            return "secondary"

    # 默认 = 主要（蓝色）
    return None


def build_choice_buttons(choices: list[dict]) -> list[list[dict]]:
    """
    接收原始选项列表，返回已自动分配样式的 Bot API inline_keyboard 行。

    每个 choice dict：
        text (str):          按钮标签（必需）
        data (str):          callback_data（必需，除非设置了 url）
        url (str):           URL 按钮（可选，与 data 互斥）
        style (str|None):    覆盖样式 — 若设置则跳过自动分类
        context (str):       分类器额外提示（如 "costs money"）
        emoji_id (str):      自定义表情 ID（可选）
        row (int):           强制放入指定行（可选）

    返回适用于 inline_keyboard 的行列表。
    """
    # 按行分组
    row_map: dict[int, list[dict]] = {}
    auto_row = 0
    for i, choice in enumerate(choices):
        btn: dict = {"text": choice["text"]}

        # 操作
        if "url" in choice:
            btn["url"] = choice["url"]
        else:
            btn["callback_data"] = choice.get("data", choice["text"].lower().replace(" ", "_"))

        # 样式 — 有覆盖则用覆盖，否则自动分类
        if "style" in choice and choice["style"] is not None:
            btn["style"] = choice["style"]
        else:
            auto_style = classify_button_style(
                choice["text"],
                choice.get("data", ""),
                choice.get("context", ""),
            )
            if auto_style:
                btn["style"] = auto_style

        # 自定义表情
        if "emoji_id" in choice:
            btn["icon_custom_emoji_id"] = choice["emoji_id"]

        # 行分配
        target_row = choice.get("row", auto_row)
        row_map.setdefault(target_row, []).append(btn)

        # 每 2 个按钮自动换行
        if len(row_map.get(auto_row, [])) >= 2:
            auto_row += 1

    return [row_map[k] for k in sorted(row_map.keys())]
\`\`\`

### 在机器人中使用分类器：

\`\`\`python
import requests

def send_choices(bot_token, chat_id, text, choices, parse_mode="HTML"):
    """发送带自动着色选择按钮的消息。"""
    keyboard = build_choice_buttons(choices)
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": parse_mode,
        "reply_markup": {"inline_keyboard": keyboard},
    }
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    resp = requests.post(url, json=payload)
    resp.raise_for_status()
    return resp.json()

# 机器人只需传入原始选项 — 颜色自动分配：
send_choices(TOKEN, chat_id, "Approve this document?", [
    {"text": "✅ Approve", "data": "approve"},
    {"text": "❌ Reject", "data": "reject"},          # 自动 → destructive（红色）
    {"text": "⏭ Review later", "data": "later"},       # 自动 → secondary（灰色）
])
\`\`\`

---

## 与 python-telegram-bot 库配合使用

> 若库版本尚未暴露 \`style\`，通过 \`api_kwargs\` 传入。

\`\`\`python
from telegram import InlineKeyboardButton, InlineKeyboardMarkup

def auto_button(text, callback_data, context=""):
    style = classify_button_style(text, callback_data, context)
    kwargs = {"style": style} if style else {}
    return InlineKeyboardButton(text, callback_data=callback_data, api_kwargs=kwargs)

keyboard = InlineKeyboardMarkup([
    [auto_button("Approve", "approve"),
     auto_button("Reject", "reject")],
    [auto_button("Skip", "skip")],
])
await update.message.reply_text("Pick an option:", reply_markup=keyboard)
\`\`\`

---

## 回复键盘 — 同样规则适用

\`\`\`json
{
  "chat_id": "<CHAT_ID>",
  "text": "Delete your data?",
  "reply_markup": {
    "keyboard": [
      [
        {"text": "Keep my data"},
        {"text": "Delete everything", "style": "destructive"}
      ]
    ],
    "resize_keyboard": true,
    "one_time_keyboard": true
  }
}
\`\`\`

---

## 按钮上的自定义表情

可与同一按钮上的 \`style\` 组合使用：

\`\`\`json
{"text": "Boost", "callback_data": "boost", "style": "destructive", "icon_custom_emoji_id": "5368324170671202286"}
\`\`\`

---

## Shell 辅助工具

快速测试彩色按钮：

\`\`\`bash
./SKILL.sh <BOT_TOKEN> <CHAT_ID>
\`\`\`

## 参考
- Telegram Bot API: https://core.telegram.org/bots/api
- Bot API 更新日志: https://core.telegram.org/bots/api-changelog
- Telegram 博客公告: https://telegram.org/blog/crafting-android-design-and-more`,
};
