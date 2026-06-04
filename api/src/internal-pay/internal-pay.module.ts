import { Module } from '@nestjs/common';
import { OrdersModule } from '../orders/orders.module';
import { EntitlementsModule } from '../entitlements/entitlements.module';
import { DeveloperModule } from '../developer/developer.module';
import { InternalPayController } from './internal-pay.controller';

@Module({
  imports: [OrdersModule, EntitlementsModule, DeveloperModule],
  controllers: [InternalPayController],
})
export class InternalPayModule {}
