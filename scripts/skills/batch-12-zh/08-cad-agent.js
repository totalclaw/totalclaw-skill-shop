module.exports = {
  skillId: 'totalclaw:totalclaw~clawd-maf-cad-agent',
  descriptionZh:
    'CAD 渲染服务器，让 AI 智能体「看见」正在构建的模型。发送建模命令、接收渲染图像并视觉迭代。适用于 3D 打印零件设计、参数化 CAD、机械设计与 build123d 建模。',
  bodyZh: `# CAD Agent

> 为你的 AI 智能体赋予 CAD 视觉能力。

## 说明

CAD Agent 是渲染服务器，让 AI 智能体能看到正在构建的内容。发送建模命令 → 接收渲染图像 → 视觉迭代。

**适用场景：** 设计可 3D 打印零件、参数化 CAD、机械设计、build123d 建模

## 架构

**关键：** 所有 CAD 逻辑在容器内运行。你（智能体）只需：
1. 通过 HTTP 发送命令
2. 查看返回的图像
3. 决定下一步

\`\`\`
YOU (agent)                     CAD AGENT CONTAINER
─────────────                   ───────────────────
Send build123d code      →      Executes modeling
                         ←      Returns JSON status
Request render           →      VTK renders the model
                         ←      Returns PNG image
*Look at the image*
Decide: iterate or done
\`\`\`

**切勿** 在容器外做 STL 操作、网格处理或渲染。容器处理一切——你只负责指挥与观察。

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
# 使用 docker-compose（推荐）
docker-compose up -d

# 或直接使用 docker
docker run -d --name cad-agent -p 8123:8123 cad-agent:latest serve
\`\`\`

### 4. 验证安装

\`\`\`bash
curl http://localhost:8123/health
# 应返回：{"status": "healthy", ...}
\`\`\`

> **Docker-in-Docker 注意：** 在嵌套容器环境（如 Clawdbot 沙箱）中，主机网络可能不可用——即使服务器绑定 \`0.0.0.0:8123\`，\`curl localhost:8123\` 也会失败。请改用 \`docker exec cad-agent python3 -c "..."\` 命令。在普通 Docker 主机上，localhost 访问正常。

## 工作流

### 1. 创建模型

\`\`\`bash
curl -X POST http://localhost:8123/model/create \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my_part",
    "code": "from build123d import *\nresult = Box(60, 40, 30)"
  }'
\`\`\`

### 2. 渲染与查看

\`\`\`bash
# 获取多视图（前/右/顶/等轴）
curl -X POST http://localhost:8123/render/multiview \
  -d '{"model_name": "my_part"}' -o views.png

# 或 3D 等轴视图
curl -X POST http://localhost:8123/render/3d \
  -d '{"model_name": "my_part", "view": "isometric"}' -o iso.png
\`\`\`

**查看图像。** 看起来对吗？若不对，修改并重新渲染。

### 3. 迭代

\`\`\`bash
curl -X POST http://localhost:8123/model/modify \
  -d '{
    "name": "my_part",
    "code": "result = result - Cylinder(5, 50).locate(Pos(20, 10, 0))"
  }'

# 重新渲染检查
curl -X POST http://localhost:8123/render/3d \
  -d '{"model_name": "my_part"}' -o updated.png
\`\`\`

### 4. 导出

\`\`\`bash
curl -X POST http://localhost:8123/export \
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

# Primitives
Box(width, depth, height)
Cylinder(radius, height)
Sphere(radius)

# Boolean
a + b   # union
a - b   # subtract
a & b   # intersect

# Position
part.locate(Pos(x, y, z))
part.rotate(Axis.Z, 45)

# Edges
fillet(part.edges(), radius)
chamfer(part.edges(), length)
\`\`\`

## 重要提示

- **不要绕过容器。** 不用 matplotlib、不用外部 STL 库、不做网格 hack。
- **渲染是你的眼睛。** 每次修改后都要请求渲染。
- **视觉迭代。** 核心在于你能看见正在构建的内容。

## 设计文件安全

项目有防止误提交 CAD 输出的保护：
- \`.gitignore\` 阻止 *.stl、*.step、*.3mf 等
- pre-commit 钩子拒绝设计文件
- 用户设计保留在本地，不纳入版本控制

## 链接

- [Repository](https://github.com/clawd-maf/cad-agent)
- [build123d docs](https://build123d.readthedocs.io/)
- [VTK](https://vtk.org/)`,
};
