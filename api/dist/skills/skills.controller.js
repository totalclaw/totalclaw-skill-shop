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
exports.SkillsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const skills_service_1 = require("./skills.service");
const query_skills_dto_1 = require("./dto/query-skills.dto");
const download_util_1 = require("../common/download.util");
let SkillsController = class SkillsController {
    constructor(skillsService) {
        this.skillsService = skillsService;
    }
    list(query) {
        return this.skillsService.list(query);
    }
    categories(kind, source) {
        return this.skillsService.categories(kind, source);
    }
    sourcesSummary() {
        return this.skillsService.sourcesSummary();
    }
    detail(skillId) {
        return this.skillsService.detail(decodeURIComponent(skillId));
    }
    async download(skillId) {
        await this.skillsService.incrementDownloads(decodeURIComponent(skillId));
        return { ok: true };
    }
    async file(skillId, res) {
        const id = decodeURIComponent(skillId);
        const dl = await this.skillsService.buildDownload(id);
        if (dl.listingType === 'paid' || dl.closedSource) {
            throw new common_1.ForbiddenException('paid skill: purchase and download via /api/entitlements/download');
        }
        await this.skillsService.incrementDownloads(id);
        (0, download_util_1.sendMarkdownAttachment)(res, dl.filename, dl.content);
    }
};
exports.SkillsController = SkillsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '列表/检索（分页、分类、来源、标签、收费过滤）' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_skills_dto_1.QuerySkillsDto]),
    __metadata("design:returntype", void 0)
], SkillsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: '分类聚合（含计数）；kind=role 聚合角色分类；source 可按来源筛选' }),
    __param(0, (0, common_1.Query)('kind')),
    __param(1, (0, common_1.Query)('source')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SkillsController.prototype, "categories", null);
__decorate([
    (0, common_1.Get)('sources-summary'),
    (0, swagger_1.ApiOperation)({ summary: '来源聚合（含计数）' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SkillsController.prototype, "sourcesSummary", null);
__decorate([
    (0, common_1.Get)(':skillId'),
    (0, swagger_1.ApiOperation)({ summary: '详情（闭源 skill 默认裁剪正文）' }),
    __param(0, (0, common_1.Param)('skillId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], SkillsController.prototype, "detail", null);
__decorate([
    (0, common_1.Post)(':skillId/download'),
    (0, swagger_1.ApiOperation)({ summary: '下载埋点（免费 skill）' }),
    __param(0, (0, common_1.Param)('skillId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SkillsController.prototype, "download", null);
__decorate([
    (0, common_1.Get)(':skillId/file'),
    (0, swagger_1.ApiOperation)({ summary: '下载免费 skill 的 SKILL.md（收费/闭源走 /entitlements/download）' }),
    __param(0, (0, common_1.Param)('skillId')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SkillsController.prototype, "file", null);
exports.SkillsController = SkillsController = __decorate([
    (0, swagger_1.ApiTags)('skills'),
    (0, common_1.Controller)('skills'),
    __metadata("design:paramtypes", [skills_service_1.SkillsService])
], SkillsController);
//# sourceMappingURL=skills.controller.js.map