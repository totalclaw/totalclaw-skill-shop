import { Module } from '@nestjs/common';
import { SkillsModule } from '../skills/skills.module';
import { QiyeController } from './qiye.controller';
import { QiyeService } from './qiye.service';

@Module({
  imports: [SkillsModule],
  controllers: [QiyeController],
  providers: [QiyeService],
})
export class QiyeModule {}
