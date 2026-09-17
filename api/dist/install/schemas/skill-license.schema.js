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
exports.SkillLicenseSchema = exports.SkillLicense = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let SkillLicense = class SkillLicense {
};
exports.SkillLicense = SkillLicense;
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, unique: true, index: true }),
    __metadata("design:type", String)
], SkillLicense.prototype, "licenseId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], SkillLicense.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], SkillLicense.prototype, "deviceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], SkillLicense.prototype, "itemId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: 'skill' }),
    __metadata("design:type", String)
], SkillLicense.prototype, "kind", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], SkillLicense.prototype, "version", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], SkillLicense.prototype, "issuedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], SkillLicense.prototype, "expiresAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 7 }),
    __metadata("design:type", Number)
], SkillLicense.prototype, "allowedOfflineDays", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], SkillLicense.prototype, "revokedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], SkillLicense.prototype, "revokedReason", void 0);
exports.SkillLicense = SkillLicense = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'skill_licenses' })
], SkillLicense);
exports.SkillLicenseSchema = mongoose_1.SchemaFactory.createForClass(SkillLicense);
//# sourceMappingURL=skill-license.schema.js.map