# ImageMagick Moltbot 技能

在 Moltbot 中执行全面的 ImageMagick 图像处理操作。

## 安装

**macOS：**
```bash
brew install imagemagick
```

**Linux：**
```bash
sudo apt install imagemagick  # Debian/Ubuntu
sudo dnf install ImageMagick  # Fedora
```

**验证：**
```bash
convert --version
```

## 可用操作

### 1. 去除背景（白/纯色 → 透明）
```bash
./scripts/remove-bg.sh input.png output.png [tolerance] [color]
```

| 参数 | 默认 | 范围 | 说明 |
|-----------|---------|-------|-------------|
| input.png | — | — | 源图 |
| output.png | — | — | 透明 PNG 输出 |
| tolerance | 20 | 0-255 | 颜色匹配容差 |
| color | #FFFFFF | hex | 要移除的颜色 |

**示例：**
```bash
./scripts/remove-bg.sh icon.png icon-clean.png              # 默认白色
./scripts/remove-bg.sh icon.png icon-clean.png 30           # 宽松容差
./scripts/remove-bg.sh icon.png icon-clean.png 10 "#000000" # 去除黑色
```

### 2. 缩放图像
```bash
convert input.png -resize 256x256 output.png
```

### 3. 格式转换
```bash
convert input.png output.webp          # PNG → WebP
convert input.jpg output.png           # JPG → PNG
convert input.png -quality 80 output.jpg  # 压缩
```

### 4. 圆角（iOS 风格）
```bash
convert input.png -alpha set -virtual pixel transparent \
    -distort viewport 512x512+0+0 \
    -channel A -blur 0x10 -threshold 50% \
    output-rounded.png
```

### 5. 添加水印
```bash
convert base.png watermark.png -gravity southeast -composite output.png
```

### 6. 批量生成缩略图
```bash
for f in *.png; do convert "$f" -resize 128x128 "thumbs/$f"; done
```

### 7. 色彩调整
```bash
convert input.png -brightness-contrast 10x0 output.png      # 更亮
convert input.png -grayscale output.png                     # 灰度
convert input.png -modulate 100,150,100 output.png          # 更高饱和度
```

## 常见模式

### 扁平图标 → 透明背景
```bash
./scripts/remove-bg.sh icon.png icon-clean.png 15
```

### 生成应用图标集（iOS）
```bash
for size in 1024 512 256 128 64 32 16; do
    convert icon.png -resize ${size}x${size} icon-${size}.png
done
```

### Web 优化
```bash
convert large.png -quality 85 -resize 2000x2000\> optimized.webp
```

## 提示

- **较高容差（20–50）**：适合抗锯齿边缘，可能误删部分前景
- **较低容差（5–15）**：保留细节，可能残留色边
- **扁平图标**：通常 10–20 效果最佳
- JPEG/WebP 用 `-quality` 控制压缩（0–100）
- 用 `-strip` 去除元数据以减小体积
