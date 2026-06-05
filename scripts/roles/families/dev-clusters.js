'use strict';
/**
 * 研发族「规范专精方向」聚类规则（试点）。
 * 把岗位池里研发相关分类的 1500+ 岗位名，按关键词归并成 ~30 个规范专精方向 key。
 * 每个 key 后续对应一份「真实世界 JD 依据」的 profile（profiles/dev.json）。
 * 顺序敏感：先匹配到的先归类，越具体的规则放越前。
 */
const DEV_CATEGORIES = ['互联网研发', '后端与架构', '前端与移动端', '大数据平台', '测试与质量', '云计算与中间件',
  // 技术邻接族（复用同一聚类与画像库）
  '运维与SRE', '人工智能与大模型', '数据与算法', '游戏研发'];

// [canonicalKey, 中文显示名, 关键词(任一命中即归类)]
const CLUSTERS = [
  ['fe-arch', '前端架构师', ['前端架构']],
  ['be-arch', '后端架构师', ['后端架构', '服务端架构']],
  ['sys-arch', '系统架构师', ['系统架构', '架构师', '云原生架构', '应用架构', '技术架构']],
  ['frontend', '前端工程师', ['前端', 'web前端', 'h5', 'ui工程', 'ux工程', 'react', 'vue', 'angular', '小程序', 'webpack', 'vite', 'babel', 'webgl', 'canvas', '可视化前端',
    'three.js', 'd3.js', 'echarts', 'svelte', 'next.js', 'nuxt', 'gatsby', 'remix开发', 'css动画', '移动端交互', '移动端性能优化', '微信开发', 'taro', 'uni-app']],
  ['fullstack', '全栈工程师', ['全栈']],
  ['mobile-ios', 'iOS 工程师', ['ios', 'swift', '苹果']],
  ['mobile-android', 'Android 工程师', ['android', '安卓', 'kotlin']],
  ['mobile-cross', '跨平台移动工程师', ['flutter', 'react native', 'rn开发', '跨平台', '移动端工程', '移动开发', '移动端开发', '混合开发', 'hybrid']],
  ['algo-ml', '机器学习工程师', ['机器学习', 'machine learning', 'ml工程']],
  ['algo-dl', '深度学习工程师', ['深度学习', 'deep learning', '模型压缩', '模型量化', '模型蒸馏', '模型剪枝', '模型加速', '神经网络', '模型训练', '模型部署', 'ai模型']],
  ['algo-cv', '计算机视觉工程师', ['计算机视觉', 'cv工程', '图像', '视觉算法']],
  ['algo-nlp', '自然语言处理工程师', ['自然语言', 'nlp', '语音', '对话系统', '大模型', 'llm']],
  ['algo-recsearch', '推荐/搜索工程师', ['推荐系统', '推荐算法', '搜索工程', '搜索算法', '广告算法']],
  ['algo-rl', '强化学习工程师', ['强化学习', 'reinforcement', 'rlhf', '决策智能', '博弈']],
  ['algo-kg', '知识图谱工程师', ['知识图谱', '图谱', 'knowledge graph', '图计算', '图算法']],
  ['algo-research', '算法研究员/科学家', ['研究员', '科学家', 'researcher', 'research scientist', 'ai伦理', '前沿研究']],
  ['algo-privacy', '隐私计算/联邦学习工程师', ['隐私计算', '联邦学习', '安全多方计算', 'mpc', '可信计算', '同态加密']],
  ['data-annotation', '数据标注', ['数据标注', '标注师', '标注专员', '标注主管', '数据采集']],
  ['aigc-creator', 'AIGC 内容创作者', ['aigc', 'ai绘画', 'ai文案', 'ai写作', 'ai视频', 'ai音乐', 'ai配音', 'ai语音合成', 'ai内容', 'ai创作', 'ai培训师', 'ai编程助手', 'ai助手开发', 'ai应用', '数字人', 'prompt工程师', '提示词']],
  ['algo-general', '算法工程师', ['算法', '数据挖掘', 'data mining']],
  ['bigdata-dev', '大数据开发工程师', ['大数据开发', '大数据工程', 'hadoop', 'spark', 'flink', '实时计算', '流计算', '流处理']],
  ['bigdata-platform', '大数据平台工程师', ['大数据平台', '数据平台', '数据中台', '数仓', '数据仓库']],
  ['bigdata-ops', '大数据运维工程师', ['大数据运维']],
  ['data-eng', '数据工程师', ['数据工程', 'etl', '数据开发', '数据集成', '数据治理', '数据建模', '数据质量', '数据湖', '数据资产', '数据中台开发']],
  ['data-science', '数据分析/科学', ['数据分析', '数据科学', 'bi工程', 'bi开发', '商业智能', '数据可视化', '指标', '统计分析', '统计师', '数据运营', '业务分析师']],
  ['dba', '数据库管理员(DBA)', ['数据库管理', 'dba', '数据库工程', 'dba工程', '数据库开发']],
  ['test-arch', '测试架构师', ['测试架构']],
  ['test-dev', '测试开发工程师', ['测试开发', 'sdet']],
  ['test-perf', '性能测试工程师', ['性能测试', '压测', '负载测试']],
  ['test-security', '安全测试工程师', ['安全测试', '渗透测试']],
  ['test-auto', '自动化测试工程师', ['自动化测试', '接口测试', 'ui自动化']],
  ['test-func', '测试工程师', ['功能测试', '手工测试', '软件测试', '测试工程', 'qa工程', '兼容性测试', '回归测试', '质量保证', '质量保障']],
  ['test-other', '专项测试工程师', ['测试']],
  ['devops', 'DevOps 工程师', ['devops', 'ci/cd', '持续集成', '持续交付']],
  ['sre', 'SRE 工程师', ['sre', '稳定性工程', '可靠性工程']],
  ['ops', '运维工程师', ['运维', '系统管理', 'it支持', '技术支持', '发布工程', '配置管理', '变更管理', '故障处理', '容量规划', '版本管理', '环境管理', '资产管理', '巡检', '网络管理员', '系统集成']],
  ['cloud', '云计算工程师', ['云计算', '公有云', '云平台', '云架构', '虚拟化', '云存储', '云监控', '云自动化', '云成本', '云迁移', '云原生应用', 'serverless', '云安全',
    'ceph', 'minio', 'glusterfs', 'longhorn', '分布式存储', '对象存储', '存储工程', '云原生存储']],
  ['container', '容器/K8s 工程师', ['容器', 'kubernetes', 'k8s', 'docker', '服务网格', 'istio', '云原生',
    'containerd', 'cri-o', 'kata', 'gvisor', 'calico', 'cilium', 'flannel', 'weave', 'kube-ovn']],
  ['middleware', '中间件工程师', ['中间件', '消息队列', 'kafka', '缓存', 'redis', '服务注册', '配置中心', '负载均衡', '反向代理', 'api网关', '网关开发',
    'esb', 'rabbitmq', 'rocketmq', 'activemq', 'pulsar', 'memcached', 'zookeeper', 'etcd', 'consul', 'nacos', 'eureka',
    'nginx', 'haproxy', 'traefik', 'envoy', 'dubbo', 'grpc', 'thrift', 'spring cloud', 'kong', 'tyk', 'apisix', 'linkerd', 'api开发', 'api高级']],
  ['embedded', '嵌入式工程师', ['嵌入式', '固件', '单片机', '驱动开发', 'rtos']],
  ['iot', '物联网(IoT)工程师', ['物联网', 'iot', '车联网']],
  ['blockchain', '区块链工程师', ['区块链', '智能合约', 'web3', '链上']],
  ['game-server', '游戏服务端工程师', ['游戏服务端', '游戏服务器', '游戏后端', '战斗服务', '帧同步', '游戏server']],
  ['game-engine', '游戏引擎/图形渲染工程师', ['游戏引擎', '引擎开发', '图形渲染', '图形学', '渲染工程', 'shader', '技术美术', 'td工程']],
  ['game-client', '游戏客户端工程师', ['游戏客户端', 'unity', 'unreal', 'ue4', 'ue5', 'cocos', '游戏前端', '玩法开发']],
  ['game-dev', '游戏开发工程师', ['游戏开发', '游戏研发', '手游', '端游', '游戏程序', '游戏']],
  ['network', '网络工程师', ['网络工程', '网络架构', 'cdn', '网络安全工程']],
  ['security-eng', '安全工程师', ['安全工程', '信息安全', '应用安全', '安全开发', 'soc分析', 'soc工程', '安全运营', '安全运维']],
  ['backend', '后端工程师', ['后端', '服务端', 'java', 'golang', 'go高级', 'go开发', 'python', 'c++', 'c#', '.net', 'node', 'php', 'ruby', 'scala', 'rust', 'kotlin后端', '微服务', '分布式']],
  ['ai-platform', 'AI 平台工程师', ['ai平台', 'ai工程', '机器学习平台', 'mlops', '模型平台', 'ai基础设施', 'ai编译器', 'ai系统', 'ai infra', 'ai加速', 'ai硬件', '推理引擎', '训练框架', 'ai交付', 'ai解决方案']],
  ['tech-pm', '技术产品/项目经理', ['技术产品经理', '技术项目经理', '研发项目经理', '项目经理', 'tpm', '大数据产品经理', '产品经理', 'ai产品', 'ai技术顾问', 'ai总监', 'ai技术专家', 'ai首席']],
];

function stripLevel(s) {
  return s.replace(/^(初级|中级|高级|资深|首席|实习|见习|主任|专家|总监|负责人|principal|senior|junior)/i, '');
}
function levelOf(title) {
  const m = title.match(/^(实习|见习|初级|中级|高级|资深|首席|专家|主任)/);
  return m ? m[1] : '中级'; // 无前缀默认按「中级/骨干」
}
function clusterOf(title) {
  const low = title.toLowerCase();
  for (const [key, name, kws] of CLUSTERS) {
    if (kws.some((k) => low.includes(k.toLowerCase()))) return { key, name };
  }
  // 兜底：研发族里没命中具体方向的，归通用「软件工程师」profile，仍优于 17 领域模板
  return { key: 'dev-generic', name: '软件工程师', fallback: true };
}

module.exports = { DEV_CATEGORIES, CLUSTERS, stripLevel, levelOf, clusterOf };

if (require.main === module) {
  const t = require('../../../data/roles/job-titles.json');
  const dev = t.filter((x) => DEV_CATEGORIES.includes(x.category));
  const cnt = {};
  let unmatched = [];
  for (const x of dev) {
    const c = clusterOf(x.title);
    if (!c) { unmatched.push(x.title); continue; }
    cnt[c.key] = (cnt[c.key] || 0) + 1;
  }
  const matched = Object.values(cnt).reduce((a, b) => a + b, 0);
  console.log(`研发族岗位 ${dev.length}，命中 ${matched}，未命中 ${unmatched.length}`);
  console.log(`规范专精方向数: ${Object.keys(cnt).length}`);
  const byName = Object.fromEntries(CLUSTERS.map(([k, n]) => [k, n]));
  console.log('=== 各方向岗位数 ===');
  for (const [k, v] of Object.entries(cnt).sort((a, b) => b[1] - a[1])) console.log(`  ${k.padEnd(16)} ${byName[k].padEnd(18)} ${v}`);
  console.log('=== 未命中样例(前30) ===');
  console.log([...new Set(unmatched)].slice(0, 30).join(' | '));
}
