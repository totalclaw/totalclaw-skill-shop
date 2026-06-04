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
var DeveloperService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeveloperService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const earning_schema_1 = require("./schemas/earning.schema");
const skill_schema_1 = require("../skills/schemas/skill.schema");
const users_service_1 = require("../users/users.service");
let DeveloperService = DeveloperService_1 = class DeveloperService {
    constructor(earningModel, skillModel, usersService) {
        this.earningModel = earningModel;
        this.skillModel = skillModel;
        this.usersService = usersService;
        this.logger = new common_1.Logger(DeveloperService_1.name);
    }
    async uploadSkill(developerId, body) {
        const skillId = `developer:${developerId}~${body.slug}`.replace(/\//g, '~').replace(/\s+/g, '-');
        const doc = await this.skillModel.findOneAndUpdate({ skillId }, {
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
                developerId: new mongoose_2.Types.ObjectId(developerId),
                listingType: body.price > 0 ? 'paid' : 'free',
                closedSource: body.closedSource ?? body.price > 0,
                pricing: { model: body.price > 0 ? 'paid' : 'free', price: body.price, currency: 'CNY' },
                reviewStatus: 'pending',
                syncedAt: new Date(),
                lastUpdated: new Date(),
            },
        }, { upsert: true, new: true, setDefaultsOnInsert: true }).exec();
        return doc;
    }
    mySkills(developerId) {
        return this.skillModel
            .find({ developerId: new mongoose_2.Types.ObjectId(developerId) })
            .sort({ updatedAt: -1 })
            .lean()
            .exec();
    }
    async settleEarning(params) {
        const rate = parseFloat(process.env.PLATFORM_FEE_RATE || '0.3');
        const platformFee = Math.round(params.gross * rate * 100) / 100;
        const net = Math.round((params.gross - platformFee) * 100) / 100;
        try {
            const earning = await this.earningModel.create({
                orderId: params.orderId,
                developerId: new mongoose_2.Types.ObjectId(String(params.developerId)),
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
        }
        catch (err) {
            if (err?.code === 11000) {
                this.logger.warn(`分账重复 orderId=${params.orderId}，跳过`);
                return this.earningModel.findOne({ orderId: params.orderId }).exec();
            }
            throw err;
        }
    }
    earnings(developerId) {
        return this.earningModel
            .find({ developerId: new mongoose_2.Types.ObjectId(developerId) })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }
};
exports.DeveloperService = DeveloperService;
exports.DeveloperService = DeveloperService = DeveloperService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(earning_schema_1.Earning.name)),
    __param(1, (0, mongoose_1.InjectModel)(skill_schema_1.Skill.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        users_service_1.UsersService])
], DeveloperService);
//# sourceMappingURL=developer.service.js.map