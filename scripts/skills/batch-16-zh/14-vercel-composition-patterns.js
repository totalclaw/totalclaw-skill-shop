module.exports = {
  skillId: 'totalclaw:totalclaw~vercel-composition-patterns',
  descriptionZh:
    '可扩展的 React 组合模式。适用于重构布尔 prop 泛滥的组件、构建灵活组件库或设计可复用 API。涉及复合组件、render props、Context Provider 或组件架构时触发。包含 React 19 API 变更。',
  bodyZh: `# React 组合模式

用于构建灵活、可维护 React 组件的组合模式。通过复合组件、状态提升与内部组合，避免布尔 prop 泛滥。这些模式使代码库在规模扩大时更便于人类与 AI 智能体协作。

## 何时应用

在以下场景参考本指南：

- 重构拥有大量布尔 prop 的组件
- 构建可复用组件库
- 设计灵活的组件 API
- 评审组件架构
- 使用复合组件或 Context Provider

## 规则分类（按优先级）

| 优先级 | 分类 | 影响 | 前缀 |
| -------- | ----------------------- | ------ | --------------- |
| 1 | 组件架构 | 高 | \`architecture-\` |
| 2 | 状态管理 | 中 | \`state-\` |
| 3 | 实现模式 | 中 | \`patterns-\` |
| 4 | React 19 API | 中 | \`react19-\` |

## 快速参考

### 1. 组件架构（高）

- \`architecture-avoid-boolean-props\` - 不要用布尔 prop 定制行为；使用组合
- \`architecture-compound-components\` - 用共享 context 组织复杂组件

### 2. 状态管理（中）

- \`state-decouple-implementation\` - Provider 是唯一知道状态如何管理的地方
- \`state-context-interface\` - 定义含 state、actions、meta 的通用接口以支持依赖注入
- \`state-lift-state\` - 将状态移入 Provider 组件供兄弟节点访问

### 3. 实现模式（中）

- \`patterns-explicit-variants\` - 创建显式变体组件，而非布尔模式
- \`patterns-children-over-render-props\` - 用 children 组合，而非 renderX props

### 4. React 19 API（中）

> **⚠️ 仅 React 19+。** 若使用 React 18 或更早版本，跳过本节。

- \`react19-no-forwardref\` - 不要使用 \`forwardRef\`；用 \`use()\` 替代 \`useContext()\`

## 如何使用

阅读各规则文件获取详细说明与代码示例：

\`\`\`
rules/architecture-avoid-boolean-props.md
rules/state-context-interface.md
\`\`\`

每个规则文件包含：

- 简要说明其重要性
- 错误示例及解释
- 正确示例及解释
- 附加上下文与参考

## 完整编译文档

所有规则展开后的完整指南：\`AGENTS.md\`
`,
};
