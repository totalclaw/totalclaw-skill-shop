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
exports.AgentDeviceSchema = exports.AgentDevice = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let AgentDevice = class AgentDevice {
};
exports.AgentDevice = AgentDevice;
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], AgentDevice.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true, unique: true, index: true }),
    __metadata("design:type", String)
], AgentDevice.prototype, "deviceId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], AgentDevice.prototype, "deviceName", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], AgentDevice.prototype, "publicKey", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true, default: 'X25519' }),
    __metadata("design:type", String)
], AgentDevice.prototype, "publicKeyAlgorithm", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], AgentDevice.prototype, "deviceFingerprint", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], AgentDevice.prototype, "agentVersion", void 0);
__decorate([
    (0, mongoose_1.Prop)({ trim: true }),
    __metadata("design:type", String)
], AgentDevice.prototype, "platform", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], AgentDevice.prototype, "lastSeenAt", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Date)
], AgentDevice.prototype, "revokedAt", void 0);
exports.AgentDevice = AgentDevice = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'agent_devices' })
], AgentDevice);
exports.AgentDeviceSchema = mongoose_1.SchemaFactory.createForClass(AgentDevice);
exports.AgentDeviceSchema.index({ userId: 1, deviceId: 1 });
//# sourceMappingURL=agent-device.schema.js.map