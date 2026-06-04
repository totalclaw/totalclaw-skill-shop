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
exports.ActivationCodeSchema = exports.ActivationCode = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ActivationCode = class ActivationCode {
};
exports.ActivationCode = ActivationCode;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true, trim: true }),
    __metadata("design:type", String)
], ActivationCode.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], ActivationCode.prototype, "skillId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 1 }),
    __metadata("design:type", Number)
], ActivationCode.prototype, "maxActivations", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 0 }),
    __metadata("design:type", Number)
], ActivationCode.prototype, "activatedCount", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: [{ userId: mongoose_2.Types.ObjectId, at: Date }],
        default: [],
    }),
    __metadata("design:type", Array)
], ActivationCode.prototype, "activations", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ActivationCode.prototype, "batchId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], ActivationCode.prototype, "remark", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], ActivationCode.prototype, "disabled", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], ActivationCode.prototype, "expiresAt", void 0);
exports.ActivationCode = ActivationCode = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'activation_codes' })
], ActivationCode);
exports.ActivationCodeSchema = mongoose_1.SchemaFactory.createForClass(ActivationCode);
//# sourceMappingURL=activation-code.schema.js.map