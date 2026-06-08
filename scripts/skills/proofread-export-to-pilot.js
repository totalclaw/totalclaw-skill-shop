'use strict';

/**
 * 将 DeepSeek 导出 JSON 经编码修复 + 轻量校对后，写入 pilot-bodies.json 供 import-pilot-refine 导入。
 * 用法：node scripts/skills/proofread-export-to-pilot.js
 */

const fs = require('fs');
const path = require('path');

const EXPORT = path.resolve(__dirname, '../../data/skills/pilot-refine/export-4roles-deepseek.json');
const OUT = path.resolve(__dirname, '../../data/skills/pilot-refine/pilot-bodies.json');

/** 按上下文修复 UTF-8 乱码（U+FFFD） */
function fixEncoding(text) {
  let s = String(text);
  const pairs = [
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
  ];
  for (const [re, rep] of pairs) s = s.replace(re, rep);
  // 兜底：删除残余单字符乱码（极少见）
  if (s.includes('\uFFFD')) {
    s = s.replace(/\uFFFD+/g, '');
  }
  return s;
}

/** 语义校对：统一术语、删冗余套话 */
function proofreadBody(body, role, suffix) {
  let s = fixEncoding(body);
  // 期货：统一术语
  if (role === '期货分析师') {
    s = s.replace(/Bloomberg/g, 'Wind/彭博');
  }
  // 年金：强调受托/负债端
  if (role === '年金投资经理') {
    s = s.replace(/普通基金/g, '年金组合');
  }
  // 能源研究员：强调覆盖范围
  if (role === '能源行业研究员') {
    s = s.replace(/新能源/g, '新能源（风光储）');
  }
  // SaaS：MEDDIC/CRM 口径
  if (role === 'SaaS销售代表' && suffix === '信息收集与证据台账') {
    if (!/MEDDIC|BANT/.test(s)) {
      s = s.replace('## 步骤', '## 步骤\n\n> 建议按 MEDDIC（Metrics/Economic buyer/Decision criteria/Decision process/Identify pain/Champion）或 BANT 框架整理证据台账。\n');
    }
  }
  return s.trim();
}

function main() {
  const data = JSON.parse(fs.readFileSync(EXPORT, 'utf8'));
  const out = [];
  let fixed = 0;
  for (const r of data) {
    const skills = [];
    for (const sk of r.skills) {
      const before = (sk.body.match(/\uFFFD/g) || []).length;
      const body = proofreadBody(sk.body, r.role, sk.suffix);
      const after = (body.match(/\uFFFD/g) || []).length;
      if (before > 0) fixed += before - after;
      skills.push({ suffix: sk.suffix, desc: sk.desc, body });
    }
    out.push({ role: r.role, category: r.category, skills });
  }
  fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8');
  console.log(`写入 ${OUT}`);
  console.log(`角色 ${out.length}，技能 ${out.reduce((n, x) => n + x.skills.length, 0)}，修复乱码 ${fixed} 处`);
  const remain = out.reduce((n, r) => n + r.skills.filter((s) => s.body.includes('\uFFFD')).length, 0);
  if (remain) console.warn('仍有乱码的技能条数:', remain);
}

main();
