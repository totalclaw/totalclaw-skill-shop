import { Model } from 'mongoose';
import { SyncRun, SyncRunDocument } from './schemas/sync-run.schema';
export declare class SourcesService {
    private readonly runModel;
    private readonly logger;
    private running;
    constructor(runModel: Model<SyncRunDocument>);
    recentRuns(limit?: number): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, SyncRun, {}, {}> & SyncRun & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    triggerSync(sources?: string): {
        ok: boolean;
        message: string;
    };
}
