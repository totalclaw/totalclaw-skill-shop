module.exports = {
  skillId: 'totalclaw:totalclaw~sarthib7-janitor',
  descriptionZh:
    'OpenClaw AI 智能体清理与会话管理技能，自动清理缓存、优化内存，实时监控 token 用量并智能修剪旧会话，防止上下文溢出。',
  bodyZh: `# Janitor - AI 智能体清理与会话管理技能

## 概述

**Janitor** 是面向 OpenClaw AI 智能体的智能清理与会话管理技能。它自动管理缓存、优化内存使用，并通过监控 token 用量与智能修剪旧会话 **防止上下文溢出**。

可将 Janitor 视为 **AI 智能体的智能维护团队**，负责：
- 🧹 清理缓存文件以优化 token 使用
- 🗑️ 释放未用内存与 RAM
- 🔍 **实时监控上下文用量（新！）**
- 🤖 **自动修剪旧会话（新！）**
- 📦 **删除前归档会话（新！）**
- 🚨 **95% 上下文用量时紧急恢复（新！）**
- 📊 向智能体报告清理统计
- 🔔 **多渠道通知（新！）**

## 快速开始

### 安装

\`\`\`bash
cd /Users/sarthiborkar/Desktop/butler-main/janitor
npm install  # 无需依赖！
\`\`\`

### 基本用法

\`\`\`javascript
const Janitor = require('./src/Janitor');

// 创建 janitor 实例
const janitor = new Janitor();

// 运行清理
const result = await janitor.cleanup();
console.log(result);
// {
//   filesDeleted: 42,
//   spaceSaved: "1.2 MB",
//   duration: "150ms",
//   memoryFreed: true
// }

// 获取报告
const report = await janitor.report();
\`\`\`

## 功能

### 1. 缓存清理

自动清理占用磁盘空间并拖慢操作的缓存文件：

\`\`\`javascript
const janitor = new Janitor();

// 清理缓存文件
await janitor.cleanup();
\`\`\`

**清理项：**
- \`node_modules/.cache/**\` - Node 模块缓存
- \`**/*.cache\` - 通用缓存文件
- \`.DS_Store\` - macOS 元数据文件
- \`dist/**/*.map\` - Source map 文件
- \`coverage/**\` - 测试覆盖率报告
- \`tmp/**\` - 临时文件
- \`**/*.log\` - 旧日志文件（>7 天）

### 2. 内存优化

释放未用内存以优化 token 使用：

\`\`\`javascript
const janitor = new Janitor();

// 释放内存
janitor.freeMemory();

// 检查内存使用
const memoryStats = janitor.getMemoryUsage();
console.log(memoryStats);
// {
//   rss: "45.2 MB",
//   heapTotal: "12.8 MB",
//   heapUsed: "8.4 MB",
//   external: "1.2 MB"
// }
\`\`\`

**内存操作：**
- 触发垃圾回收（若已启用）
- 清除 Node.js require 缓存
- 报告内存使用统计

### 3. 未使用文件清理

删除超过可配置期限未访问的文件：

\`\`\`javascript
const janitor = new Janitor({
  unusedFileAgeDays: 7  // 删除 7 天未访问的文件
});

await janitor.cleanup();
\`\`\`

**安全特性：**
- 永不删除重要文件（package.json、README.md、src/、.git/ 等）
- 可配置年龄阈值
- 删除前报告文件列表

### 4. Push 后清理

GitHub push 后自动清理：

\`\`\`javascript
const janitor = new Janitor({
  autoCleanAfterPush: true
});

// git push 之后
await janitor.cleanupAfterPush();
\`\`\`

**使用场景：**
推送到 GitHub 后，本地不再需要临时构建产物、缓存文件与覆盖率报告。

### 5. 报告与统计

获取详细清理统计：

\`\`\`javascript
const janitor = new Janitor();

// 运行若干次清理
await janitor.cleanup();
await janitor.cleanup();

// 获取统计
const stats = janitor.getStats();
console.log(stats);
// {
//   totalCleanups: 2,
//   totalFilesDeleted: 84,
//   totalSpaceSaved: "2.4 MB",
//   memoryUsage: { ... }
// }

// 获取含建议的完整报告
const report = await janitor.report();
console.log(report);
// {
//   timestamp: "2026-02-07T...",
//   status: "healthy",
//   stats: { ... },
//   recommendations: [
//     "Regular cleanup recommended."
//   ]
// }
\`\`\`

## 配置

### 默认配置

\`\`\`javascript
{
  enabled: true,
  autoCleanAfterPush: true,
  unusedFileAgeDays: 7,
  cachePatterns: [
    '**/*.cache',
    '**/node_modules/.cache/**',
    '**/.DS_Store',
    '**/dist/**/*.map',
    '**/tmp/**',
    '**/*.log',
    '**/coverage/**'
  ]
}
\`\`\`

### 自定义配置

\`\`\`javascript
const janitor = new Janitor({
  enabled: true,
  autoCleanAfterPush: false,  // 禁用 push 后自动清理
  unusedFileAgeDays: 14,       // 保留文件 2 周
  cachePatterns: [
    '**/*.cache',
    '**/my-custom-cache/**'
  ]
});
\`\`\`

## 与 Butler 集成

### 方式 1：直接集成

\`\`\`javascript
const Butler = require('../src/Butler');
const Janitor = require('../janitor/src/Janitor');

const butler = new Butler();
const janitor = new Janitor();

// 生成智能体并在之后清理
async function runTaskWithCleanup() {
  const results = await butler.spawnAgent(
    'DataAnalysis',
    'Analyze data and generate report',
    200000
  );

  // 任务后清理
  const cleanupResult = await janitor.cleanup();
  console.log('Cleanup:', cleanupResult);

  return results;
}

runTaskWithCleanup();
\`\`\`

### 方式 2：自动清理钩子

\`\`\`javascript
const Butler = require('../src/Butler');
const Janitor = require('../janitor/src/Janitor');

class ButlerWithJanitor extends Butler {
  constructor() {
    super();
    this.janitor = new Janitor({ autoCleanAfterPush: true });
  }

  async spawnAgent(...args) {
    const result = await super.spawnAgent(...args);

    // 智能体完成后自动清理
    await this.janitor.cleanup();

    return result;
  }
}

const butler = new ButlerWithJanitor();
\`\`\`

## 示例

### 示例 1：基础清理

\`\`\`javascript
const Janitor = require('./src/Janitor');

async function basicCleanup() {
  const janitor = new Janitor();

  console.log('Starting cleanup...');
  const result = await janitor.cleanup();

  console.log(\`✅ Deleted \${result.filesDeleted} files\`);
  console.log(\`✅ Saved \${result.spaceSaved}\`);
}

basicCleanup();
\`\`\`

### 示例 2：定时清理

\`\`\`javascript
const Janitor = require('./src/Janitor');

const janitor = new Janitor();

// 每小时运行清理
setInterval(async () => {
  console.log('🧹 Running scheduled cleanup...');
  const result = await janitor.cleanup();
  console.log(\`Cleaned: \${result.spaceSaved}\`);
}, 60 * 60 * 1000); // 1 hour
\`\`\`

### 示例 3：Git Hook 集成

创建 \`.git/hooks/post-commit\`：

\`\`\`bash
#!/bin/sh
node janitor/src/index.js cleanup --after-push
\`\`\`

### 示例 4：监控与告警

\`\`\`javascript
const Janitor = require('./src/Janitor');

const janitor = new Janitor();

async function monitor() {
  const report = await janitor.report();

  if (report.recommendations.length > 0) {
    console.log('⚠️  Recommendations:');
    report.recommendations.forEach(r => console.log(\`   - \${r}\`));
  }

  // 发送到监控系统
  sendToMonitoring(report);
}

setInterval(monitor, 5 * 60 * 1000); // Every 5 minutes
\`\`\`

## CLI 用法

创建 \`src/index.js\`：

\`\`\`javascript
#!/usr/bin/env node
const Janitor = require('./Janitor');

const janitor = new Janitor();

const args = process.argv.slice(2);
const command = args[0];

(async () => {
  switch (command) {
    case 'cleanup':
      const result = await janitor.cleanup();
      console.log('Result:', result);
      break;

    case 'report':
      const report = await janitor.report();
      console.log(JSON.stringify(report, null, 2));
      break;

    case 'stats':
      const stats = janitor.getStats();
      console.log(stats);
      break;

    default:
      console.log('Usage: node index.js [cleanup|report|stats]');
  }
})();
\`\`\`

然后使用：

\`\`\`bash
node janitor/src/index.js cleanup
node janitor/src/index.js report
node janitor/src/index.js stats
\`\`\`

## API 参考

### 构造函数

\`\`\`javascript
new Janitor(config?: object)
\`\`\`

### 方法

#### \`cleanup(workingDir?: string): Promise<CleanupResult>\`

运行完整清理操作。

**返回：**
\`\`\`javascript
{
  filesDeleted: number,
  spaceSaved: string,
  duration: string,
  memoryFreed: boolean
}
\`\`\`

#### \`cleanupAfterPush(): Promise<CleanupResult | null>\`

Push 后自动清理（若已启用）。

#### \`freeMemory(): void\`

通过触发垃圾回收与清除缓存释放内存。

#### \`getStats(): object\`

获取清理统计。

#### \`report(): Promise<Report>\`

生成含建议的综合报告。

#### \`getMemoryUsage(): object\`

获取当前内存使用统计。

## 最佳实践

### 1. 定期清理

定期运行清理以防止缓存堆积：

\`\`\`javascript
// 每小时
setInterval(() => janitor.cleanup(), 60 * 60 * 1000);
\`\`\`

### 2. 任务后清理

完成任务后始终清理：

\`\`\`javascript
async function runTask() {
  // 执行工作
  await butler.spawnAgent(...);

  // 清理
  await janitor.cleanup();
}
\`\`\`

### 3. 监控内存

跟踪内存使用以检测泄漏：

\`\`\`javascript
const memUsage = janitor.getMemoryUsage();
console.log('Heap used:', memUsage.heapUsed);
\`\`\`

### 4. 安全删除

Janitor 自动保护重要文件，也可添加自定义保护：

\`\`\`javascript
// 如需要可覆盖 isImportant 方法
janitor.isImportant = (filePath) => {
  const important = ['my-important-file.txt'];
  return important.some(name => filePath.includes(name));
};
\`\`\`

## 性能

- 清理耗时：50–500ms（取决于文件数量）
- 内存开销：<5MB
- 无外部依赖
- 可安全并发操作

## 故障排除

### 问题：内存使用过高

**解决：** 运行 \`janitor.freeMemory()\` 触发垃圾回收。

### 问题：文件未被删除

**解决：** 检查文件是否在受保护目录（node_modules、.git、src）。

### 问题：清理过于激进

**解决：** 在配置中增大 \`unusedFileAgeDays\`：

\`\`\`javascript
const janitor = new Janitor({ unusedFileAgeDays: 30 });
\`\`\`

## 路线图

- [ ] 通过配置文件自定义清理模式
- [ ] 与 Butler 仪表板集成
- [ ] 实时清理监控
- [ ] 云存储清理（S3、GCS）
- [ ] Docker 容器清理
- [ ] 数据库缓存清理

## 许可证

MIT

## 支持

- Issues：[GitHub Issues](https://github.com/zoro-jiro-san/butler/issues)
- 文档：本文件

---

**Janitor v1.0.0** — 让你的 AI 智能体保持整洁高效！`,
};
