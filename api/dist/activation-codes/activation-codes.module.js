"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivationCodesModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const activation_code_schema_1 = require("./schemas/activation-code.schema");
const activation_codes_service_1 = require("./activation-codes.service");
const activation_codes_controller_1 = require("./activation-codes.controller");
const entitlements_module_1 = require("../entitlements/entitlements.module");
let ActivationCodesModule = class ActivationCodesModule {
};
exports.ActivationCodesModule = ActivationCodesModule;
exports.ActivationCodesModule = ActivationCodesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: activation_code_schema_1.ActivationCode.name, schema: activation_code_schema_1.ActivationCodeSchema }]),
            entitlements_module_1.EntitlementsModule,
        ],
        controllers: [activation_codes_controller_1.ActivationCodesController],
        providers: [activation_codes_service_1.ActivationCodesService],
    })
], ActivationCodesModule);
//# sourceMappingURL=activation-codes.module.js.map