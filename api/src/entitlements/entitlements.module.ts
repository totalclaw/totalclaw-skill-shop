import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Entitlement, EntitlementSchema } from './schemas/entitlement.schema';
import { EntitlementsService } from './entitlements.service';
import { EntitlementsController } from './entitlements.controller';
import { SkillsModule } from '../skills/skills.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Entitlement.name, schema: EntitlementSchema }]),
    SkillsModule,
  ],
  controllers: [EntitlementsController],
  providers: [EntitlementsService],
  exports: [EntitlementsService],
})
export class EntitlementsModule {}
