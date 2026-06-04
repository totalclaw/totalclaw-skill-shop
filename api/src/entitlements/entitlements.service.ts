import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Entitlement, EntitlementDocument } from './schemas/entitlement.schema';

@Injectable()
export class EntitlementsService {
  constructor(
    @InjectModel(Entitlement.name)
    private readonly model: Model<EntitlementDocument>,
  ) {}

  /** 幂等授权：同一 (user, skill) 已存在则返回已有 */
  async grant(params: {
    userId: string | Types.ObjectId;
    skillId: string;
    orderId?: string;
    source?: string;
    metadata?: Record<string, unknown>;
  }) {
    const userId = new Types.ObjectId(String(params.userId));
    const existing = await this.model.findOne({ userId, skillId: params.skillId }).exec();
    if (existing) return existing;
    try {
      return await this.model.create({
        userId,
        skillId: params.skillId,
        orderId: params.orderId,
        source: params.source || 'purchase',
        grantedAt: new Date(),
        metadata: params.metadata,
      });
    } catch (err: any) {
      if (err?.code === 11000) {
        return this.model.findOne({ userId, skillId: params.skillId }).exec();
      }
      throw err;
    }
  }

  async has(userId: string | Types.ObjectId, skillId: string) {
    const userOid = new Types.ObjectId(String(userId));
    const doc = await this.model.findOne({ userId: userOid, skillId }).lean().exec();
    if (!doc) return false;
    if (doc.expiresAt && new Date(doc.expiresAt).getTime() < Date.now()) return false;
    return true;
  }

  async listByUser(userId: string | Types.ObjectId) {
    return this.model
      .find({ userId: new Types.ObjectId(String(userId)) })
      .sort({ grantedAt: -1 })
      .lean()
      .exec();
  }
}
