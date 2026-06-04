import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SyncRun, SyncRunSchema } from './schemas/sync-run.schema';
import { SourcesService } from './sources.service';
import { SourcesController } from './sources.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: SyncRun.name, schema: SyncRunSchema }])],
  controllers: [SourcesController],
  providers: [SourcesService],
})
export class SourcesModule {}
