module.exports = {
  skillId: 'totalclaw:totalclaw~pes0-exchange2010',
  descriptionZh:
    'Exchange 2010 EWS 集成，支持邮件、日历、联系人、任务管理，含附件下载、重复事件、共享日历、外出自动回复及 EWS 快速过滤搜索。',
  bodyZh: `# exchange2010

Exchange 2010 EWS 集成，用于邮件、日历、联系人与任务。

## 设置

需要在 \`.env.credentials\` 中配置凭据：
\`\`\`
EXCHANGE_SERVER=mail.company.com
EXCHANGE_DOMAIN=company
EXCHANGE_EMAIL=user@company.com
EXCHANGE_PASSWORD=your_password
\`\`\`

## 功能

- ✅ **邮件**：读取未读、发送、搜索、标记已读
- ✅ **邮件附件**：下载、提取文本（PDF、TXT）
- ✅ **邮件文件夹**：浏览已发送、草稿、回收站、垃圾邮件
- ✅ **日历**：查看、创建、更新、删除、搜索事件
- ✅ **重复事件**：检测并管理系列
- ✅ **共享日历**：访问其他 Exchange 邮箱
- ✅ **联系人**：搜索通讯录、解析姓名（GAL）
- ✅ **任务/待办**：管理、创建、完成任务
- ✅ **外出自动回复**：读取并设置外出消息
- ✅ **EWS 过滤器**：使用 \`subject__contains\`、\`start__gte\` 等快速搜索
- ✅ **列出日历**：显示所有日历文件夹

## 示例

### 读取邮件

\`\`\`python
from skills.exchange2010 import get_account, get_unread_emails

account = get_account()
emails = get_unread_emails(account, limit=10)
for email in emails:
    print(f"{email['subject']} from {email['sender']}")
\`\`\`

### 今日事件

\`\`\`python
from skills.exchange2010 import get_today_events

# 你自己的事件
today = get_today_events()

# 共享日历中的事件
today = get_today_events('shared@company.com')
\`\`\`

### 搜索事件

\`\`\`python
from skills.exchange2010 import search_calendar_by_subject
from datetime import date

# 快速搜索 Ekadashi
ekadashi = search_calendar_by_subject(
    email_address='shared@company.com',
    search_term='Ekadashi',
    start_date=date(2025, 1, 1),
    end_date=date(2026, 12, 31)
)
print(f"Found: {len(ekadashi)} events")
\`\`\`

### 创建事件

\`\`\`python
from skills.exchange2010 import create_calendar_event
from datetime import datetime

create_calendar_event(
    subject="Team Meeting",
    start=datetime(2026, 2, 7, 14, 0),
    end=datetime(2026, 2, 7, 15, 0),
    body="Project discussion",
    location="Conference Room A"
)
\`\`\`

### 更新事件

\`\`\`python
from skills.exchange2010 import update_calendar_event
from datetime import datetime

# 改期
update_calendar_event(
    event_id='AAQkAG...',
    start=datetime(2026, 2, 10, 14, 0),
    end=datetime(2026, 2, 10, 15, 0),
    location="New Room B"
)
\`\`\`

### 浏览邮件文件夹

\`\`\`python
from skills.exchange2010 import get_folder_emails, list_email_folders

# 列出所有文件夹
folders = list_email_folders(account)
for f in folders:
    print(f"{f['name']}: {f['unread_count']} unread")

# 已发送
sent = get_folder_emails('sent', limit=10)

# 草稿
drafts = get_folder_emails('drafts')

# 回收站
trash = get_folder_emails('trash')
\`\`\`

### 搜索邮件

\`\`\`python
from skills.exchange2010 import search_emails

# 按发件人
emails = search_emails(sender='boss@company.com', limit=10)

# 按主题
emails = search_emails(subject='Invoice', folder='inbox')

# 仅未读
emails = search_emails(is_unread=True, limit=20)
\`\`\`

### 标记邮件为已读

\`\`\`python
from skills.exchange2010 import mark_email_as_read

mark_email_as_read(email_id='AAQkAG...')
\`\`\`

### 下载附件

\`\`\`python
from skills.exchange2010 import get_email_attachments

# 显示信息
attachments = get_email_attachments(email_id='AAQkAG...')
for att in attachments:
    print(f"{att['name']}: {att['size']} bytes")

# 下载
attachments = get_email_attachments(
    email_id='AAQkAG...',
    download_path='/tmp/email_attachments'
)
\`\`\`

### 从附件提取文本

**前提**：PDF 文本提取需 \`pip install PyPDF2\`

\`\`\`python
from skills.exchange2010 import process_attachment_content

results = process_attachment_content(email_id='AAQkAG...')
for result in results:
    print(f"File: {result['name']}")
    if 'extracted_text' in result:
        print(f"Content: {result['extracted_text'][:500]}...")
\`\`\`

### 搜索联系人

\`\`\`python
from skills.exchange2010 import search_contacts, resolve_name

# 搜索联系人
contacts = search_contacts('John Doe')
for c in contacts:
    print(f"{c['name']}: {c['email']}")

# 解析姓名 (GAL)
result = resolve_name('john.doe@company.com')
if result:
    print(f"Found: {result['name']} - {result['email']}")
\`\`\`

### 管理任务

\`\`\`python
from skills.exchange2010 import get_tasks, create_task, complete_task, delete_task
from datetime import datetime, timedelta

# 显示未完成任务
tasks = get_tasks()
for task in tasks:
    status = '✅' if task['is_complete'] else '⏳'
    print(f"{status} {task['subject']}")

# 创建新任务
task_id = create_task(
    subject="Finish report",
    body="Q1 report due Friday",
    due_date=datetime.now() + timedelta(days=3),
    importance="High"
)

# 标记完成
complete_task(task_id)

# 删除
delete_task(task_id)
\`\`\`

### 查找重复事件

\`\`\`python
from skills.exchange2010 import get_recurring_events

recurring = get_recurring_events(
    email_address='shared@company.com',
    days=30
)
for r in recurring:
    print(f"{r['subject']}: {r['recurrence']}")
\`\`\`

### 外出自动回复

\`\`\`python
from skills.exchange2010 import get_out_of_office, set_out_of_office
from datetime import datetime, timedelta

# 检查状态
oof = get_out_of_office()
print(f"Out of office active: {oof['enabled']}")

# 启用
set_out_of_office(
    enabled=True,
    internal_reply="I am on vacation until Feb 15th.",
    external_reply="I am on vacation until Feb 15th.",
    start=datetime.now(),
    end=datetime.now() + timedelta(days=7),
    external_audience='All'  # 'All', 'Known', 'None'
)

# 禁用
set_out_of_office(enabled=False, internal_reply="")
\`\`\`

### 发送邮件

\`\`\`python
from skills.exchange2010 import send_email

send_email(
    to=["recipient@example.com"],
    subject="Test",
    body="Hello!",
    cc=["cc@example.com"]
)
\`\`\`

## API 参考

### 邮件

| 函数 | 说明 |
|----------|-------------|
| \`get_account()\` | 连接 Exchange |
| \`get_unread_emails(account, limit=50)\` | 获取未读邮件 |
| \`search_emails(search_term, sender, subject, is_unread, folder, limit)\` | 搜索邮件 |
| \`send_email(to, subject, body, cc, bcc)\` | 发送邮件 |
| \`mark_email_as_read(email_id)\` | 标记已读 |
| \`get_email_attachments(email_id, download_path)\` | 下载附件 |
| \`process_attachment_content(email_id, attachment_name)\` | 提取文本 |

### 邮件文件夹

| 函数 | 说明 |
|----------|-------------|
| \`get_folder_emails(folder_name, limit, is_unread)\` | 从文件夹获取邮件 |
| \`list_email_folders(account)\` | 列出所有文件夹 |

### 日历

| 函数 | 说明 |
|----------|-------------|
| \`get_today_events(email_address)\` | 今日事件 |
| \`get_upcoming_events(email_address, days)\` | 未来 N 天 |
| \`get_calendar_events(account, start, end)\` | 时间范围内事件 |
| \`get_shared_calendar_events(email, start, end)\` | 共享日历 |
| \`search_calendar_by_subject(email, term, start, end)\` | 快速搜索 |
| \`create_calendar_event(subject, start, end, body, location)\` | 创建事件 |
| \`update_calendar_event(event_id, ...)\` | 更新事件 |
| \`get_event_details(event_id)\` | 显示详情 |
| \`delete_calendar_event(event_id)\` | 删除事件 |
| \`get_recurring_events(email, start, end)\` | 重复事件 |
| \`list_available_calendars(account)\` | 列出日历 |
| \`count_ekadashi_events(email, start_year)\` | 统计 Ekadashi |

### 联系人

| 函数 | 说明 |
|----------|-------------|
| \`search_contacts(search_term, limit)\` | 搜索联系人 |
| \`resolve_name(name)\` | 解析姓名 (GAL) |

### 任务

| 函数 | 说明 |
|----------|-------------|
| \`get_tasks(status, folder)\` | 获取任务 |
| \`create_task(subject, body, due_date, importance, categories)\` | 创建任务 |
| \`complete_task(task_id)\` | 标记完成 |
| \`delete_task(task_id)\` | 删除任务 |

### 外出自动回复

| 函数 | 说明 |
|----------|-------------|
| \`get_out_of_office(email_address)\` | 读取状态 |
| \`set_out_of_office(enabled, internal_reply, ...)\` | 设置 OOF |

## 说明

- 明确使用 **Exchange 2010 SP2** 版本
- 自有与共享邮箱均使用 **DELEGATE** 访问类型
- **EWS 过滤器**（\`subject__contains\`、\`start__gte\`）比迭代更快
- **时区**：自动转换为带 UTC 的 EWSDateTime
- 共 **27 个函数**可用`,
};
