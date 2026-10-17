import { OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { Skill, SkillDocument } from './schemas/skill.schema';
import { QuerySkillsDto } from './dto/query-skills.dto';
export declare class SkillsService implements OnModuleInit {
    private readonly skillModel;
    private readonly logger;
    constructor(skillModel: Model<SkillDocument>);
    onModuleInit(): Promise<void>;
    private healKinds;
    list(query: QuerySkillsDto): Promise<unknown>;
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
    categories(kind?: string, source?: string): Promise<any[]>;
    private loadCategories;
    sourcesSummary(): Promise<any[]>;
    private loadSourcesSummary;
    incrementDownloads(skillId: string): Promise<void>;
    buildDownload(skillId: string): Promise<{
        filename: string;
        displayName: string;
        content: string;
        listingType: string;
        closedSource: boolean;
    }>;
    namesList(kind?: string, source?: string, listingType?: string): Promise<unknown>;
    findByName(nameOrSlug: string): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Skill, {}, {}> & Skill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    resolveSkillId(raw: string): Promise<string>;
    buildDownloadByNameOrId(nameOrId: string): Promise<{
        filename: string;
        displayName: string;
        content: string;
        listingType: string;
        closedSource: boolean;
    }>;
    private escapeRegex;
}
