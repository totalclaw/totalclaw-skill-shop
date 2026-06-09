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
exports.QuerySkillsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class QuerySkillsDto {
    constructor() {
        this.page = 1;
        this.pageSize = 24;
    }
}
exports.QuerySkillsDto = QuerySkillsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '关键词搜索（name/description）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuerySkillsDto.prototype, "q", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '分类' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuerySkillsDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '多分类（逗号分隔，命中任一即匹配；用于按大类筛选）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuerySkillsDto.prototype, "categories", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '来源（totalclaw-community = TotalClaw 社区免费技能）', enum: ['github', 'tencent', 'openclaw', 'hermes', 'totalclaw', 'clawskills', 'skilldb', 'totalclaw-community'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuerySkillsDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '标签（单个）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuerySkillsDto.prototype, "tag", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '类型', enum: ['skill', 'role'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['skill', 'role']),
    __metadata("design:type", String)
], QuerySkillsDto.prototype, "kind", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['free', 'paid'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['free', 'paid']),
    __metadata("design:type", String)
], QuerySkillsDto.prototype, "listingType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['community', 'totalclaw-proprietary', 'developer'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QuerySkillsDto.prototype, "ownership", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '排序', enum: ['latest', 'downloads', 'sales', 'rating'] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['latest', 'downloads', 'sales', 'rating']),
    __metadata("design:type", String)
], QuerySkillsDto.prototype, "sort", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QuerySkillsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 24, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QuerySkillsDto.prototype, "pageSize", void 0);
//# sourceMappingURL=query-skills.dto.js.map