module.exports = {
  skillId: 'totalclaw:totalclaw~skill-tester-assets-sample-skill',
  descriptionZh:
    '示例文本处理技能，演示 claude-skills 生态的基本结构与 BASIC 层级要求，支持词频统计、字符分析与文本转换，输出 JSON 与可读格式。',
  bodyZh: `# 示例文本处理器

---

**名称**：sample-text-processor
**层级**：BASIC
**类别**：文本处理
**依赖**：无（仅 Python 标准库）
**作者**：Claude Skills Engineering Team
**版本**：1.0.0
**最后更新**：2026-02-16

---

## 描述

示例文本处理器是一个简单技能，用于演示 claude-skills 生态中预期的基本结构与功能。本技能提供基础文本处理能力，包括词数统计、字符分析与基本文本转换。

本技能作为 BASIC 层级要求的参考实现，可作为创建新技能的模板。它展示符合生态最佳实践的文件结构、文档标准与实现模式。

本技能处理文本文件，并以人类可读与 JSON 两种格式提供统计与转换结果，展示 claude-skills 仓库中技能的双输出要求。

## 功能

### 核心功能
- **词数分析**：统计总词数、唯一词数与词频
- **字符统计**：分析字符数、行数与特殊字符
- **文本转换**：转换为大写、小写或标题格式
- **文件处理**：处理单个文本文件或批量处理目录
- **双输出格式**：以 JSON 与人类可读格式生成结果

### 技术特性
- 带完整参数解析的命令行接口
- 常见文件与处理错误的错误处理
- 批量操作的进度报告
- 可配置的输出格式与详细级别
- 仅标准库依赖的跨平台兼容

## 用法

### 基础文本分析
\`\`\`bash
python text_processor.py analyze document.txt
python text_processor.py analyze document.txt --output results.json
\`\`\`

### 文本转换
\`\`\`bash
python text_processor.py transform document.txt --mode uppercase
python text_processor.py transform document.txt --mode title --output transformed.txt
\`\`\`

### 批量处理
\`\`\`bash
python text_processor.py batch text_files/ --output results/
python text_processor.py batch text_files/ --format json --output batch_results.json
\`\`\`

## 示例

### 示例 1：基础词数统计
\`\`\`bash
$ python text_processor.py analyze sample.txt
=== TEXT ANALYSIS RESULTS ===
File: sample.txt
Total words: 150
Unique words: 85
Total characters: 750
Lines: 12
Most frequent word: "the" (8 occurrences)
\`\`\`

### 示例 2：JSON 输出
\`\`\`bash
$ python text_processor.py analyze sample.txt --format json
{
  "file": "sample.txt",
  "statistics": {
    "total_words": 150,
    "unique_words": 85,
    "total_characters": 750,
    "lines": 12,
    "most_frequent": {
      "word": "the",
      "count": 8
    }
  }
}
\`\`\`

### 示例 3：文本转换
\`\`\`bash
$ python text_processor.py transform sample.txt --mode title
Original: "hello world from the text processor"
Transformed: "Hello World From The Text Processor"
\`\`\`

## 安装

本技能仅需 Python 3.7 或更高版本及标准库，无外部依赖。

1. 克隆或下载技能目录
2. 进入 scripts 目录
3. 直接用 Python 运行文本处理器

\`\`\`bash
cd scripts/
python text_processor.py --help
\`\`\`

## 配置

文本处理器通过命令行参数支持多种配置：

- \`--format\`：输出格式（json、text）
- \`--verbose\`：启用详细输出与进度报告
- \`--output\`：指定输出文件或目录
- \`--encoding\`：指定文本文件编码（默认：utf-8）

## 架构

本技能采用简单模块化架构：

- **TextProcessor 类**：核心处理逻辑与统计计算
- **OutputFormatter 类**：处理双输出格式生成
- **FileManager 类**：管理文件 I/O 与批量处理
- **CLI 接口**：命令行参数解析与用户交互

## 错误处理

本技能包含以下情况的全面错误处理：
- 文件未找到或权限错误
- 无效编码或损坏的文本文件
- 超大文件的内存限制
- 输出目录创建与写入权限
- 无效的命令行参数

## 性能考虑

- 通过流式处理高效使用大文本文件内存
- 使用字典查找优化词数统计
- 大数据集批量处理带进度报告
- 可配置编码检测以支持国际化文本

## 贡献

本技能作为参考实现，欢迎贡献以展示最佳实践：

1. 遵循 PEP 8 编码标准
2. 包含完整 docstring
3. 添加带示例数据的测试用例
4. 新功能更新文档
5. 确保向后兼容

## 限制

作为 BASIC 层级技能，部分高级功能有意省略：
- 复杂文本分析（情感、语言检测）
- 高级文件格式支持（PDF、Word 文档）
- 数据库集成或外部 API 调用
- 超大数据集的并行处理

本技能展示 claude-skills 生态中 BASIC 层级技能所需的基本结构与质量标准，同时保持简单并聚焦核心功能。`,
};
