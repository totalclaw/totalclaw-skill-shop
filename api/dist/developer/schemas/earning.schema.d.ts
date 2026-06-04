import { HydratedDocument, Types } from 'mongoose';
export declare class Earning {
    orderId: string;
    developerId: Types.ObjectId;
    skillId: string;
    gross: number;
    platformFeeRate: number;
    platformFee: number;
    net: number;
    status: string;
}
export type EarningDocument = HydratedDocument<Earning>;
export declare const EarningSchema: import("mongoose").Schema<Earning, import("mongoose").Model<Earning, any, any, any, import("mongoose").Document<unknown, any, Earning, any, {}> & Earning & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Earning, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Earning>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Earning> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
