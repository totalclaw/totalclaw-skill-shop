"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
const WEB_AUTH_BASE = (process.env.WEB_AUTH_BASE || 'http://127.0.0.1:3080').replace(/\/$/, '');
let AuthService = class AuthService {
    constructor(users, jwt) {
        this.users = users;
        this.jwt = jwt;
    }
    async login(identifier, password) {
        const local = await this.users.findByUsername(identifier).catch(() => null);
        if (local) {
            if (!(await this.users.validatePassword(password, local.passwordHash))) {
                throw new common_1.UnauthorizedException('账号或密码错误');
            }
            return this.issue(String(local._id), local.username, local.roles, local.nickname);
        }
        const data = await this.webAuth('/auth/login', { username: identifier, password });
        const u = data.user || {};
        return this.issue('web:' + (u.id ?? identifier), u.username || identifier, ['user']);
    }
    async register(body) {
        const data = await this.webAuth('/auth/register', { username: body.username, password: body.password });
        const u = data.user || {};
        return this.issue('web:' + (u.id ?? body.username), u.username || body.username, ['user'], body.nickname);
    }
    async issue(sub, username, roles, nickname) {
        const accessToken = await this.jwt.signAsync({ sub, username, roles });
        return { accessToken, user: { id: sub, username, roles, nickname } };
    }
    async webAuth(path, body) {
        let status = 0;
        let data = {};
        try {
            const r = await fetch(`${WEB_AUTH_BASE}${path}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            status = r.status;
            data = await r.json().catch(() => ({}));
        }
        catch {
            throw new common_1.ServiceUnavailableException('认证服务暂不可用（web 接口连不上）');
        }
        if (status >= 400 || data?.ok === false || (!data?.token && !data?.accessToken && !data?.user)) {
            const msg = data?.msg || data?.message || data?.error || '账号或密码错误';
            throw new (status === 401 ? common_1.UnauthorizedException : common_1.BadRequestException)(msg);
        }
        return data;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map