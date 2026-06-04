import { DeveloperService } from './developer.service';
declare class UploadSkillDto {
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
}
export declare class DeveloperController {
    private readonly developer;
    constructor(developer: DeveloperService);
    upload(req: any, dto: UploadSkillDto): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, import("../skills/schemas/skill.schema").Skill, {}, {}> & import("../skills/schemas/skill.schema").Skill & {
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
    mySkills(req: any): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("../skills/schemas/skill.schema").Skill, {}, {}> & import("../skills/schemas/skill.schema").Skill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    earnings(req: any): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./schemas/earning.schema").Earning, {}, {}> & import("./schemas/earning.schema").Earning & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
}
export {};
