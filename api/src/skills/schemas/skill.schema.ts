import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * Skill 市场统一元数据模型。
 * 聚合 totalclaw / openclaw / hermes / github / tencent 多源后规范化为此结构。
 * 同步脚本 (scripts/sync) 直接 upsert 本集合，NestJS 读同一集合。
 */
@Schema({ timestamps: true, collection: 'skills' })
export class Skill {
  /** 全局唯一：`${source}:${owner}/${slug}` */
  @Prop({ required: true, unique: true, index: true, trim: true })
  skillId: string;

  @Prop({ required: true, trim: true, index: true })
  slug: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ trim: true })
  displayName?: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ trim: true })
  descriptionZh?: string;

  @Prop({ trim: true })
  version?: string;

  @Prop({ trim: true })
  author?: string;

  @Prop({ trim: true })
  license?: string;

  @Prop({ trim: true })
  homepage?: string;

  @Prop({ trim: true })
  repository?: string;

  @Prop({ trim: true, index: true })
  category?: string;

  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  @Prop({ type: [String], default: [] })
  platforms: string[];

  @Prop({ type: [String], default: [] })
  keywords: string[];

  /** 'github' | 'tencent' | 'openclaw' | 'hermes' | 'totalclaw' */
  @Prop({ required: true, trim: true, index: true })
  source: string;

  @Prop({ trim: true })
  sourceUrl?: string;

  @Prop({ trim: true })
  installCommand?: string;

  /** SKILL.md 正文。闭源 skill 鉴权后才下发（详情列表接口默认裁剪）。 */
  @Prop()
  contentMd?: string;

  @Prop({ type: Object, default: {} })
  requires: Record<string, unknown>;

  @Prop()
  publishedAt?: Date;

  @Prop()
  lastUpdated?: Date;

  @Prop()
  syncedAt?: Date;

  // —— 市场字段 ——

  /** 'skill' | 'role'（role = TotalClaw AI 角色/岗位人格，复用 skill 模型与交易闭环） */
  @Prop({ required: true, default: 'skill', index: true })
  kind: string;

  /** 角色专用：emoji 图标、主题色（来自角色 frontmatter） */
  @Prop({ trim: true })
  emoji?: string;

  @Prop({ trim: true })
  color?: string;

  /** 'free' | 'paid' */
  @Prop({ required: true, default: 'free', index: true })
  listingType: string;

  /** 'community' | 'totalclaw-proprietary' | 'developer' */
  @Prop({ required: true, default: 'community', index: true })
  ownership: string;

  @Prop({
    type: { model: String, price: Number, currency: String },
    default: { model: 'free', price: 0, currency: 'CNY' },
  })
  pricing: { model: string; price: number; currency: string };

  /** ownership=developer 时关联上传者 */
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  developerId?: Types.ObjectId;

  /** 'n/a' | 'pending' | 'approved' | 'rejected'（仅开发者上传走审核） */
  @Prop({ default: 'n/a', index: true })
  reviewStatus: string;

  /** 该 skill 专属绑定的角色 skillId（可选；普通 skill 为 null） */
  @Prop({ trim: true, index: true, sparse: true })
  roleId?: string;

  @Prop({ trim: true })
  reviewNote?: string;

  /** 闭源：内容鉴权后才返回 */
  @Prop({ default: false })
  closedSource: boolean;

  @Prop({
    type: {
      downloads: Number,
      sales: Number,
      ratingAvg: Number,
      ratingCount: Number,
    },
    default: { downloads: 0, sales: 0, ratingAvg: 0, ratingCount: 0 },
  })
  stats: {
    downloads: number;
    sales: number;
    ratingAvg: number;
    ratingCount: number;
  };

  @Prop({ default: false, index: true })
  featured: boolean;

  @Prop({ type: Object })
  securityAudit?: Record<string, unknown>;
}

export type SkillDocument = HydratedDocument<Skill>;
export const SkillSchema = SchemaFactory.createForClass(Skill);

// 列表/聚合常用索引（查询恒含 kind；搜索用 regex 不用 $text，故去掉重的 text 索引）
// 默认列表排序为 { syncedAt:-1, _id:-1 }（_id 做稳定 tiebreak，批量导入 syncedAt 大量相同时分页不错乱）。
// 必须带上 _id 这一级，否则计划器无法用索引满足排序、退化为全表 FETCH + 内存 SORT（14万文档 ~1s）。
SkillSchema.index({ kind: 1, syncedAt: -1, _id: -1 });
SkillSchema.index({ kind: 1, syncedAt: -1 });
SkillSchema.index({ kind: 1, category: 1 });
SkillSchema.index({ kind: 1, source: 1 });
SkillSchema.index({ kind: 1, listingType: 1 });
SkillSchema.index({ kind: 1, 'stats.downloads': -1 });
// reviewStatus / tags 的单字段索引已在各自 @Prop({ index: true }) 上声明，
// 此处不再重复 SkillSchema.index()，否则 Mongoose 会告 "Duplicate schema index" 警告。
