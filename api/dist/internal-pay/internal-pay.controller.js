"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var InternalPayController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InternalPayController = void 0;
const common_1 = require("@nestjs/common");
const crypto = __importStar(require("crypto"));
const swagger_1 = require("@nestjs/swagger");
const orders_service_1 = require("../orders/orders.service");
const entitlements_service_1 = require("../entitlements/entitlements.service");
const developer_service_1 = require("../developer/developer.service");
const pay_webhook_dto_1 = require("./dto/pay-webhook.dto");
let InternalPayController = InternalPayController_1 = class InternalPayController {
    constructor(orders, entitlements, developer) {
        this.orders = orders;
        this.entitlements = entitlements;
        this.developer = developer;
        this.logger = new common_1.Logger(InternalPayController_1.name);
    }
    async payWebhook(tokenHeader, tsHeader, dto) {
        const secret = (process.env.SKILL_PAY_INTERNAL_TOKEN ?? '').trim();
        if (!secret) {
            this.logger.error('[pay-webhook] SKILL_PAY_INTERNAL_TOKEN 未配置，拒绝所有回调');
            throw new common_1.UnauthorizedException('internal token secret not configured');
        }
        if (!tokenHeader)
            throw new common_1.UnauthorizedException('missing X-Internal-Token');
        if (!tsHeader)
            throw new common_1.UnauthorizedException('missing X-Internal-Ts');
        const tsTrim = tsHeader.trim();
        const tsMs = Number.parseInt(tsTrim, 10);
        if (!Number.isFinite(tsMs) || String(tsMs) !== tsTrim) {
            throw new common_1.UnauthorizedException('invalid X-Internal-Ts');
        }
        if (Math.abs(Date.now() - tsMs) > InternalPayController_1.TS_WINDOW_MS) {
            throw new common_1.UnauthorizedException('X-Internal-Ts out of window');
        }
        const message = `${String(dto.orderId)}.${tsTrim}`;
        const expected = crypto.createHmac('sha256', secret).update(message).digest('hex');
        const got = tokenHeader.trim().toLowerCase();
        const a = Buffer.from(got, 'utf8');
        const b = Buffer.from(expected, 'utf8');
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
            this.logger.warn(`[pay-webhook] HMAC mismatch orderId=${dto.orderId}`);
            throw new common_1.UnauthorizedException('invalid X-Internal-Token');
        }
        const order = await this.orders.findByOrderId(dto.orderId.trim());
        if (!order)
            throw new common_1.BadRequestException('order not found');
        if (order.status === 'paid') {
            this.logger.log(`[pay-webhook] orderId=${dto.orderId} 已处理，返回缓存`);
            return { ok: true, idempotent: true, skillId: order.skillId };
        }
        order.status = 'paid';
        order.paidAt = dto.paidAt ? new Date(dto.paidAt) : new Date();
        await order.save();
        await this.entitlements.grant({
            userId: order.userId,
            skillId: order.skillId,
            orderId: order.orderId,
            source: 'purchase',
            metadata: { amountCny: order.amountCny },
        });
        if (order.developerId) {
            await this.developer.settleEarning({
                orderId: order.orderId,
                developerId: order.developerId,
                skillId: order.skillId,
                gross: order.amountCny,
            });
        }
        this.logger.log(`[pay-webhook] ok orderId=${dto.orderId} skillId=${order.skillId}`);
        return { ok: true, idempotent: false, skillId: order.skillId };
    }
};
exports.InternalPayController = InternalPayController;
InternalPayController.TS_WINDOW_MS = 5 * 60 * 1000;
__decorate([
    (0, common_1.Post)('pay-webhook'),
    (0, swagger_1.ApiOperation)({
        summary: '支付回调（HMAC 验签）',
        description: '禁止前端调用。X-Internal-Token = HMAC-SHA256(env.SKILL_PAY_INTERNAL_TOKEN, `${orderId}.${ts}`)；X-Internal-Ts 必填(unix ms)，5min 窗口。',
    }),
    __param(0, (0, common_1.Headers)('x-internal-token')),
    __param(1, (0, common_1.Headers)('x-internal-ts')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, pay_webhook_dto_1.PayWebhookDto]),
    __metadata("design:returntype", Promise)
], InternalPayController.prototype, "payWebhook", null);
exports.InternalPayController = InternalPayController = InternalPayController_1 = __decorate([
    (0, swagger_1.ApiTags)('internal'),
    (0, common_1.Controller)('internal'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService,
        entitlements_service_1.EntitlementsService,
        developer_service_1.DeveloperService])
], InternalPayController);
//# sourceMappingURL=internal-pay.controller.js.map