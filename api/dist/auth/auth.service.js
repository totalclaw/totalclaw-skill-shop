"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const WEB_AUTH_BASE = (process.env.WEB_AUTH_BASE || 'http://127.0.0.1:3000/api').replace(/\/$/, '');
let AuthService = class AuthService {
    async login(identifier, password) {
        let status = 0;
        let data = {};
        try {
            const r = await fetch(`${WEB_AUTH_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password }),
            });
            status = r.status;
            data = await r.json().catch(() => ({}));
        }
        catch {
            throw new common_1.ServiceUnavailableException('认证服务暂不可用（web 登录接口连不上）');
        }
        if (status >= 400 || !data?.accessToken) {
            throw new common_1.UnauthorizedException(data?.message || '账号或密码错误');
        }
        return data;
    }
    async register() {
        throw new common_1.BadRequestException('本站与 taituai.com 共用账号，请前往 taituai.com 注册/登录');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)()
], AuthService);
//# sourceMappingURL=auth.service.js.map