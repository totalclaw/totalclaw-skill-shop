import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Skill, SkillDocument } from '../skills/schemas/skill.schema';
import { EntitlementsService } from '../entitlements/entitlements.service';
import { DeveloperService } from '../developer/developer.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<OrderDocument>,
    @InjectModel(Skill.name) private readonly skillModel: Model<SkillDocument>,
    private readonly entitlements: EntitlementsService,
    private readonly developer: DeveloperService,
  ) {}

  /** 下单：为某付费 skill 生成 pending 订单 */
  async create(userId: string, skillId: string) {
    const skill = await this.skillModel.findOne({ skillId }).lean().exec();
    if (!skill) throw new NotFoundException('skill not found');
    if (skill.listingType !== 'paid') {
      throw new BadRequestException('skill is free, no order needed');
    }
    const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
    const order = await this.orderModel.create({
      orderId,
      userId: new Types.ObjectId(userId),
      skillId,
      amountCny: skill.pricing?.price ?? 0,
      status: 'pending',
      developerId: skill.developerId,
      metadata: { ownership: skill.ownership, name: skill.name },
    });
    return {
      orderId: order.orderId,
      amountCny: order.amountCny,
      skillId,
      // 真实支付渠道后接：此处返回收银台/二维码 URL
      payUrl: null,
      note: '本期未直连支付渠道，支付回调走 POST /api/internal/pay-webhook（HMAC 验签）',
    };
  }

  findByOrderId(orderId: string) {
    return this.orderModel.findOne({ orderId }).exec();
  }

  /**
   * 模拟支付完成（仅非生产 / ALLOW_SIMULATE_PAY=1 开放）：
   * 复用支付 webhook 的发放逻辑——标记已付、发放权益、开发者分账，全部幂等。
   * 校验订单归属当前用户，避免越权替他人付款。
   */
  async simulatePay(userId: string, orderId: string) {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SIMULATE_PAY !== '1') {
      throw new ForbiddenException('simulate pay disabled in production');
    }
    const order = await this.orderModel.findOne({ orderId }).exec();
    if (!order) throw new NotFoundException('order not found');
    if (String(order.userId) !== String(userId)) {
      throw new ForbiddenException('order does not belong to you');
    }
    if (order.status === 'paid') {
      return { ok: true, idempotent: true, orderId, skillId: order.skillId };
    }

    order.status = 'paid';
    order.paidAt = new Date();
    await order.save();

    await this.entitlements.grant({
      userId: order.userId,
      skillId: order.skillId,
      orderId: order.orderId,
      source: 'purchase',
      metadata: { amountCny: order.amountCny, simulated: true },
    });

    if (order.developerId) {
      await this.developer.settleEarning({
        orderId: order.orderId,
        developerId: order.developerId,
        skillId: order.skillId,
        gross: order.amountCny,
      });
    }

    return { ok: true, idempotent: false, orderId, skillId: order.skillId };
  }

  listByUser(userId: string) {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
}
