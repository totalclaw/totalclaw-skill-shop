import { Model, Types } from 'mongoose';
import { ActivationCode, ActivationCodeDocument } from './schemas/activation-code.schema';
import { EntitlementsService } from '../entitlements/entitlements.service';
export declare class ActivationCodesService {
    private readonly model;
    private readonly entitlements;
    constructor(model: Model<ActivationCodeDocument>, entitlements: EntitlementsService);
    private genCode;
    createBatch(params: {
        skillId: string;
        count: number;
        maxActivations?: number;
        batchId?: string;
        remark?: string;
        expiresAt?: Date;
    }): Promise<{
        count: number;
        codes: string[];
    }>;
    redeem(code: string, userId: string): Promise<{
        ok: boolean;
        skillId: string;
    }>;
    listByBatch(batchId: string): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, ActivationCode, {}, {}> & ActivationCode & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: Types.ObjectId;
    }>)[]>;
}
