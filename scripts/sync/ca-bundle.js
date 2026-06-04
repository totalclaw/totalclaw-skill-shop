'use strict';

const fs = require('fs');
const path = require('path');
const tls = require('tls');
const { execFileSync } = require('child_process');

/**
 * 返回一份「Node 内置根证书 + 系统根证书」合并的 CA 列表，供 https.Agent 使用。
 *
 * 背景：部分机器上 Node 自带的 CA 集缺少某些根（如 GitHub 用的 Sectigo/USERTrust 链），
 * 导致 `unable to get local issuer certificate`；而系统钥匙串里有（所以 curl 正常）。
 * 这里把系统根证书补进来，既安全（仍校验证书）又能连通。
 * 结果缓存到 data/ca/system-roots.pem，避免每次 spawn security。
 */
function loadCaBundle() {
  const cas = [...tls.rootCertificates];
  const cacheFile = path.resolve(__dirname, '../../data/ca/system-roots.pem');
  let pem;

  try { if (fs.existsSync(cacheFile)) pem = fs.readFileSync(cacheFile, 'utf8'); } catch { /* ignore */ }

  if (!pem && process.platform === 'darwin') {
    pem = '';
    for (const kc of [
      '/System/Library/Keychains/SystemRootCertificates.keychain',
      '/Library/Keychains/System.keychain',
    ]) {
      try {
        pem += execFileSync('security', ['find-certificate', '-a', '-p', kc], {
          encoding: 'utf8', maxBuffer: 16 * 1024 * 1024,
        }) + '\n';
      } catch { /* 该钥匙串不可读，跳过 */ }
    }
    if (pem) {
      try { fs.mkdirSync(path.dirname(cacheFile), { recursive: true }); fs.writeFileSync(cacheFile, pem); } catch { /* ignore */ }
    }
  }

  if (pem) {
    const certs = pem.match(/-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g) || [];
    cas.push(...certs);
  }
  return cas;
}

module.exports = { loadCaBundle };
