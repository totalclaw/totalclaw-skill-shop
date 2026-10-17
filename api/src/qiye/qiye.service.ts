import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Skill, SkillDocument, SKILL_COUNT_INDEX_NAME, SKILL_DOWNLOADS_INDEX_NAME,
} from '../skills/schemas/skill.schema';
import { QueryQiyeSkillsDto, QueryQiyeRolesDto } from './dto/query-qiye.dto';
import { cached, filterKey } from '../common/ttl-cache.util';

/** total 与筛选条件绑定缓存 5min：qiye-app 翻页时不再每页都对 28 万集合 countDocuments。 */
const COUNT_TTL_MS = 300_000;

/** 供 qiye-app 对接的字段投影（不含 contentMd 等重字段） */
const QIYE_PROJECTION =
  'skillId name displayName slug source category description descriptionZh ' +
  'kind emoji color listingType pricing roleId stats.downloads -_id';

@Injectable()
export class QiyeService {
  constructor(
    @InjectModel(Skill.name) private readonly skillModel: Model<SkillDocument>,
  ) {}

  /** 技能列表（kind=skill），支持来源过滤、名称模糊查询、分页（默认 20 条）。 */
  async listSkills(query: QueryQiyeSkillsDto) {
    const filter: Record<string, unknown> = {
      kind: 'skill',
      reviewStatus: { $in: ['n/a', 'approved'] },
    };

    if (query.source === 'totalclaw-community') {
      filter.source = 'totalclaw';
      filter.ownership = 'community';
    } else if (query.source) {
      filter.source = query.source;
    }

    if (query.listingType) filter.listingType = query.listingType;

    if (query.q) {
      const re = new RegExp(escapeRegex(query.q), 'i');
      filter.$or = [{ name: re }, { displayName: re }, { descriptionZh: re }, { description: re }];
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const [docs, total] = await Promise.all([
      this.skillModel
        .find(filter)
        .select(QIYE_PROJECTION)
        .sort({ 'stats.downloads': -1, _id: -1 })
        // 不钉索引时计划器挑覆盖计数索引再内存 SORT 24 万条（生产 11s）；钉到下载量索引 ~1ms
        .hint(SKILL_DOWNLOADS_INDEX_NAME)
        .skip(skip)
        .limit(pageSize)
        .lean()
        .exec(),
      this.countCached(filter),
    ]);

    return {
      items: docs.map(mapSkillItem),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /** 角色列表（kind=role），支持名称模糊查询、分页（默认 20 条）。 */
  async listRoles(query: QueryQiyeRolesDto) {
    const filter: Record<string, unknown> = {
      kind: 'role',
      reviewStatus: { $in: ['n/a', 'approved'] },
    };

    if (query.q) {
      const re = new RegExp(escapeRegex(query.q), 'i');
      filter.$or = [{ name: re }, { displayName: re }, { descriptionZh: re }, { description: re }];
    }

    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const [docs, total] = await Promise.all([
      this.skillModel
        .find(filter)
        .select(QIYE_PROJECTION)
        .sort({ 'stats.downloads': -1, _id: -1 })
        // 不钉索引时计划器挑覆盖计数索引再内存 SORT 24 万条（生产 11s）；钉到下载量索引 ~1ms
        .hint(SKILL_DOWNLOADS_INDEX_NAME)
        .skip(skip)
        .limit(pageSize)
        .lean()
        .exec(),
      this.countCached(filter),
    ]);

    return {
      items: docs.map(mapRoleItem),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  private countCached(filter: Record<string, unknown>): Promise<number> {
    return cached(filterKey('qiye-cnt:', filter), COUNT_TTL_MS, () => this.skillModel.countDocuments(filter).hint(SKILL_COUNT_INDEX_NAME).exec());
  }
}

// —— 映射函数（保证返回字段结构稳定，不随 schema 变化而意外暴露敏感字段）——

function mapSkillItem(doc: Record<string, unknown>) {
  const pricing = (doc.pricing as Record<string, unknown>) ?? {};
  const stats = (doc.stats as Record<string, unknown>) ?? {};
  return {
    skillId: doc.skillId,
    name: doc.name,
    displayName: (doc.displayName as string) || null,
    source: doc.source,
    kind: 'skill' as const,
    category: (doc.category as string) || null,
    description: (doc.descriptionZh as string) || (doc.description as string) || null,
    isFree: doc.listingType === 'free',
    listingType: doc.listingType,
    pricing: {
      model: (pricing.model as string) ?? 'free',
      price: (pricing.price as number) ?? 0,
      currency: (pricing.currency as string) ?? 'CNY',
    },
    /** 绑定的角色 skillId；未绑定时为 null */
    roleId: (doc.roleId as string) || null,
    stats: { downloads: (stats.downloads as number) ?? 0 },
  };
}

function mapRoleItem(doc: Record<string, unknown>) {
  const pricing = (doc.pricing as Record<string, unknown>) ?? {};
  const stats = (doc.stats as Record<string, unknown>) ?? {};
  return {
    /** 角色的唯一 ID，与 skillId 相同 */
    roleId: doc.skillId as string,
    skillId: doc.skillId,
    name: doc.name,
    displayName: (doc.displayName as string) || null,
    source: doc.source,
    kind: 'role' as const,
    category: (doc.category as string) || null,
    description: (doc.descriptionZh as string) || (doc.description as string) || null,
    emoji: (doc.emoji as string) || null,
    color: (doc.color as string) || null,
    isFree: doc.listingType === 'free',
    listingType: doc.listingType,
    pricing: {
      model: (pricing.model as string) ?? 'free',
      price: (pricing.price as number) ?? 0,
      currency: (pricing.currency as string) ?? 'CNY',
    },
    stats: { downloads: (stats.downloads as number) ?? 0 },
  };
}

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
