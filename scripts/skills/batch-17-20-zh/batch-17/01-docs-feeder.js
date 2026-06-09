module.exports = {
  skillId: 'totalclaw:totalclaw~zerone0x-docs-feeder',
  descriptionZh:
    '自动拉取项目文档并注入 AI 智能体上下文，用于调试与学习。支持 50+ 内置项目注册表、llms.txt 优先抓取与智能发现未知文档站点。',
  bodyZh: `# Docs Feeder

自动拉取项目文档并注入你的 AI 智能体，用于调试与学习。

## 触发词

- \`docs feed <project>\`
- \`fetch docs <URL>\`

## 工作原理

1. **注册表查询** — 50+ 内置项目（React、Next.js、Hono、Prisma、Anthropic 等）
2. **抓取优先级：**
   - \`/llms-full.txt\` → 完整 LLM 友好文档
   - \`/llms.txt\` → 精简版
   - GitHub README → 回退方案
3. **智能发现** — 未知项目尝试常见模式（\`docs.xxx.com\`、\`xxx.dev\`）
4. **体积警告** — 文档超过 500KB 时提醒

## 用法

\`\`\`bash
# 按项目名（自动查表）
node fetch-docs.js nextjs

# 按 URL（直接抓取）
node fetch-docs.js https://docs.anthropic.com

# 仅原始内容（无元数据头）
node fetch-docs.js react --raw

# 保存到文件
node fetch-docs.js prisma --save

# 列出所有支持的项目
node fetch-docs.js --list
\`\`\`

## 内置注册表

50+ 项目，包括：React、Next.js、Vue、Svelte、Astro、Hono、Express、Fastify、NestJS、Prisma、Drizzle、tRPC、Zod、Tailwind CSS、shadcn/ui、TypeScript、Vite、Bun、Deno、Playwright、Vitest、Supabase、Stripe、Clerk、Anthropic、OpenAI、LangChain、Docker、Kubernetes、Terraform、Rust、Go、Python、FastAPI、Django 等。

编辑 \`docs-registry.json\` 可添加自定义项目。

## 注册表格式

\`\`\`json
{
  "myproject": {
    "url": "https://myproject.dev",
    "llms": "/llms-full.txt",
    "github": "org/repo",
    "local": "/path/to/local/docs"
  }
}
\`\`\`

## 工作流

先抓取文档，再描述你的问题：

\`\`\`
→ node fetch-docs.js nextjs
→ [文档已加载到上下文]

"我在 App Router 里遇到 hydration mismatch 错误..."
→ [AI 基于完整文档给出解决方案]
\`\`\`

## 为何有效

多数现代文档站提供 \`/llms.txt\` 或 \`/llms-full.txt\` — 单文件包含面向 LLM 格式化的完整知识库。无需手动搜索、阅读、理解文档，将整个知识库注入上下文，让 AI 交叉引用即可。

## 要求

- Node.js（无外部依赖）`,
};
