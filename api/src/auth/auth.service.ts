import { Injectable, UnauthorizedException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

// 账号体系对接 totalclaw-web（本地 web 默认 127.0.0.1:3080，auth 路由挂在根：/auth/login、/auth/register）。
// web 只负责「凭据校验/存储」，返回的是非 JWT 的不透明 token；
// skill-shop 校验通过后用本地 JWT_SECRET 重新签发自己的 JWT，保证 /me、订单、下载等门禁功能正常。
const WEB_AUTH_BASE = (process.env.WEB_AUTH_BASE || 'http://127.0.0.1:3080').replace(/\/$/, '');

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
  ) {}

  /** 登录：本地账号优先（测试/管理）；否则代理 web 校验，成功后本地重签 JWT。 */
  async login(identifier: string, password: string) {
    const local = await this.users.findByUsername(identifier).catch(() => null);
    if (local) {
      if (!(await this.users.validatePassword(password, local.passwordHash))) {
        throw new UnauthorizedException('账号或密码错误');
      }
      return this.issue(String(local._id), local.username, local.roles, local.nickname);
    }
    // 代理 totalclaw-web（本地：用户名 + 密码）
    const data = await this.webAuth('/auth/login', { username: identifier, password });
    const u = data.user || {};
    return this.issue('web:' + (u.id ?? identifier), u.username || identifier, ['user']);
  }

  /** 注册：用户名 + 密码 代理 web 的 /auth/register 建号，成功后本地重签 JWT 自动登录。 */
  async register(body: { username: string; password: string; nickname?: string }) {
    const data = await this.webAuth('/auth/register', { username: body.username, password: body.password });
    const u = data.user || {};
    return this.issue('web:' + (u.id ?? body.username), u.username || body.username, ['user'], body.nickname);
  }

  /** 本地签发 JWT（claims 与 web 兼容），返回 { accessToken, user }。 */
  private async issue(sub: string, username: string, roles: string[], nickname?: string) {
    const accessToken = await this.jwt.signAsync({ sub, username, roles });
    return { accessToken, user: { id: sub, username, roles, nickname } };
  }

  /** 转发到 totalclaw-web 的认证接口，透传其报错（兼容 {ok:false,msg} 与 {message}）。 */
  private async webAuth(path: string, body: unknown) {
    let status = 0;
    let data: any = {};
    try {
      const r = await fetch(`${WEB_AUTH_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      status = r.status;
      data = await r.json().catch(() => ({}));
    } catch {
      throw new ServiceUnavailableException('认证服务暂不可用（web 接口连不上）');
    }
    if (status >= 400 || data?.ok === false || (!data?.token && !data?.accessToken && !data?.user)) {
      const msg = data?.msg || data?.message || data?.error || '账号或密码错误';
      throw new (status === 401 ? UnauthorizedException : BadRequestException)(msg);
    }
    return data;
  }
}
