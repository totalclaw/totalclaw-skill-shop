/**
 * 闭源技能加密安装协议 `tcpkg/1` 的密码学部分。
 *
 * 协议单一事实源：`totalclaw-agent/docs/skill-shop/encrypted-install-protocol.md`。
 * 客户端实现：`totalclaw-agent/totalclaw_core/tools/skills_shop_license.py`。
 *
 * 算法：Ed25519 签名 + X25519-ECDH/HKDF-SHA256 派生 KEK + AES-256-GCM。
 * 全部走 Node 内置 `crypto`，**不引任何新依赖**。
 *
 * 秘密（签名私钥、contentKey、派生 KEK）绝不进日志。
 */
import {
  createHash,
  createPrivateKey,
  createPublicKey,
  createCipheriv,
  diffieHellman,
  generateKeyPairSync,
  hkdfSync,
  randomBytes,
  sign as edSign,
  KeyObject,
} from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

export const PROTOCOL_VERSION = 'tcpkg/1';

const MANIFEST_SIG_PREFIX = Buffer.from('tcpkg/1:manifest\n', 'utf8');
const LICENSE_SIG_PREFIX = Buffer.from('tcpkg/1:license\n', 'utf8');
const HKDF_INFO = Buffer.from('totalclaw-skill-package/v1', 'utf8');

/** base64url，无填充 —— 协议里所有二进制字段的编码。 */
export function b64u(raw: Buffer): string {
  return raw.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** 解 base64url（容忍有/无填充）。 */
export function unb64u(text: string): Buffer {
  const s = String(text || '').replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(s + '='.repeat((4 - (s.length % 4)) % 4), 'base64');
}

/**
 * 规范化 JSON：key 递归排序、无空白、UTF-8、非 ASCII 不转义。
 * 必须与客户端 `canonical_json()` 逐字节一致 —— 它是签名与 AEAD 的 AAD 的输入。
 */
export function canonicalJson(value: unknown): Buffer {
  return Buffer.from(JSON.stringify(sortDeep(value)), 'utf8');
}

function sortDeep(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortDeep);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    const src = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(src).sort()) out[k] = sortDeep(src[k]);
    return out;
  }
  return value;
}

export function sha256Hex(raw: Buffer | string): string {
  return createHash('sha256').update(raw).digest('hex');
}

/** RFC 3339 UTC，毫秒精度 —— 与客户端 `_iso()` 对齐。 */
export function rfc3339(d: Date): string {
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// 服务端签名密钥
// ---------------------------------------------------------------------------

export interface SigningKey {
  keyId: string;
  algorithm: 'Ed25519';
  privateKey: KeyObject;
  publicKeyRaw: Buffer;
}

let cachedKey: SigningKey | null = null;

/** Ed25519 raw 私钥（32B）→ KeyObject（拼 PKCS#8 前缀，避免引 asn1 依赖）。 */
function ed25519FromRaw(raw: Buffer): KeyObject {
  const pkcs8 = Buffer.concat([
    Buffer.from('302e020100300506032b657004220420', 'hex'),
    raw,
  ]);
  return createPrivateKey({ key: pkcs8, format: 'der', type: 'pkcs8' });
}

function rawPublicOf(priv: KeyObject): Buffer {
  const der = createPublicKey(priv).export({ format: 'der', type: 'spki' }) as Buffer;
  return der.subarray(der.length - 32); // SPKI 尾部 32 字节就是 raw 公钥
}

/**
 * 签名密钥：`SKILL_SIGNING_PRIVATE_KEY`（base64url raw 32B）+ `SKILL_SIGNING_KEY_ID`。
 *
 * 未配置时：开发模式自动生成一把并落 `api/.skill-signing-key.json`（0600）；
 * 生产模式**拒绝**自动生成 —— 默认值不能是一把人人都有的密钥。
 */
export function getSigningKey(): SigningKey {
  if (cachedKey) return cachedKey;
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

  const devFile = join(process.cwd(), '.skill-signing-key.json');
  if (existsSync(devFile)) {
    const saved = JSON.parse(readFileSync(devFile, 'utf8'));
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
    throw new Error(
      'SKILL_SIGNING_PRIVATE_KEY is not set. Generate an Ed25519 key and configure it ' +
        'before serving encrypted skill packages in production.',
    );
  }
  const { privateKey } = generateKeyPairSync('ed25519');
  const der = privateKey.export({ format: 'der', type: 'pkcs8' }) as Buffer;
  const raw = der.subarray(der.length - 32);
  writeFileSync(devFile, JSON.stringify({ keyId, privateKey: b64u(raw) }, null, 2), { mode: 0o600 });
  cachedKey = { keyId, algorithm: 'Ed25519', privateKey, publicKeyRaw: rawPublicOf(privateKey) };
  return cachedKey;
}

/** 客户端要 pin 的签名公钥列表（公开信息）。 */
export function publicSigningKeys() {
  const k = getSigningKey();
  return [{ keyId: k.keyId, algorithm: 'Ed25519' as const, publicKey: b64u(k.publicKeyRaw) }];
}

export interface SignatureBlock {
  keyId: string;
  algorithm: 'Ed25519';
  value: string;
}

function signWithPrefix(prefix: Buffer, payload: unknown): SignatureBlock {
  const k = getSigningKey();
  const message = Buffer.concat([prefix, canonicalJson(payload)]);
  return { keyId: k.keyId, algorithm: 'Ed25519', value: b64u(edSign(null, message, k.privateKey)) };
}

export function signManifest(manifest: unknown): SignatureBlock {
  return signWithPrefix(MANIFEST_SIG_PREFIX, manifest);
}

export function signLicense(license: unknown): SignatureBlock {
  return signWithPrefix(LICENSE_SIG_PREFIX, license);
}

// ---------------------------------------------------------------------------
// 封包
// ---------------------------------------------------------------------------

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
  /**
   * 密文的 SHA-256。放在 `encryption` 而不是 manifest 里：manifest 是 AAD，
   * 而密文由 AAD 决定 —— 塞进 manifest 会变成循环依赖。它只是"不用解密就能
   * 发现传输损坏"的早退提示，真正的完整性由 GCM tag 保证。
   */
  cipherHash: string;
  payload: string;
}

/** raw X25519 公钥（32B）→ KeyObject（拼 SPKI 前缀）。 */
function x25519PublicFromRaw(raw: Buffer): KeyObject {
  return createPublicKey({
    key: Buffer.concat([Buffer.from('302a300506032b656e032100', 'hex'), raw]),
    format: 'der',
    type: 'spki',
  });
}

/**
 * 用设备公钥封一份加密包。`aad` 是规范化后的 manifest 字节串 —— 正文与内容
 * 密钥都绑在这一份 manifest 上，改 manifest 任何一个字节两头都解不开。
 */
export function sealForDevice(
  plaintext: string,
  devicePublicKeyRaw: Buffer,
  deviceId: string,
  aad: Buffer,
): SealedPayload {
  const contentKey = randomBytes(32);
  const payloadNonce = randomBytes(12);
  const body = Buffer.from(plaintext, 'utf8');

  const cipher = createCipheriv('aes-256-gcm', contentKey, payloadNonce);
  cipher.setAAD(aad);
  const ciphertext = Buffer.concat([cipher.update(body), cipher.final()]);
  const payloadTag = cipher.getAuthTag();

  const eph = generateKeyPairSync('x25519');
  const ephRawPub = (eph.publicKey.export({ format: 'der', type: 'spki' }) as Buffer).subarray(-32);
  const shared = diffieHellman({
    privateKey: eph.privateKey,
    publicKey: x25519PublicFromRaw(devicePublicKeyRaw),
  });
  const kek = Buffer.from(
    hkdfSync('sha256', shared, Buffer.concat([ephRawPub, devicePublicKeyRaw]), HKDF_INFO, 32),
  );

  const wrapNonce = randomBytes(12);
  const wrapCipher = createCipheriv('aes-256-gcm', kek, wrapNonce);
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

/** `deviceId = sha256(raw X25519 公钥)` —— 服务端必须自己重算比对。 */
export function deviceIdFor(publicKeyRaw: Buffer): string {
  return sha256Hex(publicKeyRaw);
}
