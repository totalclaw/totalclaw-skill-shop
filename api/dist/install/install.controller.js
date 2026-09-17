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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgentDevicesController = exports.InstallController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const passport_1 = require("@nestjs/passport");
const install_service_1 = require("./install.service");
const guards_1 = require("../auth/guards");
function rethrow(err) {
    if (err instanceof install_service_1.InstallError) {
        throw new common_1.HttpException({ ok: false, errorCode: err.errorCode, message: err.message }, err.status);
    }
    throw err;
}
class OptionalJwtGuard extends (0, passport_1.AuthGuard)('jwt') {
    handleRequest(_err, user) {
        return (user || null);
    }
}
let InstallController = class InstallController {
    constructor(install) {
        this.install = install;
    }
    async licenseStatus(licenseId) {
        try {
            return await this.install.licenseStatus(decodeURIComponent(licenseId));
        }
        catch (err) {
            return rethrow(err);
        }
    }
    async revokeLicense(req, licenseId, body) {
        try {
            return await this.install.revokeLicense(req.user.userId, decodeURIComponent(licenseId), String(body?.reason || ''), (req.user.roles || []).includes('admin'));
        }
        catch (err) {
            return rethrow(err);
        }
    }
    async manifest(req, itemId) {
        try {
            return await this.install.manifest(decodeURIComponent(itemId), req.user?.userId);
        }
        catch (err) {
            return rethrow(err);
        }
    }
    async pkg(req, itemId, deviceId) {
        try {
            return await this.install.packageFor(decodeURIComponent(itemId), req.user?.userId, deviceId ? String(deviceId) : undefined);
        }
        catch (err) {
            return rethrow(err);
        }
    }
};
exports.InstallController = InstallController;
__decorate([
    (0, common_1.Get)('licenses/:licenseId/status'),
    (0, swagger_1.ApiOperation)({ summary: 'license 吊销状态（客户端离线宽限到期后同步）' }),
    __param(0, (0, common_1.Param)('licenseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InstallController.prototype, "licenseStatus", null);
__decorate([
    (0, common_1.Post)('licenses/:licenseId/revoke'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: '吊销一条 license（本人或管理员）' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('licenseId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], InstallController.prototype, "revokeLicense", null);
__decorate([
    (0, common_1.Get)(':itemId/manifest'),
    (0, common_1.UseGuards)(OptionalJwtGuard),
    (0, swagger_1.ApiOperation)({ summary: '安装元信息（不含正文）；付费条目需 JWT + 已购' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('itemId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], InstallController.prototype, "manifest", null);
__decorate([
    (0, common_1.Get)(':itemId/package'),
    (0, common_1.UseGuards)(OptionalJwtGuard),
    (0, swagger_1.ApiOperation)({ summary: '安装包：免费条目明文，付费/闭源条目按设备公钥加密' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Query)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], InstallController.prototype, "pkg", null);
exports.InstallController = InstallController = __decorate([
    (0, swagger_1.ApiTags)('install'),
    (0, common_1.Controller)('install'),
    __metadata("design:paramtypes", [install_service_1.InstallService])
], InstallController);
let AgentDevicesController = class AgentDevicesController {
    constructor(install) {
        this.install = install;
    }
    async register(req, body) {
        try {
            return await this.install.registerDevice(req.user.userId, body);
        }
        catch (err) {
            return rethrow(err);
        }
    }
    async list(req) {
        return this.install.listDevices(req.user.userId);
    }
    async revoke(req, deviceId) {
        try {
            return await this.install.revokeDevice(req.user.userId, decodeURIComponent(deviceId), (req.user.roles || []).includes('admin'));
        }
        catch (err) {
            return rethrow(err);
        }
    }
};
exports.AgentDevicesController = AgentDevicesController;
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({ summary: '注册 agent 设备公钥（请求体只含公钥与设备指纹）' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AgentDevicesController.prototype, "register", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: '我的设备列表' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AgentDevicesController.prototype, "list", null);
__decorate([
    (0, common_1.Post)(':deviceId/revoke'),
    (0, swagger_1.ApiOperation)({ summary: '撤销设备（撤销后不再下发加密包）' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('deviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AgentDevicesController.prototype, "revoke", null);
exports.AgentDevicesController = AgentDevicesController = __decorate([
    (0, swagger_1.ApiTags)('install'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, common_1.UseGuards)(guards_1.JwtAuthGuard),
    (0, common_1.Controller)('agent/devices'),
    __metadata("design:paramtypes", [install_service_1.InstallService])
], AgentDevicesController);
//# sourceMappingURL=install.controller.js.map