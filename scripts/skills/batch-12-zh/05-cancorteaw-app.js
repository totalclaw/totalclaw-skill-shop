module.exports = {
  skillId: 'totalclaw:totalclaw~cancorleone-cancorteaw-app',
  descriptionZh:
    '本地 Expo / React Native 应用构建运行器。通过白名单脚本 appctl 安全创建 Expo 项目、添加页面、启动 Web 预览并检查状态，所有操作限定在 /home/patron/apps/<project> 目录下。',
  bodyZh: `# cancorteaw-app

本地 **Expo / React Native** 应用构建运行器，用于我的 OpenClaw 服务器。

本技能是**受控运行器**，仅执行白名单脚本：
\`/home/patron/apps/_bin/appctl\`
且该脚本被限制在以下路径操作：
\`/home/patron/apps/<project>\`。

## 功能

本技能封装 \`appctl\`，提供安全、可重复的工作流：

- 在 \`/home/patron/apps/<name>\` 下**创建**新 Expo 应用脚手架
- 在 \`/home/patron/apps/<name>/app/<Screen>.tsx\` 下**添加页面**文件
- 在选定端口于 \`127.0.0.1\` 上**启动 Web 预览**（\`expo start --web\`）
- **检查**预览进程状态

## 命令

### 1）创建新应用
**命令：**
- \`new <name>\`

**示例：**
- \`new demoapp\`

**结果：**
- 创建 \`/home/patron/apps/demoapp\`
- 初始化 git（尽力而为）
- 以非交互模式使用 \`npx create-expo-app\`

---

### 2）添加页面
**命令：**
- \`add-screen <name> <screenName> <title>\`

**示例：**
- \`add-screen demoapp Settings "Settings"\`

**结果：**
- 写入：\`/home/patron/apps/demoapp/app/Settings.tsx\`
- 进行 git 提交（尽力而为）

---

### 3）启动 Web 预览
**命令：**
- \`preview <name>\`

**环境变量：**
- \`EXPO_PORT\`（可选）：覆盖预览端口
  默认：\`19006\`

**示例：**
- \`preview demoapp\`
- \`EXPO_PORT=19010 preview demoapp\`

**结果：**
- 启动 \`npx expo start --web --port <port>\`
- 日志写入：\`/home/patron/apps/_logs/<name>.preview.log\`
- pid 写入：\`/home/patron/apps/_state/<name>.pid\`
- 端口写入：\`/home/patron/apps/_state/<name>.port\`

---

### 4）状态
**命令：**
- \`status <name>\`

**示例：**
- \`status demoapp\`

**结果：**
- 若进程存活，打印 RUNNING 及 URL
- 否则打印 STOPPED

## 安全 / 护栏

- 运行器**白名单**：仅可调用 \`node\`、\`npm\`、\`npx\`、\`git\`、\`bash\`、\`python3\`。
- 所有项目路径限制在 \`/home/patron/apps\`。
- 预览绑定 \`127.0.0.1\`（回环）。若需外部访问，仅通过显式 SSH 隧道暴露。
- 预览中 Expo 遥测已禁用（\`EXPO_NO_TELEMETRY=1\`）。

## 故障排除

- 若 \`preview\` 显示运行中但页面无法加载：检查 \`/home/patron/apps/_logs/\` 中的日志文件。
- 若端口被占用：将 \`EXPO_PORT\` 设为空闲端口并重新运行 \`preview\`。
- 停止预览：\`kill $(cat /home/patron/apps/_state/<name>.pid)\`（若 pid 存在）。`,
};
