import { Injectable, NotFoundException, OnModuleInit, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Skill, SkillDocument } from './schemas/skill.schema';
import { QuerySkillsDto } from './dto/query-skills.dto';

/** 列表/详情默认裁剪的重字段（正文按需单独取） */
const LIST_PROJECTION = '-contentMd';

// 简单内存 TTL 缓存：列表/分类/来源聚合是热点又重，缓存后重复请求秒回。
const _cache = new Map<string, { at: number; data: unknown }>();
function cacheGet<T>(key: string, ttlMs: number): T | undefined {
  const e = _cache.get(key);
  if (e && Date.now() - e.at < ttlMs) return e.data as T;
  return undefined;
}
function cacheSet(key: string, data: unknown) {
  if (_cache.size > 1000) _cache.clear(); // 兜底防膨胀
  _cache.set(key, { at: Date.now(), data });
}

@Injectable()
export class SkillsService implements OnModuleInit {
  private readonly logger = new Logger(SkillsService.name);

  constructor(
    @InjectModel(Skill.name) private readonly skillModel: Model<SkillDocument>,
  ) {}

  /**
   * 启动自愈（幂等）：
   *  1) 把历史 raw 导入遗留的 kind 缺失/为 null 的「技能」补成 'skill'——否则列表查询用精确 kind:'skill'
   *     会漏掉这些文档；且精确匹配才能走 {kind,syncedAt,_id} 索引（避免 14 万文档内存排序）。
   *  2) 确保关键复合索引存在（驱动 insert 的种子库不会自动建）。
   * 部署后无需重导种子，API 一启动即把生产数据与查询口径对齐。
   */
  async onModuleInit() {
    try {
      const pending = await this.skillModel.countDocuments({ kind: null }).exec();
      if (pending > 0) {
        const r = await this.skillModel.updateMany({ kind: null }, { $set: { kind: 'skill' } }).exec();
        this.logger.log(`kind 补全：${r.modifiedCount} 个无 kind 文档 → 'skill'`);
      }
      await this.skillModel.collection.createIndex(
        { kind: 1, syncedAt: -1, _id: -1 },
        { name: 'kind_1_syncedAt_-1__id_-1', background: true },
      );
    } catch (e) {
      this.logger.warn('onModuleInit 自愈失败（不影响启动）: ' + (e as Error).message);
    }
  }

  async list(query: QuerySkillsDto) {
    const ckey = 'list:' + JSON.stringify(query);
    const cached = cacheGet<unknown>(ckey, 60_000); // 列表缓存 60s
    if (cached) return cached;
    const filter: Record<string, unknown> = {};
    // 前台默认只展示已上架（社区源 n/a，开发者源 approved）
    filter.reviewStatus = { $in: ['n/a', 'approved'] };

    // kind：role 取角色，否则取技能。用精确 'skill'（已对历史 null 补全）而非 $ne:'role'——
    // 精确匹配才能命中 {kind,syncedAt,_id} 索引、避免全表 FETCH+内存排序。
    filter.kind = query.kind === 'role' ? 'role' : 'skill';

    if (query.categories) {
      const list = String(query.categories).split(',').map((s) => s.trim()).filter(Boolean);
      if (list.length) filter.category = { $in: list };
    } else if (query.category) {
      filter.category = query.category;
    }
    if (query.source) filter.source = query.source;
    if (query.tag) filter.tags = query.tag;
    if (query.listingType) filter.listingType = query.listingType;
    if (query.ownership) filter.ownership = query.ownership;
    if (query.q) {
      const re = new RegExp(this.escapeRegex(query.q), 'i');
      filter.$or = [{ name: re }, { description: re }, { descriptionZh: re }, { keywords: re }];
    }

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      latest: { syncedAt: -1, _id: -1 },
      downloads: { 'stats.downloads': -1 },
      sales: { 'stats.sales': -1 },
      rating: { 'stats.ratingAvg': -1 },
    };
    const sort = sortMap[query.sort || 'latest'] || sortMap.latest;

    const page = query.page || 1;
    const pageSize = query.pageSize || 24;
    const skip = (page - 1) * pageSize;

    // count 与 filter（不含 page/sort）绑定单独缓存 5min：同一筛选的各页共用、且比列表缓存活得久，
    // 大幅减少「换页/换排序」时对 14 万集合重复 countDocuments 的冷开销。
    const cntKey = 'cnt:' + JSON.stringify(filter);
    let total = cacheGet<number>(cntKey, 300_000);

    const tasks: Promise<unknown>[] = [
      this.skillModel.find(filter).select(LIST_PROJECTION).sort(sort).skip(skip).limit(pageSize).lean().exec(),
    ];
    if (total === undefined) tasks.push(this.skillModel.countDocuments(filter).exec());
    const [items, freshCount] = await Promise.all(tasks);
    if (total === undefined) {
      total = freshCount as number;
      cacheSet(cntKey, total);
    }

    const res = { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
    cacheSet(ckey, res);
    return res;
  }

  /** 详情。默认裁剪闭源 skill 的正文（购买后由 entitlements 接口下发）。 */
  async detail(skillId: string, includeContent = false) {
    const doc = await this.skillModel.findOne({ skillId }).lean().exec();
    if (!doc) throw new NotFoundException('skill not found');
    if (doc.closedSource && !includeContent) {
      delete (doc as Record<string, unknown>).contentMd;
    }
    return doc;
  }

  /** 闭源内容下发（鉴权通过后调用） */
  async getContent(skillId: string) {
    const doc = await this.skillModel.findOne({ skillId }).select('skillId name contentMd').lean().exec();
    if (!doc) throw new NotFoundException('skill not found');
    return doc;
  }

  /** 分类聚合（含计数）。kind='role' 时按角色聚合，否则排除角色。 */
  async categories(kind?: string, source?: string) {
    // 缓存 key 含 source，保证「按来源切换分类」时各来源各自缓存
    const ck = 'cat:' + (kind === 'role' ? 'role' : 'skill') + (source ? ':' + source : '');
    const c = cacheGet<unknown>(ck, 600_000); // 分类缓存 10min
    if (c) return c;
    const kindMatch = kind === 'role' ? 'role' : 'skill';
    const match: Record<string, unknown> = { reviewStatus: { $in: ['n/a', 'approved'] }, kind: kindMatch };
    if (source) match.source = source; // 选了来源 → 只统计该来源下的分类
    const r = await this.skillModel.aggregate([
      { $match: match },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    cacheSet(ck, r);
    return r;
  }

  /** 来源聚合（含计数），仅普通 skill（排除角色）。 */
  async sourcesSummary() {
    const c = cacheGet<unknown>('sources', 600_000); // 来源缓存 10min
    if (c) return c;
    const r = await this.skillModel.aggregate([
      { $match: { reviewStatus: { $in: ['n/a', 'approved'] }, kind: 'skill' } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    cacheSet('sources', r);
    return r;
  }

  async incrementDownloads(skillId: string) {
    await this.skillModel.updateOne({ skillId }, { $inc: { 'stats.downloads': 1 } }).exec();
  }

  /**
   * 组装可下载的 SKILL.md 文件内容。
   * 有正文用正文；社区源缺正文时按元数据生成一份占位 SKILL.md，保证"每个 skill 都可下载"。
   * 返回的 listingType/closedSource 供调用方做鉴权判断。
   */
  async buildDownload(skillId: string) {
    const doc = await this.skillModel.findOne({ skillId }).lean().exec();
    if (!doc) throw new NotFoundException('skill not found');

    const name = doc.displayName || doc.name || doc.slug || skillId;
    const desc = doc.descriptionZh || doc.description || '';
    const meta: string[] = [`# ${name}`, ''];
    if (desc) meta.push(desc, '');
    const kv: [string, unknown][] = [
      ['skillId', doc.skillId],
      ['来源', doc.source],
      ['作者', doc.author],
      ['版本', doc.version],
      ['许可', doc.license],
      ['分类', doc.category],
      ['仓库', doc.repository],
      ['主页', doc.homepage],
      ['安装命令', doc.installCommand],
    ];
    const lines = kv.filter(([, v]) => v).map(([k, v]) => `- **${k}**: ${v}`);
    if (lines.length) meta.push('## 元数据', ...lines, '');

    const bodyMd =
      doc.contentMd && doc.contentMd.trim()
        ? doc.contentMd
        : '> 该 skill 暂无内置正文。请按上面的「仓库」或「安装命令」获取完整内容。';

    const content = `${meta.join('\n')}---\n\n${bodyMd}\n`;
    const base = String(doc.slug || doc.skillId).replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'skill';
    return {
      filename: `${base}.md`,
      displayName: name,
      content,
      listingType: doc.listingType,
      closedSource: !!doc.closedSource,
    };
  }

  private escapeRegex(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}
