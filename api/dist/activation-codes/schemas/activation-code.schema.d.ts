import { HydratedDocument, Types } from 'mongoose';
export declare class ActivationCode {
    code: string;
    skillId: string;
    maxActivations: number;
    activatedCount: number;
    activations: {
        userId: Types.ObjectId;
        at: Date;
    }[];
    batchId?: string;
    remark?: string;
    disabled: boolean;
    expiresAt?: Date;
}
export type ActivationCodeDocument = HydratedDocument<ActivationCode>;
export declare const ActivationCodeSchema: import("mongoose").Schema<ActivationCode, import("mongoose").Model<ActivationCode, any, any, any, import("mongoose").Document<unknown, any, ActivationCode, any, {}> & ActivationCode & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ActivationCode, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<ActivationCode>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<ActivationCode> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
