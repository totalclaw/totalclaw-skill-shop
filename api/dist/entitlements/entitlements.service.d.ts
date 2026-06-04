import { Model, Types } from 'mongoose';
import { Entitlement, EntitlementDocument } from './schemas/entitlement.schema';
export declare class EntitlementsService {
    private readonly model;
    constructor(model: Model<EntitlementDocument>);
    grant(params: {
        userId: string | Types.ObjectId;
        skillId: string;
        orderId?: string;
        source?: string;
        metadata?: Record<string, unknown>;
    }): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Entitlement, {}, {}> & Entitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Entitlement, {}, {}> & Entitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    has(userId: string | Types.ObjectId, skillId: string): Promise<boolean>;
    listByUser(userId: string | Types.ObjectId): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Entitlement, {}, {}> & Entitlement & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: Types.ObjectId;
    }>)[]>;
}
