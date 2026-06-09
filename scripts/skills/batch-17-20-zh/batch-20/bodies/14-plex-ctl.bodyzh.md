# plexctl — Plex 媒体服务器控制

> 通过 Plex API 控制 Plex 媒体服务器与客户端的独立 CLI

## 何时使用

**触发短语：**
- "play [title] on Plex"
- "search Plex for [query]"
- "what's playing on Plex"
- "pause/resume Plex"
- "show me what's on deck"
- "what's new on Plex"
- "list Plex clients"
- "tell me about [movie/show]"

**使用本技能当：**
- 用户想在 Plex 上播放特定内容
- 用户想搜索 Plex 媒体库
- 用户想控制播放（暂停、继续、停止、下一首、上一首）
- 用户想查看当前正在播放的内容
- 用户想浏览最近添加的内容
- 用户想查看继续观看（on-deck）
- 用户想了解某部影片/剧集的详细信息

**不使用本技能当：**
- 用户需要 Apple TV 专属导航（请用 ClawTV）
- 用户需要基于视觉的自动化（请用 ClawTV）
- 用户想管理 Plex 服务器设置（请用 Plex Web UI）

## 命令

### 设置
```bash
plexctl setup
```
交互式首次设置：
- Plex 服务器 URL（如 http://192.168.86.86:32400）
- Plex token
- 默认客户端选择

### 播放
```bash
# 播放电影（模糊搜索）
plexctl play "Fight Club"
plexctl play "inception"

# 播放指定剧集
plexctl play "The Office" -s 3 -e 10
plexctl play "Westworld" --season 2 --episode 6

# 在指定客户端播放（覆盖默认）
plexctl play "Matrix" -c "Living Room TV"
```

### 播放控制
```bash
plexctl pause              # 暂停当前播放
plexctl resume             # 继续播放
plexctl stop               # 停止播放
plexctl next               # 跳到下一曲/集
plexctl prev               # 回到上一曲/集
```

### 搜索与发现
```bash
# 跨所有媒体库搜索
plexctl search "matrix"
plexctl search "breaking bad"

# 最近添加
plexctl recent             # 最近 10 项
plexctl recent -n 20       # 最近 20 项

# 继续观看（on-deck）
plexctl on-deck

# 当前正在播放
plexctl now-playing

# 标题详细信息
plexctl info "Inception"
plexctl info "The Office"
```

### 媒体库管理
```bash
# 列出所有媒体库
plexctl libraries

# 列出可用客户端
plexctl clients
```

## 设置说明

### 1. 安装依赖
```bash
pip install plexapi
```

### 2. 运行设置
```bash
plexctl setup
```

你需要：
- **Plex 服务器 URL**：通常为 `http://[本地IP]:32400`
- **Plex token**：从 设置 → 账户 → 已授权设备 获取
  - 或从登录 Plex Web 后的浏览器 URL 获取
  - 查找 `X-Plex-Token` 参数
- **默认客户端**：工具会自动发现可用客户端

### 3. 验证
```bash
plexctl clients            # 应列出你的设备
plexctl libraries          # 应列出媒体库
plexctl search "test"      # 应返回结果
```

## 所需凭证

配置保存在 `~/.plexctl/config.json`：

```json
{
  "plex_url": "http://192.168.86.86:32400",
  "plex_token": "your-plex-token-here",
  "default_client": "Apple TV"
}
```

### 获取 Plex Token

**方法 1：设置页**
1. 登录 Plex Web（app.plex.tv）
2. 设置 → 账户 → 已授权设备
3. 在页面源码或 URL 中查找 token

**方法 2：浏览器 URL**
1. 登录状态下打开任意 Plex Web 页面
2. 在 URL 中查找 `X-Plex-Token=...`
3. 复制 token 值

**方法 3：XML 直连**
1. 访问：`http://[your-plex-ip]:32400/?X-Plex-Token=`
2. 查看页面源码
3. 查找 `authToken` 属性

## 隐私与数据

- **仅本地**：直接连接本地网络上的 Plex 媒体服务器
- **无云 API**：除 GDM 发现失败时用 Plex 云发现作回退外，通信均为本地
- **无外部服务**：不向第三方发送数据
- **无遥测**：无使用跟踪或分析
- **配置存储**：仅在本地保存 Plex URL、token 与默认客户端

**注意**：仅当本地 GDM 发现失败时才使用 Plex 云发现（MyPlex）。所有媒体播放均直连本地服务器。

## 常见用例

### 1. 快速播放电影
```bash
plexctl play "Fight Club"
```
搜索媒体库、找最佳匹配、在默认客户端开始播放。

### 2. 追剧
```bash
plexctl play "Breaking Bad" -s 1 -e 1
# ... 看完一集 ...
plexctl next                    # 下一集
plexctl next                    # 再下一集
```

### 3. 继续观看
```bash
plexctl on-deck                 # 查看进行中的内容
plexctl play "Show Name"        # 从上次位置继续
```

### 4. 浏览新内容
```bash
plexctl recent                  # 查看新增
plexctl info "Movie Title"      # 获取详情
plexctl play "Movie Title"      # 观看
```

### 5. 多客户端控制
```bash
plexctl clients                           # 列出所有客户端
plexctl play "Movie" -c "Bedroom TV"      # 在指定客户端播放
plexctl pause -c "Living Room TV"         # 暂停指定客户端
```

### 6. 媒体库搜索
```bash
plexctl search "christopher nolan"        # 查找所有 Nolan 影片
plexctl search "breaking"                 # 模糊搜索
plexctl info "Inception"                  # 观看前查看详情
```

## 模糊匹配

`play` 与 `info` 命令使用模糊搜索：
- "fight club" → "Fight Club (1999)"
- "inception" → "Inception"
- "office" → "The Office (U.S.)"

精确匹配优先于部分匹配。

## 错误处理

**找不到客户端：**
```
Error: Client 'Apple TV' not found

Available clients:
  Local:
    • Living Room TV (Plex for Apple TV)
    • Bedroom (Plex Web)
```

**无结果：**
```
No results found for: xyz123
```

**连接失败：**
```
Error connecting to Plex server: [Errno 61] Connection refused
URL: http://192.168.86.86:32400
Check your plex_url and plex_token in config
```

## 与 OpenClaw 集成

当用户要求在 Plex 上播放内容时：

1. **解析请求** — 提取标题、季、集
2. **选择命令：**
   - 电影：`plexctl play "Title"`
   - 剧集指定集：`plexctl play "Show" -s N -e N`
   - 先搜索：`plexctl search "query"` 再 `plexctl play "Title"`
3. **执行并反馈** — 运行命令，将输出告知用户

**智能体流程示例：**
```
User: "Play Fight Club on Plex"
Agent: [exec] plexctl play "Fight Club"
Output: Found: Fight Club (1999) (movie)
        ✓ Playing on Apple TV
Agent: "Now playing Fight Club on your Apple TV"
```

## 故障排除

**无法连接 Plex：**
- 确认服务器正在运行
- 检查 URL（应为 http://IP:32400，非 https）
- 验证 token 正确
- 检查防火墙设置

**找不到客户端：**
- 确保客户端设备上 Plex 应用已打开
- 运行 `plexctl clients` 查看可用客户端
- 尝试云发现（自动回退）
- 在客户端设备上重启 Plex 应用

**播放失败：**
- 确认客户端能播放该内容类型
- 检查客户端是否仍活跃（`plexctl clients`）
- 先在 Plex 应用中手动播放测试
- 查看 Plex 服务器日志

**搜索无结果：**
- 确认媒体库中存在该内容
- 尝试更宽泛的搜索词
- 检查媒体库已扫描且为最新
- 运行 `plexctl libraries` 验证库访问权限

## 性能

- **本地 GDM 发现**：约 100ms
- **云回退发现**：约 500-1000ms
- **搜索**：约 200-500ms（取决于库大小）
- **开始播放**：约 500ms
- **控制命令**：约 100ms

所有操作均为直连 Plex API — 无需视觉、截图或 AI 推理。

## 与 ClawTV 的区别

| 功能 | plexctl | ClawTV |
|---------|---------|--------|
| Plex 控制 | ✅ 直连 API | ✅ API + 视觉 |
| Apple TV 遥控 | ❌ | ✅ |
| 基于视觉的导航 | ❌ | ✅ |
| 任意流媒体应用 | ❌ | ✅ |
| 速度 | ⚡ 即时 | 🐢 较慢（截图） |
| 依赖 | 仅 plexapi | pyatv、Anthropic API、QuickTime |
| 用例 | 仅 Plex 控制 | 通用电视自动化 |

**何时用 plexctl**：快速、直连的 Plex 控制  
**何时用 ClawTV**：复杂导航、非 Plex 应用、基于视觉的自动化
