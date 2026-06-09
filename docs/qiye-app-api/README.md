# 泰途AI Skill 市场 · qiye-app 对接文档

本文档说明 **qiye-app（桌面端/CLI）** 如何从 Skill 市场拉取「技能(skill)」与「AI 员工(role)」。

- 市场前台：`http://localhost:3090`（线上 `https://<你的域名>`）
- API 基址：`{BASE}/api`，本文以 `BASE=http://localhost:3090` 为例
- 数据规模（实时，仅供参考）：技能 **252,975** · AI 员工 **27,381**
- 鉴权：公开浏览/免费内容无需登录；收费/闭源内容需 `Authorization: Bearer <token>` 且已购买

---

## 一、qiye-app 专用接口（推荐）

> **新增专用路由 `/api/qiye/*`**，字段更清晰，默认 20 条分页，含 `isFree` 布尔标识和 `roleId`。

### 1. 技能列表

```
GET {BASE}/api/qiye/skills
```

**查询参数**

| 参数 | 类型 | 说明 | 示例 |
|---|---|---|---|
| `q` | string | 技能名称模糊搜索（name / displayName / descriptionZh） | `q=渗透测试` |
| `source` | string | 来源过滤（见下方来源列表） | `source=github` |
| `listingType` | `free` \| `paid` | 收费类型过滤 | `listingType=free` |
| `page` | number | 页码，默认 1 | `page=2` |
| `pageSize` | number | 每页条数，默认 **20**，最大 100 | `pageSize=20` |

**支持的来源（source）**

| 值 | 说明 |
|---|---|
| `github` | GitHub 社区 |
| `tencent` | 腾讯开放平台 |
| `openclaw` | OpenClaw 社区 |
| `hermes` | Hermes 平台 |
| `totalclaw` | 泰途 AI（含官方+社区） |
| `totalclaw-community` | 泰途 AI 社区免费技能（虚拟来源） |
| `clawskills` | ClawSkills 平台 |
| `skilldb` | SkillDB 平台 |

**响应示例**

```json
{
  "items": [
    {
      "skillId": "github:owner/example-skill",
      "name": "example-skill",
      "displayName": "示例技能",
      "source": "github",
      "kind": "skill",
      "category": "工程研发",
      "description": "技能的中文描述",
      "isFree": true,
      "listingType": "free",
      "pricing": { "model": "free", "price": 0, "currency": "CNY" },
      "roleId": null,
      "stats": { "downloads": 100 }
    },
    {
      "skillId": "totalclaw:roleskill~some-paid-skill",
      "name": "高级分析技能",
      "displayName": "高级分析技能",
      "source": "totalclaw",
      "kind": "skill",
      "category": "数据与算法",
      "description": "...",
      "isFree": false,
      "listingType": "paid",
      "pricing": { "model": "paid", "price": 9, "currency": "CNY" },
      "roleId": null,
      "stats": { "downloads": 0 }
    }
  ],
  "total": 252975,
  "page": 1,
  "pageSize": 20,
  "totalPages": 12649
}
```

**响应字段说明**

| 字段 | 说明 |
|---|---|
| `skillId` | 技能全局唯一 ID（格式：`source:owner/slug`） |
| `name` | 技能名称（英文/原始） |
| `displayName` | 展示名称（中文，若有） |
| `source` | 来源标识 |
| `kind` | 固定为 `"skill"` |
| `category` | 分类 |
| `description` | 描述（优先中文） |
| `isFree` | **布尔值**：`true` = 免费，`false` = 收费 |
| `listingType` | `"free"` \| `"paid"` |
| `pricing.price` | 价格（CNY，免费时为 0） |
| `roleId` | 绑定角色的 skillId；未绑定时为 `null` |
| `stats.downloads` | 下载次数 |

---

### 2. 角色（AI 员工）列表

```
GET {BASE}/api/qiye/roles
```

**查询参数**

| 参数 | 类型 | 说明 | 示例 |
|---|---|---|---|
| `q` | string | 角色名称模糊搜索（name / displayName / descriptionZh） | `q=产品经理` |
| `page` | number | 页码，默认 1 | `page=1` |
| `pageSize` | number | 每页条数，默认 **20**，最大 100 | `pageSize=20` |

**响应示例**

```json
{
  "items": [
    {
      "roleId": "role:totalclaw/product-manager",
      "skillId": "role:totalclaw/product-manager",
      "name": "产品经理",
      "displayName": "产品经理",
      "source": "totalclaw",
      "kind": "role",
      "category": "互联网研发",
      "description": "负责产品规划与迭代管理",
      "emoji": "📊",
      "color": "#4F46E5",
      "isFree": true,
      "listingType": "free",
      "pricing": { "model": "free", "price": 0, "currency": "CNY" },
      "stats": { "downloads": 50 }
    }
  ],
  "total": 27381,
  "page": 1,
  "pageSize": 20,
  "totalPages": 1370
}
```

**响应字段说明（角色专有字段）**

| 字段 | 说明 |
|---|---|
| `roleId` | 角色唯一 ID（= 角色的 `skillId`，`role:` 前缀） |
| `skillId` | 同 `roleId` |
| `kind` | 固定为 `"role"` |
| `emoji` | 角色图标 emoji（可能为 `null`） |
| `color` | 角色主题色（可能为 `null`） |
| `isFree` | `true` = 免费角色，`false` = 收费角色 |

---

### 3. cURL 示例

```bash
BASE="http://localhost:3090"

# 获取免费技能（来自 GitHub，第 1 页 20 条）
curl -fsS "$BASE/api/qiye/skills?source=github&listingType=free"

# 搜索「渗透测试」相关技能
curl -fsS "$BASE/api/qiye/skills?q=%E6%B8%97%E9%80%8F%E6%B5%8B%E8%AF%95"

# 获取角色列表第 2 页
curl -fsS "$BASE/api/qiye/roles?page=2"

# 搜索「产品经理」角色
curl -fsS "$BASE/api/qiye/roles?q=%E4%BA%A7%E5%93%81%E7%BB%8F%E7%90%86"
```

---

## 二、通用接口（原有，向后兼容）

原有的 `/api/skills` 接口仍然可用，支持更多过滤参数（分类、标签、排序等）。适合前台展示场景。

```
GET {BASE}/api/skills              # 技能列表（kind 默认 skill）
GET {BASE}/api/skills?kind=role    # 角色列表
```

详见原版文档中的完整参数说明。

---

## 三、下载 / 内容获取

| 场景 | 接口 | 鉴权 |
|---|---|---|
| 免费技能/角色 下载 SKILL.md | `GET {BASE}/api/skills/{urlencoded-skillId}/file` | 无需 |
| 收费/闭源 正文（只读，带水印） | `GET {BASE}/api/entitlements/content/{id}` | Bearer + 已购 |

> 收费 skill 的 `skillId` 在路径中需 **URL 编码**（`encodeURIComponent`），因为含 `:` `~` `/` 等字符。

```bash
# 下载免费技能（Python 编码 skillId）
SID='totalclaw:roleskill~some-free-skill'
ENC=$(python3 -c "import urllib.parse,sys;print(urllib.parse.quote(sys.argv[1],safe=''))" "$SID")
curl -fsSL "$BASE/api/skills/$ENC/file" -o skill.md
```

---

## 四、收费内容约定

- **免费**（`isFree: true`）：直接下载 SKILL.md，无需登录。
- **收费**（`isFree: false`）：不提供裸文件下载，需要：
  1. 用户登录获取 token（`POST /api/auth/login`）
  2. 已购买该 skill（下单 `POST /api/orders`）
  3. 通过 `/api/entitlements/content/{id}` 只读获取（正文注入**买家专属隐形水印**，泄露可溯源）

---

## 五、roleId 与 skill-role 绑定

- 每个技能（`kind=skill`）都有一个 `roleId` 字段。
- 当前大多数技能的 `roleId` 为 `null`（通用技能，未绑定角色）。
- 若 `roleId` 不为 `null`，表示该技能专属于某角色，`roleId` 值即为目标角色的 `skillId`（`role:` 前缀）。
- 对于角色列表（`/api/qiye/roles`），每条记录的 `roleId` = 该角色自身的 `skillId`。

---

## 六、错误码

| 状态码 | 含义 |
|---|---|
| 400 | 参数校验失败 |
| 401 | 未登录（需要 Bearer token） |
| 403 | 无权限或收费内容未购买 |
| 404 | 资源不存在 |
