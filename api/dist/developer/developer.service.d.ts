import { Model, Types } from 'mongoose';
import { Earning, EarningDocument } from './schemas/earning.schema';
import { Skill, SkillDocument } from '../skills/schemas/skill.schema';
import { UsersService } from '../users/users.service';
export declare class DeveloperService {
    private readonly earningModel;
    private readonly skillModel;
    private readonly usersService;
    private readonly logger;
    constructor(earningModel: Model<EarningDocument>, skillModel: Model<SkillDocument>, usersService: UsersService);
    uploadSkill(developerId: string, body: {
        slug: string;
        name: string;
        description?: string;
        descriptionZh?: string;
        category?: string;
        tags?: string[];
        contentMd: string;
        price: number;
        license?: string;
        closedSource?: boolean;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Skill, {}, {}> & Skill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Skill, {}, {}> & Skill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    mySkills(developerId: string): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Skill, {}, {}> & Skill & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    settleEarning(params: {
        orderId: string;
        developerId: string | Types.ObjectId;
        skillId: string;
        gross: number;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Earning, {}, {}> & Earning & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Earning, {}, {}> & Earning & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    earnings(developerId: string): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Earning, {}, {}> & Earning & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: Types.ObjectId;
    }>)[]>;
}
