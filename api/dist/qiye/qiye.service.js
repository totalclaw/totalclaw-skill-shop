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
exports.QiyeService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const skill_schema_1 = require("../skills/schemas/skill.schema");
const ttl_cache_util_1 = require("../common/ttl-cache.util");
const COUNT_TTL_MS = 300_000;
const QIYE_PROJECTION = 'skillId name displayName slug source category description descriptionZh ' +
    'kind emoji color listingType pricing roleId stats.downloads -_id';
let QiyeService = class QiyeService {
    constructor(skillModel) {
        this.skillModel = skillModel;
    }
    async listSkills(query) {
        const filter = {
            kind: 'skill',
            reviewStatus: { $in: ['n/a', 'approved'] },
        };
        if (query.source === 'totalclaw-community') {
            filter.source = 'totalclaw';
            filter.ownership = 'community';
        }
        else if (query.source) {
            filter.source = query.source;
        }
        if (query.listingType)
            filter.listingType = query.listingType;
        if (query.q) {
            const re = new RegExp(escapeRegex(query.q), 'i');
            filter.$or = [{ name: re }, { displayName: re }, { descriptionZh: re }, { description: re }];
        }
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const [docs, total] = await Promise.all([
            this.skillModel
                .find(filter)
                .select(QIYE_PROJECTION)
                .sort({ 'stats.downloads': -1, _id: -1 })
                .skip(skip)
                .limit(pageSize)
                .lean()
                .exec(),
            this.countCached(filter),
        ]);
        return {
            items: docs.map(mapSkillItem),
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    async listRoles(query) {
        const filter = {
            kind: 'role',
            reviewStatus: { $in: ['n/a', 'approved'] },
        };
        if (query.q) {
            const re = new RegExp(escapeRegex(query.q), 'i');
            filter.$or = [{ name: re }, { displayName: re }, { descriptionZh: re }, { description: re }];
        }
        const page = query.page ?? 1;
        const pageSize = query.pageSize ?? 20;
        const skip = (page - 1) * pageSize;
        const [docs, total] = await Promise.all([
            this.skillModel
                .find(filter)
                .select(QIYE_PROJECTION)
                .sort({ 'stats.downloads': -1, _id: -1 })
                .skip(skip)
                .limit(pageSize)
                .lean()
                .exec(),
            this.countCached(filter),
        ]);
        return {
            items: docs.map(mapRoleItem),
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
    countCached(filter) {
        return (0, ttl_cache_util_1.cached)((0, ttl_cache_util_1.filterKey)('qiye-cnt:', filter), COUNT_TTL_MS, () => this.skillModel.countDocuments(filter).exec());
    }
};
exports.QiyeService = QiyeService;
exports.QiyeService = QiyeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(skill_schema_1.Skill.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], QiyeService);
function mapSkillItem(doc) {
    const pricing = doc.pricing ?? {};
    const stats = doc.stats ?? {};
    return {
        skillId: doc.skillId,
        name: doc.name,
        displayName: doc.displayName || null,
        source: doc.source,
        kind: 'skill',
        category: doc.category || null,
        description: doc.descriptionZh || doc.description || null,
        isFree: doc.listingType === 'free',
        listingType: doc.listingType,
        pricing: {
            model: pricing.model ?? 'free',
            price: pricing.price ?? 0,
            currency: pricing.currency ?? 'CNY',
        },
        roleId: doc.roleId || null,
        stats: { downloads: stats.downloads ?? 0 },
    };
}
function mapRoleItem(doc) {
    const pricing = doc.pricing ?? {};
    const stats = doc.stats ?? {};
    return {
        roleId: doc.skillId,
        skillId: doc.skillId,
        name: doc.name,
        displayName: doc.displayName || null,
        source: doc.source,
        kind: 'role',
        category: doc.category || null,
        description: doc.descriptionZh || doc.description || null,
        emoji: doc.emoji || null,
        color: doc.color || null,
        isFree: doc.listingType === 'free',
        listingType: doc.listingType,
        pricing: {
            model: pricing.model ?? 'free',
            price: pricing.price ?? 0,
            currency: pricing.currency ?? 'CNY',
        },
        stats: { downloads: stats.downloads ?? 0 },
    };
}
function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
//# sourceMappingURL=qiye.service.js.map