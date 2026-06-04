'use strict';

/**
 * 用 DeepSeek 生成「岗位清单(taxonomy)」→ data/roles/job-titles.json。
 * 覆盖多行业 × 多职能，参考真实招聘市场岗位命名。可重复运行（累积去重）。
 *
 *   node scripts/roles/gen-taxonomy.js --per=160
 *
 * 产物为数组：[{title, category}]，供 generate.js 消费。
 */

const fs = require('fs');
const path = require('path');
const { loadEnv } = require('./lib/env');
const { chat } = require('./lib/deepseek');

const OUT = path.resolve(__dirname, '../../data/roles/job-titles.json');

// 行业/职能桶（category 用中文，作为市场分类展示）
const BUCKETS = [
  '互联网研发', '前端与移动端', '后端与架构', '数据与算法', '人工智能与大模型',
  '测试与质量', '运维与SRE', '安全与风控', '产品经理', '产品设计与UX',
  '视觉与品牌设计', '市场营销', '内容与新媒体', '增长与投放', '品牌公关',
  '销售与商务', '客户成功与支持', '电商运营', '直播与短视频', '游戏研发',
  '游戏策划与美术', '金融与投资', '会计与审计', '财务与税务', '法律与合规',
  '人力资源', '行政与组织', '战略与咨询', '项目与交付', '供应链与采购',
  '物流与仓储', '制造与工艺', '医疗与健康', '生物与制药', '教育与培训',
  '科研与学术', '建筑与工程', '房地产', '能源与电力', '环保与可持续',
  '农业与食品', '零售与连锁', '酒店与旅游', '餐饮', '汽车与出行',
  '影视与传媒', '音乐与艺术', '体育与健身', '政务与公共事业', '航空航天',
  // —— 扩展批次（更细分行业/职能，冲 10000+ 岗位）——
  '半导体与芯片', '新能源汽车', '自动驾驶', '机器人与自动化', '工业互联网',
  '智能制造', '区块链与Web3', '云计算与中间件', '大数据平台', '物联网IoT',
  '网络安全攻防', '隐私与数据合规', '量化交易与金融科技', '保险与精算', '银行与支付',
  '证券与投行', '私募与创投', '跨境电商', '供应链金融', '智慧物流',
  '生鲜与冷链', '连锁餐饮运营', '新茶饮与咖啡', '美妆与个护', '母婴与玩具',
  '服装与时尚', '珠宝与奢侈品', '家居与家装', '智能硬件', '消费电子',
  '在线教育', '职业培训', '高等教育与科研管理', '医疗器械', '互联网医疗',
  '中医药与大健康', '基因与精准医疗', '临床与药物研发', '心理与咨询服务', '养老与康复',
  '法律科技', '知识产权', '会展与活动', '文旅与景区', '民宿与酒店运营',
  '广告与4A', '公关与危机管理', 'MCN与达人经纪', '游戏出海与发行', '电竞运营',
  '动漫与IP', '出版与数字阅读', '短剧与微综艺', '直播电商', '私域与会员运营',
  '风电与光伏', '储能与氢能', '油气与化工', '矿业与冶金', '水务与环卫',
  '碳中和与ESG', '智慧城市', '智慧交通', '测绘与遥感', '地质与勘探',
  '现代农业与种业', '畜牧与水产', '食品研发与质检', '建筑设计与BIM', '工程造价与监理',
  '房地产开发与运营', '物业管理', '航运与港口', '民航与机场', '轨道交通',
];

async function genBucket(category, per) {
  const sys = `你是招聘市场岗位专家。请列出「${category}」领域真实存在的具体岗位名称（中文），覆盖初级到高级、不同细分方向。
要求：
- 输出 ${per} 个不同岗位，尽量具体（如「资深前端工程师」「跨境电商运营专员」而非泛称）
- 只输出 JSON：{"titles": ["岗位1","岗位2", ...]}`;
  const raw = await chat(
    [{ role: 'system', content: sys }, { role: 'user', content: `领域：${category}，请给 ${per} 个岗位。` }],
    { temperature: 0.9, maxTokens: 4096, json: true },
  );
  try {
    const d = JSON.parse(raw);
    return Array.isArray(d.titles) ? d.titles : [];
  } catch { return []; }
}

async function main() {
  loadEnv();
  if (!process.env.DEEPSEEK_API_KEY) { console.error('缺 DEEPSEEK_API_KEY'); process.exit(1); }
  const per = Number((process.argv.find((a) => a.startsWith('--per=')) || '').split('=')[1] || 160);

  // 累积已有
  const seen = new Set();
  let acc = [];
  if (fs.existsSync(OUT)) {
    acc = JSON.parse(fs.readFileSync(OUT, 'utf8'));
    for (const x of acc) seen.add(x.category + '|' + x.title);
  }

  for (const category of BUCKETS) {
    try {
      const titles = await genBucket(category, per);
      let added = 0;
      for (const t of titles) {
        const title = String(t).trim();
        if (!title) continue;
        const key = category + '|' + title;
        if (seen.has(key)) continue;
        seen.add(key); acc.push({ title, category }); added++;
      }
      console.log(`  ${category}: +${added}（累计 ${acc.length}）`);
      fs.mkdirSync(path.dirname(OUT), { recursive: true });
      fs.writeFileSync(OUT, JSON.stringify(acc, null, 0));
    } catch (e) {
      console.warn(`  ${category}: 失败 ${e.message}`);
    }
  }
  console.log(`[taxonomy] 完成，共 ${acc.length} 个岗位 → ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
