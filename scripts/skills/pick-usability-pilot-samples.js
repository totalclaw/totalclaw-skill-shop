'use strict';

/**
 * 从 414 读稿样本中挑选 30 组「高优先级试点」供人工读稿（W1 启动包）。
 *
 * 优先级：历史 P0 品类 / 高流量品类 / 岗位类型多样性。
 *
 * 用法：
 *   node scripts/skills/pick-usability-pilot-samples.js
 *   node scripts/skills/pick-usability-pilot-samples.js --write
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const SAMPLES_DIR = path.join(ROOT, 'data/skills/usability-samples');
const INDEX = path.join(SAMPLES_DIR, 'index.json');
const OUT_JSON = path.join(ROOT, 'data/skills/usability-pilot-samples.json');
const OUT_SCORES = path.join(ROOT, 'data/skills/usability-manual-scores-pilot.template.json');

/** 优先品类（历史错配高发 + 高流量） */
const PRIORITY_CATEGORIES = [
  '测试与质量',
  '金融与投资',
  '软件开发',
  '隐私与数据合规',
  '矿业与冶金',
  '航运与港口',
  '油气与化工',
  '畜牧与水产',
  '直播电商',
  '医疗与健康',
  '电商运营',
  '物流与供应链',
  '制造与工业',
  '人工智能与大模型',
  '云计算与中间件',
  '客户成功与支持',
  '销售与商务',
  '战略与咨询',
  '法务与合规',
  '政务与公共服务',
  '建筑设计与BIM',
  '汽车与出行',
  '能源与电力',
  '教育科技与培训',
  '游戏与互动娱乐',
  '餐饮与连锁',
  '房地产与物业',
  '人力资源与组织',
  '网络安全',
  '工业互联网',
];

/** 曾出现在 P0 / 审计样例中的角色（精确匹配优先） */
const PRIORITY_ROLES = [
  { role: '冶金出纳', category: '矿业与冶金' },
  { role: '港口润滑工程师', category: '航运与港口' },
  { role: '无障碍测试工程师', category: '测试与质量' },
  { role: '云渗透测试工程师', category: '云计算与中间件' },
  { role: '做市交易员', category: '金融与投资' },
  { role: '环卫保洁员', category: '政务与公共服务' },
  { role: '水产养殖税务专员', category: '畜牧与水产' },
  { role: '直播财务专员', category: '直播与短视频' },
  { role: '隐私合规主任', category: '隐私与数据合规' },
  { role: '物流智能化专家', category: '物流与供应链' },
];

const TARGET = 30;

function main() {
  const write = process.argv.includes('--write');
  if (!fs.existsSync(INDEX)) {
    console.error('缺少 index.json，请先运行 audit-skill-usability-sample.js --per-category 5');
    process.exit(1);
  }

  const { 索引: all = [] } = JSON.parse(fs.readFileSync(INDEX, 'utf8'));
  const byKey = new Map(all.map((x) => [`${x.role}|||${x.category}`, x]));
  const picked = [];
  const usedKeys = new Set();

  const take = (entry, reason) => {
    const k = `${entry.role}|||${entry.category}`;
    if (usedKeys.has(k)) return false;
    usedKeys.add(k);
    picked.push({ ...entry, 优先原因: reason });
    return true;
  };

  for (const pr of PRIORITY_ROLES) {
    if (picked.length >= TARGET) break;
    const k = `${pr.role}|||${pr.category}`;
    const hit = byKey.get(k);
    if (hit) take(hit, '历史审计/P0相关角色');
    else {
      const fuzzy = all.find((x) => x.category === pr.category && x.role.includes(pr.role.slice(0, 4)));
      if (fuzzy) take(fuzzy, `品类匹配(${pr.role})`);
    }
  }

  for (const cat of PRIORITY_CATEGORIES) {
    if (picked.length >= TARGET) break;
    const hit = all.find((x) => x.category === cat && !usedKeys.has(`${x.role}|||${x.category}`));
    if (hit) take(hit, '高优先级品类');
  }

  for (const x of all) {
    if (picked.length >= TARGET) break;
    if (picked.some((p) => p.category === x.category)) continue;
    take(x, '品类补齐');
  }
  for (const x of all) {
    if (picked.length >= TARGET) break;
    take(x, '样本补齐');
  }

  const report = {
    生成时间: new Date().toISOString(),
    目标数: TARGET,
    实际数: picked.length,
    说明: '人工读稿 W1 试点：填 usability-manual-scores-pilot.json 后运行 score-usability-manual.js --pilot',
    样本: picked,
  };

  console.log('=== 高优先级读稿试点（30 组）===');
  console.log(JSON.stringify({ 数量: picked.length, 品类覆盖: [...new Set(picked.map((p) => p.category))].length }, null, 2));
  console.log('\n清单:');
  for (const p of picked) {
    console.log(`  [${p.category}] ${p.role}  ← ${p.优先原因}`);
  }

  if (write) {
    fs.writeFileSync(OUT_JSON, JSON.stringify(report, null, 2), 'utf8');
    fs.writeFileSync(OUT_SCORES, JSON.stringify({
      说明: 'W1 试点 30 组；复制为 usability-manual-scores-pilot.json 填写',
      评分维度: ['A岗位准确', 'B蓝图匹配', 'C可执行性', 'D示例质量', 'E运行时互补'],
      分数: picked.map((p) => ({
        category: p.category,
        role: p.role,
        file: p.file,
        优先原因: p.优先原因,
        scores: { A: null, B: null, C: null, D: null, E: null },
        备注: '',
      })),
    }, null, 2), 'utf8');
    console.log('\n已写入:', OUT_JSON);
    console.log('打分模板:', OUT_SCORES);
  }

  process.exit(picked.length >= TARGET ? 0 : 1);
}

main();
