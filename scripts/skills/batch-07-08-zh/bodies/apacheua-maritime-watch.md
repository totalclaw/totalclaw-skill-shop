# maritime-watch

## 描述

用于监控 Chornomorsk 港口状态与安全的技能。从天气预报、船舶追踪与新闻源等多渠道采集数据，提供港口运营概况与潜在风险。设计为可抵御 API 限流，并通过多源交叉验证减少幻觉。

## 输入

*   `port`：要监控的港口名称（默认：Chornomorsk）。

## 输出

包含以下信息的 JSON 对象：

*   `weather`：港口当前天气（交叉验证）。
*   `vessels`：在港或接近的船舶列表（交叉验证）。
*   `security`：港口安全状态（如警报、警告）（交叉验证）。
*   `news`：与港口相关的近期新闻。

## 用法

调用时传入 `port` 参数：

```
maritime-watch port=Chornomorsk
```

## 示例

```json
{
  "weather": {
    "temperature": 10,
    "conditions": "Cloudy"
  },
  "vessels": [
    {
      "name": "MV Example",
      "status": "Arrived"
    }
  ],
  "security": {
    "status": "Normal"
  },
  "news": [
    {
      "title": "Port expansion project announced",
      "url": "https://example.com/news"
    }
  ]
}
```
