import { HydratedDocument, Types } from 'mongoose';
export declare class Entitlement {
    userId: Types.ObjectId;
    skillId: string;
    orderId?: string;
    source: string;
    grantedAt: Date;
    expiresAt?: Date;
    metadata?: Record<string, unknown>;
}
export type EntitlementDocument = HydratedDocument<Entitlement>;
export declare const EntitlementSchema: import("mongoose").Schema<Entitlement, import("mongoose").Model<Entitlement, any, any, any, import("mongoose").Document<unknown, any, Entitlement, any, {}> & Entitlement & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Entitlement, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Entitlement>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Entitlement> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
