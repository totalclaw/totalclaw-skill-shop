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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const admin_service_1 = require("./admin.service");
const guards_1 = require("../auth/guards");
class ReviewDto {
}
__decorate([
    (0, class_validator_1.IsIn)(['approve', 'reject']),
    __metadata("design:type", String)
], ReviewDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ReviewDto.prototype, "note", void 0);
class FeaturedDto {
}
__decorate([
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], FeaturedDto.prototype, "featured", void 0);
let AdminController = class AdminController {
    constructor(admin) {
        this.admin = admin;
    }
    stats() {
        return this.admin.stats();
    }
    pending() {
        return this.admin.pendingReviews();
    }
    review(skillId, dto) {
        return this.admin.review(decodeURIComponent(skillId), dto.action, dto.note);
    }
    featured(skillId, dto) {
        return this.admin.setFeatured(decodeURIComponent(skillId), dto.featured);
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('stats'),
    (0, swagger_1.ApiOperation)({ summary: '市场统计' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('reviews/pending'),
    (0, swagger_1.ApiOperation)({ summary: '待审核 skill 列表' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "pending", null);
__decorate([
    (0, common_1.Post)('reviews/:skillId'),
    (0, swagger_1.ApiOperation)({ summary: '审核 skill（通过/退回）' }),
    __param(0, (0, common_1.Param)('skillId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, ReviewDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "review", null);
__decorate([
    (0, common_1.Post)('skills/:skillId/featured'),
    (0, swagger_1.ApiOperation)({ summary: '设置精选' }),
    __param(0, (0, common_1.Param)('skillId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, FeaturedDto]),
    __metadata("design:returntype", void 0)
], AdminController.prototype, "featured", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard, guards_1.RolesGuard),
    (0, guards_1.Roles)('admin'),
    (0, common_1.Controller)('admin'),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map