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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_schema_1 = require("./schemas/order.schema");
const skill_schema_1 = require("../skills/schemas/skill.schema");
const entitlements_service_1 = require("../entitlements/entitlements.service");
const developer_service_1 = require("../developer/developer.service");
let OrdersService = class OrdersService {
    constructor(orderModel, skillModel, entitlements, developer) {
        this.orderModel = orderModel;
        this.skillModel = skillModel;
        this.entitlements = entitlements;
        this.developer = developer;
    }
    async create(userId, skillId) {
        const skill = await this.skillModel.findOne({ skillId }).lean().exec();
        if (!skill)
            throw new common_1.NotFoundException('skill not found');
        if (skill.listingType !== 'paid') {
            throw new common_1.BadRequestException('skill is free, no order needed');
        }
        const orderId = `ord_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
        const order = await this.orderModel.create({
            orderId,
            userId: new mongoose_2.Types.ObjectId(userId),
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
            payUrl: null,
            note: '本期未直连支付渠道，支付回调走 POST /api/internal/pay-webhook（HMAC 验签）',
        };
    }
    findByOrderId(orderId) {
        return this.orderModel.findOne({ orderId }).exec();
    }
    async simulatePay(userId, orderId) {
        if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SIMULATE_PAY !== '1') {
            throw new common_1.ForbiddenException('simulate pay disabled in production');
        }
        const order = await this.orderModel.findOne({ orderId }).exec();
        if (!order)
            throw new common_1.NotFoundException('order not found');
        if (String(order.userId) !== String(userId)) {
            throw new common_1.ForbiddenException('order does not belong to you');
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
    listByUser(userId) {
        return this.orderModel
            .find({ userId: new mongoose_2.Types.ObjectId(userId) })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_schema_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(skill_schema_1.Skill.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        entitlements_service_1.EntitlementsService,
        developer_service_1.DeveloperService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map