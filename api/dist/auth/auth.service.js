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
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async register(username, password) {
        const existing = await this.usersService.findByUsername(username);
        if (existing)
            throw new common_1.ConflictException('username taken');
        const user = await this.usersService.create(username, password);
        return this.sign(user);
    }
    async login(username, password) {
        const user = await this.usersService.findByUsername(username);
        if (!user)
            throw new common_1.UnauthorizedException('invalid credentials');
        const ok = await this.usersService.validatePassword(password, user.passwordHash);
        if (!ok)
            throw new common_1.UnauthorizedException('invalid credentials');
        return this.sign(user);
    }
    sign(user) {
        const payload = {
            sub: String(user._id),
            username: user.username,
            roles: user.roles,
        };
        return {
            accessToken: this.jwtService.sign(payload),
            user: { id: String(user._id), username: user.username, roles: user.roles },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map