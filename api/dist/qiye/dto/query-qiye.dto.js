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
exports.QueryQiyeRolesDto = exports.QueryQiyeSkillsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class QueryQiyeSkillsDto {
    constructor() {
        this.page = 1;
        this.pageSize = 20;
    }
}
exports.QueryQiyeSkillsDto = QueryQiyeSkillsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '技能名称模糊搜索（匹配 name / displayName / descriptionZh）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryQiyeSkillsDto.prototype, "q", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: '来源过滤',
        enum: ['github', 'tencent', 'openclaw', 'hermes', 'totalclaw', 'clawskills', 'skilldb', 'totalclaw-community'],
    }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryQiyeSkillsDto.prototype, "source", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ['free', 'paid'], description: '收费类型' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['free', 'paid']),
    __metadata("design:type", String)
], QueryQiyeSkillsDto.prototype, "listingType", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryQiyeSkillsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryQiyeSkillsDto.prototype, "pageSize", void 0);
class QueryQiyeRolesDto {
    constructor() {
        this.page = 1;
        this.pageSize = 20;
    }
}
exports.QueryQiyeRolesDto = QueryQiyeRolesDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: '角色名称模糊搜索（匹配 name / displayName / descriptionZh）' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], QueryQiyeRolesDto.prototype, "q", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], QueryQiyeRolesDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 20, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], QueryQiyeRolesDto.prototype, "pageSize", void 0);
//# sourceMappingURL=query-qiye.dto.js.map