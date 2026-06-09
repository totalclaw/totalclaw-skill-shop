module.exports = {
  skillId: 'totalclaw:totalclaw~clawd-maf-cad-agent',
  descriptionZh:
    '为 AI 智能体提供 CAD 可视化渲染服务。发送建模命令、接收渲染图像并迭代设计，适用于 3D 打印件与参数化机械设计。',
  bodyZh: `# CAD Agent

> 让你的 AI 智能体拥有 CAD 视觉。

## 描述

CAD Agent 是渲染服务器，让 AI 智能体看见正在构建的内容。发送建模命令 → 接收渲染图像 → 视觉迭代。

**适用于：** 设计可 3D 打印零件、参数化 CAD、机械设计、build123d 建模

## 架构

**关键：** 所有 CAD 逻辑在容器内运行。你（智能体）仅：
1. 通过 HTTP 发送命令
2. 查看返回的图像
3. 决定下一步

\`\`\`
你（智能体）                     CAD AGENT 容器
─────────────                   ───────────────────
发送 build123d 代码      →      执行建模
                         ←      返回 JSON 状态
请求渲染                 →      VTK 渲染模型
                         ←      返回 PNG 图像
*查看图像*
决定：迭代或完成
\`\`\`

**切勿** 在容器外做 STL 操作、网格处理或渲染。容器处理一切——你只指挥与观察。

## 设置

### 1. 克隆仓库

\`\`\`bash
git clone https://github.com/clawd-maf/cad-agent.git
cd cad-agent
\`\`\`

### 2. 构建 Docker 镜像

\`\`\`bash
docker build -t cad-agent:latest .
\`\`\`

或使用 docker-compose：

\`\`\`bash
docker-compose build
\`\`\`

### 3. 运行服务器

\`\`\`bash
# 推荐 docker-compose
docker-compose up -d

# 或直接使用 docker
docker run -d --name cad-agent -p 8123:8123 cad-agent:latest serve
\`\`\`

### 4. 验证安装

\`\`\`bash
curl http://localhost:8123/health
# 应返回：{"status": "healthy", ...}
\`\`\`

> **Docker-in-Docker 注意：** 在嵌套容器环境（如沙箱）中，主机网络可能不可用——\`curl localhost:8123\` 会失败，即使服务器绑定 \`0.0.0.0:8123\`。请改用 \`docker exec cad-agent python3 -c "..."\`。在正常 Docker 主机上，localhost 访问正常。

## 工作流

### 1. 创建模型

\`\`\`bash
curl -X POST http://localhost:8123/model/create \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "my_part",
    "code": "from build123d import *\\nresult = Box(60, 40, 30)"
  }'
\`\`\`

### 2. 渲染与查看

\`\`\`bash
# 多视图（前/右/顶/等轴）
curl -X POST http://localhost:8123/render/multiview \\
  -d '{"model_name": "my_part"}' -o views.png

# 或 3D 等轴测
curl -X POST http://localhost:8123/render/3d \\
  -d '{"model_name": "my_part", "view": "isometric"}' -o iso.png
\`\`\`

**查看图像。** 是否正确？若否，修改并重新渲染。

### 3. 迭代

\`\`\`bash
curl -X POST http://localhost:8123/model/modify \\
  -d '{
    "name": "my_part", 
    "code": "result = result - Cylinder(5, 50).locate(Pos(20, 10, 0))"
  }'

# 重新渲染检查
curl -X POST http://localhost:8123/render/3d \\
  -d '{"model_name": "my_part"}' -o updated.png
\`\`\`

### 4. 导出

\`\`\`bash
curl -X POST http://localhost:8123/export \\
  -d '{"model_name": "my_part", "format": "stl"}' -o part.stl
\`\`\`

## 端点

| 端点 | 功能 |
|----------|--------------|
| \`POST /model/create\` | 运行 build123d 代码，创建模型 |
| \`POST /model/modify\` | 修改现有模型 |
| \`GET /model/list\` | 列出会话中的模型 |
| \`GET /model/{name}/measure\` | 获取尺寸 |
| \`POST /render/3d\` | 3D 着色渲染（VTK） |
| \`POST /render/2d\` | 2D 工程图 |
| \`POST /render/multiview\` | 四视图合成 |
| \`POST /export\` | 导出 STL/STEP/3MF |
| \`POST /analyze/printability\` | 检查是否可打印 |

## build123d 速查

\`\`\`python
from build123d import *

# 基本体
Box(width, depth, height)
Cylinder(radius, height)
Sphere(radius)

# 布尔
a + b   # 并集
a - b   # 差集
a & b   # 交集

# 位置
part.locate(Pos(x, y, z))
part.rotate(Axis.Z, 45)

# 边
fillet(part.edges(), radius)
chamfer(part.edges(), length)
\`\`\`

## 重要

- **不要绕过容器。** 不用 matplotlib、外部 STL 库或网格 hack。
- **渲染是你的眼睛。** 每次修改后都应请求渲染。
- **视觉迭代。** 核心是你能看见正在构建的内容。

## 设计文件安全

项目有防止误提交 CAD 输出的保护：
- \`.gitignore\` 阻止 *.stl、*.step、*.3mf 等
- Pre-commit hook 拒绝设计文件
- 用户设计保持本地，不入版本库

## 链接

- [Repository](https://github.com/clawd-maf/cad-agent)
- [build123d docs](https://build123d.readthedocs.io/)
- [VTK](https://vtk.org/)`,
};
