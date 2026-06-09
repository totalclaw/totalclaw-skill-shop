'use strict';
const fs = require('fs');
const path = require('path');

const INPUT = require('../../../data/skills/translate-batches/batch-18-input.json');
const EN_DIR = path.join(__dirname, 'en');
const OUT_DIR = path.join(__dirname, 'batch-18');

const CHINESE_SECTION = new Set([5, 7, 13]);

const DESCRIPTIONS = {
  1: 'MAMPE Industrial 智能资产转型与机电一体化专家咨询技能，代表资深工业工程师 Manfred P. Winkler 提供传感器/KI 集成、CAD 设计与 GISA 合规方案。',
  2: '产品营销技能，涵盖定位、GTM 策略、竞争情报与产品发布。适用于 ICP 定义、竞争分析、上市计划与销售赋能，产出定位陈述、战斗卡与上市方案。',
  3: 'DELLIGHT.AI 首席营销官内容运营技能，涵盖内容策略、LinkedIn 活动、品牌声音、视频制作简报、需求生成与思想领袖定位，所有营销活动须关联收入。',
  4: 'DELLIGHT.AI 首席营销官内容运营技能，涵盖内容策略、LinkedIn 活动、品牌声音、视频制作简报、需求生成与思想领袖定位，所有营销活动须关联收入。',
  5: 'MONK-EYE 深度情报技能，渗透全球论坛挖掘隐性知识，通过折射、渗透、蒸馏与综合四阶段输出可执行战略报告。',
  6: '查询股票与加密货币的实时及历史金融数据——价格、市场动态、指标与趋势，用于分析、预警与报告。由 AIsa 驱动。',
  7: '与 EchoDecks 集成，用于抽认卡管理、间隔重复学习会话与 AI 生成卡片/播客。',
  8: '通过 Memos API 创建、读取、删除与列出备忘录的简单接口，支持 OpenClaw 集成与个人知识管理。',
  9: '以「工程即营销」策略通过免费工具获取自然搜索流量并转化为付费客户。适用于零广告预算增长、低竞争关键词工具页规划与优化。',
  10: '为个体创业者构建并执行邮件营销活动，涵盖列表建设、欢迎/培育/销售序列、分段、文案撰写、送达率与指标优化。',
  11: 'BTC15 自主预测市场技能，三个协作智能体使用 USDC 提供流动性、交易与结算，无需人工干预的链上经济闭环。',
  12: 'BTC15 自主预测市场技能，三个协作智能体使用 USDC 提供流动性、交易与结算，无需人工干预的链上经济闭环。',
  13: 'GuavaMemory 面向 OpenClaw 的结构化情景记忆系统，带 Q 值评分，记录成功/失败模式并提升为可复用技能流程。',
  14: '汽车经销商营销专家技能，涵盖库存陈列、VDP 文案、季节性活动、征服广告、售后留存、OEM 联合广告合规创意、本地 SEO 与 BDC 脚本。',
  15: '生成营销活动概念、病毒式钩子与营销策略，应用 PAS、AIDA、JTBD 等框架产出可执行创意方案。',
};

function readEn(n) {
  const files = fs.readdirSync(EN_DIR).filter((f) => f.startsWith(`batch-18-${String(n).padStart(2, '0')}-`) && f.endsWith('.en.txt'));
  if (!files.length) throw new Error(`No en file for ${n}`);
  return fs.readFileSync(path.join(EN_DIR, files[0]), 'utf8');
}

function extractZhSection(text) {
  const marker = '## 中文说明\n';
  const idx = text.indexOf(marker);
  if (idx === -1) throw new Error('Missing ## 中文说明 section');
  return text.slice(idx + marker.length).trimEnd();
}

function escapeBody(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function emitJs(skillId, descriptionZh, bodyZh) {
  return `module.exports = {
  skillId: '${skillId}',
  descriptionZh:
    '${descriptionZh.replace(/'/g, "\\'")}',
  bodyZh: \`${escapeBody(bodyZh)}\`,
};
`;
}

const BODIES_DIR = path.join(OUT_DIR, 'bodies');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(BODIES_DIR, { recursive: true });

function readBody(n) {
  const nn = String(n).padStart(2, '0');
  const f = path.join(BODIES_DIR, `${nn}.bodyzh.md`);
  if (!fs.existsSync(f)) throw new Error(`Missing body file ${f}`);
  return fs.readFileSync(f, 'utf8').trimEnd();
}

for (let i = 0; i < 15; i++) {
  const n = i + 1;
  const nn = String(n).padStart(2, '0');
  const skillId = INPUT[i].skillId;
  const descriptionZh = DESCRIPTIONS[n];
  let bodyZh;
  if (CHINESE_SECTION.has(n)) {
    bodyZh = extractZhSection(readEn(n));
  } else {
    bodyZh = readBody(n);
  }
  if (!/[\u4e00-\u9fff]/.test(descriptionZh)) {
    throw new Error(`descriptionZh must contain CJK for ${nn}`);
  }
  fs.writeFileSync(path.join(OUT_DIR, `${nn}.js`), emitJs(skillId, descriptionZh, bodyZh), 'utf8');
  console.log(`Wrote ${nn}.js`);
}
