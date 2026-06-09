module.exports = {
  skillId: 'totalclaw:totalclaw~picaye-adblock-dns',
  descriptionZh:
    '在 DNS 层面实现全网范围的广告和追踪器拦截。这是一个 Pi-hole 替代方案，作为 OpenClaw 技能直接运行在你的机器上。无需额外的硬件。',
  bodyZh: `# AdBlock DNS

在 DNS 层面实现全网范围的广告和追踪器拦截。这是一个 Pi-hole 替代方案，作为 OpenClaw 技能直接运行在你的机器上。无需额外的硬件。

## 它的功能

运行一个 DNS 黑洞服务器，在你的整个网络中拦截广告、追踪器、恶意软件和遥测域名。任何将本机用作 DNS 服务器的设备都会自动获得无广告的浏览体验——手机、平板、智能电视、笔记本电脑、物联网设备，所有设备皆然。

使用与 Pi-hole 相同的拦截列表（Steven Black、AdAway、EasyList、EasyPrivacy、Anti-Malware）拦截 189,000 多个广告和追踪器域名。同时拦截 IPv4 (A) 和 IPv6 (AAAA) 查询。

**非常适用于：** 网站横幅广告、追踪像素、第三方广告网络（Doubleclick、Amazon Ads、Criteo、Rubicon 等）、应用内广告、遥测/分析追踪器、恶意软件域名。

**无法拦截：** YouTube 广告、Twitch 广告，或任何与内容本身来自同一域名的广告。这些平台从自己的 CDN 提供广告（例如 YouTube 的 \`googlevideo.com\`），因此拦截该域名会导致整个服务无法使用。这是包括 Pi-hole 在内的所有 DNS 层级拦截器的根本性限制。要拦截 YouTube 广告，请使用 uBlock Origin 之类的浏览器扩展。

## 工作原理

该技能在本机上运行一个 DNS 服务器。当某设备查询一个域名时：
- 如果该域名在拦截列表上，则返回 0.0.0.0（已拦截）
- 如果该域名是干净的，则将查询转发给上游 DNS（默认为 Cloudflare 1.1.1.1）

所有查询都会被记录并附带统计数据（总查询数、拦截百分比、拦截最多的域名）。

## 设置

### 步骤 1：运行设置脚本

\`\`\`bash
cd /path/to/skills/adblock/scripts
bash setup.sh
\`\`\`

这将：
1. 按需安装依赖项
2. 创建一个 systemd 服务（以 root 身份运行，开机启动，自动重启）
3. 下载拦截列表（约 15 万多个域名）
4. 在端口 53 上启动 DNS 服务器
5. 在端口 8053 上启动统计 API
6. 打印你的 DNS IP 和设备设置说明

用户需要在设置过程中输入一次 sudo 密码。

**替代方案（不使用 systemd 的手动启动）：**
\`\`\`bash
sudo node dns-server.js
\`\`\`

### 步骤 2：更改你设备上的 DNS 设置

**这是关键步骤。** 在设备指向 DNS 服务器之前，它不会起任何作用。

查找本机的本地 IP 地址：
\`\`\`bash
hostname -I | awk '{print $1}'
\`\`\`

然后配置设备，使其将该 IP 用作 DNS 服务器：

**路由器（拦截整个网络）：**
- 登录你的路由器管理面板（通常为 192.168.1.1）
- 找到 DNS 设置（通常在 DHCP 或 Internet/WAN 设置下）
- 将主 DNS 设置为本机的 IP
- 将备用 DNS 设置为 1.1.1.1（当本机关闭时作为后备）
- 网络上的所有设备现已受到保护

**单个设备：**

- **iPhone/iPad：** 设置 > Wi-Fi > 点击你的网络 > 配置 DNS > 手动 > 添加本机的 IP
- **Android：** 设置 > 网络 > Wi-Fi > 你的网络 > 高级 > DNS > 设置为本机的 IP
- **Mac：** 系统设置 > 网络 > Wi-Fi > 详细信息 > DNS > 添加本机的 IP
- **Windows：** 设置 > 网络 > Wi-Fi > 硬件属性 > DNS 服务器分配 > 手动 > 设置 IPv4 DNS
- **Linux：** 编辑 /etc/resolv.conf 或 NetworkManager：\`nmcli con mod "Wi-Fi" ipv4.dns "MACHINE_IP"\`

### 步骤 3：验证其是否生效

\`\`\`bash
# Should return 0.0.0.0 (blocked)
nslookup ads.google.com MACHINE_IP

# Should return a real IP (allowed)
nslookup google.com MACHINE_IP
\`\`\`

或检查 API：\`curl http://localhost:8053/stats\`

## 代理命令

当用户询问广告拦截时，使用这些命令：

### 检查统计数据
\`\`\`bash
curl -s http://localhost:8053/stats | python3 -m json.tool
\`\`\`
报告：总查询数、被拦截查询数、拦截百分比、拦截最多的域名。

### 将某域名加入白名单
如果某项功能因被拦截而出现故障：
\`\`\`bash
curl -s -X POST http://localhost:8053/whitelist/add -H "Content-Type: application/json" -d '{"domain":"example.com"}'
\`\`\`

### 拦截某个特定域名
\`\`\`bash
curl -s -X POST http://localhost:8053/blacklist/add -H "Content-Type: application/json" -d '{"domain":"annoying-site.com"}'
\`\`\`

### 检查某域名是否被拦截
\`\`\`bash
curl -s "http://localhost:8053/check?domain=ads.google.com"
\`\`\`

### 更新拦截列表
拦截列表每 24 小时自动更新一次。要强制更新：
\`\`\`bash
curl -s -X POST http://localhost:8053/update
\`\`\`

### 查看白名单
\`\`\`bash
curl -s http://localhost:8053/whitelist
\`\`\`

## 作为服务运行

\`setup.sh\` 脚本会自动处理这一点。如果你需要手动管理：

\`\`\`bash
sudo systemctl start adblock-dns     # Start
sudo systemctl stop adblock-dns      # Stop
sudo systemctl restart adblock-dns   # Restart
sudo systemctl status adblock-dns    # Check status
journalctl -u adblock-dns -f         # View logs

# Remove completely
sudo systemctl disable adblock-dns
sudo rm /etc/systemd/system/adblock-dns.service
sudo systemctl daemon-reload
\`\`\`

## 配置

编辑 \`data/config.json\`：
\`\`\`json
{
  "upstream": "1.1.1.1",   // Upstream DNS (Cloudflare, Google 8.8.8.8, etc.)
  "port": 53,              // DNS port (53 = standard, needs sudo)
  "apiPort": 8053           // Stats API port
}
\`\`\`

## 文件

- \`data/blocklist.txt\` - 编译后的拦截列表（自动生成）
- \`data/whitelist.txt\` - 列入白名单的域名（每行一个）
- \`data/custom-blacklist.txt\` - 要拦截的额外域名（每行一个）
- \`data/stats.json\` - 查询统计数据
- \`data/config.json\` - 服务器配置

## 约束

- 端口 53 需要 root/sudo 访问权限
- 设备必须配置为将本机的 IP 用作 DNS，拦截才能生效
- 如果本机离线，将其用作 DNS 的设备会失去 DNS 解析能力（请设置一个备用 DNS 作为后备）
- 仅拦截域名，不拦截页面内的广告元素（为此请使用浏览器广告拦截器）
- 绕过系统 DNS 的 HTTPS/DoH 查询将无法被捕获`,
};
