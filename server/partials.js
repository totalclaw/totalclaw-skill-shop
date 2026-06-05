'use strict';

const { escapeHtml } = require('./render');

const SOURCE_LABEL = {
  totalclaw: 'TotalClaw',
  openclaw: 'OpenClaw',
  hermes: 'Hermes',
  github: 'GitHub',
  tencent: '腾讯',
  clawskills: 'ClawSkills',
  skilldb: 'SkillDB',
};

// 前台来源筛选顺序（自研在前；镜像源/空源由首页按计数过滤展示）
const SOURCE_ORDER = ['totalclaw', 'openclaw', 'hermes', 'github', 'clawskills', 'tencent'];

// 英文分类（多来自聚合的开源 skill）→ 中文显示名。未命中则原样返回。
const CATEGORY_ZH = {
  'personal-productivity': '个人效率', 'productivity': '效率提升', 'skills': '通用技能', 'skill': '通用技能', 'sub-skills': '子技能',
  'engineering': '工程研发', 'software-development': '软件开发', 'web-development': 'Web 开发', 'algorithm': '算法',
  'backend': '后端开发', 'frontend': '前端开发', 'specialized': '专项技能', 'marketing': '市场营销', 'marketing-sales': '营销与销售',
  'paid-media': '付费投放', 'operations': '运营', 'security': '安全', 'red-teaming': '红队攻防', 'devops': 'DevOps 运维', 'mlops': 'MLOps',
  'design': '设计', 'product': '产品', 'customer-service': '客户服务', 'support': '技术支持', 'network': '网络',
  'finance': '财务金融', 'investment': '投资', 'admin-finance': '行政财务', 'testing': '测试', 'quality': '质量',
  'hr': '人力资源', 'sales': '销售', 'other': '其他', 'legal': '法律', 'supply-chain': '供应链', 'project-management': '项目管理',
  'spatial-computing': '空间计算', 'examples': '示例演示', 'game-development': '游戏开发', 'gaming': '游戏', 'ai-ml': '人工智能',
  'autonomous-ai-agents': '自主智能体', 'references': '参考资料', 'public-relations': '公共关系', 'research': '研究', 'creative': '创意',
  'strategy': '战略', 'academic': '学术', 'trademark': '商标', 'copywriting': '文案', 'business': '商业', 'media': '媒体',
  'social-media': '社交媒体', 'healthcare': '医疗健康', 'health': '健康', 'translation': '翻译', 'blockchain': '区块链',
  'education': '教育', 'manufacturing': '制造', 'consulting': '咨询', 'data-science': '数据科学', 'data': '数据',
  'communication': '沟通协作', 'presentation': '演示文稿', 'ppt-skill': '演示文稿', 'note-taking': '笔记', 'smart-home': '智能家居',
  'email': '邮件', 'hardware': '硬件', 'semiconductor': '半导体', 'admin': '行政', 'migration': '迁移', 'browser': '浏览器',
  'plugins': '插件', 'variants': '变体', 'audit-website': '网站审计', 'id-cv-resume-creator': '简历制作', 'c-level-advisor': '高管顾问',
  'whatsapp-automation-suite': 'WhatsApp 自动化', 'memory-wiki': '记忆维基', 'feishu': '飞书', 'qqbot': 'QQ 机器人', 'mcp': 'MCP',
  'cloudq-aiops': '云智能运维', 'open-prose': '文案写作', 'communication': '沟通协作',
};
function catLabel(cat) {
  if (!cat) return '其他';
  return CATEGORY_ZH[cat] || cat;
}

// AI 员工岗位的「大类」划分：通用岗位职能（跨行业的职能）vs 行业领域。
// 命中下表 → 通用岗位职能；其余角色分类 → 行业领域。
const ROLE_FUNCTIONAL_CATS = new Set([
  '产品经理', '产品设计与UX', '互联网研发', '后端与架构', '前端与移动端', '游戏研发', '游戏策划与美术',
  '数据与算法', '人工智能与大模型', '测试与质量', '运维与SRE', '安全与风控', '空间计算',
  '市场营销', '增长与投放', '内容与新媒体', '品牌公关', '直播与短视频', '销售与商务', '电商运营', '客户成功与支持',
  '视觉与品牌设计', '人力资源', '财务与税务', '会计与审计', '法律与合规', '项目与交付', '行政与组织', '战略与咨询',
  '供应链与采购', '物流与仓储', '制造与工艺', '科研与学术',
]);
const isFunctionalCat = (c) => ROLE_FUNCTIONAL_CATS.has(c);

function header(active) {
  const link = (href, label, key) =>
    `<a href="${href}" class="${active === key ? 'active' : ''}">${label}</a>`;
  return `<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/">
      <img src="/assets/img/logo-mark.png" alt="泰途AI" class="brand-mark">
      <span class="brand-text"><b>泰途AI</b><i>Skill 市场</i></span>
    </a>
    <nav>
      <a href="https://www.taituai.com" rel="noopener">官网</a>
      ${link('/skills', '技能库', 'skills')}
      ${link('/roles', 'AI 员工库', 'roles')}
      ${'' /* 开发者入口暂时隐藏，后续恢复：把下一行的注释解开
      + link('/developer', '开发者', 'developer') */}
    </nav>
    <!-- 登录入口暂时隐藏，后续恢复：去掉 hidden 即可（auth-slot 由 app.js 渲染登录态） -->
    <div class="auth-slot" id="authSlot" hidden></div>
  </div>
</header>`;
}

/** 来源筛选条：保留当前查询参数，切换 source；显示各来源 skill 数。activeSource 为空表示「全部来源」。 */
function sourceFilter(activeSource, query, counts, total) {
  const q = query || {};
  const cnt = counts || {};
  const build = (src) => {
    const o = { ...q, source: src || undefined, page: undefined };
    const qs = Object.entries(o)
      .filter(([, v]) => v != null && v !== '')
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    return '/skills' + (qs ? '?' + qs : '');
  };
  const tab = (src, label, n) => {
    const num = n != null ? ` (${n})` : '';
    return `<a class="src-tab ${(activeSource || '') === (src || '') ? 'active' : ''}" href="${build(src)}">${label}${num}</a>`;
  };
  // 只展示有数据的来源（或当前选中的来源），避免出现「来源 (0)」
  const sources = SOURCE_ORDER.filter((s) => (cnt[s] || 0) > 0 || activeSource === s);
  return `<div class="src-filter">
    ${tab('', '全部来源', total != null ? total : undefined)}
    ${sources.map((s) => tab(s, SOURCE_LABEL[s], cnt[s] || 0)).join('')}
  </div>`;
}

function footer() {
  return `<footer class="site-footer">
  <div class="wrap">
    <div class="foot-brand">
      <img src="/assets/img/logo-mark.png" alt="泰途AI" class="foot-mark" loading="lazy" decoding="async">
      <div>
        <b>泰途AI · Skill 市场</b>
        <span>多源聚合 · 收费交易 · 一键下载</span>
      </div>
    </div>
    <div class="foot-meta">
      <span>来源：TotalClaw / OpenClaw / Hermes / GitHub / 腾讯</span>
      <span>© ${new Date().getFullYear()} 泰途科技</span>
    </div>
  </div>
</footer>`;
}

function badge(skill) {
  const src = SOURCE_LABEL[skill.source] || skill.source;
  const own = skill.ownership === 'totalclaw-proprietary'
    ? '<span class="tag tag-proprietary">自研闭源</span>'
    : skill.ownership === 'developer'
    ? '<span class="tag tag-dev">开发者</span>'
    : '';
  // 价格标签（¥X / 免费）暂时全局隐藏，后续恢复：把下一行放回 return：
  // const paid = skill.listingType === 'paid'; const price = paid ? `¥${(skill.pricing && skill.pricing.price) || 0}` : '免费';
  // <span class="tag ${'${'}paid ? 'tag-paid' : 'tag-free'}">${'${'}price}</span>
  return `<span class="tag tag-source">${escapeHtml(src)}</span>${own}`;
}

function skillCard(skill) {
  const desc = skill.descriptionZh || skill.description || '';
  const dl = (skill.stats && skill.stats.downloads) || 0;
  const isRole = skill.kind === 'role';
  const emoji = isRole && skill.emoji ? `<span class="role-emoji">${escapeHtml(skill.emoji)}</span>` : '';
  return `<a class="skill-card${isRole ? ' role-card' : ''}" href="/skills/${encodeURIComponent(skill.skillId)}">
    <div class="skill-card-head">
      <h3>${emoji}${escapeHtml(skill.displayName || skill.name)}</h3>
    </div>
    <p class="skill-desc">${escapeHtml(desc.slice(0, 120))}</p>
    <div class="skill-meta">${badge(skill)}
      ${skill.category ? `<span class="tag tag-cat">${escapeHtml(catLabel(skill.category))}</span>` : ''}
    </div>
    <div class="skill-card-foot">
      <span class="card-cta">${isRole ? '购买员工 →' : skill.listingType === 'paid' ? '购买下载 →' : '免费下载 →'}</span>
    </div>
  </a>`;
}

module.exports = { header, footer, sourceFilter, skillCard, badge, catLabel, isFunctionalCat, SOURCE_LABEL, SOURCE_ORDER, CATEGORY_ZH };
