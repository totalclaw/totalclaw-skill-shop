import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards';
import { UsersService } from '../users/users.service';

class CredentialsDto {
  @IsString() @MinLength(3) username: string;
  @IsString() @MinLength(6) password: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ summary: '注册' })
  register(@Body() dto: CredentialsDto) {
    return this.authService.register(dto.username, dto.password);
  }

  @Post('login')
  @ApiOperation({ summary: '登录' })
  login(@Body() dto: CredentialsDto) {
    return this.authService.login(dto.username, dto.password);
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '当前用户' })
  async me(@Request() req) {
    const user = await this.usersService.findById(req.user.userId);
    return {
      id: req.user.userId,
      username: req.user.username,
      roles: req.user.roles,
      nickname: user?.nickname,
      earningsBalance: user?.earningsBalance ?? 0,
    };
  }

  @Post('become-developer')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '升级为开发者角色' })
  async becomeDeveloper(@Request() req) {
    await this.usersService.addRole(req.user.userId, 'developer');
    return { ok: true };
  }
}
