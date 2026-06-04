"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const skill_schema_1 = require("../skills/schemas/skill.schema");
let AdminService = class AdminService {
    constructor(skillModel) {
        this.skillModel = skillModel;
    }
    pendingReviews() {
        return this.skillModel
            .find({ ownership: 'developer', reviewStatus: 'pending' })
            .sort({ updatedAt: 1 })
            .lean()
            .exec();
    }
    async review(skillId, action, note, securityAudit) {
        const status = action === 'approve' ? 'approved' : 'rejected';
        const doc = await this.skillModel.findOneAndUpdate({ skillId }, { $set: { reviewStatus: status, reviewNote: note, securityAudit } }, { new: true }).exec();
        if (!doc)
            throw new common_1.NotFoundException('skill not found');
        return doc;
    }
    async setFeatured(skillId, featured) {
        const doc = await this.skillModel.findOneAndUpdate({ skillId }, { $set: { featured } }, { new: true }).exec();
        if (!doc)
            throw new common_1.NotFoundException('skill not found');
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
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(skill_schema_1.Skill.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], AdminService);
//# sourceMappingURL=admin.service.js.map