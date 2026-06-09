# French Services — 法国日常服务

访问法国日常服务：SNCF 火车、La Poste 包裹追踪、天气预报、巴黎大区交通（IDF）。

## 可用脚本

均在 `skills/french-services/scripts/`。仅使用 Python 标准库（无第三方依赖）。

### 🚄 SNCF — 火车（`sncf.py`）

通过 Navitia API 查询路线与即将发车。

```bash
# 查询行程
python3 scripts/sncf.py search Paris Lyon
python3 scripts/sncf.py search "Gare de Lyon" Marseille --date 2025-01-15 --time 08:00

# 某站即将发车
python3 scripts/sncf.py departures Paris

# 线路扰动
python3 scripts/sncf.py disruptions
```

**需要 API 密钥：** `SNCF_API_KEY`（Navitia 令牌 — 在 https://navitia.io 免费申请）

### 📦 La Poste — 包裹追踪（`laposte.py`）

```bash
# 追踪单个包裹
python3 scripts/laposte.py track 6A12345678901

# 追踪多个包裹
python3 scripts/laposte.py track 6A12345678901 8R98765432109
```

**需要 API 密钥：** `LAPOSTE_API_KEY`（在 https://developer.laposte.fr 免费申请）

### 🌤️ 天气预报（`meteo.py`）

通过 Open-Meteo（Météo France 模型）获取当前天气与预报。**无需 API 密钥。**

```bash
# 当前天气 + 3 日预报
python3 scripts/meteo.py Paris
python3 scripts/meteo.py Lyon --days 7
python3 scripts/meteo.py --lat 43.6 --lon 1.44    # 图卢兹（坐标）

# JSON 格式
python3 scripts/meteo.py Paris --json
```

### 🚇 RATP/IDFM — 巴黎大区交通（`ratp.py`）

通过 PRIM API 获取交通状况与到站时间。

```bash
# 全局交通状况
python3 scripts/ratp.py traffic

# 指定线路
python3 scripts/ratp.py traffic --line "Métro 13"
python3 scripts/ratp.py traffic --line "RER A"

# 某站下一班
python3 scripts/ratp.py next "Châtelet"
```

**需要 API 密钥：** `IDFM_API_KEY`（在 https://prim.iledefrance-mobilites.fr 免费申请）

## 通用选项

| 选项   | 说明                          |
|----------|--------------------------------------|
| `--json` | JSON 输出而非可读文本 |
| `--help` | 脚本帮助                       |

## 环境变量

| 变量         | 服务    | 获取方式                                    |
|------------------|------------|----------------------------------------------|
| `SNCF_API_KEY`   | SNCF       | https://navitia.io（免费，5000 次/月）  |
| `LAPOSTE_API_KEY`| La Poste   | https://developer.laposte.fr                 |
| `IDFM_API_KEY`   | RATP/IDFM  | https://prim.iledefrance-mobilites.fr        |

详见 `references/api-setup.md` 配置指南。

## 何时使用哪个脚本

| 用户问题                          | 脚本      |
|----------------------------------------------------|-------------|
| 「去里昂的下一班火车」                         | `sncf.py`   |
| 「明天早上巴黎-马赛时刻表」            | `sncf.py`   |
| 「我的包裹 6A123… 到哪了」                     | `laposte.py`|
| 「明天天气怎样？」/ 「尼斯天气」           | `meteo.py`  |
| 「13 号线通吗？」/ 「RER A 状况」           | `ratp.py`   |
| 「Châtelet 下一班地铁」                        | `ratp.py`   |

## 说明

- 天气预报无需任何配置（Open-Meteo 免费且无密钥）
- 其他服务请按 `references/api-setup.md` 配置 API 密钥
- 缺少密钥时脚本会给出明确提示
- 默认法语输出，`--json` 便于机器集成
