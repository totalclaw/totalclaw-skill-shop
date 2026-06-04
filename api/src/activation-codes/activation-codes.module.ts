import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivationCode, ActivationCodeSchema } from './schemas/activation-code.schema';
import { ActivationCodesService } from './activation-codes.service';
import { ActivationCodesController } from './activation-codes.controller';
import { EntitlementsModule } from '../entitlements/entitlements.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ActivationCode.name, schema: ActivationCodeSchema }]),
    EntitlementsModule,
  ],
  controllers: [ActivationCodesController],
  providers: [ActivationCodesService],
})
export class ActivationCodesModule {}
