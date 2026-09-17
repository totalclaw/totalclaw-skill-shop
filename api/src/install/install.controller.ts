import {
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { InstallError, InstallService } from './install.service';
import { JwtAuthGuard } from '../auth/guards';

/** `InstallError` → HTTP。协议 §6 的 `{ok:false, errorCode, message}` 形状。 */
function rethrow(err: unknown): never {
  if (err instanceof InstallError) {
    throw new HttpException(
      { ok: false, errorCode: err.errorCode, message: err.message },
      err.status,
    );
  }
  throw err;
}

/**
 * 可选 JWT：带了就解析出用户，没带也放行（免费条目匿名可取 manifest / package）。
 * `AuthGuard('jwt')` 默认无 token 直接 401，这里覆写 `handleRequest` 放行。
 */
class OptionalJwtGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(_err: any, user: any): TUser {
    return (user || null) as TUser;
  }
}

@ApiTags('install')
@Controller('install')
export class InstallController {
  constructor(private readonly install: InstallService) {}

  /**
   * 吊销状态同步。licenseId 是 128 位随机值，本身就是凭证，不强制 JWT。
   * 声明在 `:itemId/...` 之前，避免被当成 itemId。
   */
  @Get('licenses/:licenseId/status')
  @ApiOperation({ summary: 'license 吊销状态（客户端离线宽限到期后同步）' })
  async licenseStatus(@Param('licenseId') licenseId: string) {
    try {
      return await this.install.licenseStatus(decodeURIComponent(licenseId));
    } catch (err) {
      return rethrow(err);
    }
  }

  @Post('licenses/:licenseId/revoke')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '吊销一条 license（本人或管理员）' })
  async revokeLicense(
    @Request() req: any,
    @Param('licenseId') licenseId: string,
    @Body() body: { reason?: string },
  ) {
    try {
      return await this.install.revokeLicense(
        req.user.userId,
        decodeURIComponent(licenseId),
        String(body?.reason || ''),
        (req.user.roles || []).includes('admin'),
      );
    } catch (err) {
      return rethrow(err);
    }
  }

  @Get(':itemId/manifest')
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: '安装元信息（不含正文）；付费条目需 JWT + 已购' })
  async manifest(@Request() req: any, @Param('itemId') itemId: string) {
    try {
      return await this.install.manifest(decodeURIComponent(itemId), req.user?.userId);
    } catch (err) {
      return rethrow(err);
    }
  }

  @Get(':itemId/package')
  @UseGuards(OptionalJwtGuard)
  @ApiOperation({ summary: '安装包：免费条目明文，付费/闭源条目按设备公钥加密' })
  async pkg(
    @Request() req: any,
    @Param('itemId') itemId: string,
    @Query('deviceId') deviceId?: string,
  ) {
    try {
      return await this.install.packageFor(
        decodeURIComponent(itemId),
        req.user?.userId,
        deviceId ? String(deviceId) : undefined,
      );
    } catch (err) {
      return rethrow(err);
    }
  }
}

@ApiTags('install')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('agent/devices')
export class AgentDevicesController {
  constructor(private readonly install: InstallService) {}

  @Post('register')
  @ApiOperation({ summary: '注册 agent 设备公钥（请求体只含公钥与设备指纹）' })
  async register(@Request() req: any, @Body() body: Record<string, unknown>) {
    try {
      return await this.install.registerDevice(req.user.userId, body as any);
    } catch (err) {
      return rethrow(err);
    }
  }

  @Get()
  @ApiOperation({ summary: '我的设备列表' })
  async list(@Request() req: any) {
    return this.install.listDevices(req.user.userId);
  }

  @Post(':deviceId/revoke')
  @ApiOperation({ summary: '撤销设备（撤销后不再下发加密包）' })
  async revoke(@Request() req: any, @Param('deviceId') deviceId: string) {
    try {
      return await this.install.revokeDevice(
        req.user.userId,
        decodeURIComponent(deviceId),
        (req.user.roles || []).includes('admin'),
      );
    } catch (err) {
      return rethrow(err);
    }
  }
}
