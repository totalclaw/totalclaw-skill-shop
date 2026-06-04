import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

/** 每次同步运行的记录（由 scripts/sync 写入，后台展示）。 */
@Schema({ timestamps: true, collection: 'sync_runs' })
export class SyncRun {
  @Prop({ required: true, index: true })
  source: string;

  @Prop()
  startedAt: Date;

  @Prop()
  finishedAt?: Date;

  @Prop({ default: 0 })
  upserted: number;

  @Prop({ default: 0 })
  failed: number;

  /** 'running' | 'success' | 'error' */
  @Prop({ default: 'running', index: true })
  status: string;

  @Prop()
  error?: string;
}

export type SyncRunDocument = HydratedDocument<SyncRun>;
export const SyncRunSchema = SchemaFactory.createForClass(SyncRun);
