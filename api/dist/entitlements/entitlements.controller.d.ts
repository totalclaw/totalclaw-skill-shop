import { Response } from 'express';
import { EntitlementsService } from './entitlements.service';
import { SkillsService } from '../skills/skills.service';
export declare class EntitlementsController {
    private readonly entitlements;
    private readonly skills;
    constructor(entitlements: EntitlementsService, skills: SkillsService);
    mine(req: any): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./schemas/entitlement.schema").Entitlement, {}, {}> & import("./schemas/entitlement.schema").Entitlement & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    check(req: any, skillId: string): Promise<{
        owned: boolean;
    }>;
    content(req: any, skillId: string): Promise<any>;
    download(req: any, skillId: string, res: Response): Promise<void>;
}
