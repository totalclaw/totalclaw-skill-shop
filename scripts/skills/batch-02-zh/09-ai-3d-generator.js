module.exports = {
  skillId: 'totalclaw:totalclaw~vonzellu-ai-3d-generator',
  descriptionZh:
    '根据文字描述自动生成精细 3D 模型：通过 LLM 生成 Trimesh Python 脚本并导出 STL，支持参数化建模、程序化细节与定时批量生成，适用于 3D 打印工作流。',
  bodyZh: `# AI 3D Model Generator

根据文字描述自动生成精细 3D 模型。

## 架构

\`\`\`
用户提示 → LLM (Kimi/Gemini) → Python/Trimesh 代码 → 生成 STL → 导出
\`\`\`

## 自动化流水线

### 1. 提示工程（模板）

创建文件 \`prompts/3d-generator.txt\`：

\`\`\`markdown
你是一名参数化 3D 建模专家。生成使用 Trimesh 的 Python 脚本，以创建下方描述的 3D 模型。

规则:
- 使用 trimesh.creation (icosphere, cylinder, cone, torus, box)
- 复杂细节：使用循环与参数
- 高分辨率：球体 subdivisions=4-5，圆柱 sections=32-64
- 添加表面细节（面板、几何纹理）
- 模块化结构，可复用函数
- 最后导出为二进制 STL

脚本模板:
\`\`\`python
#!/usr/bin/env python3
import numpy as np
import trimesh
from trimesh.creation import icosphere, cylinder, cone, torus, box
from trimesh.transformations import rotation_matrix
import os

EXPORT_DIR = "/home/celluloid/.openclaw/workspace/stl-exports"

def save_mesh(mesh, filename):
    os.makedirs(EXPORT_DIR, exist_ok=True)
    filepath = os.path.join(EXPORT_DIR, filename)
    mesh.export(filepath)
    print(f"✓ Exporté: {filepath}")
    print(f"  Triangles: {len(mesh.faces):,}")
    return filepath

def rotate_mesh(mesh, angle, axis, point=None):
    if point is None:
        point = [0, 0, 0]
    mat = rotation_matrix(angle, axis, point)
    mesh.apply_transform(mat)
    return mesh

# === 主模型 ===
def create_model():
    meshes = []
    
    # [在此生成模型]
    
    # 合并与优化
    combined = trimesh.util.concatenate(meshes)
    combined.merge_vertices()
    return combined

if __name__ == "__main__":
    mesh = create_model()
    save_mesh(mesh, "[NOM_DU_MODELE].stl")
\`\`\`

待创建的模型描述:
{{USER_DESCRIPTION}}

仅输出完整 Python 代码，不要解释。
\`\`\`

## 2. OpenClaw 自动化技能

创建文件 \`~/.openclaw/workspace/skills/ai-3d-generator/SKILL.md\`：

### 使用

#### 简单生成
\`\`\`bash
# 根据描述生成模型
~/.openclaw/workspace/skills/ai-3d-generator/scripts/generate-from-prompt.sh "带三角翼与玻璃驾驶舱的太空飞船"
\`\`\`

#### 带参数生成
\`\`\`bash
# 带技术规格
~/.openclaw/workspace/skills/ai-3d-generator/scripts/generate-from-prompt.sh \\
  "关节可动的人形机器人" \\
  --scale=50mm \\
  --detail=high \\
  --output=robot.stl
\`\`\`

### 流程

1. **提示分析** → 提取实体（形状、尺寸、细节）
2. **代码生成** → LLM 创建 Python/Trimesh 脚本
3. **语法验证** → 检查导入与结构
4. **执行** → 生成网格并导出 STL
5. **后处理** → 优化、检查流形（manifold）

## 3. 高效提示示例

### 好提示（详细、技术化）:
\`\`\`
创建一座中世纪城堡，包含:
- 四角圆柱塔楼（直径 8mm，高 25mm）
- 塔楼上的垛口
- 方形围墙（40x40mm）
- 前方吊桥
- 石块纹理，独立砖块
- 1:100 比例，用于 3D 打印
\`\`\`

### 差提示（过于模糊）:
\`\`\`
给我做个城堡
\`\`\`

## 4. 完整自动化

### 定期生成的 Cron 任务
\`\`\`json
{
  "name": "3d:generate-daily",
  "schedule": {"kind": "cron", "expr": "0 9 * * *"},
  "payload": {
    "message": "Génère un modèle 3D aléatoire du jour (animaux, architecture, véhicules) et exporte en STL",
    "model": "openrouter/moonshotai/kimi-k2.5"
  }
}
\`\`\`

## 5. 超精细优化技巧

### 高级技术

#### 程序化雕刻
\`\`\`python
# 添加表面噪声作为纹理
def add_surface_noise(mesh, amplitude=0.1):
    vertices = mesh.vertices.copy()
    noise = np.random.normal(0, amplitude, vertices.shape)
    mesh.vertices = vertices + noise
    return mesh
\`\`\`

#### 参数化细节
\`\`\`python
# 生成重复细节
for i in range(100):  # 100 个表面面板
    angle = i * 2 * np.pi / 100
    panel = create_detailed_panel()
    position_on_surface(panel, radius=20, angle=angle)
\`\`\`

#### 优化布尔运算
\`\`\`python
# 使用 trimesh.boolean 进行复杂切割
from trimesh.boolean import difference, union, intersection

result = difference(base_mesh, cutting_tool)
\`\`\`

## 6. 完整工作流示例

### OpenClaw 命令:
\`\`\`
生成环形空间站 3D 模型，包含:
- 主环直径 80mm
- 环上 6 个居住舱模块
- 中央指挥球体
- 天线与太阳能板
- 赛博朋克风格，带电缆与管道
导出为高分辨率 STL。
\`\`\`

### 自动响应:
1. LLM 生成 Python 脚本（约 30 秒）
2. Trimesh 执行（约 1–2 分钟）
3. 导出优化后的 STL
4. 报告：三角面数、体积、尺寸

## 备注

- 极复杂模型（>10 万三角面）需预留更多时间
- 必要时使用 \`trimesh.smoothing\` 平滑表面
- 确认模型为「流形」（封闭）以便 3D 打印
- 保存生成的脚本以便复用与修改`,
};
