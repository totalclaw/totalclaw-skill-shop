import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as crypto from 'crypto';
import { ActivationCode, ActivationCodeDocument } from './schemas/activation-code.schema';
import { EntitlementsService } from '../entitlements/entitlements.service';

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base32

@Injectable()
export class ActivationCodesService {
  constructor(
    @InjectModel(ActivationCode.name)
    private readonly model: Model<ActivationCodeDocument>,
    private readonly entitlements: EntitlementsService,
  ) {}

  private genCode(): string {
    const seg = (n: number) =>
      Array.from({ length: n }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join('');
    return `TC-${seg(6)}-${seg(6)}-${seg(4)}`;
  }

  /** 管理员批量签发 */
  async createBatch(params: {
    skillId: string;
    count: number;
    maxActivations?: number;
    batchId?: string;
    remark?: string;
    expiresAt?: Date;
  }) {
    const docs = [];
    for (let i = 0; i < params.count; i++) {
      docs.push({
        code: this.genCode(),
        skillId: params.skillId,
        maxActivations: params.maxActivations ?? 1,
        batchId: params.batchId,
        remark: params.remark,
        expiresAt: params.expiresAt,
      });
    }
    const created = await this.model.insertMany(docs, { ordered: false });
    return { count: created.length, codes: created.map((c) => c.code) };
  }

  /** 用户兑换 → 发放权益 */
  async redeem(code: string, userId: string) {
    const doc = await this.model.findOne({ code: code.trim() }).exec();
    if (!doc) throw new NotFoundException('code not found');
    if (doc.disabled) throw new ForbiddenException('code disabled');
    if (doc.expiresAt && doc.expiresAt.getTime() < Date.now()) {
      throw new ForbiddenException('code expired');
    }
    if (doc.activatedCount >= doc.maxActivations) {
      throw new ForbiddenException('code exhausted');
    }
    const userOid = new Types.ObjectId(userId);
    if (doc.activations.some((a) => String(a.userId) === userId)) {
      throw new ConflictException('already redeemed by this user');
    }

    await this.entitlements.grant({
      userId,
      skillId: doc.skillId,
      orderId: `code:${doc.code}`,
      source: 'activation-code',
      metadata: { code: doc.code, batchId: doc.batchId },
    });

    doc.activatedCount += 1;
    doc.activations.push({ userId: userOid, at: new Date() });
    await doc.save();

    return { ok: true, skillId: doc.skillId };
  }

  listByBatch(batchId: string) {
    return this.model.find({ batchId }).lean().exec();
  }
}
