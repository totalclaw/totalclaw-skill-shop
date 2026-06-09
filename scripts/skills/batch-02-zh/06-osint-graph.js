module.exports = {
  skillId: 'totalclaw:totalclaw~orosha-ai-osint-graph-analyzer',
  descriptionZh:
    '从多源 OSINT 数据构建 Neo4j 知识图谱，支持实体关联、社区发现、中心性分析、路径追踪与模式识别，用于调查、威胁情报与社交网络分析。',
  bodyZh: `# OSINT Graph Analyzer 🕵️

从 OSINT 数据构建知识图谱，并使用 Neo4j 图算法发现隐藏模式。

## 功能

摄取多源 OSINT 数据，创建 Neo4j 知识图谱，用于：
- **实体关联** — 跨平台连接同一人物
- **社区发现** — 找出相关实体集群
- **中心性分析** — 识别网络中的关键影响者
- **路径分析** — 追踪实体之间的连接
- **模式识别** — 检测异常与隐藏关系

## 使用场景

- **调查工作流** — 映射复杂案件中的关系
- **威胁情报** — 识别攻击网络中的中心节点
- **社交网络分析** — 发现社区与影响模式
- **反 OSINT** — 了解自身的暴露面

## 环境要求

- Neo4j 5.x（本地或远程）
- Python 3.9+
- neo4j-driver 包

## 用法

\`\`\`bash
# 启动 Neo4j 实例（本地）
docker run -d \\
  --name neo4j \\
  -p 7474:7474 -p 7687:7687 \\
  -e NEO4J_AUTH=neo4j/password \\
  neo4j:5.23

# 摄取数据
python3 scripts/osint-graph.py --ingest data/sources.csv

# 运行社区发现
python3 scripts/osint-graph.py --community-detection

# 查找最具中心性的实体
python3 scripts/osint-graph.py --centrality --top 10

# 追踪两个实体之间的路径
python3 scripts/osint-graph.py --path "Entity A" "Entity B"

# 导出图谱用于可视化
python3 scripts/osint-graph.py --export graph.json
\`\`\`

## 数据格式

支持的格式：
- CSV（节点 + 边文件）
- JSON（Cypher 查询）
- 直接 API 摄取（Telegram、Twitter 等）

CSV 示例：
\`\`\`csv
nodes.csv:
id,name,type,properties
1,@target_account,person,"{country:US,verified:true}"
2,@associated_handle,person,"{country:RU}"

edges.csv:
source,target,relationship,timestamp
1,2,MENTIONED,2026-01-31
\`\`\`

## 图算法

| 算法 | 发现内容 | 使用场景 |
|------------|----------------|-----------|
| **Louvain** | 社区集群 | 发现协同工作的群体 |
| **PageRank** | 影响力中心性 | 识别关键影响者 |
| **Betweenness** | 桥接节点 | 找出社区间的连接点 |
| **Shortest Path** | 连接链 | 追踪间接关系 |
| **Weakly Connected** | 不连通子图 | 发现孤立集群 |

## 架构

\`\`\`
┌─────────────────┐
│  Ingestion      │  ← CSV/JSON/API sources
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Neo4j Graph    │  ← Nodes + Relationships
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Algorithms     │  ← GraphX / Neo4j Graph Algorithms
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Visualization  │  ← JSON export + D3.js / Cytoscape
└─────────────────┘
\`\`\`

## 灵感来源

- **CRIS** — 基于 Neo4j 的多智能体刑事情报系统
- **Context Graphs** — 语义搜索 + 结构分析
- **osint-analyser** — LLM 驱动的 OSINT 自动化

## 纯本地承诺

- 数据留在本地（Neo4j 实例）
- 分析无需外部 API 调用
- 支持可选离线模式

## 版本历史

- **v0.1** — MVP：CSV 摄取、基础算法、JSON 导出
- 路线图：API 集成、ML 异常检测、实时更新`,
};
