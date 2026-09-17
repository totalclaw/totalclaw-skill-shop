import { KeyObject } from 'crypto';
export declare const PROTOCOL_VERSION = "tcpkg/1";
export declare function b64u(raw: Buffer): string;
export declare function unb64u(text: string): Buffer;
export declare function canonicalJson(value: unknown): Buffer;
export declare function sha256Hex(raw: Buffer | string): string;
export declare function rfc3339(d: Date): string;
export interface SigningKey {
    keyId: string;
    algorithm: 'Ed25519';
    privateKey: KeyObject;
    publicKeyRaw: Buffer;
}
export declare function getSigningKey(): SigningKey;
export declare function publicSigningKeys(): {
    keyId: string;
    algorithm: "Ed25519";
    publicKey: string;
}[];
export interface SignatureBlock {
    keyId: string;
    algorithm: 'Ed25519';
    value: string;
}
export declare function signManifest(manifest: unknown): SignatureBlock;
export declare function signLicense(license: unknown): SignatureBlock;
export interface SealedPayload {
    algorithm: 'AES-256-GCM';
    nonce: string;
    tag: string;
    keyWrap: {
        algorithm: 'X25519-HKDF-SHA256-AES-256-GCM';
        recipientDeviceId: string;
        ephemeralPublicKey: string;
        nonce: string;
        tag: string;
        ciphertext: string;
    };
    cipherHash: string;
    payload: string;
}
export declare function sealForDevice(plaintext: string, devicePublicKeyRaw: Buffer, deviceId: string, aad: Buffer): SealedPayload;
export declare function deviceIdFor(publicKeyRaw: Buffer): string;
