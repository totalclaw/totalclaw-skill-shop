import { Response } from 'express';
import { SkillsService } from './skills.service';
import { QuerySkillsDto } from './dto/query-skills.dto';
export declare class SkillsController {
    private readonly skillsService;
    constructor(skillsService: SkillsService);
    list(query: QuerySkillsDto): Promise<{
        items: (import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./schemas/skill.schema").Skill, {}, {}> & import("./schemas/skill.schema").Skill & {
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
    categories(kind?: string): Promise<any[]>;
    sourcesSummary(): Promise<any[]>;
    detail(skillId: string): Promise<import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./schemas/skill.schema").Skill, {}, {}> & import("./schemas/skill.schema").Skill & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    download(skillId: string): Promise<{
        ok: boolean;
    }>;
    file(skillId: string, res: Response): Promise<void>;
}
