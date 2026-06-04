/**
 * PM2 进程配置。
 * - skill-shop-web: Express SSR 前台 (默认 :3090)
 * - skill-shop-api: NestJS API + 管理后台 (默认 :3091); nginx 将 /api /admin 反代到此端口
 */
const path = require('path');
const fs = require('fs');

const apiCwd = path.join(__dirname, 'api');
const apiPort = parseInt(process.env.API_PORT || '3091', 10);

// 从 api/.env 读取关键 env 透传给进程（仿 totalclaw-web）
const apiEnvFile = path.join(apiCwd, '.env');
const apiEnvFromFile = {};
if (fs.existsSync(apiEnvFile)) {
  fs.readFileSync(apiEnvFile, 'utf-8').split('\n').forEach((line) => {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m) apiEnvFromFile[m[1]] = m[2].replace(/^["']|["']$/g, '');
  });
}

const apps = [
  {
    name: 'skill-shop-web',
    script: 'server/index.js',
    cwd: __dirname,
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_restarts: 20,
    min_uptime: '5s',
    env: {
      NODE_ENV: 'production',
      PORT: 3090,
      API_BASE: process.env.API_BASE || 'http://127.0.0.1:3091',
      PUBLIC_ORIGIN: process.env.PUBLIC_ORIGIN || 'http://localhost:3090',
    },
  },
];

if (process.env.SKIP_API !== '1') {
  apps.push({
    name: 'skill-shop-api',
    cwd: apiCwd,
    script: 'dist/main.js',
    instances: 1,
    exec_mode: 'fork',
    autorestart: true,
    max_memory_restart: '400M',
    env: {
      ...apiEnvFromFile,
      NODE_ENV: 'production',
      PORT: apiPort,
    },
  });
}

module.exports = { apps };
