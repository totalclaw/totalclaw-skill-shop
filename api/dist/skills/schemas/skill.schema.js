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
exports.SkillSchema = exports.Skill = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let Skill = class Skill {
};
exports.Skill = Skill;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true, index: true, trim: true }),
    __metadata("design:type", String)
], Skill.prototype, "skillId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], Skill.prototype, "slug", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], Skill.prototype, "name", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Skill.prototype, "displayName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Skill.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Skill.prototype, "descriptionZh", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Skill.prototype, "version", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Skill.prototype, "author", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Skill.prototype, "license", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Skill.prototype, "homepage", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Skill.prototype, "repository", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, index: true }),
    __metadata("design:type", String)
], Skill.prototype, "category", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [], index: true }),
    __metadata("design:type", Array)
], Skill.prototype, "tags", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Skill.prototype, "platforms", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: [String], default: [] }),
    __metadata("design:type", Array)
], Skill.prototype, "keywords", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, index: true }),
    __metadata("design:type", String)
], Skill.prototype, "source", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Skill.prototype, "sourceUrl", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Skill.prototype, "installCommand", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Skill.prototype, "contentMd", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object, default: {} }),
    __metadata("design:type", Object)
], Skill.prototype, "requires", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Skill.prototype, "publishedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Skill.prototype, "lastUpdated", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], Skill.prototype, "syncedAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'skill', index: true }),
    __metadata("design:type", String)
], Skill.prototype, "kind", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Skill.prototype, "emoji", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Skill.prototype, "color", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'free', index: true }),
    __metadata("design:type", String)
], Skill.prototype, "listingType", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, default: 'community', index: true }),
    __metadata("design:type", String)
], Skill.prototype, "ownership", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: { model: String, price: Number, currency: String },
        default: { model: 'free', price: 0, currency: 'CNY' },
    }),
    __metadata("design:type", Object)
], Skill.prototype, "pricing", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Skill.prototype, "developerId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'n/a', index: true }),
    __metadata("design:type", String)
], Skill.prototype, "reviewStatus", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], Skill.prototype, "reviewNote", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], Skill.prototype, "closedSource", void 0);
__decorate([
    (0, mongoose_1.Prop)({
        type: {
            downloads: Number,
            sales: Number,
            ratingAvg: Number,
            ratingCount: Number,
        },
        default: { downloads: 0, sales: 0, ratingAvg: 0, ratingCount: 0 },
    }),
    __metadata("design:type", Object)
], Skill.prototype, "stats", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false, index: true }),
    __metadata("design:type", Boolean)
], Skill.prototype, "featured", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: Object }),
    __metadata("design:type", Object)
], Skill.prototype, "securityAudit", void 0);
exports.Skill = Skill = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'skills' })
], Skill);
exports.SkillSchema = mongoose_1.SchemaFactory.createForClass(Skill);
exports.SkillSchema.index({ kind: 1, syncedAt: -1, _id: -1 });
exports.SkillSchema.index({ kind: 1, syncedAt: -1 });
exports.SkillSchema.index({ kind: 1, category: 1 });
exports.SkillSchema.index({ kind: 1, source: 1 });
exports.SkillSchema.index({ kind: 1, listingType: 1 });
exports.SkillSchema.index({ kind: 1, 'stats.downloads': -1 });
//# sourceMappingURL=skill.schema.js.map