# book-reader

从多种来源阅读书籍（epub、pdf、txt），并追踪阅读进度。

## 目的

让 AI 智能体能够阅读完整书籍，用于学习、摘要与知识提取。

## 功能

- **多种来源**：Anna's Archive、Project Gutenberg、本地文件
- **格式支持**：EPUB、PDF、TXT
- **进度追踪**：记住上次阅读位置
- **智能分块**：分段消化阅读
- **摘要生成**：阅读过程中提取关键洞见

## 所需工具

- `curl` 或 `wget` — 下载书籍
- `pandoc` — EPUB 转文本（可选，可回退到 Python）
- `pdftotext`（poppler-utils）— 提取 PDF 文本
- Python 3，含 `ebooklib` 与 `beautifulsoup4`（解析 EPUB）

## 用法

### 搜索书籍

```bash
./book-reader.sh search "Thinking Fast and Slow"
```

### 下载书籍

```bash
./book-reader.sh download <book-id> [output-file]
```

### 阅读（含进度追踪）

```bash
./book-reader.sh read <file> [--from-page N] [--pages N]
```

### 查看阅读进度

```bash
./book-reader.sh status
```

## 安装

```bash
# 安装依赖
sudo apt-get install poppler-utils pandoc  # Linux
# brew install poppler pandoc  # macOS

pip3 install ebooklib beautifulsoup4 lxml

# 添加执行权限
chmod +x book-reader.sh
```

## 书籍来源

1. **Project Gutenberg**（7 万+ 公版书）
   - API：https://gutendex.com
   - 免费、合法、无 DRM

2. **Anna's Archive**（影子图书馆）
   - 数百万书籍、论文、漫画
   - 法律地位因司法管辖区而异
   - 请负责任使用

3. **本地文件**（自有 epub/pdf 收藏）

## 阅读状态

进度保存在 `~/.openclaw/workspace/memory/reading-state.json`：

```json
{
  "currentBook": "Thinking, Fast and Slow",
  "file": "/path/to/book.epub",
  "totalPages": 499,
  "pagesRead": 127,
  "lastRead": 1770957900,
  "bookmarks": [50, 200],
  "notes": "Interesting insight about System 1 vs System 2..."
}
```

## 示例工作流

```bash
# 查找书籍
./book-reader.sh search "Daniel Kahneman Thinking"

# 下载
./book-reader.sh download 12345 ~/books/thinking-fast-slow.epub

# 开始阅读
./book-reader.sh read ~/books/thinking-fast-slow.epub --pages 50

# 稍后继续
./book-reader.sh read ~/books/thinking-fast-slow.epub --pages 50

# 查看进度
./book-reader.sh status
```

## 隐私与伦理

- 公版书（Gutenberg）：完全合法
- 版权书籍：请遵守当地法律
- 觉得有价值请购买以支持作者
- 用于个人学习，勿再分发

## 限制

- PDF OCR 质量不一
- 不支持 DRM 书籍（有意为之）
- 大型 PDF 解析可能较慢
- EPUB 转纯文本格式可能不完美

---

**请负责任使用。尽可能支持作者。**
