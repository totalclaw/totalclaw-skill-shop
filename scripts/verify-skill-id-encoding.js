'use strict';

/**
 * 服务端用例：skillId 在 URL 路径段里的两种写法都要能下到同一个 skill。
 *
 * 背景：skillId 的规范形态是 `${source}:${owner}/${slug}`，客户端把 `/` 编成
 * `~` 放进路径段（agent 仓 `shop_url_segment()`；约定见
 * docs/skill-shop/encrypted-install-protocol.md §2）。
 * `GET /api/skills/by-name/:name/file` 此前只做 `decodeURIComponent`，
 * 于是 slug 短名能下、**完整 skillId 一律 404**。
 *
 * 覆盖：
 *   1. 纯函数 `skillIdCandidates` 的候选顺序（读 api/dist 的构建产物）
 *   2. 完整 skillId（`~` 形态）下载 → 200
 *   3. slug 短名下载 → 200（反向用例：原来就通的这条不许变）
 *   4. 完整 skillId（`%2F` 形态）下载 → 200
 *   5. developer 渠道那种 skillId 里**本来就带字面 `~`** 的条目 → 200
 *      （无脑 `~`→`/` 会把这条改坏，所以必须留一条钉住）
 *   6. 不存在的名字 → 404（反向用例：别把 404 修成"随便返回一个"）
 *
 * 前置：mongod + API 已在跑（`npm run start:local`，或按 README 起）。
 * 用法：node scripts/verify-skill-id-encoding.js
 *       API_BASE=http://127.0.0.1:3091 MONGODB_URI=mongodb://127.0.0.1:27018/totalclaw
 */

const path = require('path');
const { MongoClient } = require('mongodb');

const API_BASE = (process.env.API_BASE || 'http://127.0.0.1:3091').replace(/\/+$/, '');
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/totalclaw';

// 测试夹具用独立前缀，跑完删掉，不碰真实数据。
const FREE_ID = 'verify:tilde-owner/free-skill'; // 规范形态：含 `/`
const FREE_SLUG = 'wpr-verify-free';
const DEV_ID = 'developer:verify6512~wpr-verify-dev'; // skillId 里有字面 `~`
const DEV_SLUG = 'wpr-verify-dev';

let failures = 0;
function check(name, ok, detail) {
  if (ok) {
    console.log(`  PASS  ${name}`);
  } else {
    failures += 1;
    console.log(`  FAIL  ${name}${detail ? ` — ${detail}` : ''}`);
  }
}

function skillDoc(skillId, slug) {
  const now = new Date();
  return {
    skillId,
    slug,
    name: slug,
    displayName: slug,
    description: 'verify fixture',
    descriptionZh: '校验夹具',
    version: '1.0.0',
    author: 'verify',
    source: skillId.split(':')[0],
    category: 'demo',
    tags: [],
    platforms: [],
    keywords: [],
    listingType: 'free',
    closedSource: false,
    reviewStatus: 'approved',
    kind: 'skill',
    contentMd: `## body of ${slug}\n`,
    createdAt: now,
    updatedAt: now,
  };
}

async function get(url) {
  const resp = await fetch(url);
  const text = await resp.text();
  return { status: resp.status, text };
}

(async () => {
  // ── 1. 纯函数候选顺序 ───────────────────────────────────────────────
  const utilPath = path.join(__dirname, '..', 'api', 'dist', 'common', 'skill-id.util.js');
  let skillIdCandidates;
  try {
    ({ skillIdCandidates } = require(utilPath));
  } catch (err) {
    console.error(`读不到构建产物 ${utilPath}，先 npm run api:build`);
    throw err;
  }
  console.log('skillIdCandidates（纯函数）');
  check('含 `~` 时给出两个候选，原样在前',
    JSON.stringify(skillIdCandidates('a:b~c')) === JSON.stringify(['a:b~c', 'a:b/c']),
    JSON.stringify(skillIdCandidates('a:b~c')));
  check('不含 `~` 时只有一个候选',
    JSON.stringify(skillIdCandidates('plain-slug')) === JSON.stringify(['plain-slug']));
  check('空串给空数组', JSON.stringify(skillIdCandidates('  ')) === '[]');
  check('多个 `~` 全部还原',
    JSON.stringify(skillIdCandidates('a~b~c')) === JSON.stringify(['a~b~c', 'a/b/c']));

  // ── 夹具入库 ────────────────────────────────────────────────────────
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const skills = client.db().collection('skills');
  await skills.updateOne({ skillId: FREE_ID }, { $set: skillDoc(FREE_ID, FREE_SLUG) }, { upsert: true });
  await skills.updateOne({ skillId: DEV_ID }, { $set: skillDoc(DEV_ID, DEV_SLUG) }, { upsert: true });

  try {
    console.log(`GET ${API_BASE}/api/skills/by-name/:name/file`);

    // ── 2. 完整 skillId（`~` 形态）
    const tilde = await get(`${API_BASE}/api/skills/by-name/${encodeURIComponent(FREE_ID.replace(/\//g, '~'))}/file`);
    check('完整 skillId（/ 编成 ~）→ 200', tilde.status === 200, `HTTP ${tilde.status} ${tilde.text.slice(0, 120)}`);
    check('完整 skillId 拿到的是同一个 skill 的正文',
      tilde.text.includes(`body of ${FREE_SLUG}`), tilde.text.slice(0, 120));

    // ── 3. slug 短名（反向用例：原来就通的这条不许变）
    const bySlug = await get(`${API_BASE}/api/skills/by-name/${encodeURIComponent(FREE_SLUG)}/file`);
    check('slug 短名 → 200', bySlug.status === 200, `HTTP ${bySlug.status}`);
    check('两种写法拿到同一份内容', bySlug.text === tilde.text);

    // ── 4. 完整 skillId（`%2F` 形态）
    const pct = await get(`${API_BASE}/api/skills/by-name/${encodeURIComponent(FREE_ID)}/file`);
    check('完整 skillId（percent-encoded /）→ 200', pct.status === 200, `HTTP ${pct.status}`);

    // ── 5. skillId 里本来就带字面 `~`
    const dev = await get(`${API_BASE}/api/skills/by-name/${encodeURIComponent(DEV_ID)}/file`);
    check('skillId 含字面 ~（developer 渠道）→ 200', dev.status === 200, `HTTP ${dev.status} ${dev.text.slice(0, 120)}`);
    check('字面 ~ 的条目拿到的是它自己的正文',
      dev.text.includes(`body of ${DEV_SLUG}`), dev.text.slice(0, 120));

    // ── 6. 反向用例：不存在的名字仍然 404
    const missing = await get(`${API_BASE}/api/skills/by-name/${encodeURIComponent('verify:nope~not-there')}/file`);
    check('不存在的 skillId 仍然 404', missing.status === 404, `HTTP ${missing.status}`);
  } finally {
    await skills.deleteMany({ skillId: { $in: [FREE_ID, DEV_ID] } });
    await client.close();
  }

  console.log(failures === 0 ? '\n全部通过' : `\n${failures} 条失败`);
  process.exit(failures === 0 ? 0 : 1);
})().catch((e) => {
  console.error('校验脚本出错:', e);
  process.exit(1);
});
