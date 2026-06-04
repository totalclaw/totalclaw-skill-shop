import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Earning, EarningSchema } from './schemas/earning.schema';
import { DeveloperService } from './developer.service';
import { DeveloperController } from './developer.controller';
import { SkillsModule } from '../skills/skills.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Earning.name, schema: EarningSchema }]),
    SkillsModule,
    UsersModule,
  ],
  controllers: [DeveloperController],
  providers: [DeveloperService],
  exports: [DeveloperService],
})
export class DeveloperModule {}
