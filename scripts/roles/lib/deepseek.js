'use strict';

const https = require('https');
const { loadCaBundle } = require('../../sync/ca-bundle');

const httpsAgent = new https.Agent({ ca: loadCaBundle() });

const API = 'https://api.deepseek.com/chat/completions';

/**
 * 调用 DeepSeek chat。返回 assistant 文本。带重试与超时。
 * key 取 process.env.DEEPSEEK_API_KEY。
 */
function chat(messages, { model = 'deepseek-chat', temperature = 0.7, maxTokens = 4096, json = false, tries = 3 } = {}) {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) return Promise.reject(new Error('DEEPSEEK_API_KEY 未配置'));
  const body = JSON.stringify({
    model, messages, temperature, max_tokens: maxTokens, stream: false,
    ...(json ? { response_format: { type: 'json_object' } } : {}),
  });

  const attempt = (n) => new Promise((resolve, reject) => {
    const req = https.request(API, {
      method: 'POST',
      agent: httpsAgent,
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + key,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        try {
          const d = JSON.parse(data);
          if (d.choices && d.choices[0]) return resolve(d.choices[0].message.content);
          reject(new Error('deepseek 异常: ' + (data.slice(0, 200))));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => req.destroy(new Error('deepseek 超时')));
    req.write(body); req.end();
  }).catch(async (e) => {
    if (n < tries) { await new Promise((r) => setTimeout(r, 800 * n)); return attempt(n + 1); }
    throw e;
  });

  return attempt(1);
}

module.exports = { chat };
