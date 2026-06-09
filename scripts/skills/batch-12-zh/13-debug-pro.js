module.exports = {
  skillId: 'totalclaw:totalclaw~debug-pro',
  descriptionZh:
    '系统化调试方法论与多语言调试命令。七步调试协议，涵盖 JavaScript、Python、Swift、CSS、网络与 Git bisect 等场景。',
  bodyZh: `# debug-pro

系统化调试方法论与语言专属调试命令。

## 七步调试协议

1. **复现** — 让问题稳定失败。记录确切步骤、输入与环境。
2. **隔离** — 缩小范围。注释代码、二分查找、用 \`git bisect\` 检查近期提交。
3. **假设** — 形成关于根因的具体、可验证理论。
4. **插桩** — 添加针对性日志、断点或断言。
5. **验证** — 确认根因。若假设错误，回到第 3 步。
6. **修复** — 应用最小正确修复。调试时抵制重构冲动。
7. **回归测试** — 编写能捕获此 bug 的测试并确认通过。

## 语言专属调试

### JavaScript / TypeScript
\`\`\`bash
# Node.js 调试器
node --inspect-brk app.js
# Chrome DevTools: chrome://inspect

# 控制台调试
console.log(JSON.stringify(obj, null, 2))
console.trace('Call stack here')
console.time('perf'); /* code */ console.timeEnd('perf')

# 内存泄漏
node --expose-gc --max-old-space-size=4096 app.js
\`\`\`

### Python
\`\`\`bash
# 内置调试器
python -m pdb script.py

# 代码中断点
breakpoint()  # Python 3.7+

# 详细追踪
python -X tracemalloc script.py

# 性能分析
python -m cProfile -s cumulative script.py
\`\`\`

### Swift
\`\`\`bash
# LLDB 调试
lldb ./MyApp
(lldb) breakpoint set --name main
(lldb) run
(lldb) po myVariable

# Xcode: Product → Profile (Instruments)
\`\`\`

### CSS / 布局
\`\`\`css
/* 为所有元素描边 */
* { outline: 1px solid red !important; }

/* 调试特定元素 */
.debug { background: rgba(255,0,0,0.1) !important; }
\`\`\`

### 网络
\`\`\`bash
# HTTP 调试
curl -v https://api.example.com/endpoint
curl -w "@curl-format.txt" -o /dev/null -s https://example.com

# DNS
dig example.com
nslookup example.com

# 端口
lsof -i :3000
netstat -tlnp
\`\`\`

### Git Bisect
\`\`\`bash
git bisect start
git bisect bad              # 当前提交有问题
git bisect good abc1234     # 已知良好提交
# Git 检出中间提交 — 测试后：
git bisect good  # 或  git bisect bad
# 重复直到找到根因提交
git bisect reset
\`\`\`

## 常见错误模式

| 错误 | 可能原因 | 修复 |
|-------|-------------|-----|
| \`Cannot read property of undefined\` | 缺少空值检查或数据结构错误 | 添加可选链（\`?.\`）或校验数据 |
| \`ENOENT\` | 文件/目录不存在 | 检查路径、创建目录、使用 \`existsSync\` |
| \`CORS error\` | 后端缺少 CORS 头 | 添加带正确来源的 CORS 中间件 |
| \`Module not found\` | 缺少依赖或导入路径错误 | \`npm install\`，检查 tsconfig paths |
| \`Hydration mismatch\`（React） | 服务端/客户端渲染 HTML 不一致 | 确保渲染一致，客户端专用逻辑用 \`useEffect\` |
| \`Segmentation fault\` | 内存损坏、空指针 | 检查数组边界、指针有效性 |
| \`Connection refused\` | 服务未在预期端口运行 | 确认服务已启动、验证端口/主机 |
| \`Permission denied\` | 文件/网络权限问题 | 检查 chmod、防火墙、sudo |

## 快速诊断命令

\`\`\`bash
# 哪个进程占用了此端口？
lsof -i :PORT

# 该进程在做什么？
ps aux | grep PROCESS

# 监视文件变更
fswatch -r ./src

# 磁盘空间
df -h

# 系统资源使用
top -l 1 | head -10
\`\`\``,
};
