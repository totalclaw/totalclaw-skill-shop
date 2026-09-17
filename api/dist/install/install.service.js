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
var InstallService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstallService = exports.InstallError = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const crypto_1 = require("crypto");
const skills_service_1 = require("../skills/skills.service");
const entitlements_service_1 = require("../entitlements/entitlements.service");
const watermark_util_1 = require("../common/watermark.util");
const skill_id_util_1 = require("../common/skill-id.util");
const agent_device_schema_1 = require("./schemas/agent-device.schema");
const skill_license_schema_1 = require("./schemas/skill-license.schema");
const install_crypto_1 = require("./install.crypto");
class InstallError extends Error {
    constructor(errorCode, message, status = 400) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
    }
}
exports.InstallError = InstallError;
let InstallService = InstallService_1 = class InstallService {
    constructor(devices, licenses, skills, entitlements) {
        this.devices = devices;
        this.licenses = licenses;
        this.skills = skills;
        this.entitlements = entitlements;
        this.logger = new common_1.Logger(InstallService_1.name);
    }
    async registerDevice(userId, body) {
        if (String(body.protocolVersion || '') !== install_crypto_1.PROTOCOL_VERSION) {
            throw new InstallError('E_PROTOCOL_VERSION', `unsupported protocol version`, 400);
        }
        if (String(body.publicKeyAlgorithm || 'X25519') !== 'X25519') {
            throw new InstallError('E_PROTOCOL_VERSION', 'device key algorithm must be X25519', 400);
        }
        let raw;
        try {
            raw = (0, install_crypto_1.unb64u)(String(body.publicKey || ''));
        }
        catch {
            throw new InstallError('E_DEVICE_ID_MISMATCH', 'publicKey is not valid base64url', 400);
        }
        if (raw.length !== 32) {
            throw new InstallError('E_DEVICE_ID_MISMATCH', 'publicKey must be 32 bytes', 400);
        }
        const computed = (0, install_crypto_1.deviceIdFor)(raw);
        if (String(body.deviceId || '') !== computed) {
            throw new InstallError('E_DEVICE_ID_MISMATCH', 'deviceId does not match publicKey', 400);
        }
        const existing = await this.devices.findOne({ deviceId: computed }).exec();
        if (existing && String(existing.userId) !== String(userId)) {
            throw new InstallError('E_DEVICE_ID_MISMATCH', 'device belongs to another account', 403);
        }
        if (existing?.revokedAt) {
            this.logger.warn(`device ${computed.slice(0, 16)} re-registered after revocation`);
        }
        const doc = await this.devices
            .findOneAndUpdate({ deviceId: computed }, {
            $set: {
                userId: new mongoose_2.Types.ObjectId(String(userId)),
                deviceId: computed,
                publicKey: (0, install_crypto_1.b64u)(raw),
                publicKeyAlgorithm: 'X25519',
                deviceFingerprint: String(body.deviceFingerprint || ''),
                deviceName: String(body.deviceName || ''),
                platform: String(body.platform || ''),
                agentVersion: String(body.agentVersion || ''),
                lastSeenAt: new Date(),
            },
            $unset: { revokedAt: '', },
        }, { upsert: true, new: true, setDefaultsOnInsert: true })
            .exec();
        return {
            ok: true,
            deviceId: doc.deviceId,
            userId: String(doc.userId),
            registeredAt: (0, install_crypto_1.rfc3339)(doc.lastSeenAt || new Date()),
            revoked: false,
            signingKeys: (0, install_crypto_1.publicSigningKeys)(),
        };
    }
    async listDevices(userId) {
        const rows = await this.devices
            .find({ userId: new mongoose_2.Types.ObjectId(String(userId)) })
            .sort({ lastSeenAt: -1 })
            .lean()
            .exec();
        return {
            ok: true,
            items: rows.map((d) => ({
                deviceId: d.deviceId,
                deviceName: d.deviceName || '',
                platform: d.platform || '',
                agentVersion: d.agentVersion || '',
                lastSeenAt: d.lastSeenAt ? (0, install_crypto_1.rfc3339)(new Date(d.lastSeenAt)) : null,
                revoked: !!d.revokedAt,
                revokedAt: d.revokedAt ? (0, install_crypto_1.rfc3339)(new Date(d.revokedAt)) : null,
            })),
        };
    }
    async revokeDevice(userId, deviceId, isAdmin = false) {
        const filter = { deviceId };
        if (!isAdmin)
            filter.userId = new mongoose_2.Types.ObjectId(String(userId));
        const doc = await this.devices.findOne(filter).exec();
        if (!doc)
            throw new InstallError('E_DEVICE_NOT_REGISTERED', 'device not found', 404);
        doc.revokedAt = doc.revokedAt || new Date();
        await doc.save();
        return { ok: true, deviceId, revoked: true, revokedAt: (0, install_crypto_1.rfc3339)(doc.revokedAt) };
    }
    async resolveItem(nameOrId) {
        const raw = String(nameOrId || '').trim();
        if (!raw)
            throw new InstallError('E_ITEM_NOT_INSTALLABLE', 'itemId required', 404);
        for (const candidate of (0, skill_id_util_1.skillIdCandidates)(raw)) {
            try {
                return await this.skills.detail(candidate, true);
            }
            catch {
            }
        }
        try {
            const byName = await this.skills.findByName(raw);
            return await this.skills.detail(String(byName.skillId), true);
        }
        catch {
            throw new InstallError('E_ITEM_NOT_INSTALLABLE', 'item not found', 404);
        }
    }
    static isPaid(doc) {
        return !!doc.closedSource || doc.listingType === 'paid';
    }
    buildManifestBase(doc) {
        return {
            protocolVersion: install_crypto_1.PROTOCOL_VERSION,
            itemId: String(doc.skillId),
            kind: doc.kind === 'role' ? 'role' : 'skill',
            name: String(doc.slug || doc.name || doc.skillId),
            displayName: String(doc.displayName || doc.name || ''),
            description: String(doc.descriptionZh || doc.description || ''),
            version: String(doc.version || ''),
            runtime: 'totalclaw-agent',
            listingType: String(doc.listingType || 'free'),
            closedSource: !!doc.closedSource,
            requiresAuth: InstallService_1.isPaid(doc),
            contentType: 'text/markdown',
            entry: doc.kind === 'role' ? 'ROLE.md' : 'SKILL.md',
        };
    }
    async manifest(nameOrId, userId) {
        const doc = await this.resolveItem(nameOrId);
        const paid = InstallService_1.isPaid(doc);
        if (paid) {
            if (!userId)
                throw new InstallError('E_NOT_ENTITLED', 'sign in required', 403);
            if (!(await this.entitlements.has(userId, String(doc.skillId)))) {
                throw new InstallError('E_NOT_ENTITLED', 'item not purchased', 403);
            }
        }
        return {
            ok: true,
            ...this.buildManifestBase(doc),
            encrypted: paid,
            packageUrl: `/api/install/${encodeURIComponent(String(doc.skillId).replace(/\//g, '~'))}/package`,
        };
    }
    async packageFor(nameOrId, userId, deviceId) {
        const doc = await this.resolveItem(nameOrId);
        const paid = InstallService_1.isPaid(doc);
        const base = this.buildManifestBase(doc);
        if (!paid) {
            const dl = await this.skills.buildDownload(String(doc.skillId));
            await this.skills.incrementDownloads(String(doc.skillId));
            return { ok: true, protocolVersion: install_crypto_1.PROTOCOL_VERSION, encrypted: false, manifest: base, content: dl.content };
        }
        if (!userId)
            throw new InstallError('E_NOT_ENTITLED', 'sign in required', 403);
        if (!(await this.entitlements.has(userId, String(doc.skillId)))) {
            throw new InstallError('E_NOT_ENTITLED', 'item not purchased', 403);
        }
        if (!deviceId) {
            throw new InstallError('E_DEVICE_NOT_REGISTERED', 'deviceId query parameter required', 404);
        }
        const device = await this.devices.findOne({ deviceId }).lean().exec();
        if (!device)
            throw new InstallError('E_DEVICE_NOT_REGISTERED', 'device not registered', 404);
        if (String(device.userId) !== String(userId)) {
            throw new InstallError('E_DEVICE_NOT_REGISTERED', 'device belongs to another account', 404);
        }
        if (device.revokedAt)
            throw new InstallError('E_DEVICE_REVOKED', 'device revoked', 403);
        const content = await this.skills.getContent(String(doc.skillId));
        const plaintextBody = String(content?.contentMd || '').trim();
        if (!plaintextBody) {
            throw new InstallError('E_ITEM_NOT_INSTALLABLE', 'item has no content to install', 404);
        }
        const watermarked = this.renderSkillMarkdown(doc, (0, watermark_util_1.applyWatermark)(plaintextBody, {
            userId: String(userId),
            username: `device ${String(deviceId).slice(0, 16)}`,
            skillId: String(doc.skillId),
        }));
        const license = await this.issueLicense(doc, String(userId), deviceId);
        const body = Buffer.from(watermarked, 'utf8');
        const manifest = {
            ...base,
            contentHash: `sha256:${(0, install_crypto_1.sha256Hex)(body)}`,
            contentLength: body.length,
            deviceId,
            licenseId: license.licenseId,
            issuedAt: license.issuedAt,
            watermark: { fingerprint: (0, watermark_util_1.fingerprint)(String(userId), String(doc.skillId)) },
        };
        const aad = (0, install_crypto_1.canonicalJson)(manifest);
        const sealed = (0, install_crypto_1.sealForDevice)(watermarked, (0, install_crypto_1.unb64u)(device.publicKey), deviceId, aad);
        await this.skills.incrementDownloads(String(doc.skillId));
        const { payload, cipherHash, ...encryption } = sealed;
        return {
            protocolVersion: install_crypto_1.PROTOCOL_VERSION,
            encrypted: true,
            manifest,
            manifestSignature: (0, install_crypto_1.signManifest)(manifest),
            encryption: { ...encryption, cipherHash },
            payload,
            license,
            licenseSignature: (0, install_crypto_1.signLicense)(license),
        };
    }
    renderSkillMarkdown(doc, bodyMd) {
        const name = doc.displayName || doc.name || doc.slug || doc.skillId;
        const desc = doc.descriptionZh || doc.description || '';
        const lines = [`# ${name}`, ''];
        if (desc)
            lines.push(desc, '');
        const kv = [
            ['skillId', doc.skillId],
            ['来源', doc.source],
            ['作者', doc.author],
            ['版本', doc.version],
            ['许可', doc.license],
            ['分类', doc.category],
        ];
        const meta = kv.filter(([, v]) => v).map(([k, v]) => `- **${k}**: ${v}`);
        if (meta.length)
            lines.push('## 元数据', ...meta, '');
        return `${lines.join('\n')}---\n\n${bodyMd}\n`;
    }
    async issueLicense(doc, userId, deviceId) {
        const offlineDays = Math.max(0, parseInt(process.env.SKILL_LICENSE_OFFLINE_DAYS || '7', 10) || 0);
        const validDays = parseInt(process.env.SKILL_LICENSE_VALID_DAYS || '0', 10) || 0;
        const licenseId = (0, crypto_1.randomBytes)(16).toString('hex');
        const issuedAt = new Date();
        const expiresAt = validDays > 0 ? new Date(issuedAt.getTime() + validDays * 86400_000) : null;
        await this.licenses.create({
            licenseId,
            userId: new mongoose_2.Types.ObjectId(String(userId)),
            deviceId,
            itemId: String(doc.skillId),
            kind: doc.kind === 'role' ? 'role' : 'skill',
            version: String(doc.version || ''),
            issuedAt,
            expiresAt: expiresAt || undefined,
            allowedOfflineDays: offlineDays,
        });
        const origin = (process.env.PUBLIC_ORIGIN || '').replace(/\/$/, '');
        return {
            protocolVersion: install_crypto_1.PROTOCOL_VERSION,
            licenseId,
            userId: String(userId),
            deviceId,
            itemId: String(doc.skillId),
            kind: doc.kind === 'role' ? 'role' : 'skill',
            version: String(doc.version || ''),
            issuedAt: (0, install_crypto_1.rfc3339)(issuedAt),
            expiresAt: expiresAt ? (0, install_crypto_1.rfc3339)(expiresAt) : null,
            allowedOfflineDays: offlineDays,
            revocationUrl: `${origin}/api/install/licenses/${licenseId}/status`,
        };
    }
    async licenseStatus(licenseId) {
        const lic = await this.licenses.findOne({ licenseId }).lean().exec();
        const checkedAt = (0, install_crypto_1.rfc3339)(new Date());
        if (!lic) {
            return { ok: true, licenseId, revoked: true, revokedAt: null, reason: 'unknown license', deviceRevoked: false, checkedAt };
        }
        const device = await this.devices.findOne({ deviceId: lic.deviceId }).lean().exec();
        const deviceRevoked = !device || !!device.revokedAt;
        const stillEntitled = await this.entitlements.has(String(lic.userId), lic.itemId);
        const revoked = !!lic.revokedAt || deviceRevoked || !stillEntitled;
        return {
            ok: true,
            licenseId,
            revoked,
            revokedAt: lic.revokedAt ? (0, install_crypto_1.rfc3339)(new Date(lic.revokedAt)) : revoked ? checkedAt : null,
            reason: lic.revokedReason || (deviceRevoked ? 'device revoked' : (!stillEntitled ? 'entitlement withdrawn' : null)),
            deviceRevoked,
            checkedAt,
        };
    }
    async revokeLicense(userId, licenseId, reason, isAdmin = false) {
        const filter = { licenseId };
        if (!isAdmin)
            filter.userId = new mongoose_2.Types.ObjectId(String(userId));
        const lic = await this.licenses.findOne(filter).exec();
        if (!lic)
            throw new InstallError('E_ITEM_NOT_INSTALLABLE', 'license not found', 404);
        lic.revokedAt = lic.revokedAt || new Date();
        lic.revokedReason = reason || 'revoked by owner';
        await lic.save();
        return { ok: true, licenseId, revoked: true, revokedAt: (0, install_crypto_1.rfc3339)(lic.revokedAt) };
    }
};
exports.InstallService = InstallService;
exports.InstallService = InstallService = InstallService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(agent_device_schema_1.AgentDevice.name)),
    __param(1, (0, mongoose_1.InjectModel)(skill_license_schema_1.SkillLicense.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        skills_service_1.SkillsService,
        entitlements_service_1.EntitlementsService])
], InstallService);
//# sourceMappingURL=install.service.js.map