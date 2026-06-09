module.exports = {
  skillId: 'totalclaw:totalclaw~simskii-umea-data',
  descriptionZh: '查询瑞典于默奥市开放数据，涵盖设施、人口、环境与基础设施。',
  bodyZh: `# Umeå Data - 于默奥市开放数据

查询于默奥市（Umeå kommun）关于地点、设施、人口、环境等的开放数据。

## API 基础 URL
\`https://opendata.umea.se/api/v2/\`

## 可用数据类别

### 🏞️ 休闲与设施

#### **Lekplatser（游乐场）**
- 数据集 ID：\`gop_lekparker\`
- 包含 Gator och Parker 管理的游乐场位置
- 字段：namn、omrade、坐标（geo_point_2d）、联系信息
- 示例：「Mariehem 附近最近的游乐场在哪？」

#### **Badplatser（游泳场所）**
- 数据集 ID：\`badplatser\`
- 于默奥公共游泳地点
- 字段：namn、omrade、typ、坐标、handik_anp（无障碍）
- 示例：「于默奥有哪些游泳场所？」

#### **Vandringsleder（徒步路线）**
- 数据集 ID：\`vandringsleder\`
- 含路线与距离的徒步道
- 字段：namn、delstracka、kommun、klass、langd（米）、geo_shape（路线几何）
- 示例：「在于默奥可以在哪徒步？」

#### **Rastplatser（休息区）**
- 数据集 ID：\`rastplatser\`
- 休息站与野餐区
- 字段：name、位置坐标
- 示例：「休息区在哪？」

#### **Träd（树木）**
- 数据集 ID：\`trad-som-forvaltas-av-gator-och-parker\`
- Gator och Parker 管理的树木
- 字段：树种、位置、管理数据
- 示例：「该区域有哪些树？」

### ⚡ 基础设施

#### **Laddplatser（电动汽车充电站）**
- 数据集 ID：\`laddplatser\`
- 电动汽车充电站
- 字段：name、street、house_number、zipcode、city、owned_by、operator、number_charging_points、available_charging_points、position（lon/lat）
- 示例：「市中心附近有充电站吗？」

#### **WiFi 热点**
- 数据集 ID：\`wifi-hotspots\`
- 公共 WiFi 接入点
- 字段：popularnamn（名称）、koordinat（坐标）
- 示例：「于默奥哪里有免费 wifi？」

### 🏗️ 建筑与规划

#### **Bygglov Beslut（建筑许可决定）**
- 数据集 ID：\`bygglov-beslut\`
- 已批准的建筑许可
- 字段：arendebeskrivning、arendetyp、beslut、beslutsdatum、registreringsdatum、beslutstyp
- 示例：「最近批准了哪些建筑许可？」

#### **Bygglov Inkomna Ärenden（建筑许可申请）**
- 数据集 ID：\`bygglov-inkomna-arenden\`
- 收到的建筑许可申请
- 字段：申请详情、提交日期、状态
- 示例：「收到了多少建筑许可申请？」

### 📊 人口与统计

#### **Befolkningsförändringar（人口变化）**
- 数据集 ID：\`befolkningsfoeraendringar-helar\`
- 人口变化统计
- 字段：year、births、deaths、migration、total change
- 示例：「于默奥人口如何变化？」

#### **Bostadsbestånd（住房存量）**
- 数据集 ID：\`bostadsbestand-hustyp\`
- 按类型分的住房库存
- 字段：house type、count、area
- 示例：「住房存量情况如何？」

### 🌍 环境

#### **Växthusgasutsläpp（温室气体排放）**
- 数据集 ID：\`vaxthusgasutslapp_umea\`
- 于默奥温室气体排放数据
- 字段：year、sector、emissions（吨 CO2 当量）
- 示例：「于默奥的温室气体排放是多少？」

#### **Brottsstatistik（犯罪统计）**
- 数据集 ID：\`exempel-brottsstatistik-anmaelda-brott-fran-bra-s-oeppna-data\`
- BRÅ 开放数据的报案犯罪
- 字段：crime type、count、year
- 示例：「犯罪统计情况如何？」

## 用法

### 查询数据集
\`\`\`bash
./scripts/query.sh <dataset_id> [limit]
\`\`\`

示例：
\`\`\`bash
./scripts/query.sh badplatser 10
./scripts/query.sh laddplatser 20
\`\`\`

### 查找最近地点
\`\`\`bash
./scripts/nearby.sh <dataset_id> <lat> <lon> [limit]
\`\`\`

示例：
\`\`\`bash
# 查找 Mariehem 附近最近的游乐场（近似坐标）
./scripts/nearby.sh gop_lekparker 63.8200 20.3000 5

# 查找市中心附近最近的充电站
./scripts/nearby.sh laddplatser 63.8258 20.2630 5
\`\`\`

## API 端点

### 列出所有数据集
\`\`\`bash
curl "https://opendata.umea.se/api/v2/catalog/datasets"
\`\`\`

### 从数据集获取记录
\`\`\`bash
curl "https://opendata.umea.se/api/v2/catalog/datasets/{dataset_id}/records?limit=20"
\`\`\`

### 搜索数据集
\`\`\`bash
curl "https://opendata.umea.se/api/v2/catalog/datasets?where=search(default,\\"query\\")"
\`\`\`

## 数据格式

所有记录遵循以下结构：
\`\`\`json
{
  "total_count": 123,
  "records": [
    {
      "record": {
        "id": "unique-id",
        "timestamp": "2024-01-01T12:00:00Z",
        "fields": {
          "namn": "Location Name",
          "geo_point_2d": {
            "lat": 63.825,
            "lon": 20.263
          },
          ...
        }
      }
    }
  ]
}
\`\`\`

## 自然语言查询示例

AI 可回答如下问题：

**休闲：**
- 「Mariehem 附近最近的游乐场在哪？」
- 「于默奥有哪些游泳场所？」
- 「可以在哪徒步？」
- 「E4 附近有休息区吗？」

**基础设施：**
- 「市中心附近有充电站吗？」
- 「哪里有免费 wifi？」
- 「一共有多少充电桩？」

**规划：**
- 「最近批准了哪些建筑许可？」
- 「于默奥现在在建什么？」

**人口与环境：**
- 「人口如何变化？」
- 「于默奥的温室气体排放是多少？」
- 「于默奥有多少住房？」
- 「犯罪统计情况如何？」

## 说明

- 无需 API 密钥
- 所有数据公开开放
- 坐标使用 WGS84（lat/lon）
- 部分数据集含 geo_shape（路线/区域）
- 由于默奥市定期更新`,
};
