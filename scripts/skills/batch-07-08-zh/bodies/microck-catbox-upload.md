# Catbox/Litterbox 文件上传

将文件上传至 catbox.moe（永久）或 litterbox.catbox.moe（临时）。

## 用法

上传至 Litterbox（临时，推荐）：
```bash
python upload.py /path/to/file.mp4
python upload.py /path/to/file.mp4 --time 24h
```

上传至 Catbox（永久）：
```bash
python upload.py /path/to/file.png --service catbox --userhash YOUR_HASH
```

## 选项

- `--service`：`litterbox`（默认）或 `catbox`
- `--time`：Litterbox 过期时间：`1h`、`12h`、`24h`、`72h`（默认 `24h`）
- `--userhash`：Catbox 账户 hash（可选，追踪上传时需要）

## 限制

| 服务 | 最大体积 | 有效期 |
|---------|----------|----------|
| Litterbox | 1 GB | 1h - 72h |
| Catbox | 200 MB | 永久 |

## 返回

成功时返回已上传文件的 URL。
