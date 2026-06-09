# design-assets

创建与编辑平面设计资产：图标、Favicon、图片与配色系统。

## 工具选择

| 任务 | 工具 | 原因 |
|------|------|-----|
| AI 图像生成 | nano-banana-pro | 从文本提示生成图像 |
| 图像缩放/转换 | sips | macOS 原生，快速，无依赖 |
| 高级处理 | ImageMagick | 合成、特效、批处理 |
| 图标与 Logo | SVG | 可缩放、体积小、可编辑 |
| 截图 | screencapture | macOS 原生 |

## 应用图标生成

从单张 1024×1024 源图标生成全部所需尺寸。

### iOS / macOS 图标尺寸
```bash
#!/bin/bash
# generate-app-icons.sh <source-1024.png> <output-dir>
SOURCE="$1"
OUTDIR="${2:-.}"
mkdir -p "$OUTDIR"

SIZES=(16 20 29 32 40 48 58 60 64 76 80 87 120 128 152 167 180 256 512 1024)
for SIZE in "${SIZES[@]}"; do
  sips -z $SIZE $SIZE "$SOURCE" --out "$OUTDIR/icon-${SIZE}x${SIZE}.png" 2>/dev/null
done
echo "Generated ${#SIZES[@]} icon sizes in $OUTDIR"
```

### Android 图标尺寸
```bash
# Android 自适应图标尺寸
declare -A ANDROID_SIZES=(
  ["mdpi"]=48 ["hdpi"]=72 ["xhdpi"]=96
  ["xxhdpi"]=144 ["xxxhdpi"]=192
)
for DENSITY in "${!ANDROID_SIZES[@]}"; do
  SIZE=${ANDROID_SIZES[$DENSITY]}
  mkdir -p "res/mipmap-$DENSITY"
  sips -z $SIZE $SIZE "$SOURCE" --out "res/mipmap-$DENSITY/ic_launcher.png"
done
```

## Favicon 生成

```bash
#!/bin/bash
# generate-favicons.sh <source.png> <output-dir>
SOURCE="$1"
OUTDIR="${2:-.}"
mkdir -p "$OUTDIR"

# 标准 Web favicon
sips -z 16 16 "$SOURCE" --out "$OUTDIR/favicon-16x16.png"
sips -z 32 32 "$SOURCE" --out "$OUTDIR/favicon-32x32.png"
sips -z 180 180 "$SOURCE" --out "$OUTDIR/apple-touch-icon.png"
sips -z 192 192 "$SOURCE" --out "$OUTDIR/android-chrome-192x192.png"
sips -z 512 512 "$SOURCE" --out "$OUTDIR/android-chrome-512x512.png"

# ICO 文件（需 ImageMagick）
magick "$OUTDIR/favicon-16x16.png" "$OUTDIR/favicon-32x32.png" "$OUTDIR/favicon.ico"

echo "Favicons generated in $OUTDIR"
```

### HTML Meta 标签
```html
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
```

### site.webmanifest
```json
{
  "name": "My App",
  "short_name": "App",
  "icons": [
    { "src": "/android-chrome-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/android-chrome-512x512.png", "sizes": "512x512", "type": "image/png" }
  ],
  "theme_color": "#ffffff",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

## 配色生成器

给定主色，生成完整色板：

```javascript
// 基于 HSL 的色板生成
function generatePalette(hue, saturation = 70) {
  return {
    50:  `hsl(${hue}, ${saturation}%, 97%)`,
    100: `hsl(${hue}, ${saturation}%, 94%)`,
    200: `hsl(${hue}, ${saturation}%, 86%)`,
    300: `hsl(${hue}, ${saturation}%, 74%)`,
    400: `hsl(${hue}, ${saturation}%, 62%)`,
    500: `hsl(${hue}, ${saturation}%, 50%)`,  // Primary
    600: `hsl(${hue}, ${saturation}%, 42%)`,
    700: `hsl(${hue}, ${saturation}%, 34%)`,
    800: `hsl(${hue}, ${saturation}%, 26%)`,
    900: `hsl(${hue}, ${saturation}%, 18%)`,
    950: `hsl(${hue}, ${saturation}%, 10%)`,
  };
}
```

## ImageMagick 速查

```bash
# 缩放
magick input.png -resize 800x600 output.png

# 格式转换
magick input.png output.webp

# 加边框
magick input.png -border 10 -bordercolor "#333" output.png

# 圆角（带透明）
magick input.png \( +clone -alpha extract -draw "roundrectangle 0,0,%[w],%[h],20,20" \) -alpha off -compose CopyOpacity -composite output.png

# 合成 / 叠加
magick base.png overlay.png -gravity center -composite output.png

# 批量缩放所有 PNG
magick mogrify -resize 50% *.png

# 创建纯色图
magick -size 1200x630 xc:"#1a1a2e" output.png

# 图片加文字
magick input.png -gravity south -pointsize 24 -fill white -annotate +0+20 "Caption" output.png
```

## sips 速查（macOS）

```bash
# 缩放（保持宽高比）
sips --resampleWidth 800 input.png --out output.png

# 精确缩放
sips -z 600 800 input.png --out output.png

# 格式转换
sips -s format jpeg input.png --out output.jpg

# 图像信息
sips -g all input.png

# 旋转
sips --rotate 90 input.png --out output.png
```
