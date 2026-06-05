import { Body, Controller, Get, Post, UseGuards, Request, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';
import { UsersService } from '../users/users.service';

// 与 web 共用账号：identifier=手机号/邮箱/用户名（兼容老前端传 username 字段）
class LoginDto {
  @IsOptional() @IsString() identifier?: string;
  @IsOptional() @IsString() username?: string;
  @IsString() @MinLength(1) password: string;
}

// 用户名 + 密码 注册（对接 totalclaw-web 本地 web：username≥3、password≥6）
class RegisterDto {
  @IsString() @MinLength(3, { message: '用户名至少 3 个字符' }) username: string;
  @IsString() @MinLength(6, { message: '密码至少 6 位' }) password: string;
  @IsOptional() @IsString() nickname?: string;
}

// .taituai.com 父域 cookie，实现与 web 跨子域共享登录态。线上 COOKIE_DOMAIN=.taituai.com
const COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || '';
const COOKIE_SECURE = process.env.COOKIE_SECURE !== '0';
function setAuthCookie(res: Response, token: string) {
  res.cookie('tc_token', token, {
    domain: COOKIE_DOMAIN || undefined,
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: COOKIE_SECURE,
    maxAge: 1000 * 60 * 60 * 24 * 30,
  });
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: '注册（用户名+密码，代理 web 建号，成功即登录）' })
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.register(dto);
    if (result?.accessToken) setAuthCookie(res, result.accessToken);
    return result;
  }

  @Post('login')
  @ApiOperation({ summary: '登录（代理 web 登录 API，identifier=手机号/邮箱）' })
  async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(dto.identifier || dto.username || '', dto.password);
    if (result?.accessToken) setAuthCookie(res, result.accessToken);
    return result;
  }

  @Post('logout')
  @ApiOperation({ summary: '退出（清 .taituai.com cookie）' })
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('tc_token', { domain: COOKIE_DOMAIN || undefined, path: '/' });
    return { ok: true };
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '当前用户' })
  async me(@Request() req) {
    // 用户主体在 web；本站补充信息（开发者收益等）按 id 取，取不到给默认
    const sup = await this.usersService.findById(req.user.userId).catch(() => null);
    return {
      id: req.user.userId,
      username: req.user.username,
      roles: req.user.roles,
      nickname: sup?.nickname,
      earningsBalance: sup?.earningsBalance ?? 0,
    };
  }

  @Post('become-developer')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '升级为开发者角色' })
  async becomeDeveloper(@Request() req) {
    await this.usersService.addRole(req.user.userId, 'developer').catch(() => null);
    return { ok: true };
  }
}
