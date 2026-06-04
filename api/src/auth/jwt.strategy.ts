import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// 兼容 web 与本站两种 JWT claims：
//   web:        { sub, email, role, tv }      （role 字符串）
//   本站(历史)： { sub, username, roles[] }
export interface JwtPayload {
  sub: string;
  email?: string;
  phone?: string;
  role?: string;
  username?: string;
  roles?: string[];
}

// 从 Cookie 头里取 tc_token（无需 cookie-parser 依赖），用于 .taituai.com 跨子域共享登录态。
function cookieExtractor(req: any): string | null {
  const raw = req?.headers?.cookie;
  if (!raw) return null;
  const m = String(raw).match(/(?:^|;\s*)tc_token=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // 优先 Authorization: Bearer，回退 tc_token cookie（与 web 共享登录态）
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      ignoreExpiration: false,
      // 与 web 共用同一个 JWT_SECRET 才能验 web 签发的 token
      secretOrKey: process.env.JWT_SECRET || 'change-me-skill-market-jwt',
    });
  }

  async validate(payload: JwtPayload) {
    const roles = payload.roles && payload.roles.length
      ? payload.roles
      : (payload.role ? [payload.role] : ['user']);
    const username = payload.username || payload.email || payload.phone || payload.sub;
    return { userId: payload.sub, username, roles };
  }
}
