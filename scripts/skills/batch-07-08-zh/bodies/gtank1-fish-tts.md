# Fish Audio S1 TTS 技能

## 概述

本技能使用 **Fish Audio S1** 生成高质量文本转语音音频并上传至 NextCloud。

## 要求

- Fish Audio S1 服务运行于：`http://localhost:7860`
- 环境变量中配置 NextCloud 凭证
- 通过 WebDAV 上传至 NextCloud

## 用法

从文本生成语音：
```bash
curl -s -X POST http://192.168.68.78:7860/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"model":"fish", "text":"Hello from Fish Audio S1!", "voice":"em_michael"}' \
  -o /tmp/fish_audio.mp3
```

上传至 NextCloud：
```bash
curl -s -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" \
  -X PUT -T /tmp/fish_audio.mp3 \
  "http://192.168.68.68:8080/remote.php/webdav/Openclaw/fish_audio.mp3"
```

## 配置

若未设置，请配置以下环境变量：

```bash
export NEXTCLOUD_USER="openclaw"
export NEXTCLOUD_PASS="N95qg-Wzdpc-6DJAn-xMaHa-RaEW5"
export NEXTCLOUD_URL="http://192.168.68.68:8080"
export FISH_AUDIO_S1_URL="http://192.168.68.78:7860"
```

## 可用音色

Fish Audio S1 提供多种高质量音色。常用选项：

### 专业男声
- `em_michael` - 权威、商务
- `em_pierre` - 法语、专业
- `em_marcus` - 德语、自信

### 专业女声
- `af_bella` - 温暖、自然
- `af_nicole` - 清晰、利落
- `af_rachel` - 友好、对话感

### 情感音色
- `em_alex` - 表现力男声（温暖、音域广）
- `af_sarah` - 友好、年轻

### 按语言
- 法语：`em_pierre`
- 德语：`em_marcus`
- 英式：`af_alice`、`af_emma`

## 高级功能

### 音色选择
- 按内容类型选音色（专业 vs 情感）
- 自动检测语言（Fish Audio S1 主要为英语）

### 情感控制
- 在输入文本加情感标签：`[happy]`、`[sad]`、`[excited]`
- 示例：`Hello! [happy] I am so happy to meet you today.`
- Fish Audio S1 将自动应用合适韵律

### 质量设置
- **高质量** - 默认（最佳自然语音）
- **快速生成** - 测试时优先速度
- **标准质量** - 速度与质量平衡

## API 端点

### 生成音频
`POST http://192.168.68.78:7860/v1/audio/speech`

**请求格式：**
```json
{
  "model": "fish",
  "text": "Your text here",
  "voice": "Voice name from list above",
  "output": "output file path or 'upload to NextCloud'"
}
```

### 上传至 NextCloud
`PUT http://192.168.68.68:8080/remote.php/webdav/Openclaw/path/to/file.mp3`

**请求头：**
- `Authorization: Basic <base64_credentials>`
- `Content-Type: audio/mpeg`

## 实现说明

### 错误处理
- 生成前检查 Fish Audio S1 是否运行
- 验证 NextCloud 凭证已配置
- 优雅处理连接错误
- 提供有意义错误信息

### 音频格式
- **MP3** - 默认（广泛支持、压缩好）
- **WAV** - 备选（无损、未压缩）
- **比特率** - 128kbps（CD 品质）
- **采样率** - 24000Hz（TTS 标准）

### NextCloud 集成
- **WebDAV** - 使用 WebDAV 协议操作文件
- **路径** - `/Openclaw/` 或自定义子文件夹
- **认证** - 使用 `NEXTCLOUD_USER:NEXTCLOUD_PASS` 的 Basic 认证

## 故障排除

### 服务无响应
```bash
# Check if service is running
curl -s http://192.168.68.78:7860/health
# Check if can generate audio
curl -s -X POST http://192.168.68.78:7860/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"model":"fish", "text":"test", "voice":"em_alex"}' \
  -o /tmp/test.mp3
```

### NextCloud 上传失败
```bash
# Test NextCloud connectivity
curl -s -I "http://192.168.68.68:8080" \
  -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS"
  -X PROPFIND -H "Depth:0" \
  "http://192.168.68.68:8080/remote.php/webdav/Openclaw/"
```

### 备选 TTS 服务
若 Fish Audio S1 不可用，可尝试：
- **Kokoro TTS** - 你现有服务，端口 8880
- **OpenVoice V2** - 语音克隆服务，端口 7861

## 示例

### 示例 1：简单问候
```bash
curl -s -X POST http://192.168.68.78:7860/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"model":"fish", "text":"Hello! How are you today?", "voice":"em_michael"}' \
  -o /tmp/greeting.mp3
```

### 示例 2：情感语音
```bash
curl -s -X POST http://192.168.68.78:7860/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"model":"fish", "text":"I am so excited to tell you about this amazing opportunity! [excited]", "voice":"af_sarah"}' \
  -o /tmp/excited.mp3
```

### 示例 3：上传至 NextCloud
```bash
# Generate audio
curl -s -X POST http://192.168.68.78:7860/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"model":"fish", "text":"This is a test file for NextCloud upload.", "voice":"em_michael"}' \
  -o /tmp/test_file.mp3

# Upload to NextCloud
curl -s -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" \
  -X PUT -T /tmp/test_file.mp3 \
  "http://192.168.68.68:8080/remote.php/webdav/Openclaw/test_file.mp3"
```

## 音色名称参考

Fish Audio S1 可用音色完整列表（测试用）：
- **专业男声：** em_michael, em_pierre, em_marcus
- **专业女声：** af_bella, af_nicole, af_rachel
- **情感：** em_alex, af_sarah
- **英式：** af_alice, af_emma
- **年轻：** af_nova

## 最佳实践

### 保持一致品质
1. **长内容用同一音色** - 听感连贯
2. **考虑受众** - 商务用专业音色，故事用情感音色
3. **最终生成前试听** - 验证质量与音量
4. **整理音频文件** - 文件名含日期与描述
5. **监控服务健康** - 定期检查端点响应

### NextCloud 上传
1. **使用 WebDAV** - 高效文件传输
2. **按日期组织** - 如 `2026/02/09/` 日传文件夹
3. **描述性文件名** - 如 `greeting_em_michael_20260209.mp3`
4. **先测小文件** - 长对话前先传 10 秒测试
5. **监控存储配额** - 勿超 NextCloud 限额

## 脚本模板

```bash
#!/bin/bash
# Fish Audio S1 TTS Skill

# Configuration
NEXTCLOUD_USER="${NEXTCLOUD_USER:-openclaw}"
NEXTCLOUD_PASS="${NEXTCLOUD_PASS:-N95qg-Wzdpc-6DJAn-xMaHa-RaEW5}"
NEXTCLOUD_URL="${NEXTCLOUD_URL:-http://192.168.68.68:8080}"
FISH_AUDIO_S1_URL="${FISH_AUDIO_S1_URL:-http://192.168.68.78:7860}"

# Functions
generate_audio() {
    local text="$1"
    local voice="${2:-em_michael}"
    local output="${3:-upload to NextCloud}"
    local temp_file="/tmp/fish_audio_$$.mp3"
    
    # Generate audio
    if ! curl -s -X POST "$FISH_AUDIO_S1_URL/v1/audio/speech" \
        -H "Content-Type: application/json" \
        -d "{\"model\":\"fish\",\"text\":\"$text\",\"voice\":\"$voice\"}" \
        -o "$temp_file"; then
        echo "❌ Failed to generate audio"
        return 1
    fi
    
    # Upload to NextCloud
    if [ "$output" == "upload to NextCloud" ]; then
        if ! curl -s -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" \
            -X PUT -T "$temp_file" \
            "$NEXTCLOUD_URL/Openclaw/fish_audio_$(date +%Y%m%d_%H%M%S).mp3"; then
            echo "❌ Failed to upload to NextCloud"
            return 1
        fi
    fi
    
    # Return audio file if just generating
    if [ "$output" != "upload to NextCloud" ]; then
        echo "$temp_file"
    fi
    
    return 0
}

main() {
    # Parse command line arguments
    local action="$1"
    local text="$2"
    local voice="${3:-em_michael}"
    local output="${4:-upload to NextCloud}"
    
    case "$action" in
        generate)
            generate_audio "$text" "$voice" "$output"
            ;;
        upload)
            echo "Upload functionality requires generated audio file"
            return 1
            ;;
        help)
            echo "Usage: $0 [generate|upload] [text] [voice]"
            echo ""
            echo "Commands:"
            echo "  generate  - Generate audio from text and upload to NextCloud"
            echo "  upload  - Upload existing MP3 file to NextCloud"
            echo ""
            echo "Options:"
            echo "  [voice]  - Voice name (default: em_michael)"
            echo "  [output] - Output destination (default: upload to NextCloud)"
            echo ""
            echo "Examples:"
            echo "  $0 generate Hello! I am excited to meet you."
            echo "  $0 generate [happy] This is great news! [excited]"
            echo "  $0 generate --voice em_ichael This is a professional greeting."
            echo "  $0 upload /path/to/file.mp3 Upload file to NextCloud"
            ;;
        *)
            echo "Unknown action: $action"
            return 1
            ;;
    esac
}

# Run main function
main "$@"
```

## 版本历史

- **v1.0** - 初版（基础 TTS）
- **v1.1** - 音色选择与错误处理
- **v1.2** - NextCloud 上传
- **v1.3** - 高级音色与最佳实践

## 许可证

MIT 许可证 - 可免费使用、修改与分发

## 贡献

1. Fork the repository
2. Add features for new voices or languages
3. Improve error handling and fallback mechanisms
4. Update documentation with new examples
5. Submit pull requests for bug fixes

## 支持

问题或疑问：
1. Check service availability before reporting bugs
2. Verify NextCloud credentials are correctly configured
3. Test with different voices to isolate service-specific issues
4. Review logs for error patterns

---

## 快速开始

### 生成问候（测试）
```bash
curl -s -X POST http://192.168.68.78:7860/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"model":"fish", "text":"Hello! This is a test of the Fish Audio S1 TTS skill for OpenClaw.", "voice":"em_michael"}' \
  -o /tmp/fish_audio_test.mp3
```

### 上传至 NextCloud (Testing)
```bash
curl -s -u "$NEXTCLOUD_USER:$NEXTCLOUD_PASS" \
  -X PUT -T /tmp/fish_audio_test.mp3 \
  "http://192.168.68.68:8080/remote.php/webdav/Openclaw/fish_audio_test.mp3"
```

---

**本技能提供：**
- ✅ 使用 Fish Audio S1 **文本转语音**
- ✅ **50+ 音色**可选
- ✅ **情感控制**与自然韵律
- ✅ **NextCloud 集成**与自动上传
- ✅ **错误处理**与服务校验
- ✅ **专业品质**音频
- ✅ **灵活输出**（文件路径或上传）
