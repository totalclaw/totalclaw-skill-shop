import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * 激活码 / 兑换码（仿 totalclaw-web ActivationCode）。
 * 兑换后给 (user, skillId) 发放 entitlement。用于离线/批量授权。
 */
@Schema({ timestamps: true, collection: 'activation_codes' })
export class ActivationCode {
  @Prop({ required: true, unique: true, index: true, trim: true })
  code: string;

  /** 该码可激活的 skill */
  @Prop({ required: true, trim: true, index: true })
  skillId: string;

  @Prop({ default: 1 })
  maxActivations: number;

  @Prop({ default: 0 })
  activatedCount: number;

  @Prop({
    type: [{ userId: Types.ObjectId, at: Date }],
    default: [],
  })
  activations: { userId: Types.ObjectId; at: Date }[];

  @Prop({ trim: true })
  batchId?: string;

  @Prop({ trim: true })
  remark?: string;

  @Prop({ default: false })
  disabled: boolean;

  @Prop()
  expiresAt?: Date;
}

export type ActivationCodeDocument = HydratedDocument<ActivationCode>;
export const ActivationCodeSchema = SchemaFactory.createForClass(ActivationCode);
