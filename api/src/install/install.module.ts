import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SkillsModule } from '../skills/skills.module';
import { EntitlementsModule } from '../entitlements/entitlements.module';
import { AuthModule } from '../auth/auth.module';
import { AgentDevice, AgentDeviceSchema } from './schemas/agent-device.schema';
import { SkillLicense, SkillLicenseSchema } from './schemas/skill-license.schema';
import { InstallService } from './install.service';
import { AgentDevicesController, InstallController } from './install.controller';

/**
 * 闭源技能加密安装（协议 `tcpkg/1`）。
 * 单一事实源：`totalclaw-agent/docs/skill-shop/encrypted-install-protocol.md`。
 */
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AgentDevice.name, schema: AgentDeviceSchema },
      { name: SkillLicense.name, schema: SkillLicenseSchema },
    ]),
    SkillsModule,
    EntitlementsModule,
    AuthModule,
  ],
  controllers: [InstallController, AgentDevicesController],
  providers: [InstallService],
  exports: [InstallService],
})
export class InstallModule {}
