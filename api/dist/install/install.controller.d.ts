import { InstallService } from './install.service';
export declare class InstallController {
    private readonly install;
    constructor(install: InstallService);
    licenseStatus(licenseId: string): Promise<{
        ok: boolean;
        licenseId: string;
        revoked: boolean;
        revokedAt: string;
        reason: string;
        deviceRevoked: boolean;
        checkedAt: string;
    }>;
    revokeLicense(req: any, licenseId: string, body: {
        reason?: string;
    }): Promise<{
        ok: boolean;
        licenseId: string;
        revoked: boolean;
        revokedAt: string;
    }>;
    manifest(req: any, itemId: string): Promise<{
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
    pkg(req: any, itemId: string, deviceId?: string): Promise<{
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
}
export declare class AgentDevicesController {
    private readonly install;
    constructor(install: InstallService);
    register(req: any, body: Record<string, unknown>): Promise<{
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
    list(req: any): Promise<{
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
    revoke(req: any, deviceId: string): Promise<{
        ok: boolean;
        deviceId: string;
        revoked: boolean;
        revokedAt: string;
    }>;
}
