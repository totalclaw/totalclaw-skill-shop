module.exports = {
  skillId: 'totalclaw:totalclaw~hugosbl-deploy-kit',
  descriptionZh:
    'Web 部署工具包，通过 Vercel、Railway、Supabase CLI 简化应用部署、数据库创建、托管配置与环境变量管理。',
  bodyZh: `# Deploy Kit — Web 部署技能

通过 **Vercel**、**Railway** 与 **Supabase** 的 CLI 简化 Web 应用部署。

## 何时使用

用户要求部署应用、创建数据库、配置托管，或在这些平台上管理环境变量时使用。

## 主工作流

### 1. 检测项目

\`\`\`bash
python3 skills/deploy-kit/scripts/deploy.py detect <路径>
\`\`\`

返回：框架、语言、发现的关键文件。

### 2. 检查可用 CLI

\`\`\`bash
python3 skills/deploy-kit/scripts/deploy.py check
\`\`\`

若缺少 CLI，引导安装（见参考文档）。

### 3. 推荐平台

\`\`\`bash
python3 skills/deploy-kit/scripts/deploy.py recommend <路径>
\`\`\`

| 项目类型 | 推荐平台 |
|---|---|
| 静态前端 / SSR（Next、Astro、Vite、Svelte、Nuxt） | **Vercel** |
| 后端 / API（Express、Flask、FastAPI、Django） | **Railway** |
| 全栈应用 + 数据库 | **Railway** + **Supabase** |
| 数据库 / 认证 / 存储 / Edge Functions | **Supabase** |

### 4. 部署

\`\`\`bash
python3 skills/deploy-kit/scripts/deploy.py deploy <路径> --platform <vercel|railway|supabase>
\`\`\`

⚠️ **部署前必须征求用户确认。** 脚本也会进行交互式确认。

## 项目检测规则

| 发现的文件 | 检测到的框架 |
|---|---|
| \`next.config.*\` | Next.js |
| \`astro.config.*\` | Astro |
| \`vite.config.*\` | Vite |
| \`svelte.config.*\` | SvelteKit |
| \`nuxt.config.*\` | Nuxt |
| \`remix.config.*\` / \`app/root.tsx\` | Remix |
| \`angular.json\` | Angular |
| \`requirements.txt\` / \`Pipfile\` | Python |
| \`manage.py\` | Django |
| \`package.json\` → scripts.start | Node.js 应用 |
| \`Dockerfile\` | Docker（Railway） |
| \`supabase/config.toml\` | Supabase 项目 |

## 环境变量

- **Vercel**：\`vercel env add VAR_NAME\` 或通过控制台
- **Railway**：\`railway variables set NAME=VALUE\`
- **Supabase**：通过 \`supabase secrets set NAME=VALUE\` 设置密钥

部署前务必检查 \`.env\` / \`.env.local\` 中的现有变量。

## 自定义域名

- **Vercel**：\`vercel domains add mydomain.com\`
- **Railway**：\`railway domain\`（生成子域名），自定义域名通过控制台

## 详细参考

按平台按需加载：

- \`skills/deploy-kit/references/vercel.md\` — Vercel CLI 完整参考
- \`skills/deploy-kit/references/railway.md\` — Railway CLI 完整参考
- \`skills/deploy-kit/references/supabase.md\` — Supabase CLI 完整参考

## 快速命令

| 操作 | 命令 |
|---|---|
| Vercel 预览部署 | \`vercel\` |
| Vercel 生产部署 | \`vercel --prod\` |
| Railway 部署 | \`railway up\` |
| Supabase 推送数据库 | \`supabase db push\` |
| 部署 Edge Function | \`supabase functions deploy <name>\` |
| 查看日志 | \`vercel logs <url>\` / \`railway logs\` |
| 列出项目 | \`vercel ls\` / \`railway list\` |

## 智能体规则

1. **未经用户明确确认绝不部署**
2. 推荐前始终检测项目
3. 确认 CLI 已安装且已认证
4. 需要高级命令时加载平台详细参考
5. 生产前先建议预览部署
6. 若项目超出免费额度，说明潜在费用
`,
};
