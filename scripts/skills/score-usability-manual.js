'use strict';

/**
 * 汇总人工读稿打分（data/skills/usability-manual-scores.json）。
 *
 * 用法：
 *   node scripts/skills/score-usability-manual.js
 *   node scripts/skills/score-usability-manual.js --write
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const TEMPLATE = path.join(ROOT, 'data/skills/usability-manual-scores.template.json');
const SCORES = path.join(ROOT, 'data/skills/usability-manual-scores.json');
const PILOT_SCORES = path.join(ROOT, 'data/skills/usability-manual-scores-pilot.json');
const PILOT_TEMPLATE = path.join(ROOT, 'data/skills/usability-manual-scores-pilot.template.json');
const OUT = path.join(ROOT, 'data/skills/usability-manual-scores-report.json');

const DIMS = ['A', 'B', 'C', 'D', 'E'];
const DIM_LABELS = {
  A: '岗位准确',
  B: '蓝图匹配',
  C: '可执行性',
  D: '示例质量',
  E: '运行时互补',
};

function loadScores() {
  const pilot = process.argv.includes('--pilot');
  if (pilot) {
    const p = fs.existsSync(PILOT_SCORES) ? PILOT_SCORES : PILOT_TEMPLATE;
    if (!fs.existsSync(p)) {
      console.error('缺少试点打分文件。请先运行: node scripts/skills/pick-usability-pilot-samples.js --write');
      process.exit(1);
    }
    return { data: JSON.parse(fs.readFileSync(p, 'utf8')), path: p, pilot: true };
  }
  const p = fs.existsSync(SCORES) ? SCORES : TEMPLATE;
  if (!fs.existsSync(p)) {
    console.error('未找到打分文件。请先运行: node scripts/skills/audit-skill-usability-sample.js --per-category 5');
    process.exit(1);
  }
  return { data: JSON.parse(fs.readFileSync(p, 'utf8')), path: p, pilot: false };
}

function avg(nums) {
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function main() {
  const write = process.argv.includes('--write');
  const { data, path: srcPath, pilot } = loadScores();
  const rows = data.分数 || data.scores || [];

  const report = {
    生成时间: new Date().toISOString(),
    来源: path.relative(ROOT, srcPath),
    模式: pilot ? 'W1试点30组' : '全量414组',
    样本总数: rows.length,
    已填完: 0,
    部分填写: 0,
    未填写: 0,
    维度均分: {},
    总体均分: null,
    低分样本: [],
    按品类: {},
  };

  const dimVals = Object.fromEntries(DIMS.map((d) => [d, []]));
  const overall = [];

  for (const row of rows) {
    const scores = row.scores || row.分数 || {};
    const filled = DIMS.filter((d) => typeof scores[d] === 'number' && scores[d] >= 1 && scores[d] <= 5);
    if (filled.length === 0) {
      report.未填写++;
      continue;
    }
    if (filled.length < DIMS.length) report.部分填写++;
    else report.已填完++;

    const rowAvg = avg(filled.map((d) => scores[d]));
    if (rowAvg != null) overall.push(rowAvg);

    for (const d of filled) dimVals[d].push(scores[d]);

    const cat = row.category || row.品类 || '未知';
    if (!report.按品类[cat]) report.按品类[cat] = { 样本: 0, 均分: [] };
    report.按品类[cat].样本++;
    if (rowAvg != null) report.按品类[cat].均分.push(rowAvg);

    if (filled.length === DIMS.length && rowAvg < 4) {
      report.低分样本.push({
        category: cat,
        role: row.role || row.角色,
        均分: Number(rowAvg.toFixed(2)),
        scores,
        备注: row.备注 || row.note || '',
      });
    }
  }

  for (const d of DIMS) {
    const v = avg(dimVals[d]);
    report.维度均分[DIM_LABELS[d]] = v != null ? Number(v.toFixed(2)) : null;
  }
  report.总体均分 = overall.length ? Number(avg(overall).toFixed(2)) : null;

  for (const [cat, info] of Object.entries(report.按品类)) {
    info.均分 = info.均分.length ? Number(avg(info.均分).toFixed(2)) : null;
  }

  report.通过 = report.已填完 === report.样本总数
    && report.总体均分 != null
    && report.总体均分 >= 4
    && report.低分样本.length === 0;

  console.log('=== 人工读稿打分汇总 ===');
  console.log(JSON.stringify({
    来源: report.来源,
    样本: report.样本总数,
    已填完: report.已填完,
    部分填写: report.部分填写,
    未填写: report.未填写,
    总体均分: report.总体均分,
    维度均分: report.维度均分,
    低分样本数: report.低分样本.length,
    人工验收通过: report.通过 ? '✅' : '❌（待填完或均分<4）',
  }, null, 2));

  if (report.低分样本.length) {
    console.log('\n低分样本（<4.0）:', report.低分样本.slice(0, 10));
  }

  if (write) {
    fs.writeFileSync(OUT, JSON.stringify(report, null, 2), 'utf8');
    console.log('\n已写入:', OUT);
  }

  process.exit(report.通过 ? 0 : 1);
}

main();
