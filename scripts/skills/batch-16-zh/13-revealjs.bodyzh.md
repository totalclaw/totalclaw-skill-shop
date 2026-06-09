# Reveal.js 演示文稿

使用 reveal.js 创建 HTML 演示文稿。无需构建步骤——在浏览器中打开 HTML 即可。

## 你将创建的内容

reveal.js 演示文稿包含：

1. **HTML 文件** - 包含幻灯片并从 CDN 加载 reveal.js
2. **CSS 文件** - 布局、颜色、排版与组件的自定义样式

## 设计原则

**关键**：创建任何演示前先分析内容并选择合适的设计元素：

1. **考虑主题**：演示讲什么？暗示何种基调、行业或氛围？
2. **检查品牌**：若用户提到公司/组织，考虑其品牌色与识别元素
3. **配色匹配内容**：选择反映主题的颜色
4. **说明方案**：写代码前解释设计选择

**要求**：
- ✅ 写代码前先说明基于内容的设计方案
- ✅ 使用 Web 安全字体（Arial、Helvetica、Georgia、Verdana 等）或在 CSS 中通过 `@import` 引入 Google Fonts
- ✅ 通过大小、字重与颜色建立清晰视觉层次
- ✅ 确保可读性：强对比、合适字号、整洁对齐
- ✅ 保持一致：在各幻灯片重复模式、间距与视觉语言
- ✅ **字号始终使用 `pt`（磅）**——幻灯片为固定尺寸，`pt` 可预测且熟悉（类似 PowerPoint/Keynote）。字号不要用 `em`、`rem` 或 `px`。

### 配色选择

**创意选色**：
- **跳出默认**：什么颜色真正匹配该主题？避免惯性选择。
- **多角度考虑**：主题、行业、氛围、能量、受众、品牌（如有）
- **大胆尝试**：意外组合——医疗不必绿色，金融不必藏青
- **构建色板**：选 3-5 种协调色（主色 + 辅助 + 强调）
- **确保对比**：文字在背景上清晰可读

**示例配色**（激发创意——选一、改编或自创）：

1. **Classic Blue**: Deep navy (#1C2833), slate gray (#2E4053), silver (#AAB7B8), off-white (#F4F6F6)
2. **Teal & Coral**: Teal (#5EA8A7), deep teal (#277884), coral (#FE4447), white (#FFFFFF)
3. **Bold Red**: Red (#C0392B), bright red (#E74C3C), orange (#F39C12), yellow (#F1C40F), green (#2ECC71)
4. **Warm Blush**: Mauve (#A49393), blush (#EED6D3), rose (#E8B4B8), cream (#FAF7F2)
5. **Burgundy Luxury**: Burgundy (#5D1D2E), crimson (#951233), rust (#C15937), gold (#997929)
6. **Deep Purple & Emerald**: Purple (#B165FB), dark blue (#181B24), emerald (#40695B), white (#FFFFFF)
7. **Cream & Forest Green**: Cream (#FFE1C7), forest green (#40695B), white (#FCFCFC)
8. **Pink & Purple**: Pink (#F8275B), coral (#FF574A), rose (#FF737D), purple (#3D2F68)
9. **Lime & Plum**: Lime (#C5DE82), plum (#7C3A5F), coral (#FD8C6E), blue-gray (#98ACB5)
10. **Black & Gold**: Gold (#BF9A4A), black (#000000), cream (#F4F6F6)
11. **Sage & Terracotta**: Sage (#87A96B), terracotta (#E07A5F), cream (#F4F1DE), charcoal (#2C2C2C)
12. **Charcoal & Red**: Charcoal (#292929), red (#E33737), light gray (#CCCBCB)
13. **Vibrant Orange**: Orange (#F96D00), light gray (#F2F2F2), charcoal (#222831)
14. **Forest Green**: Black (#191A19), green (#4E9F3D), dark green (#1E5128), white (#FFFFFF)
15. **Retro Rainbow**: Purple (#722880), pink (#D72D51), orange (#EB5C18), amber (#F08800), gold (#DEB600)
16. **Vintage Earthy**: Mustard (#E3B448), sage (#CBD18F), forest green (#3A6B35), cream (#F4F1DE)
17. **Coastal Rose**: Old rose (#AD7670), beaver (#B49886), eggshell (#F3ECDC), ash gray (#BFD5BE)
18. **Orange & Turquoise**: Light orange (#FC993E), grayish turquoise (#667C6F), white (#FCFCFC)

### 幻灯片内容原则

**多样化呈现是关键。** 即使内容类型相似，也要变化视觉呈现：

- 各幻灯片使用**不同布局**：一栏多列、堆叠框、带图标标注等
- 混合容器：纯文本、盒子、标注、引用
- 使用**视觉层次**：`<strong>` 强调关键词，不同颜色区分类别
- 用引用、标注、分栏等元素打断列表
- 连续幻灯片不要重复相同布局

**保持可扫读：**
- 短要点，非段落
- 尽量每页一个主观点
- 用图标（Font Awesome）增加视觉趣味

**内容少时放大**——不要用 tiny 文字留大片空白。

## 工作流

### 步骤 1：规划结构

根据用户内容确定：
- 需要多少幻灯片
- 哪些作为章节分隔页（居中、较大文字）
- 何处使用垂直幻灯片栈展开细节

### 步骤 2：生成脚手架

使用 `create-presentation.js`（与本 SKILL.md 同目录的 `scripts/` 下）生成 HTML 脚手架。

```bash
node <path-to-skill>/scripts/create-presentation.js --structure 1,1,d,3,1,d,1 --title "My Presentation" --output presentation.html
```

**查找脚本路径：** 脚本位于 SKILL.md 相对路径 `scripts/create-presentation.js`。常见位置：
- 项目技能：`.claude/skills/revealjs/scripts/create-presentation.js`
- 用户技能：`~/.claude/skills/revealjs/scripts/create-presentation.js`

**选项：**
- `--slides N` - 创建 N 张水平幻灯片（简单模式）
- `--structure <list>` - 逗号分隔的混合布局：
  - `1` = 单张水平幻灯片
  - `N`（N > 1）= N 张垂直堆叠幻灯片
  - `d` = 章节分隔页（居中，无 content 包装）
- `--output <file>` - 输出文件名（默认 presentation.html）
- `--title <text>` - 演示标题
- `--styles <file>` - 自定义 CSS 文件名（默认 styles.css）

**示例：**
```bash
# 10 张水平幻灯片
node <path-to-skill>/scripts/create-presentation.js --slides 10 --output presentation.html

# 混合结构：开场、2 内容页、分隔、3 页垂直栈、分隔、结尾
node <path-to-skill>/scripts/create-presentation.js --structure 1,1,1,d,3,d,1 --title "Q4 Review" --output presentation.html
```

### 步骤 3：自定义 CSS

脚手架脚本自动将 `base-styles.css` 复制为 `styles.css`。现在自定义 CSS 变量（尤其颜色）。

**使用 Google Fonts：** 在 CSS 顶部添加 `@import`：
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Lato:wght@300;400;600&display=swap');

:root {
  --heading-font: "Playfair Display", Georgia, serif;
  --body-font: "Lato", Helvetica, sans-serif;
  /* ... */
}
```

基础文件包含：

1. **CSS 变量**便于定制：
```css
:root {
  /* ===========================================
     背景色 - 先设置此项！
     =========================================== */
  --background-color: #ffffff;  /* 深色主题可改（如 #1a1a2e） */

  /* 排版 - 字号始终用 pt */
  --heading-font: "Source Sans Pro", Helvetica, sans-serif;
  --body-font: "Source Sans Pro", Helvetica, sans-serif;
  --base-font-size: 32px;  /* 唯一 px 值 - 设置 reveal.js 基准 */
  --text-size: 16pt;       /* 正文基准 - 故意偏小 */
  --h1-size: 48pt;
  --h2-size: 36pt;
  --h3-size: 24pt;

  /* 颜色 - 每份演示自定义 */
  --primary-color: #2196F3;
  --secondary-color: #ff9800;
  --text-color: #222;       /* 深色背景用浅色文字（如 #FAF7F2） */
  --muted-color: #666;      /* 深色背景也需调整 */
  --box-bg: #f5f5f5;
  --box-border: #ddd;
}
```

2. 用 `.reveal` 前缀**覆盖 reveal.js 样式**：
```css
.reveal {
  font-family: var(--body-font);
}

.reveal h1, .reveal h2, .reveal h3 {
  font-family: var(--heading-font);
  text-transform: none;
  color: var(--text-color);
}

.reveal p, .reveal li {
  font-size: var(--text-size);
  color: var(--text-color);
}
```

3. **幻灯片布局样式** - 控制内边距与定位：
```css
.reveal .slides section {
  padding: 40px 60px;
  text-align: left;
}
```

4. **组件类** - 盒子、标注等（见 [CSS 组件参考](#css-components-reference)）

5. **文字尺寸工具类**（内容少时放大文字）：
```css
/* 基准 16pt - 需要时用这些类放大 */
.text-lg { font-size: 18pt; }    /* 略大 */
.text-xl { font-size: 20pt; }    /* 中等强调 */
.text-2xl { font-size: 24pt; }   /* 强强调 */
.text-3xl { font-size: 28pt; }   /* 很大 */
.text-4xl { font-size: 32pt; }   /* 正文最大 */
.text-muted { color: var(--muted-color); }
.text-center { text-align: center; }
```

**排版指引：**
- 基准文字（`--text-size: 16pt`）故意偏小以容纳更多内容
- 内容少时用 `.text-lg`、`.text-xl` 等合适填充空间
- 内容多的页避免溢出，内容少的页保持灵活

### 步骤 4：填充 HTML 内容

编辑生成的 HTML，为每页添加内容。遵循以下模式：

**标准幻灯片结构：**
```html
<section id="unique-slide-id">
  <h2>Slide Title</h2>
  <div class="content">
    <!-- Content here -->
  </div>
</section>
```

**多栏布局** - 始终用内联 CSS grid（不要创建 `.grid-2` 等工具类）：
```html
<!-- 等宽列 -->
<div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px;">
  <div>Column 1</div>
  <div>Column 2</div>
</div>

<!-- 三列 -->
<div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 25px;">
  <div>Column 1</div>
  <div>Column 2</div>
  <div>Column 3</div>
</div>

<!-- 不等宽列 -->
<div style="display: grid; grid-template-columns: 1fr 2fr; gap: 30px;">
  <div>Narrow sidebar</div>
  <div>Wide main content</div>
</div>
```

为何 grid 用内联样式？每页布局需求不同——列比、间距等。内联样式逐页完全控制，无需大量工具类。

**重要 HTML 模式：**
- 每个 `<section>` 应有唯一 `id` 以便稳定识别
- 章节标题页使用 `class="section-divider"` 居中
- 主内容包在 `<div class="content">` 中以保持间距。这是 flex 容器，填充标题下方剩余垂直空间。
- 底部出处/来源用 `<div class="footnote">`

### 步骤 5：检查内容溢出

运行溢出检查器，确保无幻灯片内容超出边界：

```bash
node scripts/check-overflow.js presentation.html
```

脚本检查每页：
- **垂直溢出**：内容高于幻灯片高度
- **水平溢出**：内容宽于幻灯片宽度

若检测到溢出，减少内容或调整受影响页字号。

### 步骤 6：截图视觉审查

**关键：必须审查每一张幻灯片的截图。** 不要跳过或只抽样。视觉问题常见，只能逐页检查。

捕获所有幻灯片截图：

```bash
cd <presentation-directory>
npx decktape reveal "presentation.html?export" output.pdf \
  --screenshots \
  --screenshots-directory "screenshots/$(date +%Y%m%d_%H%M%S)"
```

**说明：** `?export` 查询参数禁用图表动画以便 PDF 更清晰。直接在浏览器看 HTML 时图表仍会动画。

这会创建带时间戳文件夹（如 `screenshots/20241210_143052/`）便于版本对比。

然后用 Read 工具检查每张截图。

#### 检查要点

溢出脚本能抓大部分布局问题，以下需视觉检查：

1. **容器内颜色继承**：盒子/标注内文字可能继承错误颜色。深色页面上浅色 `.box` 或 `.callout` 内文字若无显式深色会不可读。

   **修复模式** - 为浅色容器显式设置文字与项目符号颜色：
   ```css
   .box-light p,
   .box-light li {
     color: var(--text-dark);
   }

   .box-light ul li::before {
     background: var(--primary-color);  /* 项目符号颜色 */
   }
   ```

2. **自定义列表样式**：覆盖默认列表样式时，项目符号在某些背景上可能对比不足。

3. **图标未渲染**：Font Awesome 加载失败时，图标处为空方块或空白。

4. **溢出边缘情况**：复杂嵌套布局偶尔漏检。

5. **意外换行**：预期一行的文字变成两行。多栏布局中某栏标题换行而其他不换时尤其常见。

**修复后重新捕获特定页：**
```bash
npx decktape reveal "presentation.html?export" output.pdf \
  --screenshots \
  --screenshots-directory "screenshots/$(date +%Y%m%d_%H%M%S)" \
  --slides 2,5,7-9
```

然后重新检查更新后的截图验证修复。新时间戳文件夹便于与上一版对比。

## CSS 组件参考

### 盒子
```css
.box {
  background: var(--box-bg);
  border: 1px solid var(--box-border);
  border-radius: 8px;
  padding: 20px;
}

.box-outlined {
  border: 1px solid var(--box-border);
  border-radius: 8px;
  padding: 20px;
  background: transparent;
}
```

### 标注
```css
.callout {
  border-left: 6px solid var(--primary-color);
  paddin