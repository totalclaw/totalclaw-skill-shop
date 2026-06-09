module.exports = {
  skillId: 'totalclaw:totalclaw~manikal-hide-my-email',
  descriptionZh:
    '从终端生成 Apple iCloud+「隐藏我的电子邮件」地址，生成的地址会自动复制到剪贴板。',
  bodyZh: `# Hide My Email CLI

从终端生成 Apple iCloud+「隐藏我的电子邮件」（Hide My Email）地址。生成的地址会自动复制到剪贴板。

## 用法

\`\`\`bash
hme <label> [note]
\`\`\`

- **label**（必填）：地址标签（例如你注册的服务名称）
- **note**（可选）：地址的描述或提醒

## 示例

\`\`\`bash
# 创建标签为 "Twitter" 的地址
hme "Twitter"

# 创建带备注的地址
hme "Shopping" "For online orders"
\`\`\`

## 输出

成功时，打印掩码邮箱并将完整地址复制到剪贴板：

\`\`\`
✓ abc****@icloud.com (copied to clipboard)
\`\`\`

失败时，向 stderr 打印错误信息并以非零状态码退出。

## 要求

- 已订阅 iCloud+ 的 macOS
- 已在系统设置中为终端应用授予辅助功能权限`,
};
