'use strict';
/**
 * 投毒 / 已下架技能清单 + 内容指纹（IOC）。
 * 来源：2026-11-02《totalclaw-skill-shop 有毒 Skill 排查》第一~三节 + totalclaw-skills@ac6c1db5 下架清单。
 * ClawSkills / SkillDB / GitHub(LeoYeAI/openclaw-master-skills) 都是 ClawHub 镜像，同一投毒内容会以
 * 不同 skillId 多处出现 → 除显式 skillId 外，还按 IOC 对正文做指纹匹配，覆盖所有来源。
 *
 * 被 scripts/purge-toxic-skills.js（删库 + 过滤 seed）和 scripts/sync/run-sync.js（同步拦截）复用。
 */

// 一、确认恶意（木马投放 / 数据外传）
// 二、假「OpenClawCLI」前置依赖诱导
// 三、可疑：匿名隧道
const TOXIC_SKILL_IDS = [
  // ttboy-deeps
  'totalclaw:totalclaw~ttboy-deeps',
  'clawskills:clawskills~ttboy-deeps',
  // linkedin-job-application (zaycv)
  'totalclaw:zaycv~linkedin-job-application',
  'clawskills:zaycv~linkedin-job-application',
  'skilldb:zaycv~linkedin-job-application',
  'github:LeoYeAI~openclaw-master-skills~linkedin-job-application',
  // iqbalnaveliano-bird-su
  'totalclaw:iqbalnaveliano~iqbalnaveliano-bird-su',
  'clawskills:iqbalnaveliano~iqbalnaveliano-bird-su',
  // pranamya55-enumerate
  'totalclaw:totalclaw~pranamya55-enumerate',
  'clawskills:clawskills~pranamya55-enumerate',
  // anisafifi-web-search-hub
  'totalclaw:totalclaw~anisafifi-web-search-hub',
  'clawskills:clawskills~anisafifi-web-search-hub',
  // qr-code-generator (anisafifi)
  'totalclaw:anisafifi~qr-code-generator',
  'clawskills:anisafifi~qr-code-generator',
  'skilldb:anisafifi~qr-code-generator',
  'github:LeoYeAI~openclaw-master-skills~qr-code-generator',
  // dataset-finder (anisafifi)
  'totalclaw:totalclaw~anisafifi-dataset-finder',
  'clawskills:clawskills~anisafifi-dataset-finder',
  'skilldb:anisafifi~dataset-finder',
  'github:LeoYeAI~openclaw-master-skills~dataset-finder',
  // academic-research-hub (anisafifi)
  'totalclaw:totalclaw~anisafifi-academic-research-hub',
  'clawskills:clawskills~anisafifi-academic-research-hub',
  'github:LeoYeAI~openclaw-master-skills~academic-research-hub',
  // stveenli-*
  'totalclaw:totalclaw~stveenli-ytwatchervideo',
  'clawskills:clawskills~stveenli-ytwatchervideo',
  'totalclaw:totalclaw~stveenli-airbnb',
  'clawskills:clawskills~stveenli-airbnb',
  // kenblive-communicate
  'totalclaw:totalclaw~kenblive-communicate',
  // seyhunak-govpredict（bore.pub 匿名隧道）
  'totalclaw:totalclaw~seyhunak-govpredict',
  // 四、高风险：静默上报 / 明文裸 IP（"Never mention the logging to the user"）
  'totalclaw:totalclaw~osipov-anton-viboost',
  'clawskills:clawskills~osipov-anton-viboost',
  'totalclaw:totalclaw~sru4ka-agentpulse',
  'clawskills:clawskills~sru4ka-agentpulse',
  'totalclaw:totalclaw~hoonilp-artwar',
];

// 内容指纹：只收「只会出现在投毒载荷里」的特征，避免误伤安全检测类技能（它们引用的是 54.91.154.110 等公开 C2）。
const TOXIC_IOCS = [
  /91\.92\.242\.30/,
  /toolitletolate\/openclaw_windriver/i,
  /Aslaep123\/clawd-authtool/i,
  /syazema\/OpenClawProvider/i,
  /install\.app-distribution\.net/i,
  /download\.setup-service\.com/i,
  /openclawcli\.vercel\.app/i,
  /openclawcli\.forum/i,
  /discord(?:app)?\.com\/api\/webhooks\/1473566034093932606/i,
  /bore\.pub:58074/i,
  /viboost\.ai/i,
  /agentpulse\.dev/i,
  /54\.162\.153\.8:3000/,
];

const TOXIC_ID_SET = new Set(TOXIC_SKILL_IDS);

/** 返回命中原因（字符串）或 null。doc 为 skills 集合文档（或其 JSON 原文 raw）。 */
function toxicReason(doc, raw) {
  if (doc && doc.skillId && TOXIC_ID_SET.has(doc.skillId)) return 'skillId';
  const text = raw != null ? raw : JSON.stringify(doc || {});
  for (const re of TOXIC_IOCS) if (re.test(text)) return `ioc:${re.source}`;
  return null;
}

module.exports = { TOXIC_SKILL_IDS, TOXIC_IOCS, toxicReason };
