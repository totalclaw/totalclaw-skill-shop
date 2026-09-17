import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * 一次加密包签发对应一条 license。协议 `tcpkg/1` §5。
 *
 * `licenseId` 本身是 128 位随机值 —— 状态查询接口用它当凭证，所以它既是主键
 * 也是"只有持有者知道"的秘密，不要在公开列表里泄露。
 */
@Schema({ timestamps: true, collection: 'skill_licenses' })
export class SkillLicense {
  @Prop({ required: true, trim: true, unique: true, index: true })
  licenseId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  deviceId: string;

  @Prop({ required: true, trim: true, index: true })
  itemId: string;

  @Prop({ trim: true, default: 'skill' })
  kind: string;

  @Prop({ trim: true })
  version?: string;

  @Prop({ default: Date.now })
  issuedAt: Date;

  /** 空 = 永久授权（仍受 allowedOfflineDays 约束）。 */
  @Prop()
  expiresAt?: Date;

  @Prop({ default: 7 })
  allowedOfflineDays: number;

  @Prop()
  revokedAt?: Date;

  @Prop({ trim: true })
  revokedReason?: string;
}

export type SkillLicenseDocument = HydratedDocument<SkillLicense>;
export const SkillLicenseSchema = SchemaFactory.createForClass(SkillLicense);
