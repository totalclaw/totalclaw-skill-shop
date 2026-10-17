import { HydratedDocument, Types } from 'mongoose';
export declare class Skill {
    skillId: string;
    slug: string;
    name: string;
    displayName?: string;
    description?: string;
    descriptionZh?: string;
    version?: string;
    author?: string;
    license?: string;
    homepage?: string;
    repository?: string;
    category?: string;
    tags: string[];
    platforms: string[];
    keywords: string[];
    source: string;
    sourceUrl?: string;
    installCommand?: string;
    contentMd?: string;
    requires: Record<string, unknown>;
    publishedAt?: Date;
    lastUpdated?: Date;
    syncedAt?: Date;
    kind: string;
    emoji?: string;
    color?: string;
    listingType: string;
    ownership: string;
    pricing: {
        model: string;
        price: number;
        currency: string;
    };
    developerId?: Types.ObjectId;
    reviewStatus: string;
    roleId?: string;
    reviewNote?: string;
    closedSource: boolean;
    stats: {
        downloads: number;
        sales: number;
        ratingAvg: number;
        ratingCount: number;
    };
    featured: boolean;
    securityAudit?: Record<string, unknown>;
}
export declare const SKILL_COUNT_INDEX_KEY: {
    readonly kind: 1;
    readonly reviewStatus: 1;
    readonly source: 1;
    readonly category: 1;
    readonly listingType: 1;
    readonly ownership: 1;
};
export declare const SKILL_COUNT_INDEX_NAME = "kind_reviewStatus_source_category_listingType_ownership";
export declare const SKILL_DOWNLOADS_INDEX_KEY: {
    readonly kind: 1;
    readonly 'stats.downloads': -1;
    readonly _id: -1;
};
export declare const SKILL_DOWNLOADS_INDEX_NAME = "kind_downloads_id";
export type SkillDocument = HydratedDocument<Skill>;
export declare const SkillSchema: import("mongoose").Schema<Skill, import("mongoose").Model<Skill, any, any, any, import("mongoose").Document<unknown, any, Skill, any, {}> & Skill & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Skill, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Skill>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Skill> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
