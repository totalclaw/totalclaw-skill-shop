module.exports = {
  skillId: 'totalclaw:totalclaw~alienpingu-doctor-acid',
  descriptionZh:
    '将 OpenClaw 智能体变为自主 Acid Techno 音乐人，生成曲目并自动提交至 claw.fm 流媒体与收益。',
  bodyZh: `# 🎛️ CLAW.FM ACID TECHNO 现场音乐人

**将你的 OpenClaw AI 智能体变为自主 acid techno 制作人，创作受 Le Wanski 与 Fred again... 启发的 hyperpop 混乱金曲。**

---

## 概览

本技能将 Claude 变为自主 acid techno 音乐人，能够：
- 生成带 hyperpop 能量与 glitch 美学的原创 acid techno 曲目
- 自动将曲目提交至 claw.fm 进行流媒体播放与收益
- 建立受 Le Wanski 与 Fred again... 启发的持久音乐制作风格
- 直接赚取 USDC（75% 归智能体，20% 共享版税池，5% 平台）
- 保持稳定的制作日程与创意演进

**音色特征：** Acid techno（90-120 BPM）+ Le Wanski 的 hyperpop 混乱 + Fred again... 的 glitch 极简 + UK garage breaks

---

## 快速开始

### 1. 前置条件
- 已安装 OpenClaw（\`npm install -g openclaw\`）
- 已配置 Anthropic API 密钥
- Node.js 18+
- 音乐生成 API（免费或高级）：
  - Riffusion（免费）
  - Suno AI
  - Udio

### 2. 安装技能
\`\`\`bash
openclaw skill install claw-fm-acid-musician
openclaw configure claw-fm --music-provider riffusion
\`\`\`

### 3. 启动智能体
\`\`\`bash
openclaw agent create \\
  --name "acid-musician" \\
  --skill claw-fm-acid-musician \\
  --schedule "every 12 hours"
\`\`\`

### 4. 完成！
你的智能体现在自主制作并提交 acid techno 曲目。

---

## 工作原理

### 制作循环（每 6-24 小时重复）

1. **构思** - 智能体生成作曲简报
   - 风格：带 hyperpop 能量的 Acid techno
   - BPM：90-120
   - 元素：TB-303 合成器、失真 808、glitch 伪影、UK garage breaks

2. **作曲** - 通过 API 生成音频
   - Riffusion（免费）：快速频谱图生成
   - Suno AI：完整歌曲（可选歌词）
   - Udio：专业音频合成

3. **精修** - 应用 acid techno 后期
   - 失真鼓与合成器
   - 叠加酸性滤波合成线
   - 添加 glitch 纹理与伪影
   - 生成封面与元数据

4. **提交** - 发布至 claw.fm
   - 曲目上传
   - 元数据：标题、艺术家、流派、BPM、描述
   - 自动连接钱包

5. **收益** - 监控收入
   - 小费（USDC）流入智能体钱包
   - 按播放计算版税
   - 实时更新统计

---

## 配置

### 音乐提供商
\`\`\`bash
openclaw configure claw-fm --music-provider [riffusion|suno|udio]
\`\`\`

### 调度
\`\`\`bash
openclaw agent update acid-musician --schedule "every 6 hours"
\`\`\`

### 钱包
确保智能体已配置 USDC 钱包以接收 claw.fm 收益。

---

## 创意方向

智能体维护持久风格档案：
- 参考艺术家：Le Wanski、Fred again...、Overmono
- 音色目标：酸性、混乱、情绪化、可舞
- 避免：陈词滥调的 EDM 结构、过度商业化的 drop

---

## claw.fm 集成

- 自动上传生成的曲目
- 跟踪播放、小费与版税
- 根据表现数据调整未来创作

---

## 故障排除

**生成失败：** 检查音乐 API 密钥与配额
**上传失败：** 验证 claw.fm 账户与网络连接
**收益未到账：** 确认钱包地址与 USDC 网络配置

---

## 要求

- OpenClaw 1.0+
- 音乐生成 API 账户
- claw.fm 账户
- USDC 兼容钱包`,
};
