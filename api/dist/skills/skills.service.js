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
var SkillsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const skill_schema_1 = require("./schemas/skill.schema");
const skill_id_util_1 = require("../common/skill-id.util");
const ttl_cache_util_1 = require("../common/ttl-cache.util");
const LIST_PROJECTION = '-contentMd';
let SkillsService = SkillsService_1 = class SkillsService {
    constructor(skillModel) {
        this.skillModel = skillModel;
        this.logger = new common_1.Logger(SkillsService_1.name);
    }
    async onModuleInit() {
        try {
            await this.skillModel.collection.createIndex({ kind: 1, syncedAt: -1, _id: -1 }, { name: 'kind_1_syncedAt_-1__id_-1', background: true });
            await this.skillModel.collection.createIndex({ ...skill_schema_1.SKILL_COUNT_INDEX_KEY }, { name: skill_schema_1.SKILL_COUNT_INDEX_NAME, background: true });
            await this.skillModel.collection.createIndex({ ...skill_schema_1.SKILL_DOWNLOADS_INDEX_KEY }, { name: skill_schema_1.SKILL_DOWNLOADS_INDEX_NAME, background: true });
        }
        catch (e) {
            this.logger.warn('onModuleInit 建索引失败（不影响启动）: ' + e.message);
        }
        void this.healKinds().catch((e) => this.logger.warn('kind 自愈失败（不影响服务）: ' + e.message));
    }
    async healKinds() {
        const skillFilter = { kind: null, skillId: { $not: /^role:/ } };
        if (await this.skillModel.exists(skillFilter)) {
            const r = await this.skillModel.updateMany(skillFilter, { $set: { kind: 'skill' } }).exec();
            this.logger.log(`kind 补全：${r.modifiedCount} 个无 kind 文档 → 'skill'`);
        }
        const roleFilter = { skillId: /^role:/, kind: { $ne: 'role' } };
        if (await this.skillModel.exists(roleFilter)) {
            const r = await this.skillModel.updateMany(roleFilter, { $set: { kind: 'role' } }).exec();
            this.logger.warn(`角色 kind 修正：${r.modifiedCount} 个 role:* 文档 kind 非 'role'，已修正`);
        }
    }
    async list(query) {
        const ckey = 'list:' + JSON.stringify(query);
        const hit = (0, ttl_cache_util_1.cacheGet)(ckey, 60_000);
        if (hit)
            return hit;
        const filter = {};
        filter.reviewStatus = { $in: ['n/a', 'approved'] };
        filter.kind = query.kind === 'role' ? 'role' : 'skill';
        if (query.categories) {
            const list = String(query.categories).split(',').map((s) => s.trim()).filter(Boolean);
            if (list.length)
                filter.category = { $in: list };
        }
        else if (query.category) {
            filter.category = query.category;
        }
        if (query.source === 'totalclaw-community') {
            filter.source = 'totalclaw';
            filter.ownership = 'community';
        }
        else if (query.source) {
            filter.source = query.source;
        }
        if (query.tag)
            filter.tags = query.tag;
        if (query.listingType)
            filter.listingType = query.listingType;
        if (query.ownership)
            filter.ownership = query.ownership;
        if (query.q) {
            const re = new RegExp(this.escapeRegex(query.q), 'i');
            filter.$or = [{ name: re }, { description: re }, { descriptionZh: re }, { keywords: re }];
        }
        const sortMap = {
            latest: { syncedAt: -1, _id: -1 },
            downloads: { 'stats.downloads': -1 },
            sales: { 'stats.sales': -1 },
            rating: { 'stats.ratingAvg': -1 },
        };
        const sort = sortMap[query.sort || 'latest'] || sortMap.latest;
        const page = query.page || 1;
        const pageSize = query.pageSize || 24;
        const skip = (page - 1) * pageSize;
        const cntKey = (0, ttl_cache_util_1.filterKey)('cnt:', filter);
        const [items, total] = await Promise.all([
            this.skillModel.find(filter).select(LIST_PROJECTION).sort(sort).skip(skip).limit(pageSize).lean().exec(),
            (0, ttl_cache_util_1.cached)(cntKey, 300_000, () => this.skillModel.countDocuments(filter).hint(skill_schema_1.SKILL_COUNT_INDEX_NAME).exec()),
        ]);
        const res = { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
        (0, ttl_cache_util_1.cacheSet)(ckey, res);
        return res;
    }
    async detail(skillId, includeContent = false) {
        const doc = await this.skillModel.findOne({ skillId }).lean().exec();
        if (!doc)
            throw new common_1.NotFoundException('skill not found');
        if (doc.closedSource && !includeContent) {
            delete doc.contentMd;
        }
        return doc;
    }
    async getContent(skillId) {
        const doc = await this.skillModel.findOne({ skillId }).select('skillId name contentMd').lean().exec();
        if (!doc)
            throw new common_1.NotFoundException('skill not found');
        return doc;
    }
    async categories(kind, source) {
        const ck = 'cat:' + (kind === 'role' ? 'role' : 'skill') + (source ? ':' + source : '');
        return (0, ttl_cache_util_1.cached)(ck, 600_000, () => this.loadCategories(kind, source));
    }
    async loadCategories(kind, source) {
        const kindMatch = kind === 'role' ? 'role' : 'skill';
        const match = { reviewStatus: { $in: ['n/a', 'approved'] }, kind: kindMatch };
        if (source === 'totalclaw-community') {
            match.source = 'totalclaw';
            match.ownership = 'community';
        }
        else if (source) {
            match.source = source;
        }
        const r = await this.skillModel.aggregate([
            { $match: match },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]).hint(skill_schema_1.SKILL_COUNT_INDEX_NAME);
        return r;
    }
    async sourcesSummary() {
        return (0, ttl_cache_util_1.cached)('sources', 600_000, () => this.loadSourcesSummary());
    }
    async loadSourcesSummary() {
        const [realSources, communityCount] = await Promise.all([
            this.skillModel.aggregate([
                { $match: { reviewStatus: { $in: ['n/a', 'approved'] }, kind: 'skill' } },
                { $group: { _id: '$source', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]).hint(skill_schema_1.SKILL_COUNT_INDEX_NAME),
            this.skillModel.countDocuments({
                reviewStatus: { $in: ['n/a', 'approved'] },
                kind: 'skill',
                source: 'totalclaw',
                ownership: 'community',
            }).hint(skill_schema_1.SKILL_COUNT_INDEX_NAME).exec(),
        ]);
        const result = [...realSources];
        if (communityCount > 0) {
            const tcIdx = result.findIndex((r) => r._id === 'totalclaw');
            result.splice(tcIdx >= 0 ? tcIdx + 1 : 0, 0, { _id: 'totalclaw-community', count: communityCount });
        }
        return result;
    }
    async incrementDownloads(skillId) {
        await this.skillModel.updateOne({ skillId }, { $inc: { 'stats.downloads': 1 } }).exec();
    }
    async buildDownload(skillId) {
        const doc = await this.skillModel.findOne({ skillId }).lean().exec();
        if (!doc)
            throw new common_1.NotFoundException('skill not found');
        const name = doc.displayName || doc.name || doc.slug || skillId;
        const desc = doc.descriptionZh || doc.description || '';
        const meta = [`# ${name}`, ''];
        if (desc)
            meta.push(desc, '');
        const kv = [
            ['skillId', doc.skillId],
            ['来源', doc.source],
            ['作者', doc.author],
            ['版本', doc.version],
            ['许可', doc.license],
            ['分类', doc.category],
            ['仓库', doc.repository],
            ['主页', doc.homepage],
            ['安装命令', doc.installCommand],
        ];
        const lines = kv.filter(([, v]) => v).map(([k, v]) => `- **${k}**: ${v}`);
        if (lines.length)
            meta.push('## 元数据', ...lines, '');
        const bodyMd = doc.contentMd && doc.contentMd.trim()
            ? doc.contentMd
            : '> 该 skill 暂无内置正文。请按上面的「仓库」或「安装命令」获取完整内容。';
        const content = `${meta.join('\n')}---\n\n${bodyMd}\n`;
        const base = String(doc.slug || doc.skillId).replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'skill';
        return {
            filename: `${base}.md`,
            displayName: name,
            content,
            listingType: doc.listingType,
            closedSource: !!doc.closedSource,
        };
    }
    async namesList(kind, source, listingType) {
        const ck = `names:${kind ?? ''}:${source ?? ''}:${listingType ?? ''}`;
        const hit = (0, ttl_cache_util_1.cacheGet)(ck, 300_000);
        if (hit)
            return hit;
        const filter = { reviewStatus: { $in: ['n/a', 'approved'] } };
        filter.kind = kind === 'role' ? 'role' : 'skill';
        if (source === 'totalclaw-community') {
            filter.source = 'totalclaw';
            filter.ownership = 'community';
        }
        else if (source)
            filter.source = source;
        if (listingType)
            filter.listingType = listingType;
        const items = await this.skillModel
            .find(filter)
            .select('skillId name slug displayName listingType source')
            .sort({ 'stats.downloads': -1, _id: -1 })
            .hint(skill_schema_1.SKILL_DOWNLOADS_INDEX_NAME)
            .limit(50000)
            .lean()
            .exec();
        const result = { total: items.length, items };
        (0, ttl_cache_util_1.cacheSet)(ck, result);
        return result;
    }
    async findByName(nameOrSlug) {
        const q = String(nameOrSlug || '').trim();
        if (!q)
            throw new common_1.NotFoundException('name required');
        const re = new RegExp(`^${this.escapeRegex(q)}$`, 'i');
        const doc = await this.skillModel
            .findOne({
            reviewStatus: { $in: ['n/a', 'approved'] },
            $or: [{ name: re }, { slug: re }, { displayName: re }],
        })
            .lean()
            .exec();
        if (!doc) {
            const prefix = new RegExp(`^${this.escapeRegex(q)}`, 'i');
            const fallback = await this.skillModel
                .findOne({
                reviewStatus: { $in: ['n/a', 'approved'] },
                $or: [{ name: prefix }, { slug: prefix }, { displayName: prefix }],
            })
                .lean()
                .exec();
            if (!fallback)
                throw new common_1.NotFoundException('skill not found by name: ' + q);
            return fallback;
        }
        return doc;
    }
    async resolveSkillId(raw) {
        for (const candidate of (0, skill_id_util_1.skillIdCandidates)(raw)) {
            const doc = await this.skillModel.findOne({ skillId: candidate }).select('skillId').lean().exec();
            if (doc)
                return String(doc.skillId);
        }
        return String(raw || '').trim();
    }
    async buildDownloadByNameOrId(nameOrId) {
        for (const candidate of (0, skill_id_util_1.skillIdCandidates)(nameOrId)) {
            const byId = await this.skillModel.findOne({ skillId: candidate }).lean().exec();
            if (byId)
                return this.buildDownload(byId.skillId);
        }
        const byName = await this.findByName(nameOrId);
        return this.buildDownload(byName.skillId);
    }
    escapeRegex(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};
exports.SkillsService = SkillsService;
exports.SkillsService = SkillsService = SkillsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(skill_schema_1.Skill.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SkillsService);
//# sourceMappingURL=skills.service.js.map