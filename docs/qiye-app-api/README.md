# 泰途AI Skill 市场 · 对接文档（供 totalclaw-qiye-app 拉取技能与员工）

本文档说明 **qiye-app（桌面端/CLI）** 如何从 Skill 市场拉取「技能(skill)」与「AI 员工(role)」，提供 **接口(REST API) / 命令(cURL) / CLI** 三种模式。

- 市场前台：`http://localhost:3090`（线上 `https://<你的域名>`）
- API 基址：`{BASE}/api`，本文以 `BASE=http://localhost:3090` 为例
- 数据规模（实时，仅供参考）：技能 **117,277** · AI 员工 **27,397** · 员工分类 **127**
- 数据模型：同一集合用 `kind` 区分——`kind` 缺省/非 `role` = 技能；`kind=role` = AI 员工
- 鉴权：公开浏览/免费内容无需登录；收费/闭源内容需 `Authorization: Bearer <token>` 且已购买

> ⚠️ 收费 skill 为防复刻**不提供裸文件下载**，仅在已购+登录态下通过 `/api/entitlements/content/:id` 只读获取（正文带买家专属水印）。免费 skill 可直接下载。详见「四、收费内容」。

---

## 一、接口模式（REST API）

所有列表/详情接口返回 JSON。`skillId` 在路径中需 **URL 编码**（含 `:`、`~` 等）。

### 1. 列表 / 搜索

```
GET {BASE}/api/skills
```

| 参数 | 说明 | 示例 |
|---|---|---|
| `kind` | `role` 取 AI 员工；缺省取技能 | `kind=role` |
| `q` | 关键词（名称/描述） | `q=渗透测试` |
| `category` | 单分类 | `category=工程研发` |
| `categories` | 多分类（逗号，命中任一） | `categories=后端与架构,前端与移动端` |
| `source` | 来源 | `source=totalclaw` |
| `tag` | 标签（单个） | `tag=岗位技能` |
| `listingType` | `free`/`paid` | `listingType=free` |
| `sort` | `latest`/`downloads`/`sales`/`rating` | `sort=downloads` |
| `page` / `pageSize` | 分页（pageSize ≤ 100） | `page=1&pageSize=50` |

返回：

```json
{ "items": [ { "skillId": "...", "name": "...", "displayName": "...",
  "descriptionZh": "...", "category": "...", "source": "...", "kind": "skill",
  "listingType": "free", "pricing": {"price":0}, "stats": {"downloads":0} } ],
  "total": 117277, "page": 1, "pageSize": 24, "totalPages": 4887 }
```

### 2. 分类 / 来源聚合

```
GET {BASE}/api/skills/categories            # 技能分类（含计数）
GET {BASE}/api/skills/categories?kind=role  # AI 员工分类（含计数）
GET {BASE}/api/skills/categories?source=github   # 某来源下的分类
GET {BASE}/api/skills/sources-summary       # 各来源 skill 数
```

### 3. 详情

```
GET {BASE}/api/skills/{urlencoded-skillId}
```
返回单个技能/员工的元数据。**闭源/收费**的 `contentMd` 会被裁剪（需走收费内容接口）。

### 4. 拉取正文 / 下载

| 场景 | 接口 | 鉴权 |
|---|---|---|
| 免费技能/员工 下载 SKILL.md | `GET {BASE}/api/skills/{id}/file` | 无需 |
| 收费/闭源 正文（只读，带水印） | `GET {BASE}/api/entitlements/content/{id}` | Bearer + 已购 |
| 下载计数 +1（可选埋点） | `POST {BASE}/api/skills/{id}/download` | 无需 |

---

## 二、命令模式（cURL）

### 拉员工/技能列表（取前 50 个研发员工）

```bash
curl -fsS "http://localhost:3090/api/skills?kind=role&category=互联网研发&pageSize=50"
```

### 按关键词搜技能

```bash
curl -fsS "http://localhost:3090/api/skills?q=Kubernetes&listingType=free&sort=downloads"
```

### 下载一个免费 SKILL.md（id 需 URL 编码）

```bash
SID='totalclaw:roleskill~academic-anthropologist-s18xnt02'
ENC=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=''))" "$SID")
curl -fsSL "http://localhost:3090/api/skills/$ENC/file" -o skill.md
```

### 拉收费/闭源正文（需登录拿 token + 已购）

```bash
# 1) 登录拿 token
TOKEN=$(curl -fsS -X POST http://localhost:3090/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"identifier":"<用户名/手机号/邮箱>","password":"<密码>"}' \
  | python3 -c "import json,sys;print(json.load(sys.stdin)['accessToken'])")

# 2) 拉正文（已购才放行；返回 JSON，contentMd 含买家水印）
curl -fsS "http://localhost:3090/api/entitlements/content/$ENC" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 三、CLI 模式（TotalClaw CLI）

> CLI 把上面的接口封装成命令，自动处理鉴权 token、URL 编码与落地。qiye-app 内置/调用该 CLI 完成安装。

```bash
# 安装一个技能或员工（按 skillId）
totalclaw install totalclaw:roleskill~academic-anthropologist-s18xnt02

# 登录（收费内容需要）
totalclaw login

# 搜索
totalclaw search "渗透测试" --kind role
```

收费 skill 通过 CLI/官方运行时**在运行时内使用**，不导出明文文件（防转售）。

---

## 四、收费内容与防复刻约定

- 免费内容：`/api/skills/{id}/file` 直接下载，无需登录。
- 收费/闭源内容：**不提供裸文件下载**（`/api/entitlements/download` 对收费返回 403）。只能：
  1. 已购+登录 → `/api/entitlements/content/{id}` 只读获取（正文注入**买家专属隐形水印**，泄露可溯源）；
  2. 或经官方 TotalClaw 运行时在运行时内调用（不落明文）。
- qiye-app 对接收费内容时，请在已登录态携带用户 token；展示/缓存到本地时**保留水印**，不要二次导出明文供外部分发。

---

## 五、qiye-app 接入建议（拉取流程）

```
列表/搜索  GET /api/skills?kind=role|skill&...     → 选中 skillId
   │
   ├─ 免费：GET /api/skills/{id}/file              → 落地 SKILL.md
   └─ 收费：登录 → 校验已购 GET /api/entitlements/check/{id}
            → GET /api/entitlements/content/{id}   → 运行时内使用（带水印）
```

字段约定、错误码（401 未登录 / 403 未购或收费不可下载 / 404 不存在）与分页同上。
