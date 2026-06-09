import { QiyeService } from './qiye.service';
import { QueryQiyeSkillsDto, QueryQiyeRolesDto } from './dto/query-qiye.dto';
export declare class QiyeController {
    private readonly qiyeService;
    constructor(qiyeService: QiyeService);
    listSkills(query: QueryQiyeSkillsDto): Promise<{
        items: {
            skillId: unknown;
            name: unknown;
            displayName: string;
            source: unknown;
            kind: "skill";
            category: string;
            description: string;
            isFree: boolean;
            listingType: unknown;
            pricing: {
                model: string;
                price: number;
                currency: string;
            };
            roleId: string;
            stats: {
                downloads: number;
            };
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
    listRoles(query: QueryQiyeRolesDto): Promise<{
        items: {
            roleId: string;
            skillId: unknown;
            name: unknown;
            displayName: string;
            source: unknown;
            kind: "role";
            category: string;
            description: string;
            emoji: string;
            color: string;
            isFree: boolean;
            listingType: unknown;
            pricing: {
                model: string;
                price: number;
                currency: string;
            };
            stats: {
                downloads: number;
            };
        }[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }>;
}
