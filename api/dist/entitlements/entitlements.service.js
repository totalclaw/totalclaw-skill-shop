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
exports.EntitlementsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const entitlement_schema_1 = require("./schemas/entitlement.schema");
let EntitlementsService = class EntitlementsService {
    constructor(model) {
        this.model = model;
    }
    async grant(params) {
        const userId = new mongoose_2.Types.ObjectId(String(params.userId));
        const existing = await this.model.findOne({ userId, skillId: params.skillId }).exec();
        if (existing)
            return existing;
        try {
            return await this.model.create({
                userId,
                skillId: params.skillId,
                orderId: params.orderId,
                source: params.source || 'purchase',
                grantedAt: new Date(),
                metadata: params.metadata,
            });
        }
        catch (err) {
            if (err?.code === 11000) {
                return this.model.findOne({ userId, skillId: params.skillId }).exec();
            }
            throw err;
        }
    }
    async has(userId, skillId) {
        const userOid = new mongoose_2.Types.ObjectId(String(userId));
        const doc = await this.model.findOne({ userId: userOid, skillId }).lean().exec();
        if (!doc)
            return false;
        if (doc.expiresAt && new Date(doc.expiresAt).getTime() < Date.now())
            return false;
        return true;
    }
    async listByUser(userId) {
        return this.model
            .find({ userId: new mongoose_2.Types.ObjectId(String(userId)) })
            .sort({ grantedAt: -1 })
            .lean()
            .exec();
    }
};
exports.EntitlementsService = EntitlementsService;
exports.EntitlementsService = EntitlementsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(entitlement_schema_1.Entitlement.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EntitlementsService);
//# sourceMappingURL=entitlements.service.js.map