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
exports.EntitlementsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const entitlements_service_1 = require("./entitlements.service");
const guards_1 = require("../auth/guards");
const skills_service_1 = require("../skills/skills.service");
const download_util_1 = require("../common/download.util");
let EntitlementsController = class EntitlementsController {
    constructor(entitlements, skills) {
        this.entitlements = entitlements;
        this.skills = skills;
    }
    mine(req) {
        return this.entitlements.listByUser(req.user.userId);
    }
    async check(req, skillId) {
        const id = decodeURIComponent(skillId);
        return { owned: await this.entitlements.has(req.user.userId, id) };
    }
    async content(req, skillId) {
        const id = decodeURIComponent(skillId);
        const skill = await this.skills.detail(id, true);
        if (skill.closedSource || skill.listingType === 'paid') {
            const owned = await this.entitlements.has(req.user.userId, id);
            if (!owned)
                throw new common_1.ForbiddenException('skill not purchased');
        }
        return this.skills.getContent(id);
    }
    async download(req, skillId, res) {
        const id = decodeURIComponent(skillId);
        const dl = await this.skills.buildDownload(id);
        if (dl.closedSource || dl.listingType === 'paid') {
            const owned = await this.entitlements.has(req.user.userId, id);
            if (!owned)
                throw new common_1.ForbiddenException('skill not purchased');
        }
        await this.skills.incrementDownloads(id);
        (0, download_util_1.sendMarkdownAttachment)(res, dl.filename, dl.content);
    }
};
exports.EntitlementsController = EntitlementsController;
__decorate([
    (0, common_1.Get)('mine'),
    (0, swagger_1.ApiOperation)({ summary: '我的已购 skill' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], EntitlementsController.prototype, "mine", null);
__decorate([
    (0, common_1.Get)('check/:skillId'),
    (0, swagger_1.ApiOperation)({ summary: '检查是否已购买某 skill' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('skillId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EntitlementsController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('content/:skillId'),
    (0, swagger_1.ApiOperation)({ summary: '获取已购（含闭源）skill 正文，鉴权放行' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('skillId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EntitlementsController.prototype, "content", null);
__decorate([
    (0, common_1.Get)('download/:skillId'),
    (0, swagger_1.ApiOperation)({ summary: '下载已购（含收费/闭源）skill 的 SKILL.md，鉴权放行' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('skillId')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], EntitlementsController.prototype, "download", null);
exports.EntitlementsController = EntitlementsController = __decorate([
    (0, swagger_1.ApiTags)('entitlements'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Controller)('entitlements'),
    __metadata("design:paramtypes", [entitlements_service_1.EntitlementsService,
        skills_service_1.SkillsService])
], EntitlementsController);
//# sourceMappingURL=entitlements.controller.js.map