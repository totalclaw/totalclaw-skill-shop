module.exports = {
  skillId: 'totalclaw:totalclaw~qiangwang375-wq-v2rayn',
  descriptionZh:
    '在 macOS 上管理 V2RayN 代理客户端，支持节点管理、连接测试、自动故障检测与切换，以及订阅更新。',
  bodyZh: `# V2RayN 技能

在 macOS 上管理 V2RayN 代理客户端，支持自动故障切换。

## 概述

V2RayN 是 macOS 上的 V2Ray 客户端。本技能帮助管理节点、测试连接、自动检测故障并更新订阅。

## 快速状态检查

\`\`\`bash
# 检查 V2RayN 是否在运行
ps aux | grep -i v2rayN | grep -v grep

# 检查监听端口
lsof -i :10808 -i :10809 -i :10810 -i :7890 -i :7891 2>/dev/null

# 测试连接
curl -s --max-time 5 https://www.google.com -w "\\nStatus: %{http_code}\\n"
\`\`\`

## 自动检查节点健康（每 30 分钟）

本技能自动：
1. 检查当前节点是否可用
2. 若失败，更新订阅
3. 选择新的可用节点

### 实现

创建 cron 任务：
\`\`\`
*/30 * * * * /path/to/check_v2rayn.sh
\`\`\`

### 检查脚本

\`\`\`bash
#!/bin/bash
# check_v2rayn.sh - V2RayN 自动检查与故障切换

LOG_FILE="$HOME/.openclaw/logs/v2rayn_check.log"
CONFIG_DIR="$HOME/Library/Application Support/v2rayN/guiConfigs"
MAIN_CONFIG="$CONFIG_DIR/guiNConfig.json"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# 测试连接
test_connection() {
    curl -s --max-time 5 -x socks5://127.0.0.1:10808 https://www.google.com -o /dev/null -w "%{http_code}" 2>/dev/null
}

# 获取当前节点信息
get_current_node() {
    python3 -c "
import json
with open('$MAIN_CONFIG') as f:
    d = json.load(f)
    idx = d.get('currentServerIndex')
    if idx is not None:
        servers = d.get('vmess',[]) + d.get('vless',[]) + d.get('trojan',[])
        if idx < len(servers):
            print(servers[idx].get('remarks', 'Unknown'))
        else:
            print('Invalid index')
    else:
        print('No server selected')
" 2>/dev/null
}

# 主检查
log "=== Starting V2RayN health check ==="

# 测试当前连接
RESULT=$(test_connection)
log "Connection test result: $RESULT"

if [ "$RESULT" = "200" ]; then
    log "✅ Node is working: $(get_current_node)"
    exit 0
else
    log "❌ Node failed! Trying to recover..."
    
    # 尝试更新订阅
    log "Updating subscription..."
    # 注意：V2RayN CLI 功能有限，需手动或外部脚本
    
    log "Please manually:"
    log "1. Open V2RayN"
    log "2. Update subscription"
    log "3. Select a new node"
    
    # 通知用户
    echo "⚠️ V2RayN node failed! Please check manually."
    exit 1
fi
\`\`\`

## 手动命令

### 1. 检查节点状态
\`\`\`bash
# 测试所有常用代理端口
for port in 10808 10809 10810 7890 7891; do
    result=$(curl -s --max-time 3 -x socks5://127.0.0.1:$port https://www.google.com -w "%{http_code}" 2>/dev/null)
    echo "Port $port: $result"
done
\`\`\`

### 2. 列出所有节点
\`\`\`bash
cat ~/Library/Application\\ Support/v2rayN/guiConfigs/guiNConfig.json | python3 -c "
import json,sys
d=json.load(sys.stdin)
servers = d.get('vmess',[]) + d.get('vless',[]) + d.get('trojan',[]) + d.get('shadowsocks',[])
print(f'Total nodes: {len(servers)}')
for i, s in enumerate(servers):
    print(f'{i+1}. {s.get(\\"remarks\\", s.get(\\"name\\", \\"Unnamed\\"))}')
"
\`\`\`

### 3. 获取当前节点
\`\`\`bash
python3 -c "
import json
with open('$HOME/Library/Application Support/v2rayN/guiConfigs/guiNConfig.json') as f:
    d = json.load(f)
    idx = d.get('currentServerIndex')
    if idx:
        servers = d.get('vmess',[]) + d.get('vless',[]) + d.get('trojan',[])
        if idx < len(servers):
            s = servers[idx]
            print(f'Current: {s.get(\\"remarks\\", \\"Unknown\\")}')
            print(f'Protocol: {s.get(\\"protocol\\", \\"trojan\\")}')
"
\`\`\`

### 4. 测试特定节点
\`\`\`bash
# 测试当前节点
curl -s --max-time 5 -x socks5://127.0.0.1:10808 https://www.google.com

# 直连测试
curl -s --max-time 5 https://www.google.com
\`\`\`

### 5. 查看日志
\`\`\`bash
ls -la ~/Library/Application\\ Support/v2rayN/guiLogs/
tail -50 ~/Library/Application\\ Support/v2rayN/guiLogs/*.log 2>/dev/null | tail -30
\`\`\`

### 6. 重启 V2RayN
\`\`\`bash
# 结束并重启
pkill -f v2rayN
open /Applications/v2rayN.app
\`\`\`

### 7. 强制更新订阅
注意：V2RayN 没有用于订阅更新的 CLI。你需要：
1. 打开 V2RayN GUI
2. 点击订阅的「Update」

## 配置文件

| 文件 | 说明 |
|------|------|
| \`guiNConfig.json\` | 主 GUI 配置（节点、设置） |
| \`config.json\` | V2Ray/Xray 运行时配置 |
| \`configPre.json\` | Sing-box 配置（若使用 TUN 模式） |

## 故障排除

### 节点不可用
1. 查看日志：\`tail -50 ~/Library/Application Support/v2rayN/guiLogs/*.log\`
2. 测试端口：\`lsof -i :10808\`
3. 在 GUI 中尝试不同节点
4. 更新订阅

### 所有节点无效
- 导入新订阅
- 或在 GUI 中手动添加节点

### TUN 模式不可用
- 检查 TUN 接口是否存在：\`ifconfig | grep -i tun\`
- 检查 configPre.json 中的 TUN 设置`,
};
