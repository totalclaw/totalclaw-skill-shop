import { HydratedDocument } from 'mongoose';
export declare class SyncRun {
    source: string;
    startedAt: Date;
    finishedAt?: Date;
    upserted: number;
    failed: number;
    status: string;
    error?: string;
}
export type SyncRunDocument = HydratedDocument<SyncRun>;
export declare const SyncRunSchema: import("mongoose").Schema<SyncRun, import("mongoose").Model<SyncRun, any, any, any, import("mongoose").Document<unknown, any, SyncRun, any, {}> & SyncRun & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SyncRun, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<SyncRun>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<SyncRun> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
