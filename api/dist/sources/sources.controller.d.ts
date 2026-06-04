import { SourcesService } from './sources.service';
declare class TriggerDto {
    source?: string;
}
export declare class SourcesController {
    private readonly sources;
    constructor(sources: SourcesService);
    runs(): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./schemas/sync-run.schema").SyncRun, {}, {}> & import("./schemas/sync-run.schema").SyncRun & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    sync(dto: TriggerDto): {
        ok: boolean;
        message: string;
    };
}
export {};
