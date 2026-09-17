"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PROTOCOL_VERSION = void 0;
exports.b64u = b64u;
exports.unb64u = unb64u;
exports.canonicalJson = canonicalJson;
exports.sha256Hex = sha256Hex;
exports.rfc3339 = rfc3339;
exports.getSigningKey = getSigningKey;
exports.publicSigningKeys = publicSigningKeys;
exports.signManifest = signManifest;
exports.signLicense = signLicense;
exports.sealForDevice = sealForDevice;
exports.deviceIdFor = deviceIdFor;
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = require("path");
exports.PROTOCOL_VERSION = 'tcpkg/1';
const MANIFEST_SIG_PREFIX = Buffer.from('tcpkg/1:manifest\n', 'utf8');
const LICENSE_SIG_PREFIX = Buffer.from('tcpkg/1:license\n', 'utf8');
const HKDF_INFO = Buffer.from('totalclaw-skill-package/v1', 'utf8');
function b64u(raw) {
    return raw.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function unb64u(text) {
    const s = String(text || '').replace(/-/g, '+').replace(/_/g, '/');
    return Buffer.from(s + '='.repeat((4 - (s.length % 4)) % 4), 'base64');
}
function canonicalJson(value) {
    return Buffer.from(JSON.stringify(sortDeep(value)), 'utf8');
}
function sortDeep(value) {
    if (Array.isArray(value))
        return value.map(sortDeep);
    if (value && typeof value === 'object' && !(value instanceof Date)) {
        const src = value;
        const out = {};
        for (const k of Object.keys(src).sort())
            out[k] = sortDeep(src[k]);
        return out;
    }
    return value;
}
function sha256Hex(raw) {
    return (0, crypto_1.createHash)('sha256').update(raw).digest('hex');
}
function rfc3339(d) {
    return d.toISOString();
}
let cachedKey = null;
function ed25519FromRaw(raw) {
    const pkcs8 = Buffer.concat([
        Buffer.from('302e020100300506032b657004220420', 'hex'),
        raw,
    ]);
    return (0, crypto_1.createPrivateKey)({ key: pkcs8, format: 'der', type: 'pkcs8' });
}
function rawPublicOf(priv) {
    const der = (0, crypto_1.createPublicKey)(priv).export({ format: 'der', type: 'spki' });
    return der.subarray(der.length - 32);
}
function getSigningKey() {
    if (cachedKey)
        return cachedKey;
    const keyId = (process.env.SKILL_SIGNING_KEY_ID || 'k1').trim();
    const fromEnv = (process.env.SKILL_SIGNING_PRIVATE_KEY || '').trim();
    if (fromEnv) {
        const raw = unb64u(fromEnv);
        if (raw.length !== 32) {
            throw new Error('SKILL_SIGNING_PRIVATE_KEY must be a base64url raw Ed25519 key (32 bytes)');
        }
        const privateKey = ed25519FromRaw(raw);
        cachedKey = { keyId, algorithm: 'Ed25519', privateKey, publicKeyRaw: rawPublicOf(privateKey) };
        return cachedKey;
    }
    const devFile = (0, path_1.join)(process.cwd(), '.skill-signing-key.json');
    if ((0, fs_1.existsSync)(devFile)) {
        const saved = JSON.parse((0, fs_1.readFileSync)(devFile, 'utf8'));
        const privateKey = ed25519FromRaw(unb64u(saved.privateKey));
        cachedKey = {
            keyId: String(saved.keyId || keyId),
            algorithm: 'Ed25519',
            privateKey,
            publicKeyRaw: rawPublicOf(privateKey),
        };
        return cachedKey;
    }
    if (process.env.NODE_ENV === 'production') {
        throw new Error('SKILL_SIGNING_PRIVATE_KEY is not set. Generate an Ed25519 key and configure it ' +
            'before serving encrypted skill packages in production.');
    }
    const { privateKey } = (0, crypto_1.generateKeyPairSync)('ed25519');
    const der = privateKey.export({ format: 'der', type: 'pkcs8' });
    const raw = der.subarray(der.length - 32);
    (0, fs_1.writeFileSync)(devFile, JSON.stringify({ keyId, privateKey: b64u(raw) }, null, 2), { mode: 0o600 });
    cachedKey = { keyId, algorithm: 'Ed25519', privateKey, publicKeyRaw: rawPublicOf(privateKey) };
    return cachedKey;
}
function publicSigningKeys() {
    const k = getSigningKey();
    return [{ keyId: k.keyId, algorithm: 'Ed25519', publicKey: b64u(k.publicKeyRaw) }];
}
function signWithPrefix(prefix, payload) {
    const k = getSigningKey();
    const message = Buffer.concat([prefix, canonicalJson(payload)]);
    return { keyId: k.keyId, algorithm: 'Ed25519', value: b64u((0, crypto_1.sign)(null, message, k.privateKey)) };
}
function signManifest(manifest) {
    return signWithPrefix(MANIFEST_SIG_PREFIX, manifest);
}
function signLicense(license) {
    return signWithPrefix(LICENSE_SIG_PREFIX, license);
}
function x25519PublicFromRaw(raw) {
    return (0, crypto_1.createPublicKey)({
        key: Buffer.concat([Buffer.from('302a300506032b656e032100', 'hex'), raw]),
        format: 'der',
        type: 'spki',
    });
}
function sealForDevice(plaintext, devicePublicKeyRaw, deviceId, aad) {
    const contentKey = (0, crypto_1.randomBytes)(32);
    const payloadNonce = (0, crypto_1.randomBytes)(12);
    const body = Buffer.from(plaintext, 'utf8');
    const cipher = (0, crypto_1.createCipheriv)('aes-256-gcm', contentKey, payloadNonce);
    cipher.setAAD(aad);
    const ciphertext = Buffer.concat([cipher.update(body), cipher.final()]);
    const payloadTag = cipher.getAuthTag();
    const eph = (0, crypto_1.generateKeyPairSync)('x25519');
    const ephRawPub = eph.publicKey.export({ format: 'der', type: 'spki' }).subarray(-32);
    const shared = (0, crypto_1.diffieHellman)({
        privateKey: eph.privateKey,
        publicKey: x25519PublicFromRaw(devicePublicKeyRaw),
    });
    const kek = Buffer.from((0, crypto_1.hkdfSync)('sha256', shared, Buffer.concat([ephRawPub, devicePublicKeyRaw]), HKDF_INFO, 32));
    const wrapNonce = (0, crypto_1.randomBytes)(12);
    const wrapCipher = (0, crypto_1.createCipheriv)('aes-256-gcm', kek, wrapNonce);
    wrapCipher.setAAD(aad);
    const wrapped = Buffer.concat([wrapCipher.update(contentKey), wrapCipher.final()]);
    const wrapTag = wrapCipher.getAuthTag();
    return {
        algorithm: 'AES-256-GCM',
        nonce: b64u(payloadNonce),
        tag: b64u(payloadTag),
        keyWrap: {
            algorithm: 'X25519-HKDF-SHA256-AES-256-GCM',
            recipientDeviceId: deviceId,
            ephemeralPublicKey: b64u(ephRawPub),
            nonce: b64u(wrapNonce),
            tag: b64u(wrapTag),
            ciphertext: b64u(wrapped),
        },
        cipherHash: `sha256:${sha256Hex(ciphertext)}`,
        payload: b64u(ciphertext),
    };
}
function deviceIdFor(publicKeyRaw) {
    return sha256Hex(publicKeyRaw);
}
//# sourceMappingURL=install.crypto.js.map