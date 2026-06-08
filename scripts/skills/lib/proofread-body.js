'use strict';

/** 共享校对逻辑：编码修复 + 轻量正文规范化（不调用外部 LLM） */

const ENCODING_PAIRS = [
  [/与\uFFFD+仓/g, '与持仓'],
  [/3\uFFFD+要素/g, '3个要素'],
  [/领\uFFFD+/g, '领域'],
  [/模型\uFFFD+算/g, '模型运算'],
  [/触\uFFFD+上报/g, '触发上报'],
  [/双人\uFFFD+字/g, '双人签字'],
  [/对\uFFFD+后/g, '对冲后'],
  [/交易\uFFFD+束/g, '交易结束'],
  [/做多XX\uFFFD+约/g, '做多XX合约'],
  [/模糊\uFFFD+带/g, '模糊地带'],
  [/要求\uFFFD+留/g, '要求保留'],
  [/本技\uFFFD+/g, '本技能'],
  [/根据\uFFFD+入/g, '根据输入'],
  [/时\uFFFD+戳/g, '时间戳'],
  [/回\uFFFD+验证/g, '回归验证'],
  [/人工\uFFFD+理/g, '人工处理'],
  [/展望与\uFFFD+略/g, '展望与策略'],
  [/吨）作\uFFFD+支撑/g, '吨）作为支撑'],
  [/避免\uFFFD+用/g, '避免使用'],
  [/无\uFFFD+何/g, '无任何'],
  [/未触发止\uFFFD+/g, '未触发止损'],
  [/^-\s*\uFFFD+动项/m, '- 行动项'],
  [/类别\uFFFD+如/g, '类别（如'],
  [/完成\uFFFD+平衡/g, '完成再平衡'],
  [/复核）\uFFFD+并/g, '复核），并'],
  [/排期\uFFFD+暂停/g, '排期需暂停'],
  [/3月15日\uFFFD+/g, '3月15日前'],
  [/汇总\uFFFD+资产/g, '汇总各资产'],
  [/数据\uFFFD+行录入/g, '数据并行录入'],
  [/只读权限\uFFFD+仅/g, '只读权限，仅'],
  [/情景下的\uFFFD+代/g, '情景下的代'],
  [/5\.0%\uFFFD+CPI/g, '5.0%，CPI'],
  [/风\uFFFD+管理/g, '风险管理'],
  [/输出格\uFFFD+（/g, '输出格式（'],
  [/工具\uFFFD+用清单/g, '工具调用清单'],
  [/团队\uFFFD+识库/g, '团队知识库'],
  [/复盘报\uFFFD+出具/g, '复盘报告出具'],
  [/公司公告）\uFFFD+/g, '公司公告）。'],
  [/里\uFFFD+碑/g, '里程碑'],
  [/研究计划\uFFFD+的/g, '研究计划的'],
  [/撰写\uFFFD+业专题/g, '撰写行业专题'],
  [/原油\uFFFD+货价格/g, '原油现货价格'],
  [/俄\uFFFD+冲突/g, '俄乌冲突'],
  [/上\uFFFD+合规部门/g, '上报合规部门'],
  [/成交量\uFFFD+机构/g, '成交量、机构'],
  [/报告》，\uFFFD+含/g, '报告》，包含'],
  [/附\uFFFD+支持依据/g, '附数据支持依据'],
  [/增长幅\uFFFD+应与/g, '增长幅度应与'],
  [/产能规\uFFFD+、/g, '产能规划、'],
  [/提示\uFFFD+，/g, '提示词，'],
  [/连接失败\uFFFD+若/g, '连接失败**：若'],
  [/运行\uFFFD+型/g, '运行模型'],
  [/关\uFFFD+变化/g, '关键变化'],
  [/盈利\uFFFD+望触底/g, '盈利能力有望触底'],
  [/实际数\uFFFD+，/g, '实际数据，'],
  [/Q1"\uFFFD+同时/g, 'Q1"；同时'],
  [/步骤3中\uFFFD+入/g, '步骤3中加入'],
  [/105亿\uFFFD+，/g, '105亿元，'],
  [/未\uFFFD+虑/g, '未考虑'],
  [/回答\uFFFD+并确认/g, '回答，并确认'],
  [/需\uFFFD+澄清文档/g, '需求澄清文档'],
  [/当前\uFFFD+段/g, '当前阶段'],
  [/调研问\uFFFD+、/g, '调研问卷、'],
  [/方案演示"\uFFFD+谈判/g, '方案演示""谈判'],
  [/对比分\uFFFD+表/g, '对比分析表'],
  [/技\uFFFD+支持/g, '技术支持'],
  [/标记\uFFFD+修正/g, '标记待修正'],
  [/ABC公\uFFFD+，/g, 'ABC公司，'],
  [/交\uFFFD+物/g, '交付物'],
  [/摘要邮\uFFFD+/g, '摘要邮件'],
  [/为何\uFFFD+做了什么/g, '为何、做了什么'],
  [/补\uFFFD+视角/g, '补充视角'],
  [/不当承诺）\uFFFD+应/g, '不当承诺）**，应'],
  [/数字\uFFFD+行产品经理/g, '数字银行产品经理'],
  [/实时\uFFFD+价优化师/g, '实时竞价优化师'],
  [/\uFFFD+时竞价优化师/g, '实时竞价优化师'],
  [/行\uFFFD+产品经理/g, '银行产品经理'],
];

function fixEncoding(text) {
  let s = String(text || '');
  for (const [re, rep] of ENCODING_PAIRS) s = s.replace(re, rep);
  if (s.includes('\uFFFD')) s = s.replace(/\uFFFD+/g, '');
  return s;
}

function extractRoleFromMd(md) {
  return /role:\s*"([^"]+)"/.exec(md || '')?.[1] || '';
}

function extractBody(md) {
  return (md || '').replace(/^---[\s\S]*?---\n\n#[^\n]+\n\n/, '').trim();
}

function extractFrontmatter(md) {
  const m = /^---\n([\s\S]*?)\n---/.exec(md || '');
  return m ? m[0] : null;
}

/** 轻量正文校对：编码 + 去 DeepSeek 残留 + 补注意事项 */
function proofreadBody(body, roleName, suffix) {
  let s = fixEncoding(body);
  s = s.replace(/```(?:markdown|md)?/gi, '').trim();
  if (!/^##\s*注意事项/m.test(s)) {
    s += '\n\n## 注意事项\n\n- 涉及敏感信息时遵循最小必要原则并脱敏留痕。\n- 超出授权范围或不确定的操作先停下来请求确认。\n';
  }
  if (roleName && !s.includes(roleName)) {
    const core = roleName.replace(/(工程师|架构师|设计师|分析师|工程|师|员|经理|专员|主管|总监|顾问|代表|专家|官|长|助理|策划|运营|开发|测试)$/, '').trim();
    if (core.length >= 2 && s.includes(core)) { /* ok */ }
    else if (/^##\s*何时使用/m.test(s)) {
      s = s.replace(/^##\s*何时使用/m, `## 何时使用\n\n本技能供${roleName}在「${suffix}」环节使用。`);
    }
  }
  return s.trim();
}

function proofreadContentMd(contentMd, roleName, suffix, skillName) {
  const fm = extractFrontmatter(contentMd);
  if (!fm) return null;
  const fixedRole = fixEncoding(roleName);
  const fixedName = fixEncoding(skillName);
  let fmFixed = fixEncoding(fm);
  if (fixedRole && fmFixed.includes('\uFFFD') === false) {
    fmFixed = fmFixed.replace(/role:\s*"[^"]+"/, `role: "${fixedRole}"`);
  }
  const body = proofreadBody(extractBody(contentMd), fixedRole, suffix);
  return {
    contentMd: `${fmFixed}\n\n# ${fixedName}\n\n${body}\n`,
    name: fixedName,
    roleName: fixedRole,
    description: fixEncoding(/description:\s*"([^"]+)"/.exec(fmFixed)?.[1] || ''),
  };
}

function hasCorruption(text) {
  return String(text || '').includes('\uFFFD');
}

module.exports = {
  ENCODING_PAIRS,
  fixEncoding,
  extractRoleFromMd,
  extractBody,
  extractFrontmatter,
  proofreadBody,
  proofreadContentMd,
  hasCorruption,
};
