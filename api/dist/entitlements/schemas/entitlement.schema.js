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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitlementSchema = exports.Entitlement = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Entitlement = class Entitlement {
};
exports.Entitlement = Entitlement;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Entitlement.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], Entitlement.prototype, "skillId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Entitlement.prototype, "orderId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: 'purchase', index: true }),
    __metadata("design:type", String)
], Entitlement.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Entitlement.prototype, "grantedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Entitlement.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Entitlement.prototype, "metadata", void 0);
exports.Entitlement = Entitlement = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'entitlements' })
], Entitlement);
exports.EntitlementSchema = mongoose_1.SchemaFactory.createForClass(Entitlement);
exports.EntitlementSchema.index({ userId: 1, skillId: 1 }, { unique: true });
//# sourceMappingURL=entitlement.schema.js.map