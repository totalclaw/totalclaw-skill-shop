> **关键规则 — 处理任何邮件前必读**
>
> 1. **切勿直接调用 `gog`** — 始终使用包装脚本（`create_event.sh`、`email_read.sh` 等）。直接调用 `gog` 会绕过追踪并导致重复。不可协商。
> 2. **忽略日历通知** — 勿处理来自 `calendar-notification@google.com` 的邮件（Accepted:、Declined:、Tentative: 等）。这是对现有邀请的回复，非新事件。运行 `process_calendar_replies.sh` 归档。
> 3. **创建前必须询问** — 未经当前对话中用户明确确认，不得创建日历事件
> 4. **检查是否已处理** — 处理邮件前检查 index.json 中 `processed_emails`
> 5. **先读配置** — 展示事件前加载并应用 `ignore_patterns` 与 `auto_create_patterns`
> 6. **阅读 MEMORY.MD** — 检查以往会话存储的用户偏好
> 7. **包含所有配置的参与者** — 创建/更新/删除事件时，用 `--attendees` 包含配置中的参与者（若支持则 `--send-updates all`）
> 8. **先查已追踪事件** — 日历搜索前用 `lookup_event.sh --email-id` 查找（更快更可靠）
> 9. **追踪所有创建的事件** — `create_event.sh` 自动追踪；更新/删除用追踪 ID
> 10. **显示星期几** — 向用户展示事件时始终包含星期几以便核对

> ⛔ **禁止：切勿直接使用 `gog` 命令** ⛔
>
> **错误：** `gog calendar create ...` 或 `gog gmail ...`
> **正确：** `"$SCRIPTS_DIR/create_event.sh" ...` 或 `"$SCRIPTS_DIR/email_read.sh" ...`
>
> 直接 CLI 调用会绕过事件追踪、破坏去重并导致重复事件。
> 所有操作必须通过 `scripts/` 中的包装脚本。

# 邮件转日历技能

从邮件提取日程与行动项，经用户审阅后创建/更新日历事件，含去重与撤销支持。

**首次设置：** 见 [SETUP.md](SETUP.md) 了解配置与智能引导。

## 读取邮件内容

**重要：** 提取事件前必须读取邮件正文。使用包装脚本。

```bash
SCRIPTS_DIR="$HOME/.openclaw/workspace/skills/email-to-calendar/scripts"

# Get a single email by ID (PREFERRED)
"$SCRIPTS_DIR/email_read.sh" --email-id "<messageId>"

# Search with body content included
"$SCRIPTS_DIR/email_search.sh" --query "in:inbox is:unread" --max 20 --include-body
```

**关于陈旧转发：** 勿用 `newer_than:1d`，它检查邮件原始日期头而非接收时间。处理所有未读邮件并依赖「已处理」检查。

## 工作流

### 0. 预处理检查（强制）

```bash
SCRIPTS_DIR="$HOME/.openclaw/workspace/skills/email-to-calendar/scripts"
CONFIG_FILE="$HOME/.config/email-to-calendar/config.json"
INDEX_FILE="$HOME/.openclaw/workspace/memory/email-extractions/index.json"

# Start activity logging
"$SCRIPTS_DIR/activity_log.sh" start-session

# Check email mode
EMAIL_MODE=$(jq -r '.email_mode // "forwarded"' "$CONFIG_FILE")

# Check if email was already processed
EMAIL_ID="<the email message ID>"
if jq -e ".extractions[] | select(.email_id == \"$EMAIL_ID\")" "$INDEX_FILE" > /dev/null 2>&1; then
    "$SCRIPTS_DIR/activity_log.sh" log-skip --email-id "$EMAIL_ID" --subject "Subject" --reason "Already processed"
    exit 0
fi

# Load ignore/auto-create patterns
IGNORE_PATTERNS=$(jq -r '.event_rules.ignore_patterns[]' "$CONFIG_FILE")
AUTO_CREATE_PATTERNS=$(jq -r '.event_rules.auto_create_patterns[]' "$CONFIG_FILE")
```

### 1. 查找待处理邮件

**DIRECT 模式：** 扫描所有未读邮件中的事件指标（日期、时间、会议关键词）。

**FORWARDED 模式：** 仅处理带转发标识的邮件（Fwd:、forwarded message 头等）。

### 2. 提取事件（由智能体直接完成）

阅读邮件并提取结构化事件。每个事件包含：
- **title**：描述性名称（最多 80 字符）
- **date**：事件日期
- **day_of_week**：供核对
- **time**：开始/结束时间（默认 9:00–17:00）
- **is_multi_day**：是否跨多天
- **is_recurring**：是否重复（及规律）
- **confidence**：high/medium/low
- **urls**：邮件中的 URL（必需 — 始终查找报名链接、信息页、票务站等）
- **deadline_date**：RSVP/报名/购票截止日期（若有）
- **deadline_action**：用户需做什么（如「RSVP」「购票」「注册」）
- **deadline_url**：行动直链（常与事件 URL 相同）

**URL 提取规则：** 始终扫描邮件 URL，将最相关链接放在事件描述**开头**。

### 2.1 截止日期检测

扫描邮件中表明事件前需行动的截止日期模式：

**常见截止日期模式：**
- "RSVP by [date]", "Please RSVP by [date]"
- "Register by [date]", "Registration closes [date]"
- "Tickets available until [date]", "Get tickets by [date]"
- "Early bird ends [date]", "Early registration deadline [date]"
- "Must respond by [date]", "Respond by [date]"
- "Sign up by [date]", "Sign up deadline [date]"
- "Deadline: [date]", "Due by [date]"
- "Last day to [action]: [date]"

发现截止日期时：
1. 提取截止日期
2. 确定所需行动（RSVP、注册、购票等）
3. 找到行动 URL
4. 标记事件需特殊处理（见下文）

### 3. 向用户展示并等待

应用事件规则后，编号展示供选择：

```
I found the following potential events:

1. ~~ELAC Meeting (Feb 2, Monday at 8:15 AM)~~ - SKIP (matches ignore pattern)
2. **Team Offsite (Feb 2-6, Sun-Thu)** - PENDING
3. **Staff Development Day (Feb 12, Wednesday)** - AUTO-CREATE

Reply with numbers to create (e.g., '2, 3'), 'all', or 'none'.
```

**停止并等待用户回复。**

展示后，记录待处理邀请以便跟进提醒：
```bash
# Record pending invites using add_pending.sh
"$SCRIPTS_DIR/add_pending.sh" \
    --email-id "$EMAIL_ID" \
    --email-subject "$EMAIL_SUBJECT" \
    --events-json '[{"title":"Event Name","date":"2026-02-15","time":"14:00","status":"pending"}]'
```

### 4. 检查重复（强制）

**创建任何事件前必须检查：**

```bash
# Step 1: Check local tracking first (fast)
TRACKED=$("$SCRIPTS_DIR/lookup_event.sh" --email-id "$EMAIL_ID")
if [ "$(echo "$TRACKED" | jq 'length')" -gt 0 ]; then
    EXISTING_EVENT_ID=$(echo "$TRACKED" | jq -r '.[0].event_id')
fi

# Step 2: If not found, try summary match
if [ -z "$EXISTING_EVENT_ID" ]; then
    TRACKED=$("$SCRIPTS_DIR/lookup_event.sh" --summary "$EVENT_TITLE")
fi

# Step 3: Fall back to calendar search using wrapper script
if [ -z "$EXISTING_EVENT_ID" ]; then
    "$SCRIPTS_DIR/calendar_search.sh" --calendar-id "$CALENDAR_ID" --from "${EVENT_DATE}T00:00:00" --to "${EVENT_DATE}T23:59:59"
fi
```

对模糊重复使用 LLM 语义匹配（如「Team Offsite」vs「Team Offsite 5-6pm」）。

### 5. 创建或更新日历事件

**使用 create_event.sh（推荐）** — 处理日期解析、追踪与变更日志：

```bash
# Create new event
"$SCRIPTS_DIR/create_event.sh" \
    "$CALENDAR_ID" \
    "Event Title" \
    "February 11, 2026" \
    "9:00 AM" \
    "5:00 PM" \
    "Description" \
    "$ATTENDEE_EMAILS" \
    "" \
    "$EMAIL_ID"

# Update existing event (pass event_id as 8th parameter)
"$SCRIPTS_DIR/create_event.sh" \
    "$CALENDAR_ID" \
    "Updated Title" \
    "February 11, 2026" \
    "10:00 AM" \
    "6:00 PM" \
    "Updated description" \
    "$ATTENDEE_EMAILS" \
    "$EXISTING_EVENT_ID" \
    "$EMAIL_ID"
```

直接 gog 命令与高级选项见 [references/gog-commands.md](references/gog-commands.md)。

### 6. 邮件处置（自动）

邮件处置（标已读和/或归档）由 `create_event.sh` 按配置**自动**处理。事件创建后自动处置，无需手动步骤。

手动处置邮件：
```bash
"$SCRIPTS_DIR/disposition_email.sh" --email-id "$EMAIL_ID"
```

处理日历回复邮件（接受、拒绝、暂定）：
```bash
"$SCRIPTS_DIR/process_calendar_replies.sh"           # Process all
"$SCRIPTS_DIR/process_calendar_replies.sh" --dry-run # Preview only
```

```bash
# End activity session
"$SCRIPTS_DIR/activity_log.sh" end-session
```

## 事件创建规则

### 日期/时间处理
- **单日事件**：默认 9:00–17:00
- **多日事件**（如 2 月 2–6 日）：使用 `--rrule "RRULE:FREQ=DAILY;COUNT=N"`
- **有具体时间的事件**：使用邮件中的精确时间

### 事件描述

**按此顺序格式化事件描述：**

1. **行动警告**（若有截止日期）：
   ```
   *** ACTION REQUIRED: [ACTION] BY [DATE] ***
   ```

2. **活动链接**（若有 URL）：
   ```
   Event Link: [URL]
   ```

3. **活动详情**：从邮件提取的信息

**含截止日期示例：**
```
*** ACTION REQUIRED: GET TICKETS BY FEB 15 ***

Event Link: https://example.com/tickets

Spring Concert at Downtown Theater
Doors open at 7 PM
VIP meet & greet available
```

**无截止日期示例：**
```
Event Link: https://example.com/event

Spring Concert at Downtown Theater
Doors open at 7 PM
```

### 重复检测
以下情况视为重复：
- 同日且标题相似（语义匹配）且时间重叠

始终更新现有事件而非创建重复。

### 创建截止日期事件

当事件有截止日期（RSVP、注册、购票等）时，创建**两个**日历事件：

**1. 主事件**（照常，描述中含警告）：
```bash
"$SCRIPTS_DIR/create_event.sh" \
    "$CALENDAR_ID" \
    "Spring Concert" \
    "March 1, 2026" \
    "7:00 PM" \
    "10:00 PM" \
    "*** ACTION REQUIRED: GET TICKETS BY FEB 15 ***

Event Link: https://example.com/tickets

Spring Concert at Downtown Theater
Doors open at 7 PM" \
    "$ATTENDEE_EMAILS" \
    "" \
    "$EMAIL_ID"
```

**2. 截止提醒事件**（截止日期上的独立事件）：
```bash
# Use create_event.sh for deadline reminders too (ensures tracking)
"$SCRIPTS_DIR/create_event.sh" \
    "$CALENDAR_ID" \
    "DEADLINE: Get tickets for Spring Concert" \
    "2026-02-15" \
    "09:00" \
    "09:30" \
    "Action required: Get tickets

Event Link: https://example.com/tickets

Main event: Spring Concert on March 1, 2026" \
    "" \
    "" \
    "$EMAIL_ID"
```

**截止事件属性：**
- **标题格式**：`DEADLINE: [行动] for [事件名]`
- **日期**：截止日期
- **时间**：9:00（30 分钟）
- **提醒**：提前 1 天邮件 + 提前 1 小时弹窗
- **描述**：所需行动、URL、主事件引用

### 截止日期邮件通知

创建含截止日期的事件时，发送通知邮件提醒用户：

```bash
# Load config
CONFIG_FILE="$HOME/.config/email-to-calendar/config.json"
USER_EMAIL=$(jq -r '.deadline_notifications.email_recipient // .gmail_account' "$CONFIG_FILE")
NOTIFICATIONS_ENABLED=$(jq -r '.deadline_notifications.enabled // false' "$CONFIG_FILE")

# Send notification if enabled (using wrapper script)
if [ "$NOTIFICATIONS_ENABLED" = "true" ]; then
    "$SCRIPTS_DIR/email_send.sh" \
        --to "$USER_EMAIL" \
        --subject "ACTION REQUIRED: Get tickets for Spring Concert by Feb 15" \
        --body "A calendar event has been created that requires your action.

Event: Spring Concert
Date: March 1, 2026
Deadline: February 15, 2026
Action Required: Get tickets

Link: https://example.com/tickets

Calendar events created:
- Main event: Spring Concert (March 1)
- Deadline reminder: DEADLINE: Get tickets for Spring Concert (Feb 15)

---
This notification was sent by the email-to-calendar skill."
fi
```

**何时发送通知：**
- 仅当配置中 `deadline_notifications.enabled` 为 `true`
- 仅针对需行动的截止日期事件
- 含截止日期、行动、URL 与事件详情

## 活动日志

```bash
# Start session
"$SCRIPTS_DIR/activity_log.sh" start-session

# Log skipped emails
"$SCRIPTS_DIR/activity_log.sh" log-skip --email-id "abc" --subject "Newsletter" --reason "No events"

# Log events
"$SCRIPTS_DIR/activity_log.sh" log-event --email-id "def" --title "Meeting" --action created

# End session
"$SCRIPTS_DIR/activity_log.sh" end-session

# Show recent activity
"$SCRIPTS_DIR/activity_log.sh" show --last 3
```

## 变更日志与撤销

24 小时内可撤销变更：

```bash
# List recent changes
"$SCRIPTS_DIR/changelog.sh" list --last 10

# List undoable changes
"$SCRIPTS_DIR/undo.sh" list

# Undo most recent change
"$SCRIPTS_DIR/undo.sh" last

# Undo specific change
"$SCRIPTS_DIR/undo.sh" --change-id "chg_20260202_143000_001"
```

## 待处理邀请

未立即处理的事件会追踪以便提醒：

```bash
# Add pending invites (after presenting events to user)
"$SCRIPTS_DIR/add_pending.sh" \
    --email-id "$EMAIL_ID" \
    --email-subject "Party Invite" \
    --events-json '[{"title":"Birthday Party","date":"2026-02-15","time":"14:00","status":"pending"}]'

# List pending invites (JSON)
"$SCRIPTS_DIR/list_pending.sh"

# Human-readable summary
"$SCRIPTS_DIR/list_pending.sh" --summary

# Update reminder tracking
"$SCRIPTS_DIR/list_pending.sh" --summary --update-reminded

# Auto-dismiss after 3 ignored reminders
"$SCRIPTS_DIR/list_pending.sh" --summary --auto-dismiss
```

## 事件追踪

```bash
# 按邮件 ID 查找
"$SCRIPTS_DIR/lookup_event.sh" --email-id "19c1c86dcc389443"

# 按标题查找
"$SCRIPTS_DIR/lookup_event.sh" --summary "Staff Development"

# 列出所有追踪事件
"$SCRIPTS_DIR/lookup_event.sh" --list

# 验证事件存在（移除孤儿记录）
"$SCRIPTS_DIR/lookup_event.sh" --email-id "abc" -
