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
exports.SkillsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const skill_schema_1 = require("./schemas/skill.schema");
const LIST_PROJECTION = '-contentMd';
const _cache = new Map();
function cacheGet(key, ttlMs) {
    const e = _cache.get(key);
    if (e && Date.now() - e.at < ttlMs)
        return e.data;
    return undefined;
}
function cacheSet(key, data) {
    if (_cache.size > 1000)
        _cache.clear();
    _cache.set(key, { at: Date.now(), data });
}
let SkillsService = class SkillsService {
    constructor(skillModel) {
        this.skillModel = skillModel;
    }
    async list(query) {
        const ckey = 'list:' + JSON.stringify(query);
        const cached = cacheGet(ckey, 60_000);
        if (cached)
            return cached;
        const filter = {};
        filter.reviewStatus = { $in: ['n/a', 'approved'] };
        filter.kind = query.kind === 'role' ? 'role' : { $ne: 'role' };
        if (query.categories) {
            const list = String(query.categories).split(',').map((s) => s.trim()).filter(Boolean);
            if (list.length)
                filter.category = { $in: list };
        }
        else if (query.category) {
            filter.category = query.category;
        }
        if (query.source)
            filter.source = query.source;
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
        const [items, total] = await Promise.all([
            this.skillModel.find(filter).select(LIST_PROJECTION).sort(sort).skip(skip).limit(pageSize).lean().exec(),
            this.skillModel.countDocuments(filter).exec(),
        ]);
        const res = { items, total, page, pageSize, totalPages: Math.ceil(total / pageSize) };
        cacheSet(ckey, res);
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
    async categories(kind) {
        const ck = 'cat:' + (kind === 'role' ? 'role' : 'skill');
        const c = cacheGet(ck, 600_000);
        if (c)
            return c;
        const kindMatch = kind === 'role' ? 'role' : { $ne: 'role' };
        const r = await this.skillModel.aggregate([
            { $match: { reviewStatus: { $in: ['n/a', 'approved'] }, kind: kindMatch } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        cacheSet(ck, r);
        return r;
    }
    async sourcesSummary() {
        const c = cacheGet('sources', 600_000);
        if (c)
            return c;
        const r = await this.skillModel.aggregate([
            { $match: { reviewStatus: { $in: ['n/a', 'approved'] }, kind: { $ne: 'role' } } },
            { $group: { _id: '$source', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        cacheSet('sources', r);
        return r;
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
    escapeRegex(s) {
        return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
};
exports.SkillsService = SkillsService;
exports.SkillsService = SkillsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(skill_schema_1.Skill.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], SkillsService);
//# sourceMappingURL=skills.service.js.map