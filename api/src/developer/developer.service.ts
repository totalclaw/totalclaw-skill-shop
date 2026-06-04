import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Earning, EarningDocument } from './schemas/earning.schema';
import { Skill, SkillDocument } from '../skills/schemas/skill.schema';
import { UsersService } from '../users/users.service';

@Injectable()
export class DeveloperService {
  private readonly logger = new Logger(DeveloperService.name);

  constructor(
    @InjectModel(Earning.name) private readonly earningModel: Model<EarningDocument>,
    @InjectModel(Skill.name) private readonly skillModel: Model<SkillDocument>,
    private readonly usersService: UsersService,
  ) {}

  /** 开发者上传 skill（进入待审核） */
  async uploadSkill(developerId: string, body: {
    slug: string;
    name: string;
    description?: string;
    descriptionZh?: string;
    category?: string;
    tags?: string[];
    contentMd: string;
    price: number;
    license?: string;
    closedSource?: boolean;
  }) {
    // skillId 必须 URL 安全（作为路径参数）：避免 '/'
    const skillId = `developer:${developerId}~${body.slug}`.replace(/\//g, '~').replace(/\s+/g, '-');
    const doc = await this.skillModel.findOneAndUpdate(
      { skillId },
      {
        $set: {
          skillId,
          slug: body.slug,
          name: body.name,
          description: body.description,
          descriptionZh: body.descriptionZh,
          category: body.category,
          tags: body.tags || [],
          contentMd: body.contentMd,
          license: body.license,
          source: 'totalclaw',
          ownership: 'developer',
          developerId: new Types.ObjectId(developerId),
          listingType: body.price > 0 ? 'paid' : 'free',
          closedSource: body.closedSource ?? body.price > 0,
          pricing: { model: body.price > 0 ? 'paid' : 'free', price: body.price, currency: 'CNY' },
          reviewStatus: 'pending',
          syncedAt: new Date(),
          lastUpdated: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).exec();
    return doc;
  }

  /** 开发者自己上传的 skill 列表 */
  mySkills(developerId: string) {
    return this.skillModel
      .find({ developerId: new Types.ObjectId(developerId) })
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
  }

  /**
   * 分账：成交后记一笔收益（幂等：orderId 唯一）。
   * 同时累加开发者余额。由支付 webhook 在权益发放后调用。
   */
  async settleEarning(params: {
    orderId: string;
    developerId: string | Types.ObjectId;
    skillId: string;
    gross: number;
  }) {
    const rate = parseFloat(process.env.PLATFORM_FEE_RATE || '0.3');
    const platformFee = Math.round(params.gross * rate * 100) / 100;
    const net = Math.round((params.gross - platformFee) * 100) / 100;
    try {
      const earning = await this.earningModel.create({
        orderId: params.orderId,
        developerId: new Types.ObjectId(String(params.developerId)),
        skillId: params.skillId,
        gross: params.gross,
        platformFeeRate: rate,
        platformFee,
        net,
        status: 'settled',
      });
      await this.usersService.addEarnings(params.developerId, net);
      this.logger.log(`分账 orderId=${params.orderId} net=${net} (gross=${params.gross}, fee=${platformFee})`);
      return earning;
    } catch (err: any) {
      if (err?.code === 11000) {
        this.logger.warn(`分账重复 orderId=${params.orderId}，跳过`);
        return this.earningModel.findOne({ orderId: params.orderId }).exec();
      }
      throw err;
    }
  }

  earnings(developerId: string) {
    return this.earningModel
      .find({ developerId: new Types.ObjectId(developerId) })
      .sort({ createdAt: -1 })
      .lean()
      .exec();
  }
}
