import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Skill, SkillDocument } from '../skills/schemas/skill.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Skill.name) private readonly skillModel: Model<SkillDocument>,
  ) {}

  /** 待审核的开发者上传 skill */
  pendingReviews() {
    return this.skillModel
      .find({ ownership: 'developer', reviewStatus: 'pending' })
      .sort({ updatedAt: 1 })
      .lean()
      .exec();
  }

  async review(skillId: string, action: 'approve' | 'reject', note?: string, securityAudit?: Record<string, unknown>) {
    const status = action === 'approve' ? 'approved' : 'rejected';
    const doc = await this.skillModel.findOneAndUpdate(
      { skillId },
      { $set: { reviewStatus: status, reviewNote: note, securityAudit } },
      { new: true },
    ).exec();
    if (!doc) throw new NotFoundException('skill not found');
    return doc;
  }

  async setFeatured(skillId: string, featured: boolean) {
    const doc = await this.skillModel.findOneAndUpdate(
      { skillId },
      { $set: { featured } },
      { new: true },
    ).exec();
    if (!doc) throw new NotFoundException('skill not found');
    return doc;
  }

  async stats() {
    const [total, paid, pending, bySource] = await Promise.all([
      this.skillModel.countDocuments().exec(),
      this.skillModel.countDocuments({ listingType: 'paid' }).exec(),
      this.skillModel.countDocuments({ reviewStatus: 'pending' }).exec(),
      this.skillModel.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
    ]);
    return { total, paid, pending, bySource };
  }
}
