import { AdminService } from './admin.service';
declare class ReviewDto {
    action: 'approve' | 'reject';
    note?: string;
}
declare class FeaturedDto {
    featured: boolean;
}
export declare class AdminController {
    private readonly admin;
    constructor(admin: AdminService);
    stats(): Promise<{
        total: number;
        paid: number;
        pending: number;
        bySource: any[];
    }>;
    pending(): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../skills/schemas/skill.schema").Skill, {}, {}> & import("../skills/schemas/skill.schema").Skill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    review(skillId: string, dto: ReviewDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../skills/schemas/skill.schema").Skill, {}, {}> & import("../skills/schemas/skill.schema").Skill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("../skills/schemas/skill.schema").Skill, {}, {}> & import("../skills/schemas/skill.schema").Skill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    featured(skillId: string, dto: FeaturedDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../skills/schemas/skill.schema").Skill, {}, {}> & import("../skills/schemas/skill.schema").Skill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, import("../skills/schemas/skill.schema").Skill, {}, {}> & import("../skills/schemas/skill.schema").Skill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
export {};
