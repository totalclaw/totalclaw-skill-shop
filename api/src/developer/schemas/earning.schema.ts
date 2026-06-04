import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * 开发者收益账本。每笔成交分账一条，orderId 唯一保证幂等（不重复分账）。
 * gross=成交额, platformFeeRate=平台抽成比例, net=开发者净收益。
 */
@Schema({ timestamps: true, collection: 'developer_earnings' })
export class Earning {
  @Prop({ required: true, unique: true, index: true, trim: true })
  orderId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  developerId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  skillId: string;

  @Prop({ required: true })
  gross: number;

  @Prop({ required: true })
  platformFeeRate: number;

  @Prop({ required: true })
  platformFee: number;

  @Prop({ required: true })
  net: number;

  /** 'settled'（已入账本） | 'withdrawn'（已提现，后做） */
  @Prop({ default: 'settled', index: true })
  status: string;
}

export type EarningDocument = HydratedDocument<Earning>;
export const EarningSchema = SchemaFactory.createForClass(Earning);
