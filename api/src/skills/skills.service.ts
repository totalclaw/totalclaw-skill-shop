import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Skill, SkillDocument } from './schemas/skill.schema';
import { QuerySkillsDto } from './dto/query-skills.dto';

/** 列表/详情默认裁剪的重字段（正文按需单独取） */
const LIST_PROJECTION = '-contentMd';

@Injectable()
export class SkillsService {
  constructor(
    @InjectModel(Skill.name) private readonly skillModel: Model<SkillDocument>,
  ) {}

  async list(query: QuerySkillsDto) {
    const filter: Record<string, unknown> = {};
    // 前台默认只展示已上架（社区源 n/a，开发者源 approved）
    filter.reviewStatus = { $in: ['n/a', 'approved'] };

    // kind：role 仅在显式 kind=role 时返回；普通 skill 列表排除角色（兼容历史无 kind 字段的文档）
    filter.kind = query.kind === 'role' ? 'role' : { $ne: 'role' };

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

    const [items, total] = await Promise.all([
      this.skillModel.find(filter).select(LIST_PROJECTION).sort(sort).skip(skip).limit(pageSize).lean().exec(),
      this.skillModel.countDocuments(filter).exec(),
    ]);

    return { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
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
  async categories(kind?: string) {
    const kindMatch = kind === 'role' ? 'role' : { $ne: 'role' };
    return this.skillModel.aggregate([
      { $match: { reviewStatus: { $in: ['n/a', 'approved'] }, kind: kindMatch } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
  }

  /** 来源聚合（含计数），仅普通 skill（排除角色）。 */
  async sourcesSummary() {
    return this.skillModel.aggregate([
      { $match: { reviewStatus: { $in: ['n/a', 'approved'] }, kind: { $ne: 'role' } } },
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
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
