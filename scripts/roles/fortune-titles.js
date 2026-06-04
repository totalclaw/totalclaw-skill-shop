'use strict';
// 生成「玄学命理」岗位清单 → data/roles/fortune-titles.json，并并入主清单。
const fs = require('fs');
const path = require('path');

const CATEGORY = '玄学命理';
const TITLES = [
  '测字解字师', '八字命理师', '四柱预测师', '奇门遁甲师', '紫微斗数师',
  '六爻预测师', '梅花易数师', '风水堪舆师', '阳宅风水师', '阴宅风水师',
  '塔罗占卜师', '西方占星师', '星座运势分析师', '手相分析师', '面相分析师',
  '姓名学起名师', '宝宝起名师', '公司起名师', '择日择吉师', '黄历择日师',
  '周易咨询师', '易经讲师', '六壬预测师', '太乙神数师', '铁板神算师',
  '生肖运势师', '财运分析师', '婚姻情感占卜师', '事业运势顾问', '号码能量分析师',
  '水晶能量疗愈师', '塔罗牌培训讲师', '命理课程导师', '风水布局顾问', '办公室风水顾问',
  '开运饰品顾问', '梦境解析师', '灵签解签师', '佛道文化顾问', '国学命理顾问',
];

const out = TITLES.map((t) => ({ title: t, category: CATEGORY }));
const dir = path.resolve(__dirname, '../../data/roles');
fs.mkdirSync(dir, { recursive: true });
fs.writeFileSync(path.join(dir, 'fortune-titles.json'), JSON.stringify(out, null, 0));

// 并入主清单（去重）
const mainP = path.join(dir, 'job-titles.json');
let main = [];
try { main = JSON.parse(fs.readFileSync(mainP, 'utf8')); } catch { /* */ }
const seen = new Set(main.map((x) => x.category + '|' + x.title));
let added = 0;
for (const x of out) { const k = x.category + '|' + x.title; if (!seen.has(k)) { main.push(x); seen.add(k); added++; } }
fs.writeFileSync(mainP, JSON.stringify(main, null, 0));
console.log(`玄学命理岗位 ${out.length} 个；并入主清单新增 ${added}（主清单 ${main.length}）`);
