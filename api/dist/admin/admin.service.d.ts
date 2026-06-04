import { Model } from 'mongoose';
import { Skill, SkillDocument } from '../skills/schemas/skill.schema';
export declare class AdminService {
    private readonly skillModel;
    constructor(skillModel: Model<SkillDocument>);
    pendingReviews(): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Skill, {}, {}> & Skill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    review(skillId: string, action: 'approve' | 'reject', note?: string, securityAudit?: Record<string, unknown>): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Skill, {}, {}> & Skill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Skill, {}, {}> & Skill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    setFeatured(skillId: string, featured: boolean): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Skill, {}, {}> & Skill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Skill, {}, {}> & Skill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    stats(): Promise<{
        total: number;
        paid: number;
        pending: number;
        bySource: any[];
    }>;
}
