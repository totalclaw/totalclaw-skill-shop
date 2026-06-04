# SSL 证书目录

放置 `<域名>.pem`(fullchain 证书) 与 `<域名>.key`(私钥)。
**本目录的证书/私钥被 .gitignore 排除，绝不入库**——部署到服务器时需手动拷贝。

部署脚本 `scripts/deploy-pm2.sh` 会按优先级取证书：
1. 显式 env `SSL_CERT` / `SSL_KEY`
2. 本目录 `certs/<NGINX_SERVER_NAME>.pem` / `.key`  ← 推荐
3. 宝塔默认 `/www/server/panel/vhost/cert/<域名>/{fullchain,privkey}.pem`

## skills.taituai.com
- `skills.taituai.com.pem`(DigiCert DV，含中间证书链)
- `skills.taituai.com.key`(RSA 私钥)
- 服务器部署：把这两个文件拷到服务器项目的 `certs/` 下，再 `NGINX_SERVER_NAME=skills.taituai.com npm run deploy`
