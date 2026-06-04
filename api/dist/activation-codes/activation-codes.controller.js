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
exports.ActivationCodesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const activation_codes_service_1 = require("./activation-codes.service");
const guards_1 = require("../auth/guards");
class RedeemDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RedeemDto.prototype, "code", void 0);
class CreateBatchDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBatchDto.prototype, "skillId", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateBatchDto.prototype, "count", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], CreateBatchDto.prototype, "maxActivations", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBatchDto.prototype, "batchId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateBatchDto.prototype, "remark", void 0);
let ActivationCodesController = class ActivationCodesController {
    constructor(service) {
        this.service = service;
    }
    redeem(req, dto) {
        return this.service.redeem(dto.code, req.user.userId);
    }
    createBatch(dto) {
        return this.service.createBatch(dto);
    }
};
exports.ActivationCodesController = ActivationCodesController;
__decorate([
    (0, common_1.Post)('activation-codes/redeem'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '兑换激活码 → 发放权益' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RedeemDto]),
    __metadata("design:returntype", void 0)
], ActivationCodesController.prototype, "redeem", null);
__decorate([
    (0, common_1.Post)('admin/activation-codes/batch'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, guards_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: '管理员批量签发激活码' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateBatchDto]),
    __metadata("design:returntype", void 0)
], ActivationCodesController.prototype, "createBatch", null);
exports.ActivationCodesController = ActivationCodesController = __decorate([
    (0, swagger_1.ApiTags)('activation-codes'),
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [activation_codes_service_1.ActivationCodesService])
], ActivationCodesController);
//# sourceMappingURL=activation-codes.controller.js.map