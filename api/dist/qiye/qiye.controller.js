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
exports.QiyeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const qiye_service_1 = require("./qiye.service");
const query_qiye_dto_1 = require("./dto/query-qiye.dto");
let QiyeController = class QiyeController {
    constructor(qiyeService) {
        this.qiyeService = qiyeService;
    }
    listSkills(query) {
        return this.qiyeService.listSkills(query);
    }
    listRoles(query) {
        return this.qiyeService.listRoles(query);
    }
};
exports.QiyeController = QiyeController;
__decorate([
    (0, common_1.Get)('skills'),
    (0, swagger_1.ApiOperation)({
        summary: 'qiye-app：技能列表（分页 20 条，支持来源过滤 + 名称模糊查询）',
        description: [
            '返回 kind=skill 的技能列表。',
            '每条记录包含 skillId、isFree 标识、listingType、pricing、',
            '以及 roleId（若该技能绑定了某角色则为角色 skillId，否则为 null）。',
            '支持 source 来源过滤（含虚拟来源 totalclaw-community）、',
            'q 对 name/displayName/descriptionZh 模糊搜索、listingType 收费过滤。',
            '分页默认 20 条，最大 100 条。',
        ].join('\n'),
    }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '技能分页列表',
        schema: {
            example: {
                items: [
                    {
                        skillId: 'github:owner/slug',
                        name: 'example-skill',
                        displayName: '示例技能',
                        source: 'github',
                        kind: 'skill',
                        category: '工程研发',
                        description: '技能描述',
                        isFree: true,
                        listingType: 'free',
                        pricing: { model: 'free', price: 0, currency: 'CNY' },
                        roleId: null,
                        stats: { downloads: 100 },
                    },
                ],
                total: 252975,
                page: 1,
                pageSize: 20,
                totalPages: 12649,
            },
        },
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_qiye_dto_1.QueryQiyeSkillsDto]),
    __metadata("design:returntype", void 0)
], QiyeController.prototype, "listSkills", null);
__decorate([
    (0, common_1.Get)('roles'),
    (0, swagger_1.ApiOperation)({
        summary: 'qiye-app：角色（AI 员工）列表（分页 20 条，支持名称模糊查询）',
        description: [
            '返回 kind=role 的 AI 员工角色列表。',
            '每条记录包含 roleId（= skillId）、isFree 标识、listingType、pricing、emoji、color。',
            'q 对 name/displayName/descriptionZh 做模糊搜索。',
            '分页默认 20 条，最大 100 条。',
        ].join('\n'),
    }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false, description: '角色名称模糊搜索' }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, description: '页码（默认 1）' }),
    (0, swagger_1.ApiQuery)({ name: 'pageSize', required: false, description: '每页条数（默认 20，最大 100）' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: '角色分页列表',
        schema: {
            example: {
                items: [
                    {
                        roleId: 'role:totalclaw/product-manager',
                        skillId: 'role:totalclaw/product-manager',
                        name: '产品经理',
                        displayName: '产品经理',
                        source: 'totalclaw',
                        kind: 'role',
                        category: '互联网研发',
                        description: '负责产品规划与迭代',
                        emoji: '📊',
                        color: '#4F46E5',
                        isFree: true,
                        listingType: 'free',
                        pricing: { model: 'free', price: 0, currency: 'CNY' },
                        stats: { downloads: 50 },
                    },
                ],
                total: 27381,
                page: 1,
                pageSize: 20,
                totalPages: 1370,
            },
        },
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [query_qiye_dto_1.QueryQiyeRolesDto]),
    __metadata("design:returntype", void 0)
], QiyeController.prototype, "listRoles", null);
exports.QiyeController = QiyeController = __decorate([
    (0, swagger_1.ApiTags)('qiye-app'),
    (0, common_1.Controller)('qiye'),
    __metadata("design:paramtypes", [qiye_service_1.QiyeService])
], QiyeController);
//# sourceMappingURL=qiye.controller.js.map