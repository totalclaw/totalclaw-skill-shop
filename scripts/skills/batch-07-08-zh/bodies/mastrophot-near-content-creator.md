# NEAR 内容创作技能

为社媒与教育场景生成可直接发布的 NEAR 生态内容。

实现入口：`{baseDir}/dist/index.js`

## 何时使用

在需要以下能力时使用：
- 面向 NEAR 受众的教育型社媒内容（推文串）。
- 带时间戳指标的每日 NEAR 市场简报。
- 附链接的精选生态新闻。
- 针对特定 NEAR 主题的教程草稿。

## 命令

```python
@skill.command("near_content_thread")
async def generate_thread(topic: str) -> list:
    """Generate educational Twitter thread"""

@skill.command("near_content_update")
async def market_update() -> str:
    """Generate daily market update"""

@skill.command("near_content_news")
async def ecosystem_news() -> list:
    """Compile ecosystem news"""

@skill.command("near_content_tutorial")
async def generate_tutorial(topic: str) -> str:
    """Generate tutorial content"""
```

## 说明

- 市场简报包含时间戳指标，仅供信息参考。
- 新闻汇编优先采用 NEAR 及邻近官方来源，附链接、去重与来源排序。
- 教程面向可执行操作，而非泛泛文案。
- 推文串输出规范为稳定的 `1/8` … `8/8` 结构，便于直接发布。
