module.exports = {
  skillId: 'totalclaw:totalclaw~ishsharm0-autonomous-executor',
  descriptionZh:
    '自愈式自主任务执行：自动错误恢复、指数退避重试、检查点续跑、MongoDB 日志与夜间批处理。',
  bodyZh: `# 自主执行器

具备自愈与错误恢复能力的全自主任务执行。

## 功能

- **自动错误恢复**：分类错误并应用针对性恢复策略
- **指数退避**：可配置上限的智能重试时序
- **自愈**：自动安装缺失依赖、创建缺失资源
- **检查点/续跑**：保存进度以支持可恢复的夜间任务
- **MongoDB 日志**：持久化执行日志供监控
- **能力感知**：完整了解所有 OpenClaw 技能与工具
- **夜间批处理**：排队任务在你睡眠时运行

## 错误类别与恢复

| 类别 | 自动恢复 |
|----------|---------------|
| Network | 退避等待并重试，检查连通性 |
| Auth | 刷新凭据，提示重新认证 |
| Rate Limit | 按 Retry-After 头等待，指数退避 |
| Resource | 创建缺失文件/目录，清理临时文件 |
| Validation | 自动修复输入，使用默认值 |
| Dependency | pip install 缺失模块 |
| Browser | 重启 Playwright 上下文，降低并发 |
| API | 退避重试，尝试备用端点 |

## 快速用法

\`\`\`python
from autonomous_executor.executor import AutoExec

# 自主部署项目
result = AutoExec.deploy("my-portfolio", "portfolio", "My awesome portfolio")

# 对任意函数启用自动恢复
result = AutoExec.run(my_function, arg1, arg2, _max_retries=5)

# 查看夜间报告
report = AutoExec.report()

# 列出所有能力
print(AutoExec.caps())
\`\`\`

## 夜间批处理执行

\`\`\`python
from autonomous_executor.overnight import Overnight

# 排队夜间任务
Overnight.deploy("my-portfolio", "portfolio", description="Overnight deploy")
Overnight.deploy("client-site", "landing", description="Client landing page")
Overnight.research("AI trends 2025")

# 排队自定义函数
Overnight.run(my_backup_function, "/data", _name="Backup Data")

# 启动夜间运行
summary = Overnight.start()

# 次日早晨查看报告
print(Overnight.report())
\`\`\`

## 装饰器用法

\`\`\`python
from autonomous_executor.executor import autonomous

@autonomous(max_retries=5, task_name="Critical Task")
def my_critical_function():
    # 将自动从错误中恢复
    return do_something()
\`\`\`

## 完整 API

### AutonomousExecutor

\`\`\`python
from autonomous_executor.executor import AutonomousExecutor

executor = AutonomousExecutor(user="ishaan")

# 执行任意函数
result = executor.execute(
    task_fn=my_function,
    args=(arg1, arg2),
    kwargs={"key": "value"},
    task_name="My Task",
    max_retries=5,
    timeout=300  # 5 分钟
)

# 运行项目流水线
result = executor.run_project_pipeline({
    "name": "my-app",
    "type": "nextjs",
    "description": "My Next.js app",
    "extra": {"features": ["dark_mode", "auth"]}
})

# 运行调研
result = executor.run_research_pipeline("quantum computing", depth="deep")

# 获取执行历史
history = executor.get_execution_history(limit=20)

# 获取夜间报告
report = executor.get_overnight_report()
\`\`\`

## 示例输出

\`\`\`
[14:23:45] 🚀 Starting task: Deploy Portfolio
[14:23:45]    Max retries: 5, Timeout: 0s
[14:23:45]    Available capabilities: 15 skills
[14:23:45] ⚡ Attempt 1/5...
[14:23:47] ❌ Attempt 1 failed: ConnectionError: Network timeout
[14:23:47]    Error category: network
[14:23:47] 🔧 Trying recovery: wait_and_retry
[14:23:47] ⏳ Waiting 4.0s before retry...
[14:23:51] ⚡ Attempt 2/5...
[14:24:03] ✅ Task completed successfully in 12.1s
\`\`\`

## MongoDB 集合

- \`task_records\`：完整任务执行记录
- \`task_checkpoints\`：可恢复任务的检查点数据
- \`execution_logs\`：实时执行日志`,
};
