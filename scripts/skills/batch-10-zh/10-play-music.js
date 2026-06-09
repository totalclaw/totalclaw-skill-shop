module.exports = {
  skillId: 'totalclaw:totalclaw~awspace-play-music',
  descriptionZh:
    '可控音乐播放器，支持暂停/恢复/停止，单一入口点与后台服务器架构。',
  bodyZh: `# 🎵 Play Music 技能

**可控音乐播放器，支持 pause/resume/stop**  
单一入口点，后台服务器实现完整控制

## 快速开始

1. **放置音乐文件** 于 \`music\` 文件夹（默认）或设置 \`MUSIC_DIR\` 环境变量
2. **安装 pygame**（推荐以获得完整控制）：\`pip install pygame\`
3. **使用**：\`./play-music play\`

## 单一入口点

本技能有**一个清晰入口点**：\`./play-music\`

### 命令接口
\`\`\`
./play-music help          - 显示帮助
./play-music list          - 列出可用歌曲
./play-music play          - 播放默认歌曲
./play-music pause         - 暂停当前播放
./play-music resume        - 恢复暂停的音乐
./play-music stop          - 停止当前播放
./play-music status        - 显示播放状态
./play-music <filename>    - 播放指定歌曲（如 song.mp3）
./play-music server-start  - 手动启动音乐服务器
./play-music server-stop   - 停止音乐服务器
\`\`\`

## 示例

\`\`\`bash
# 播放默认歌曲
./play-music play

# 播放指定歌曲
./play-music song.mp3

# 控制播放
./play-music pause
./play-music resume
./play-music stop

# 查看可用歌曲
./play-music list
\`\`\`

## 功能

✅ **单一入口点** - 无需纠结用哪个脚本  
✅ **完整播放控制** - 播放、暂停、恢复、停止  
✅ **资源高效** - 需要时自动启动服务器，停止音乐后自动关闭  
✅ **清晰架构** - 客户端-服务器分离  
✅ **基于 Pygame** - 高质量音频播放  
✅ **跨平台** - 兼容 macOS/Windows/Linux  

## 设置

### 1. 安装 Pygame（推荐）
完整 pause/resume/stop 控制：
\`\`\`bash
pip install pygame
\`\`\`

### 2. 添加音乐文件
将音乐文件放在：
- 默认：\`./music\`（相对于脚本位置）
- 自定义：设置 \`MUSIC_DIR\` 环境变量

### 3. 配置
\`\`\`bash
# 设置自定义音乐目录
export MUSIC_DIR="/path/to/your/music"

# 设置默认歌曲名
export DEFAULT_SONG="my-song.mp3"
\`\`\`

## 工作原理

本技能采用清晰的客户端-服务器架构：

1. **\`play-music\`** - 单一入口点（合并客户端功能的 Python 脚本）
2. **\`music-server.py\`** - 处理音乐播放的后台服务器
3. **Pygame mixer** - 高质量音频与完整控制

**资源高效设计：** 播放音乐时服务器自动启动，停止音乐后自动关闭。在保持客户端-服务器便利性的同时节省系统资源。

## 故障排查

**尝试 pause/resume/stop 时显示 "No music playing"**  
先开始播放：\`./play-music play\`

**"Music directory not found"**  
创建目录：\`mkdir music\` 或设置 \`MUSIC_DIR\` 环境变量

**"Pygame not installed"**  
安装：\`pip install pygame\`

**服务器无法启动**  
检查端口 12346 是否可用，或终止现有服务器：
\`\`\`bash
pkill -f "music-server.py"
./play-music server-start
\`\`\`

## 文件结构

\`\`\`
play-music/
├── play-music           # 单一入口点（Python 脚本）
├── music-server.py      # 后台服务器
├── SKILL.md            # 本文档
├── README.md           # 用户文档
├── _meta.json          # 技能元数据
└── .gitignore          # Git 忽略文件
\`\`\`

**简洁 minimal** - 无冗余文件，结构清晰。

## 与 OpenClaw 集成

本技能注册到 OpenClaw 后，用于音乐播放任务。技能提供知识与工具，以 pause/resume/stop 支持控制音乐播放。`,
};
