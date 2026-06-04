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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivationCodesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto = __importStar(require("crypto"));
const activation_code_schema_1 = require("./schemas/activation-code.schema");
const entitlements_service_1 = require("../entitlements/entitlements.service");
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
let ActivationCodesService = class ActivationCodesService {
    constructor(model, entitlements) {
        this.model = model;
        this.entitlements = entitlements;
    }
    genCode() {
        const seg = (n) => Array.from({ length: n }, () => ALPHABET[crypto.randomInt(ALPHABET.length)]).join('');
        return `TC-${seg(6)}-${seg(6)}-${seg(4)}`;
    }
    async createBatch(params) {
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
    async redeem(code, userId) {
        const doc = await this.model.findOne({ code: code.trim() }).exec();
        if (!doc)
            throw new common_1.NotFoundException('code not found');
        if (doc.disabled)
            throw new common_1.ForbiddenException('code disabled');
        if (doc.expiresAt && doc.expiresAt.getTime() < Date.now()) {
            throw new common_1.ForbiddenException('code expired');
        }
        if (doc.activatedCount >= doc.maxActivations) {
            throw new common_1.ForbiddenException('code exhausted');
        }
        const userOid = new mongoose_2.Types.ObjectId(userId);
        if (doc.activations.some((a) => String(a.userId) === userId)) {
            throw new common_1.ConflictException('already redeemed by this user');
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
    listByBatch(batchId) {
        return this.model.find({ batchId }).lean().exec();
    }
};
exports.ActivationCodesService = ActivationCodesService;
exports.ActivationCodesService = ActivationCodesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(activation_code_schema_1.ActivationCode.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        entitlements_service_1.EntitlementsService])
], ActivationCodesService);
//# sourceMappingURL=activation-codes.service.js.map