# Content Creator → 已重定向

> **本技能已拆分为两个专家技能。** 请根据意图选择：

| 你想… | 请改用 |
|----------------|-----------------|
| **撰写**博客、文章或指南 | [content-production](../content-production/) |
| **规划**创作内容、主题集群、内容日历 | [content-strategy](../content-strategy/) |
| **分析品牌声线** | [content-production](../content-production/)（含 `brand_voice_analyzer.py`） |
| **优化现有内容 SEO** | [content-production](../content-production/)（含 `seo_optimizer.py`） |
| **创作社媒内容** | [social-content](../social-content/) |

## 为何调整

原 `content-creator` 试图包揽规划、写作、SEO、社媒与品牌声线，成为「万金油」。专家技能各自更专精：

- **content-production** — 完整流水线：调研 → 简报 → 草稿 → 优化 → 发布。包含原 content-creator 的全部 Python 工具。
- **content-strategy** — 战略规划：主题集群、关键词研究、内容日历与优先级框架。

## 主动触发

- **用户说「content creator」** → 路由至 content-production（最常见意图是写作）。
- **用户说「content plan」或「what should I write」** → 路由至 content-strategy。

## 输出物

| 当用户请求… | 路由至… |
|---------------------|-------------|
| 「Write a blog post」 | content-production |
| 「Content calendar」 | content-strategy |
| 「Brand voice analysis」 | content-production（`brand_voice_analyzer.py`） |
| 「SEO optimization」 | content-production（`seo_optimizer.py`） |

## 沟通

这是重定向技能。将用户引导至正确专家 — 不要在此直接处理请求。

## 相关技能

- **content-production**：完整内容执行流水线（继任者）。
- **content-strategy**：内容规划与选题（继任者）。
- **content-humanizer**：后处理 AI 内容使其更自然。
- **marketing-context**：两位继任者都会读取的基础上下文。
