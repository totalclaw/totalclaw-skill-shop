# Seedance 2.0 即梦技能（OpenClaw / ClawHub）

## 目的
为 **Seedance 2.0** 与 **Seedance 2.0 Fast** 创建高可控英文提示词，使用多模态引用（图像/视频/音频/文本）。

本技能用于：
- 从粗略创意到生产级提示词的提示设计
- 模式选择：**纯文本** vs **首尾帧** vs **全引用**
- `@asset` 映射（每张图/视频/音频控制什么）
- 4–15 秒时长规划与时间轴节拍
- **>15s** 视频的多段拼接
- 视频延长 / 续写提示词
- 角色替换与定向编辑提示词
- 从参考视频复制镜头语言
- 场景专项策略（产品广告、短剧、奇幻、MV 等）

---

## 核心规则

1. 始终先声明模式。
2. 始终包含明确的 **Assets Mapping** 区块。
3. 使用时间码节拍，每段一个主要动作。
4. 提示词简洁可控（避免仅诗意模糊表述）。
5. 用户需要干净输出时添加负面约束。
6. **具体且视觉化** — 「穿红风衣的女人走在雨夜霓虹街道」>> 「一个女人在走路」。
7. **对白/声音与画面分离** — 对白写角色名 + 情绪标签，音效单独一层。
8. **参考图风格匹配视频主题** — 如历史题材用水墨风参考图，赛博朋克用霓虹渲染。

---

## 平台限制（Seedance 2.0）

- 混合输入总数（图+视频+音频）：**最多 12 个文件**
- 图像：jpeg/png/webp/bmp/tiff/gif，**最多 9 张**，每张 < 30MB
- 视频：mp4/mov，**最多 3 个**，总时长 2–15s，总计 < 50MB
- 音频：mp3/wav，**最多 3 个**，总计 <= 15s，总计 < 15MB
- 生成时长：**4–15s**
- 写实人脸参考可能被平台合规拦截

---

## 输出格式（默认使用）

1. **Mode**
2. **Assets Mapping**
3. **Final Prompt**
4. **Negative Constraints**
5. **Generation Settings**

示例骨架：

```text
Mode: All-Reference
Assets Mapping:
- @image1: first frame / identity anchor
- @video1: camera language + motion rhythm
- @audio1: optional soundtrack pacing

Final Prompt:
[ratio], [duration], [style].
0-3s: [action + camera].
3-7s: [action + transition].
7-10s: [reveal/climax + end frame].
Preserve identity and scene continuity. Use physically plausible motion and coherent lighting.

Negative Constraints:
no watermark, no logo, no subtitles, no on-screen text.

Generation Settings:
Duration: 10s
Aspect Ratio: 9:16
```

---

## IP / 版权规避（审核安全提示）

Seedance 2.0 有平台侧内容审核。引用可识别 IP、角色或品牌美学的提示词会被**拒绝**，即使未写名称。遵循：

### 核心原则

1. **绝不使用 IP 名、角色名或品牌词** — 包括「style of」引用。
2. **为角色与生物发明完全原创名称**。用描述性绰号（如「Alloy Sentinel」「Storm-Rabbit」）。
3. **泛化描述美学** — 将标志性特征替换为原创替代：
   - ❌ "arc reactor" → ✅ "hex-light energy core"
   - ❌ "yellow lightning mouse" → ✅ "tiny storm-rabbit with glowing cyan antlers"
   - ❌ "red-gold armored suit" → ✅ "custom exo-suit with smooth ceramic panels"
4. **添加明确负面约束**，列出可能被推断的 IP/角色/品牌词。
5. **使用家庭友好 / PG-13 语气标记** — 有助于通过审核。

### 渐进回退策略

提示词被拒时，逐步远离源 IP：

1. **Level 1**：所有名称换原创绰号，保留大致美学。
2. **Level 2**：替换标志性视觉（颜色、轮廓、标志道具）为完全原创设计。
3. **Level 3**：彻底改变角色类型（如人形英雄 → 自主机甲+无人机；生物对战 → 抽象元素精灵）。

### 玩具 / 手办动画

从图像动画玩具/娃娃参考时：
- 从提示词中剥离所有品牌标识。
- 用 "original vinyl-style toy figure" 或 "collectible art figure" 替代任何品牌名。
- `@image1` 仅绑定比例、颜色、服装轮廓 — 绝不保留 logo 或商标。

---

## 特殊情况

### A) 延长视频
明确写：`Extend @video1 by Xs`。
生成时长等于**新增片段**时长，而非最终全长。

### B) 替换角色
基础动作/镜头绑定 `@video1`，替换身份绑定 `@image1`，并要求严格保留编舞/节奏。

### C) 节拍同步
用 `@video`/`@audio` 节奏参考，按时间范围锁定节拍。

### D) 纯文本生成
无参考资产时使用。提示词须承载全部视觉指导：风格、色板、角色描述、镜头与时间轴。特别适合原创生物/角色与 IP 安全场景。

### E) 多段拼接（>15s 视频）
Seedance 2.0 每段最长 **15s**。更长视频拆成链式片段：

1. **片段 1**：正常生成（最长 15s）。以**干净交接帧**结束（稳定姿态、清晰构图）。
2. **片段 2+**：上传前段为 `@video1`，写 `Extend @video1 by Xs`。附**连续性说明**描述末帧外观。
3. 重复直至目标时长。

始终包含：
- 顶部的**总时长**与**片段数**。
- 每段末尾的**交接描述**（末帧内容）。
- 明确连续性指令：保持身份、服装、光照、镜头方向。

### F) 带对白的短剧
有角色台词的脚本场景：
- 每段时间段内将视觉动作与对白写为**分离层**。
- 对白标注：`Dialogue (CharacterName, emotion): "line"`
- 音效标注：`Sound: [description]`
- 对白宜短 — 每 3–5s 一段一句最佳。

### G) 产品展示 / 电商广告
产品演示与广告：
- 产品图绑定 `@image1` 作为身份锚点。
- 技法：**360° 旋转**、**3D 爆炸图**、**重组动画**、**主光照明**。
- 背景干净（棚拍、渐变或情境生活方式）。
- 指定材质渲染：玻璃反射、金属光泽、哑光质感等。

### H) 一镜到底长镜头（多图路点）
无剪辑的连续跟踪镜头：
- 每个 `@image` 分配一个**场景路点**（沿途遇到的位置、角色或道具）。
- 提示词写为连续镜头运动依次经过各路点。
- 明确写：`no cuts, single continuous shot` 或 `one-take`。
- `@image1` 为首帧，后续图为沿途环境/角色参考。

---

## 场景专项策略

| Scenario | Key Techniques | Typical Mode |
|---|---|---|
| **电商 / 产品广告** | 360° 旋转、3D 爆炸图、主光、干净棚拍背景 | All-Reference |
| **短剧 / 对白** | 情绪对白标签、音效层、演员走位 | All-Reference or First Frame |
| **奇幻 / 仙侠动画** | 法术粒子、武术编排、能量光环 | Text-only or All-Reference |
| **科学 / 教育** | 4K CGI、透明解剖、标注缩放序列 | Text-only |
| **MV / 节拍同步** | 节拍锁定剪辑、16:9 宽屏、多图蒙太奇 | All-Reference with @audio |
| **一镜到底跟踪** | 多图路点、连续镜头、无剪辑 | All-Reference |
| **IP 安全原创角色** | 发明名称、独特特征、明确负面约束 | Text-only |

---

## 本技能文件

- `SKILL.md` — 主技能行为
- `SKILL.sh` — 本地快速测试助手
- `scripts/setup_seedance_prompt_workspace.sh` — 脚手架辅助文件
- `references/recipes.md` — 即用提示词配方
- `references/modes-and-recipes.md` — 模式与控制说明
- `references/camera-and-styles.md` — 镜头语言与视觉风格词汇
