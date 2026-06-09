module.exports = {
  skillId: 'totalclaw:totalclaw~imraxy-auto-context-manager',
  descriptionZh:
    'AI 驱动的自动项目上下文管理。检测用户所指项目并保持上下文感知。完全本地运行，无需外部 API。',
  bodyZh: `# 自动上下文管理器

AI 驱动的自动项目上下文管理。检测用户所指项目并保持上下文感知。

## 激活

**自动检测：** 在会话开始或上下文不清时使用。
**手动调用：** 用户询问项目或切换上下文时。

## 快速命令

在技能目录下运行：

\`\`\`bash
# 从消息检测项目
python acm.py detect "your message here"

# 列出所有项目
python acm.py list

# 获取当前活动项目
python acm.py current

# 切换到其他项目
python acm.py switch <project_id>
\`\`\`

## 会话中的用法

**当用户消息包含项目关键词时：**
1. 运行 \`python acm.py detect "<message>"\` 识别上下文
2. 用上下文优先选择相关技能/记忆
3. 以项目感知知识回复

**示例：**
\`\`\`
User: "Check my portfolio"
-> 检测：financial/trading 项目
-> 使用相关金融技能
-> 检查交易相关记忆文件
\`\`\`

## 配置

项目存储在 \`~/.auto-context/projects.json\`，可自定义：

\`\`\`json
{
  "projects": {
    "my-project": {
      "name": "My Project",
      "description": "Project description",
      "keywords": ["keyword1", "keyword2", "keyword3"]
    }
  },
  "current_project": "default"
}
\`\`\`

## 文件

- \`auto_context_manager.py\` - 核心模块
- \`acm.py\` - CLI 封装
- \`~/.auto-context/projects.json\` - 项目配置（自动创建）

## 添加项目

\`\`\`python
from auto_context_manager import AutoContextManager
acm = AutoContextManager()
acm.create_project('project_id', 'Project Name', ['keyword1', 'keyword2'], 'Description')
\`\`\`

## 集成说明

- 完全本地，无外部 API
- 数据存储在 \`~/.auto-context/\`
- 置信度分数表示匹配强度
- 始终返回结果（默认回退到 "default" 项目）`,
};
