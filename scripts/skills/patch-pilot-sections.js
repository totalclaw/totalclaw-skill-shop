'use strict';

/**
 * 为 claude-author 试点技能补齐 polish 标准章节（保留原高质量正文）。
 */

const { MongoClient } = require('mongodb');

const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27018/totalclaw';
const REQUIRED_INSERT = ['边界与约束', '失败模式与规避', '质量标准与验收', '安全与合规', '示例'];

function extractRole(md) {
  const m = /role:\s*"([^"]+)"/.exec(md || '');
  return m ? m[1] : '该岗位';
}

function supplementalSections(roleName) {
  return [
    '',
    '## 边界与约束',
    '',
    `- 仅使用用户授权范围内的数据、渠道与系统；涉及客户/业务敏感信息遵循最小必要原则并脱敏。`,
    `- 聚焦${roleName}职责范围内的工作；超出授权、合规或专业边界的事项先停下来请求确认。`,
    `- 不替用户做出未经授权的对外承诺或操作。`,
    '',
    '## 失败模式与规避',
    '',
    '- **目标未对齐就执行**：先复述目标、约束与验收标准，缺信息则列出待确认问题。',
    '- **步骤跳步或缺证据**：关键结论标注依据来源；无法确认处显式标注假设。',
    '- **范围蔓延**：发现需求扩张时先更新任务边界，再调整计划与交付预期。',
    '',
    '## 质量标准与验收',
    '',
    '- 产出结构清晰，用户可直接批准、修改或继续追问。',
    '- 保留依据来源、待确认问题、责任人与下一步行动，便于追溯。',
    '- 关键结论可追溯到具体输入或证据。',
    '',
    '## 安全与合规',
    '',
    '- 仅使用用户授权范围内的数据与系统；敏感信息脱敏处理。',
    '- 涉及付费闭源内容时，只在授权环境中使用，不把正文转发给未授权运行时。',
    '- 不输出攻击性或危害他人系统的可执行步骤。',
    '',
    '## 示例（输入 → 输出骨架）',
    '',
    `- **输入**：用户提出一个与「${roleName}」相关的具体任务及其约束（时间、资源、合规要求）。`,
    `- **输出**：按上文「输出」清单给出结构化交付物，并附待确认问题与下一步行动建议。`,
  ].join('\n');
}

function patchBody(fullMd, roleName) {
  const idx = fullMd.indexOf('\n## 注意事项');
  if (idx === -1) return null;
  const before = fullMd.slice(0, idx);
  for (const sec of REQUIRED_INSERT) {
    if (new RegExp(`^##\\s*${sec}`, 'm').test(before)) return null;
  }
  return before + supplementalSections(roleName) + fullMd.slice(idx);
}

/** 对仅含核心章节的正文补齐标准章节 */
function patchBodyWithSections(bodyOnly, roleName) {
  if (new RegExp(`^##\\s*边界与约束`, 'm').test(bodyOnly)) return bodyOnly;
  const idx = bodyOnly.indexOf('\n## 注意事项');
  if (idx === -1) return bodyOnly + supplementalSections(roleName);
  return bodyOnly.slice(0, idx) + supplementalSections(roleName) + bodyOnly.slice(idx);
}

async function main() {
  const apply = process.argv.includes('--apply');
  const client = new MongoClient(MONGO_URL);
  await client.connect();
  const col = client.db().collection('skills');

  const docs = await col.find({ kind: 'skill', 'securityAudit.programmatic.refinedBy': 'claude-author' }).toArray();
  let patched = 0; let skipped = 0;

  for (const d of docs) {
    const roleName = extractRole(d.contentMd);
    const newMd = patchBody(d.contentMd, roleName);
    if (!newMd) { skipped++; continue; }
    if (apply) {
      await col.updateOne({ _id: d._id }, {
        $set: {
          contentMd: newMd,
          version: '1.2.1',
          'securityAudit.programmatic.sectionsPatchedAt': new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
        },
      });
    }
    patched++;
  }

  console.log(`试点技能章节补齐: ${patched} 条${apply ? '（已写库）' : '（dry-run）'}，跳过 ${skipped}`);
  await client.close();
}

if (require.main === module) main().catch((e) => { console.error(e); process.exit(1); });

module.exports = { patchBodyWithSections, supplementalSections };
