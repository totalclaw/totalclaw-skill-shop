import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * 购买权益 / 已购 skill。仿 totalclaw-web VipRecord，但维度是 (user, skill)。
 * 支付 webhook 成功或激活码兑换后写入；闭源 skill 内容鉴权据此放行。
 */
@Schema({ timestamps: true, collection: 'entitlements' })
export class Entitlement {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  skillId: string;

  /** 关联订单或激活码（审计） */
  @Prop({ trim: true })
  orderId?: string;

  /** 'purchase' | 'activation-code' | 'admin' | 'free' */
  @Prop({ trim: true, default: 'purchase', index: true })
  source: string;

  @Prop({ default: Date.now })
  grantedAt: Date;

  /** 可选到期（永久授权则不设） */
  @Prop()
  expiresAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export type EntitlementDocument = HydratedDocument<Entitlement>;
export const EntitlementSchema = SchemaFactory.createForClass(Entitlement);

// 同一用户对同一 skill 只保留一条有效授权
EntitlementSchema.index({ userId: 1, skillId: 1 }, { unique: true });
