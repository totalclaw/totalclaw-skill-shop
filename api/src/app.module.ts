import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { SkillsModule } from './skills/skills.module';
import { SourcesModule } from './sources/sources.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { OrdersModule } from './orders/orders.module';
import { EntitlementsModule } from './entitlements/entitlements.module';
import { ActivationCodesModule } from './activation-codes/activation-codes.module';
import { InternalPayModule } from './internal-pay/internal-pay.module';
import { DeveloperModule } from './developer/developer.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27018/skill-market',
    ),
    SkillsModule,
    SourcesModule,
    UsersModule,
    AuthModule,
    OrdersModule,
    EntitlementsModule,
    ActivationCodesModule,
    InternalPayModule,
    DeveloperModule,
    AdminModule,
  ],
})
export class AppModule {}
