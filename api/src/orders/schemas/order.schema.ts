import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * 订单。orderId 唯一索引保证幂等（仿 totalclaw-web ProcessedOrder）。
 * status: 'pending'（已下单待支付）-> 'paid'（webhook 回调成功）-> 'refunded'。
 */
@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ required: true, unique: true, index: true, trim: true })
  orderId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, trim: true, index: true })
  skillId: string;

  @Prop({ required: true })
  amountCny: number;

  /** 'pending' | 'paid' | 'refunded' */
  @Prop({ required: true, default: 'pending', index: true })
  status: string;

  /** 开发者 skill 的上传者（分账用） */
  @Prop({ type: Types.ObjectId, ref: 'User' })
  developerId?: Types.ObjectId;

  @Prop()
  paidAt?: Date;

  @Prop({ type: Object })
  metadata?: Record<string, unknown>;
}

export type OrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);
