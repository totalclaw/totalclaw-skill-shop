"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstallModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const skills_module_1 = require("../skills/skills.module");
const entitlements_module_1 = require("../entitlements/entitlements.module");
const auth_module_1 = require("../auth/auth.module");
const agent_device_schema_1 = require("./schemas/agent-device.schema");
const skill_license_schema_1 = require("./schemas/skill-license.schema");
const install_service_1 = require("./install.service");
const install_controller_1 = require("./install.controller");
let InstallModule = class InstallModule {
};
exports.InstallModule = InstallModule;
exports.InstallModule = InstallModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: agent_device_schema_1.AgentDevice.name, schema: agent_device_schema_1.AgentDeviceSchema },
                { name: skill_license_schema_1.SkillLicense.name, schema: skill_license_schema_1.SkillLicenseSchema },
            ]),
            skills_module_1.SkillsModule,
            entitlements_module_1.EntitlementsModule,
            auth_module_1.AuthModule,
        ],
        controllers: [install_controller_1.InstallController, install_controller_1.AgentDevicesController],
        providers: [install_service_1.InstallService],
        exports: [install_service_1.InstallService],
    })
], InstallModule);
//# sourceMappingURL=install.module.js.map