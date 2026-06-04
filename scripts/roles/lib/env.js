'use strict';

const fs = require('fs');
const path = require('path');

/** 回退读 api/.env（取 MONGODB_URI / DEEPSEEK_API_KEY 等），不覆盖已存在的 process.env。 */
function loadEnv() {
  const envFile = path.resolve(__dirname, '../../../api/.env');
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
}

module.exports = { loadEnv };
