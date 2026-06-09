module.exports = {
  skillId: 'totalclaw:totalclaw~sichengchen-ohio-state-api',
  descriptionZh:
    '俄亥俄州立大学 (OSU) Content API 数据获取技能，支持直接 HTTP 抓取与 MCP 服务器，涵盖餐饮、公交、建筑、活动、课程、停车等校园数据。',
  bodyZh: `## 使用方式

### 选项 A：直接 HTTP 获取（最快）

使用捆绑的 fetch 辅助工具从 OSU Content API 拉取 JSON。

- 通过完整 URL 获取：
  - \`node ohio-state-api/scripts/osu-fetch.mjs https://content.osu.edu/v2/api/v1/dining/locations\`
- 通过服务 + 路径获取：
  - \`node ohio-state-api/scripts/osu-fetch.mjs --service dining --path /locations\`

注意：\`--path\` 可以带或不带前导 \`/\`（两者都有效）。

如果响应很大，添加 \`--extract <dot.path>\`（例如 \`--extract data\`）以仅打印某个子树。

### 选项 A2：curl（无需 Node）

如果你只想要原始 JSON 并且有可用的 \`curl\`，请参考 \`ohio-state-api/references/OSU_API.md\`：

- 完整 URL：
  - \`curl -sS -H 'accept: application/json' 'https://content.osu.edu/v2/api/v1/dining/locations'\`
- 带查询参数：
  - \`curl -sS -H 'accept: application/json' 'https://content.osu.edu/v2/classes/search?q=cse&p=1'\`

可选：管道到 \`jq\` 以提高可读性：
- \`curl -sS -H 'accept: application/json' 'https://content.osu.edu/v2/api/v1/dining/locations' | jq .\`

### 选项 B：MCP 服务器（最适合兼容 MCP 的客户端）

此技能在 \`ohio-state-api/mcp-server/\` 下捆绑了原始的 MCP 服务器。

构建它：
- \`cd ohio-state-api/mcp-server && npm install && npm run build\`

然后配置你的 MCP 客户端以运行：
- command: \`node\`
- args: \`["/ABSOLUTE/PATH/TO/ohio-state-api/mcp-server/build/index.js"]\`

运行后，使用如下工具：
- \`get_bus_routes\`、\`get_bus_vehicles\`
- \`get_buildings\`、\`search_buildings\`、\`get_building_details\`
- \`get_dining_locations\`、\`get_dining_menu\`
- \`get_campus_events\`、\`get_events_by_date_range\`
- \`search_classes\`
- \`get_parking_availability\`

（完整列表请参见 \`ohio-state-api/mcp-server/README.md\` 以及 \`ohio-state-api/mcp-server/src/\` 中的工具定义。）

## 「获取 OSU 数据」请求的推荐工作流程

1. 确定服务领域（餐饮、公交、建筑、活动等）。
2. 优先使用列表/搜索端点，然后沿着 ID 进入详情端点。
3. 对于基于时间的数据，始终同时包含：
   - 查询窗口（绝对日期/时间），以及
   - 检索时间戳。
4. 在向用户返回数据时，总结关键字段，并在可能时将原始 JSON 作为构件附上。

## 常用基础 URL（公共）

这些被捆绑的 MCP 服务器使用，并可与 \`osu-fetch.mjs\` 配合工作：

- Athletics: \`https://content.osu.edu/v3/athletics\`
- Bus: \`https://content.osu.edu/v2/bus\`
- Buildings: \`https://content.osu.edu/v2/api\`
- Calendar: \`https://content.osu.edu/v2/calendar\`
- Classes: \`https://content.osu.edu/v2/classes\`
- Dining: \`https://content.osu.edu/v2/api/v1/dining\`
- Directory: \`https://content.osu.edu\`
- Events: \`https://content.osu.edu/v2\`
- Food trucks: \`https://content.osu.edu/v2/foodtruck\`
- Library: \`https://content.osu.edu/v2/library\`
- Merchants: \`https://content.osu.edu/v2\`
- Parking: \`https://content.osu.edu/v2/parking/garages\`
- Rec sports: \`https://content.osu.edu/v3\`
- Student orgs: \`https://content.osu.edu/v2/student-org\`

## 示例（复制/粘贴）

- 餐饮地点：
  - \`curl -sS -H 'accept: application/json' 'https://content.osu.edu/v2/api/v1/dining/locations'\`
- 停车可用性：
  - \`curl -sS -H 'accept: application/json' 'https://content.osu.edu/v2/parking/garages/availability'\`
- 建筑「搜索」（用 \`jq\` 在客户端过滤）：
  - \`curl -sS -H 'accept: application/json' 'https://content.osu.edu/v2/api/buildings' | jq -r '.data.buildings[] | select((.name // "") | test("union";"i")) | "\\(.buildingNumber)\\t\\(.name)"'\`

## 额外参考

- API 参考：\`ohio-state-api/references/OSU_API.md\``,
};
