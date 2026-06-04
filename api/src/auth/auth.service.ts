import { Injectable, UnauthorizedException, BadRequestException, ServiceUnavailableException } from '@nestjs/common';

// 与 totalclaw-web 共用账号体系：登录直接代理到 web 的登录 API。
// WEB_AUTH_BASE 指向 web 的 NestJS user-info-api（线上默认 127.0.0.1:3000/api）。
const WEB_AUTH_BASE = (process.env.WEB_AUTH_BASE || 'http://127.0.0.1:3000/api').replace(/\/$/, '');

@Injectable()
export class AuthService {
  /** 登录：转发到 web 的 /auth/login（identifier=手机号/邮箱 + password），原样返回其 token/user。 */
  async login(identifier: string, password: string) {
    let status = 0;
    let data: any = {};
    try {
      const r = await fetch(`${WEB_AUTH_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      status = r.status;
      data = await r.json().catch(() => ({}));
    } catch {
      throw new ServiceUnavailableException('认证服务暂不可用（web 登录接口连不上）');
    }
    if (status >= 400 || !data?.accessToken) {
      throw new UnauthorizedException(data?.message || '账号或密码错误');
    }
    return data; // { accessToken, refreshToken, user }
  }

  /** 注册：账号体系归 web，引导去 taituai.com 注册。 */
  async register() {
    throw new BadRequestException('本站与 taituai.com 共用账号，请前往 taituai.com 注册/登录');
  }
}
