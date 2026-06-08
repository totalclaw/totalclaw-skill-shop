'use strict';

/**
 * 导出人工读稿样本：每品类 N 个角色 × 8 条 skill 摘要。
 *
 * 用法：
 *   node scripts/skills/audit-skill-usability-sample.js --per-category 5
 *   node scripts/skills/audit-skill-usability-sample.js --per-category 5 --out data/skills/usability-samples
 */

const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
const { classifyP0, extractKeyDuties } = require('./scan-p0-role-skills');
const { isGenericDuty } = require('./role-duty-helpers');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const BATCH_BY = 'complete-totalclaw-agent-role-skills';

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i !== -1 ? process.argv[i + 1] : d;
};

function summarizeSkill(md) {
  const when = md.match(/## 何时使用\n\n([\s\S]*?)\n\n##/)?.[1]?.trim().slice(0, 200) || '';
  const steps = (md.match(/^\d+\.\s.+$/gm) || []).slice(0, 5);
  const keys = extractKeyDuties(md);
  const genericKeys = keys.filter(isGenericDuty).length;
  return { when, steps, keyDuties: keys, genericKeyCount: genericKeys };
}

async function main() {
  const perCat = Number(arg('per-category', 5));
  const outDir = path.resolve(arg('out', path.join(__dirname, '../../data/skills/usability-samples')));
  fs.mkdirSync(outDir, { recursive: true });

  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const byCat = new Map();
  const cur = col.find(
    { kind: 'skill', 'securityAudit.programmatic.by': BATCH_BY },
    { projection: { name: 1, category: 1, contentMd: 1, skillId: 1, version: 1 } },
  );
  while (await cur.hasNext()) {
    const d = await cur.next();
    const cat = d.category || /category:\s*"([^"]+)"/.exec(d.contentMd || '')?.[1] || '未知';
    const role = /role:\s*"([^"]+)"/.exec(d.contentMd || '')?.[1] || '';
    if (!role) continue;
    const rk = `${role}|||${cat}`;
    if (!byCat.has(cat)) byCat.set(cat, new Map());
    if (!byCat.get(cat).has(rk)) byCat.get(cat).set(rk, { role, category: cat, skills: [] });
    byCat.get(cat).get(rk).skills.push(d);
  }

  const index = [];
  let fileCount = 0;

  for (const [cat, roleMap] of [...byCat.entries()].sort((a, b) => a[0].localeCompare(b[0], 'zh'))) {
    const roles = [...roleMap.values()].sort((a, b) => a.role.localeCompare(b.role, 'zh'));
    const picks = roles.slice(0, perCat);
    for (const pick of picks) {
      const roleDoc = await col.findOne(
        { kind: 'role', name: pick.role, category: pick.category },
        { projection: { contentMd: 1 } },
      );
      const duties = pick.skills[0] ? extractKeyDuties(pick.skills[0].contentMd || '') : [];
      const p0Reasons = classifyP0(pick.role, pick.category, duties, roleDoc);

      const lines = [
        `# 读稿样本：${pick.role} @ ${pick.category}`,
        '',
        `- skill 数：${pick.skills.length}`,
        `- P0 标记：${p0Reasons.length ? p0Reasons.join(', ') : '无'}`,
        `- 版本：${pick.skills[0]?.version || '?'}`,
        '',
        '## 人工打分（1-5，留空待填）',
        '',
        '| 维度 | 分数 | 备注 |',
        '|------|------|------|',
        '| A 岗位准确 | | |',
        '| B 蓝图匹配 | | |',
        '| C 可执行性 | | |',
        '| D 示例质量 | | |',
        '| E 运行时互补 | | |',
        '',
      ];

      for (const sk of pick.skills.sort((a, b) => a.name.localeCompare(b.name, 'zh'))) {
        const sum = summarizeSkill(sk.contentMd || '');
        lines.push(`---`, '', `### ${sk.name}`, '', `skillId: \`${sk.skillId}\``, '');
        lines.push('**何时使用（摘录）**', '', sum.when, '');
        lines.push('**岗位关键动作**', '', ...sum.keyDuties.map((k) => `- ${k}`), '');
        lines.push('**步骤（前5）**', '', ...sum.steps.map((s) => `- ${s}`), '');
        lines.push('');
      }

      const fname = `${String(cat).replace(/[/\\?%*:|"<>]/g, '_')}_${pick.role.replace(/[/\\?%*:|"<>]/g, '_')}.md`;
      fs.writeFileSync(path.join(outDir, fname), lines.join('\n'), 'utf8');
      fileCount++;
      index.push({ category: cat, role: pick.role, file: fname, p0: p0Reasons });
    }
  }

  fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify({
    生成时间: new Date().toISOString(),
    品类数: byCat.size,
    样本角色数: index.length,
    每品类: perCat,
    索引: index,
  }, null, 2), 'utf8');

  fs.writeFileSync(path.join(outDir, '../usability-manual-scores.template.json'), JSON.stringify({
    说明: '复制为 usability-manual-scores.json 并填写分数',
    评分维度: ['A岗位准确', 'B蓝图匹配', 'C可执行性', 'D示例质量', 'E运行时互补'],
    分数: index.map((i) => ({
      category: i.category,
      role: i.role,
      file: i.file,
      p0: i.p0,
      scores: { A: null, B: null, C: null, D: null, E: null },
      备注: '',
    })),
  }, null, 2), 'utf8');

  console.log(`导出完成：${byCat.size} 品类，${index.length} 角色样本，${fileCount} 文件 → ${outDir}`);
  await client.close();
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}
