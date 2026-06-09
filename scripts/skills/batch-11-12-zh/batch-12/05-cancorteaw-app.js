module.exports = {
  skillId: 'totalclaw:totalclaw~cancorleone-cancorteaw-app',
  descriptionZh:
    '本地 Expo / React Native 应用构建运行器。通过白名单脚本安全创建应用、添加页面并启动 Web 预览。',
  bodyZh: `# cancorteaw-app

本地 **Expo / React Native** 应用构建运行器。

本技能是**受控运行器**，仅执行白名单脚本：
\`/home/patron/apps/_bin/appctl\`  
该脚本限制在以下路径操作：
\`/home/patron/apps/<project>\`。

## 功能

本技能封装 \`appctl\`，提供安全、可重复的工作流：

- 在 \`/home/patron/apps/<name>\` **创建** 新 Expo 应用脚手架
- 在 \`/home/patron/apps/<name>/app/<Screen>.tsx\` **添加页面**
- **启动 Web 预览**（\`expo start --web\`），绑定 \`127.0.0.1\` 与指定端口
- **检查** 预览进程状态

## 命令

### 1) 创建新应用
**命令：**
- \`new <name>\`

**示例：**
- \`new demoapp\`

**结果：**
- 创建 \`/home/patron/apps/demoapp\`
- 初始化 git（尽力而为）
- 非交互模式使用 \`npx create-expo-app\`

---

### 2) 添加页面
**命令：**
- \`add-screen <name> <screenName> <title>\`

**示例：**
- \`add-screen demoapp Settings "Settings"\`

**结果：**
- 写入：\`/home/patron/apps/demoapp/app/Settings.tsx\`
- 尽力 git commit

---

### 3) 启动 Web 预览
**命令：**
- \`preview <name>\`

**环境：**
- \`EXPO_PORT\`（可选）：覆盖预览端口  
  默认：\`19006\`

**示例：**
- \`preview demoapp\`
- \`EXPO_PORT=19010 preview demoapp\`

**结果：**
- 启动 \`npx expo start --web --port <port>\`
- 日志：\`/home/patron/apps/_logs/<name>.preview.log\`
- pid：\`/home/patron/apps/_state/<name>.pid\`
- 端口：\`/home/patron/apps/_state/<name>.port\`

---

### 4) 状态
**命令：**
- \`status <name>\`

**示例：**
- \`status demoapp\`

**结果：**
- 进程存活则打印 RUNNING 与 URL
- 否则打印 STOPPED

## 安全 / 护栏

- 运行器**白名单**：仅可调用 \`node\`、\`npm\`、\`npx\`、\`git\`、\`bash\`、\`python3\`。
- 所有项目路径限制在 \`/home/patron/apps\`。
- 预览绑定 \`127.0.0.1\`（回环）。需外网访问请显式 SSH 隧道。
- 预览禁用 Expo 遥测（\`EXPO_NO_TELEMETRY=1\`）。

## 故障排除

- \`preview\` 显示运行但页面不加载：检查 \`/home/patron/apps/_logs/\` 日志。
- 端口占用：设置空闲 \`EXPO_PORT\` 后重跑 \`preview\`。
- 停止预览：\`kill $(cat /home/patron/apps/_state/<name>.pid)\`（若 pid 存在）。`,
};
