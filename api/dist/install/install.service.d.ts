import { Model } from 'mongoose';
import { SkillsService } from '../skills/skills.service';
import { EntitlementsService } from '../entitlements/entitlements.service';
import { AgentDeviceDocument } from './schemas/agent-device.schema';
import { SkillLicenseDocument } from './schemas/skill-license.schema';
export declare class InstallError extends Error {
    readonly errorCode: string;
    readonly status: number;
    constructor(errorCode: string, message: string, status?: number);
}
export declare class InstallService {
    private readonly devices;
    private readonly licenses;
    private readonly skills;
    private readonly entitlements;
    private readonly logger;
    constructor(devices: Model<AgentDeviceDocument>, licenses: Model<SkillLicenseDocument>, skills: SkillsService, entitlements: EntitlementsService);
    registerDevice(userId: string, body: {
        protocolVersion?: string;
        publicKey?: string;
        publicKeyAlgorithm?: string;
        deviceId?: string;
        deviceFingerprint?: string;
        deviceName?: string;
        platform?: string;
        agentVersion?: string;
    }): Promise<{
        ok: boolean;
        deviceId: string;
        userId: string;
        registeredAt: string;
        revoked: boolean;
        signingKeys: {
            keyId: string;
            algorithm: "Ed25519";
            publicKey: string;
        }[];
    }>;
    listDevices(userId: string): Promise<{
        ok: boolean;
        items: {
            deviceId: string;
            deviceName: string;
            platform: string;
            agentVersion: string;
            lastSeenAt: string;
            revoked: boolean;
            revokedAt: string;
        }[];
    }>;
    revokeDevice(userId: string, deviceId: string, isAdmin?: boolean): Promise<{
        ok: boolean;
        deviceId: string;
        revoked: boolean;
        revokedAt: string;
    }>;
    private resolveItem;
    private static isPaid;
    private buildManifestBase;
    manifest(nameOrId: string, userId?: string): Promise<{
        encrypted: boolean;
        packageUrl: string;
        protocolVersion: string;
        itemId: string;
        kind: string;
        name: string;
        displayName: string;
        description: string;
        version: string;
        runtime: string;
        listingType: string;
        closedSource: boolean;
        requiresAuth: boolean;
        contentType: string;
        entry: string;
        ok: boolean;
    }>;
    packageFor(nameOrId: string, userId: string | undefined, deviceId: string | undefined): Promise<{
        ok: boolean;
        protocolVersion: string;
        encrypted: boolean;
        manifest: {
            protocolVersion: string;
            itemId: string;
            kind: string;
            name: string;
            displayName: string;
            description: string;
            version: string;
            runtime: string;
            listingType: string;
            closedSource: boolean;
            requiresAuth: boolean;
            contentType: string;
            entry: string;
        };
        content: string;
        manifestSignature?: undefined;
        encryption?: undefined;
        payload?: undefined;
        license?: undefined;
        licenseSignature?: undefined;
    } | {
        protocolVersion: string;
        encrypted: boolean;
        manifest: {
            contentHash: string;
            contentLength: number;
            deviceId: string;
            licenseId: string;
            issuedAt: string;
            watermark: {
                fingerprint: string;
            };
            protocolVersion: string;
            itemId: string;
            kind: string;
            name: string;
            displayName: string;
            description: string;
            version: string;
            runtime: string;
            listingType: string;
            closedSource: boolean;
            requiresAuth: boolean;
            contentType: string;
            entry: string;
        };
        manifestSignature: import("./install.crypto").SignatureBlock;
        encryption: {
            cipherHash: string;
            algorithm: "AES-256-GCM";
            nonce: string;
            tag: string;
            keyWrap: {
                algorithm: "X25519-HKDF-SHA256-AES-256-GCM";
                recipientDeviceId: string;
                ephemeralPublicKey: string;
                nonce: string;
                tag: string;
                ciphertext: string;
            };
        };
        payload: string;
        license: {
            protocolVersion: string;
            licenseId: string;
            userId: string;
            deviceId: string;
            itemId: string;
            kind: string;
            version: string;
            issuedAt: string;
            expiresAt: string;
            allowedOfflineDays: number;
            revocationUrl: string;
        };
        licenseSignature: import("./install.crypto").SignatureBlock;
        ok?: undefined;
        content?: undefined;
    }>;
    private renderSkillMarkdown;
    private issueLicense;
    licenseStatus(licenseId: string): Promise<{
        ok: boolean;
        licenseId: string;
        revoked: boolean;
        revokedAt: string;
        reason: string;
        deviceRevoked: boolean;
        checkedAt: string;
    }>;
    revokeLicense(userId: string, licenseId: string, reason: string, isAdmin?: boolean): Promise<{
        ok: boolean;
        licenseId: string;
        revoked: boolean;
        revokedAt: string;
    }>;
}
