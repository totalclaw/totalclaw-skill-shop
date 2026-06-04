import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ required: true, unique: true, index: true, trim: true })
  username: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ trim: true })
  nickname?: string;

  /** 角色：'user' | 'developer' | 'admin'（数组，便于叠加 developer + user） */
  @Prop({ type: [String], default: ['user'], index: true })
  roles: string[];

  @Prop({ trim: true })
  wechatOpenId?: string;

  /** 开发者收益余额（分账累计净收益，单位元；提现后做扣减） */
  @Prop({ type: Number, default: 0 })
  earningsBalance: number;
}

export type UserDocument = HydratedDocument<User>;
export const UserSchema = SchemaFactory.createForClass(User);
