import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { spawn } from 'child_process';
import * as path from 'path';
import { SyncRun, SyncRunDocument } from './schemas/sync-run.schema';

@Injectable()
export class SourcesService {
  private readonly logger = new Logger(SourcesService.name);
  private running = false;

  constructor(
    @InjectModel(SyncRun.name) private readonly runModel: Model<SyncRunDocument>,
  ) {}

  recentRuns(limit = 50) {
    return this.runModel.find().sort({ createdAt: -1 }).limit(limit).lean().exec();
  }

  /** 手动触发同步：spawn scripts/sync/run-sync.js（非阻塞） */
  triggerSync(sources?: string) {
    if (this.running) {
      return { ok: false, message: '同步进行中，请稍后' };
    }
    this.running = true;
    const script = path.join(__dirname, '..', '..', '..', 'scripts', 'sync', 'run-sync.js');
    const args = [script];
    if (sources) args.push(`--source=${sources}`);
    const child = spawn('node', args, {
      cwd: path.join(__dirname, '..', '..', '..'),
      env: process.env,
      detached: true,
      stdio: 'ignore',
    });
    child.on('close', () => { this.running = false; });
    child.on('error', (e) => {
      this.running = false;
      this.logger.error(`同步触发失败: ${e.message}`);
    });
    child.unref();
    return { ok: true, message: `已触发同步 sources=${sources || 'all'}` };
  }
}
