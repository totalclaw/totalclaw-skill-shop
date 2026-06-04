import { Model } from 'mongoose';
import { Skill, SkillDocument } from './schemas/skill.schema';
import { QuerySkillsDto } from './dto/query-skills.dto';
export declare class SkillsService {
    private readonly skillModel;
    constructor(skillModel: Model<SkillDocument>);
    list(query: QuerySkillsDto): Promise<{
        items: (import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Skill, {}, {}> & Skill & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        }> & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    detail(skillId: string, includeContent?: boolean): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Skill, {}, {}> & Skill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getContent(skillId: string): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Skill, {}, {}> & Skill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    categories(kind?: string): Promise<any[]>;
    sourcesSummary(): Promise<any[]>;
    incrementDownloads(skillId: string): Promise<void>;
    buildDownload(skillId: string): Promise<{
        filename: string;
        displayName: string;
        content: string;
        listingType: string;
        closedSource: boolean;
    }>;
    private escapeRegex;
}
