# 密钥管理

使用 Vault、AWS Secrets Manager 及平台原生方案，为 CI/CD 流水线安全管理密钥。

## 描述

**何时使用：**
- 安全存储 API 密钥与凭证
- 管理数据库密码
- 处理 TLS 证书
- 设置自动密钥轮换
- 实现最小权限访问模式
- 将密钥集成进 CI/CD（GitHub Actions、GitLab CI）
- 在 Kubernetes 中使用外部密钥部署

**何时不用：**
- 仅需本地开发值（用不入 git 的 .env）
- 无法保护对密钥后端的访问
- 计划硬编码密钥（不要这样做）

---

## 密钥管理工具对比

| 工具 | 最适合 | 关键特性 |
|------|----------|--------------|
| **HashiCorp Vault** | 企业、多云 | 动态密钥、轮换、审计日志 |
| **AWS Secrets Manager** | AWS 原生工作负载 | RDS 集成、自动轮换 |
| **Azure Key Vault** | Azure 工作负载 | HSM 支持、证书管理 |
| **Google Secret Manager** | GCP 工作负载 | 版本控制、IAM 集成 |
| **GitHub Secrets** | GitHub Actions | 简单，按仓库/组织/环境 |
| **GitLab CI Variables** | GitLab CI | 保护分支、掩码变量 |

---

## HashiCorp Vault

### 设置

```bash
# 启动 Vault 开发服务器
vault server -dev

# 设置环境
export VAULT_ADDR='http://127.0.0.1:8200'
export VAULT_TOKEN='root'

# 启用密钥引擎
vault secrets enable -path=secret kv-v2

# 存储密钥
vault kv put secret/database/config username=admin password=secret
```

### GitHub Actions 集成 Vault

```yaml
name: Deploy with Vault Secrets

on: [push]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4

    - name: Import Secrets from Vault
      uses: hashicorp/vault-action@v2
      with:
        url: https://vault.example.com:8200
        token: ${{ secrets.VAULT_TOKEN }}
        secrets: |
          secret/data/database username | DB_USERNAME ;
          secret/data/database password | DB_PASSWORD ;
          secret/data/api key | API_KEY

    - name: Use secrets
      run: |
        echo "Connecting to database as $DB_USERNAME"
        # Use $DB_PASSWORD, $API_KEY
```

### GitLab CI 集成 Vault

```yaml
deploy:
  image: vault:latest
  before_script:
    - export VAULT_ADDR=https://vault.example.com:8200
    - export VAULT_TOKEN=$VAULT_TOKEN
    - apk add curl jq
  script:
    - |
      DB_PASSWORD=$(vault kv get -field=password secret/database/config)
      API_KEY=$(vault kv get -field=key secret/api/credentials)
      echo "Deploying with secrets..."
```

---

## AWS Secrets Manager

### 存储密钥

```bash
aws secretsmanager create-secret \
  --name production/database/password \
  --secret-string "super-secret-password"
```

### 在 GitHub Actions 中获取

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws-region: us-west-2

- name: Get secret from AWS
  run: |
    SECRET=$(aws secretsmanager get-secret-value \
      --secret-id production/database/password \
      --query SecretString \
      --output text)
    echo "::add-mask::$SECRET"
    echo "DB_PASSWORD=$SECRET" >> $GITHUB_ENV

- name: Use secret
  run: ./deploy.sh  # $DB_PASSWORD available
```

### Terraform 集成

```hcl
data "aws_secretsmanager_secret_version" "db_password" {
  secret_id = "production/database/password"
}

resource "aws_db_instance" "main" {
  allocated_storage    = 100
  engine              = "postgres"
  instance_class      = "db.t3.large"
  username            = "admin"
  password            = jsondecode(data.aws_secretsmanager_secret_version.db_password.secret_string)["password"]
}
```

---

## Kubernetes：External Secrets Operator

```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: vault-backend
  namespace: production
spec:
  provider:
    vault:
      server: "https://vault.example.com:8200"
      path: "secret"
      version: "v2"
      auth:
        kubernetes:
          mountPath: "kubernetes"
          role: "production"

---
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: database-credentials
  namespace: production
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: vault-backend
    kind: SecretStore
  target:
    name: database-credentials
    creationPolicy: Owner
  data:
  - secretKey: username
    remoteRef:
      key: database/config
      property: username
  - secretKey: password
    remoteRef:
      key: database/config
      property: password
```

---

## 密钥轮换

### 自动化（AWS Lambda）

```python
import boto3
import json

def lambda_handler(event, context):
    client = boto3.client('secretsmanager')

    # Get current secret
    response = client.get_secret_value(SecretId='my-secret')
    current_secret = json.loads(response['SecretString'])

    # Generate new password
    new_password = generate_strong_password()

    # Update database password
    update_database_password(new_password)

    # Update secret
    client.put_secret_value(
        SecretId='my-secret',
        SecretString=json.dumps({
            'username': current_secret['username'],
            'password': new_password
        })
    )

    return {'statusCode': 200}
```

### 手动轮换流程

1. 生成新密钥
2. 在密钥库中更新
3. 更新应用使用新密钥
4. 验证功能
5. 撤销旧密钥

---

## 密钥扫描

### Pre-commit Hook

```bash
#!/bin/bash
# .git/hooks/pre-commit

# 用 TruffleHog 检测密钥
docker run --rm -v "$(pwd):/repo" \
  trufflesecurity/trufflehog:latest \
  filesystem --directory=/repo

if [ $? -ne 0 ]; then
  echo "❌ Secret detected! Commit blocked."
  exit 1
fi
```

### CI/CD 密钥扫描

```yaml
secret-scan:
  stage: security
  image: trufflesecurity/trufflehog:latest
  script:
    - trufflehog filesystem .
  allow_failure: false
```

---

## 最佳实践

1. **切勿将密钥提交到 Git**
2. **各环境使用不同密钥**
3. **定期轮换**（最长 90 天）
4. **实现最小权限**
5. **启用审计日志**
6. **使用密钥扫描**（GitGuardian、TruffleHog）
7. **日志中掩码密钥**
8. **静态加密**
9. **尽可能使用短效令牌**
10. **记录密钥需求文档**

---

## 相关技能

- `vulnerability-scanner` — 检测代码中暴露的密钥
- `api-security` — 保护 API 凭证
