import { ActivationCodesService } from './activation-codes.service';
declare class RedeemDto {
    code: string;
}
declare class CreateBatchDto {
    skillId: string;
    count: number;
    maxActivations?: number;
    batchId?: string;
    remark?: string;
}
export declare class ActivationCodesController {
    private readonly service;
    constructor(service: ActivationCodesService);
    redeem(req: any, dto: RedeemDto): Promise<{
        ok: boolean;
        skillId: string;
    }>;
    createBatch(dto: CreateBatchDto): Promise<{
        count: number;
        codes: string[];
    }>;
}
export {};
