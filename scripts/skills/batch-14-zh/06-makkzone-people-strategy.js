module.exports = {
  skillId: 'totalclaw:totalclaw~makkzone-people-strategy',
  descriptionZh:
    '基于 SQLite 图存储的人员关系管理智能体技能，支持创建、查询和管理人员及其关系网络，适合个人 CRM 与组织图。',
  bodyZh: `# People-Strategy 智能体技能

## 概述

基于 SQLite 数据库提供持久化图存储的人员关系管理智能体技能。本技能使 AI 智能体能够创建、管理和查询人员及其关系网络，非常适合构建个人 CRM、组织架构、导师网络和协作映射。

## 能力

### 人员管理
- **创建人员**：添加带完整信息的新人员（姓名、角色、关系、组织、性格、备注）
- **读取人员**：检索单个人员或在数据库中搜索/过滤
- **更新人员**：修改任何人员的信息
- **删除人员**：从数据库中移除人员（级联删除关系）
- **搜索**：在姓名、角色和组织中进行全文搜索
- **过滤**：按组织或关系类型过滤

### 关系管理
- **创建边**：在人员之间建立有向关系
- **查询关系**：获取某人员的入站、出站或所有关系
- **更新边**：修改关系类型和描述
- **删除边**：移除特定关系
- **双向支持**：跟踪关系的两个方向

### 图操作
- **完整图导出**：将整个网络导出为 JSON（节点 + 边）
- **人员网络**：获取个人的完整网络视图
- **关系类型**：支持自定义关系类型（reports_to、mentors、works_with 等）

## 数据库架构

### 表

**people**
- \`id\`：INTEGER PRIMARY KEY
- \`name\`：TEXT NOT NULL
- \`role\`：TEXT
- \`relation_to_me\`：TEXT
- \`organization\`：TEXT
- \`character\`：TEXT
- \`notes\`：TEXT
- \`created_at\`：TIMESTAMP
- \`updated_at\`：TIMESTAMP

**edges**
- \`id\`：INTEGER PRIMARY KEY
- \`from_person_id\`：INTEGER（FK 到 people.id）
- \`to_person_id\`：INTEGER（FK 到 people.id）
- \`relationship_type\`：TEXT NOT NULL
- \`description\`：TEXT
- \`created_at\`：TIMESTAMP
- \`updated_at\`：TIMESTAMP
- (from_person_id, to_person_id, relationship_type) 上的 UNIQUE 约束

### 索引
- \`idx_people_name\`：people.name 上的索引
- \`idx_edges_from\`：edges.from_person_id 上的索引
- \`idx_edges_to\`：edges.to_person_id 上的索引

## 使用示例

### 命令行界面

\`\`\`bash
# 人员操作
python people_skill.py add-person "Jane Doe" --role "CTO" --org "StartupXYZ" --relation "Mentor"
python people_skill.py get-person 1
python people_skill.py search "engineer"
python people_skill.py list-people --org "StartupXYZ"
python people_skill.py update-person 1 --notes "Coffee meeting scheduled"
python people_skill.py delete-person 1

# 关系操作
python people_skill.py add-relationship 1 2 "mentors" --description "Tech career guidance"
python people_skill.py get-relationships 1
python people_skill.py list-relationships
python people_skill.py update-relationship 1 --type "coaches"
python people_skill.py delete-relationship 1

# 图操作
python people_skill.py get-graph
python people_skill.py get-network 1
\`\`\`

### Python API

\`\`\`python
from database import PeopleDatabase
from people_skill import PeopleAgent

# 初始化
agent = PeopleAgent("people.db")

# 添加人员
result = agent.add_person(
    name="Alice Johnson",
    role="VP Engineering",
    relation_to_me="Former colleague",
    organization="TechCorp",
    character="Strategic thinker, empathetic leader",
    notes="Worked together 2020-2022"
)
person_id = result["person_id"]

# 添加关系
agent.add_relationship(
    from_person_id=1,
    to_person_id=2,
    relationship_type="manages",
    description="Direct manager relationship"
)

# 查询网络
network = agent.get_person_network(person_id)
print(f"Found {network['connections_count']} connections")

# 导出图
graph = agent.get_graph()
print(f"Graph: {graph['nodes_count']} nodes, {graph['edges_count']} edges")
\`\`\`

## 常见关系类型

- \`reports_to\`：层级汇报（下属 → 经理）
- \`manages\`：层级管理（经理 → 下属）
- \`works_with\`：同级协作
- \`mentors\`：导师关系（导师 → 学员）
- \`mentored_by\`：反向导师关系（学员 → 导师）
- \`friends_with\`：个人友谊
- \`knows\`：熟人
- \`collaborates_with\`：项目协作
- \`introduced_by\`：引荐来源

## 用例

### 1. 个人 CRM
跟踪职业联系人、角色、组织以及相识方式。添加关于对话、会议或跟进的备注。

\`\`\`bash
python people_skill.py add-person "Sarah Chen" \\
  --role "Product Director" \\
  --org "InnovateCo" \\
  --relation "Met at conference" \\
  --notes "Interested in API collaboration, follow up Q2"
\`\`\`

### 2. 组织映射
构建和维护带汇报关系的组织架构。

\`\`\`bash
# 添加团队成员
python people_skill.py add-person "Mike Lead" --role "Team Lead" --org "Engineering"
python people_skill.py add-person "Dev One" --role "Engineer" --org "Engineering"
python people_skill.py add-person "Dev Two" --role "Engineer" --org "Engineering"

# 创建汇报结构
python people_skill.py add-relationship 2 1 "reports_to"
python people_skill.py add-relationship 3 1 "reports_to"
\`\`\`

### 3. 导师网络
跟踪导师关系和职业指导连接。

\`\`\`bash
python people_skill.py add-relationship 5 3 "mentors" \\
  --description "Career guidance in ML/AI"
\`\`\`

### 4. 协作跟踪
映射项目中谁与谁合作。

\`\`\`bash
python people_skill.py add-relationship 1 2 "works_with" \\
  --description "Project Phoenix collaboration"
\`\`\`

### 5. 网络分析
分析职业网络以识别关键连接。

\`\`\`bash
# 查看某人的完整网络
python people_skill.py get-network 1

# 导出用于可视化
python people_skill.py get-graph > network.json
\`\`\`

## 高级功能

### 双向关系查询
系统自动处理两个方向：
\`\`\`python
# 获取某人的所有关系
edges = db.get_all_edges_for_person(person_id)
# 返回：{"outgoing": [...], "incoming": [...]}
\`\`\`

### 级联删除
删除人员会自动移除所有相关关系。

### 重复预防
UNIQUE 约束防止相同两人之间相同类型的重复关系。

### 搜索灵活性
搜索跨多个字段：
\`\`\`bash
python people_skill.py search "engineer"
# 匹配：姓名、角色、组织
\`\`\`

## 集成示例

### 导出到可视化工具
\`\`\`bash
# 导出图用于 D3.js、Cytoscape、Gephi 等工具
python people_skill.py get-graph > graph.json
\`\`\`

### 从 CSV 导入
\`\`\`python
import csv
from people_skill import PeopleAgent

agent = PeopleAgent()
with open('contacts.csv', 'r') as f:
    reader = csv.DictReader(f)
    for row in reader:
        agent.add_person(
            name=row['name'],
            role=row['role'],
            organization=row['org'],
            relation_to_me=row['relation']
        )
\`\`\`

## 最佳实践

1. **一致命名**：对关系类型使用一致的命名约定
2. **丰富备注**：添加上下文备注以记住重要细节
3. **定期更新**：使用 update 命令保持信息最新
4. **性格跟踪**：使用 character 字段记住性格特征
5. **关系描述**：为关系添加上下文以提高清晰度
6. **先搜索**：添加前先搜索以避免重复

## API 参考

详见 [people_skill.py](people_skill.py) 获取完整 API 文档。

### 主要类
- \`PeopleDatabase\`：底层数据库操作
- \`PeopleAgent\`：带结果字典的高级智能体接口

### 返回格式
所有智能体方法返回包含以下内容的字典：
- \`success\`：表示成功/失败的布尔值
- \`message\`：人类可读的状态消息（出错时）
- 特定于操作的数据字段

## 错误处理

本技能包含全面的错误处理：
- 外键约束防止无效关系
- 唯一约束防止重复关系
- 级联删除维护引用完整性
- CLI 中的 try-catch 块提供用户友好的错误

## 性能

- 索引查询实现快速查找
- 高效的图遍历
- 适合数千人的网络
- SQLite 处理并发读取

## 未来增强

潜在扩展：
- 图可视化生成
- 人员之间的最短路径查找
- 影响力/中心性评分
- 重复人员检测
- 导出为各种格式（GraphML、DOT）
- 从 LinkedIn、联系人列表导入
- 基于时间的关系跟踪
- 关系强度/置信度评分

## 许可证

MIT`,
};
