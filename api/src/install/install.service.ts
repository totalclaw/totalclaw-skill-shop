import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';

import { SkillsService } from '../skills/skills.service';
import { EntitlementsService } from '../entitlements/entitlements.service';
import { applyWatermark, fingerprint } from '../common/watermark.util';
import { skillIdCandidates } from '../common/skill-id.util';
import { AgentDevice, AgentDeviceDocument } from './schemas/agent-device.schema';
import { SkillLicense, SkillLicenseDocument } from './schemas/skill-license.schema';
import {
  PROTOCOL_VERSION,
  b64u,
  canonicalJson,
  deviceIdFor,
  publicSigningKeys,
  rfc3339,
  sealForDevice,
  sha256Hex,
  signLicense,
  signManifest,
  unb64u,
} from './install.crypto';

/** 协议 §6 的错误码。HTTP 状态由 controller 决定。 */
export class InstallError extends Error {
  constructor(
    readonly errorCode: string,
    message: string,
    readonly status = 400,
  ) {
    super(message);
  }
}

@Injectable()
export class InstallService {
  private readonly logger = new Logger(InstallService.name);

  constructor(
    @InjectModel(AgentDevice.name)
    private readonly devices: Model<AgentDeviceDocument>,
    @InjectModel(SkillLicense.name)
    private readonly licenses: Model<SkillLicenseDocument>,
    private readonly skills: SkillsService,
    private readonly entitlements: EntitlementsService,
  ) {}

  // ── 设备 ────────────────────────────────────────────────────────────────

  /**
   * 注册设备公钥。请求体只有公钥与设备指纹 —— 服务端**不保存客户端私钥**，
   * 也没有任何字段能装它。
   */
  async registerDevice(
    userId: string,
    body: {
      protocolVersion?: string;
      publicKey?: string;
      publicKeyAlgorithm?: string;
      deviceId?: string;
      deviceFingerprint?: string;
      deviceName?: string;
      platform?: string;
      agentVersion?: string;
    },
  ) {
    if (String(body.protocolVersion || '') !== PROTOCOL_VERSION) {
      throw new InstallError('E_PROTOCOL_VERSION', `unsupported protocol version`, 400);
    }
    if (String(body.publicKeyAlgorithm || 'X25519') !== 'X25519') {
      throw new InstallError('E_PROTOCOL_VERSION', 'device key algorithm must be X25519', 400);
    }
    let raw: Buffer;
    try {
      raw = unb64u(String(body.publicKey || ''));
    } catch {
      throw new InstallError('E_DEVICE_ID_MISMATCH', 'publicKey is not valid base64url', 400);
    }
    if (raw.length !== 32) {
      throw new InstallError('E_DEVICE_ID_MISMATCH', 'publicKey must be 32 bytes', 400);
    }
    // deviceId 由公钥唯一决定：自己重算，不信客户端报的值。
    const computed = deviceIdFor(raw);
    if (String(body.deviceId || '') !== computed) {
      throw new InstallError('E_DEVICE_ID_MISMATCH', 'deviceId does not match publicKey', 400);
    }

    const existing = await this.devices.findOne({ deviceId: computed }).exec();
    if (existing && String(existing.userId) !== String(userId)) {
      throw new InstallError('E_DEVICE_ID_MISMATCH', 'device belongs to another account', 403);
    }
    if (existing?.revokedAt) {
      // 用户把自己的机器加回来是正常操作；记一笔审计，不静默。
      this.logger.warn(`device ${computed.slice(0, 16)} re-registered after revocation`);
    }
    const doc = await this.devices
      .findOneAndUpdate(
        { deviceId: computed },
        {
          $set: {
            userId: new Types.ObjectId(String(userId)),
            deviceId: computed,
            publicKey: b64u(raw),
            publicKeyAlgorithm: 'X25519',
            deviceFingerprint: String(body.deviceFingerprint || ''),
            deviceName: String(body.deviceName || ''),
            platform: String(body.platform || ''),
            agentVersion: String(body.agentVersion || ''),
            lastSeenAt: new Date(),
          },
          $unset: { revokedAt: '', },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true },
      )
      .exec();

    return {
      ok: true,
      deviceId: doc.deviceId,
      userId: String(doc.userId),
      registeredAt: rfc3339(doc.lastSeenAt || new Date()),
      revoked: false,
      signingKeys: publicSigningKeys(),
    };
  }

  async listDevices(userId: string) {
    const rows = await this.devices
      .find({ userId: new Types.ObjectId(String(userId)) })
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
        lastSeenAt: d.lastSeenAt ? rfc3339(new Date(d.lastSeenAt)) : null,
        revoked: !!d.revokedAt,
        revokedAt: d.revokedAt ? rfc3339(new Date(d.revokedAt)) : null,
      })),
    };
  }

  async revokeDevice(userId: string, deviceId: string, isAdmin = false) {
    const filter: Record<string, unknown> = { deviceId };
    if (!isAdmin) filter.userId = new Types.ObjectId(String(userId));
    const doc = await this.devices.findOne(filter).exec();
    if (!doc) throw new InstallError('E_DEVICE_NOT_REGISTERED', 'device not found', 404);
    doc.revokedAt = doc.revokedAt || new Date();
    await doc.save();
    return { ok: true, deviceId, revoked: true, revokedAt: rfc3339(doc.revokedAt) };
  }

  // ── 条目解析与鉴权 ──────────────────────────────────────────────────────

  private async resolveItem(nameOrId: string) {
    const raw = String(nameOrId || '').trim();
    if (!raw) throw new InstallError('E_ITEM_NOT_INSTALLABLE', 'itemId required', 404);
    // 候选顺序与 by-name/:name/file 同一个口径（skill-id.util.ts）：原样优先，
    // 再把 `~` 还原成 `/`。此前这里是无条件 `~`→`/`，developer 渠道那种
    // skillId 里本来就带字面 `~` 的条目会被改坏。
    for (const candidate of skillIdCandidates(raw)) {
      try {
        return await this.skills.detail(candidate, true);
      } catch {
        // 下一个候选
      }
    }
    try {
      // 都不是 skillId，按名称/slug 再找一次
      const byName: any = await this.skills.findByName(raw);
      return await this.skills.detail(String(byName.skillId), true);
    } catch {
      throw new InstallError('E_ITEM_NOT_INSTALLABLE', 'item not found', 404);
    }
  }

  private static isPaid(doc: any): boolean {
    return !!doc.closedSource || doc.listingType === 'paid';
  }

  private buildManifestBase(doc: any) {
    return {
      protocolVersion: PROTOCOL_VERSION,
      itemId: String(doc.skillId),
      kind: doc.kind === 'role' ? 'role' : 'skill',
      name: String(doc.slug || doc.name || doc.skillId),
      displayName: String(doc.displayName || doc.name || ''),
      description: String(doc.descriptionZh || doc.description || ''),
      version: String(doc.version || ''),
      runtime: 'totalclaw-agent',
      listingType: String(doc.listingType || 'free'),
      closedSource: !!doc.closedSource,
      requiresAuth: InstallService.isPaid(doc),
      contentType: 'text/markdown',
      entry: doc.kind === 'role' ? 'ROLE.md' : 'SKILL.md',
    };
  }

  /** 协议 §4.1：manifest 不含正文。免费匿名可取，付费需 JWT + entitlement。 */
  async manifest(nameOrId: string, userId?: string) {
    const doc: any = await this.resolveItem(nameOrId);
    const paid = InstallService.isPaid(doc);
    if (paid) {
      if (!userId) throw new InstallError('E_NOT_ENTITLED', 'sign in required', 403);
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

  /**
   * 协议 §4.2：免费条目返回明文包；付费/闭源条目按设备公钥封一份加密包。
   *
   * 顺序刻意是「先鉴权 → 再查设备 → 最后才碰正文」：没权限的请求根本不会走到
   * 读正文那一步。
   */
  async packageFor(nameOrId: string, userId: string | undefined, deviceId: string | undefined) {
    const doc: any = await this.resolveItem(nameOrId);
    const paid = InstallService.isPaid(doc);
    const base = this.buildManifestBase(doc);

    if (!paid) {
      // 免费路径完全不走加密闭环：不需要设备、不签发 license。
      const dl = await this.skills.buildDownload(String(doc.skillId));
      await this.skills.incrementDownloads(String(doc.skillId));
      return { ok: true, protocolVersion: PROTOCOL_VERSION, encrypted: false, manifest: base, content: dl.content };
    }

    if (!userId) throw new InstallError('E_NOT_ENTITLED', 'sign in required', 403);
    if (!(await this.entitlements.has(userId, String(doc.skillId)))) {
      throw new InstallError('E_NOT_ENTITLED', 'item not purchased', 403);
    }
    if (!deviceId) {
      throw new InstallError('E_DEVICE_NOT_REGISTERED', 'deviceId query parameter required', 404);
    }
    const device = await this.devices.findOne({ deviceId }).lean().exec();
    if (!device) throw new InstallError('E_DEVICE_NOT_REGISTERED', 'device not registered', 404);
    if (String(device.userId) !== String(userId)) {
      throw new InstallError('E_DEVICE_NOT_REGISTERED', 'device belongs to another account', 404);
    }
    if (device.revokedAt) throw new InstallError('E_DEVICE_REVOKED', 'device revoked', 403);

    const content: any = await this.skills.getContent(String(doc.skillId));
    const plaintextBody = String(content?.contentMd || '').trim();
    if (!plaintextBody) {
      throw new InstallError('E_ITEM_NOT_INSTALLABLE', 'item has no content to install', 404);
    }
    // 水印：可见授权声明 + 零宽指纹，泄露可溯源到买家 + 设备。
    // 只水印**正文**，不碰外面那层市场元数据头 —— 零宽字符会顶掉
    // `# 名称` / `## 元数据` 的行首，客户端解析头部时就认不出来了。
    const watermarked = this.renderSkillMarkdown(
      doc,
      applyWatermark(plaintextBody, {
        userId: String(userId),
        username: `device ${String(deviceId).slice(0, 16)}`,
        skillId: String(doc.skillId),
      }),
    );

    const license = await this.issueLicense(doc, String(userId), deviceId);
    const body = Buffer.from(watermarked, 'utf8');
    const manifest = {
      ...base,
      contentHash: `sha256:${sha256Hex(body)}`,
      contentLength: body.length,
      deviceId,
      licenseId: license.licenseId,
      issuedAt: license.issuedAt,
      watermark: { fingerprint: fingerprint(String(userId), String(doc.skillId)) },
    };
    const aad = canonicalJson(manifest);
    const sealed = sealForDevice(watermarked, unb64u(device.publicKey), deviceId, aad);
    await this.skills.incrementDownloads(String(doc.skillId));

    const { payload, cipherHash, ...encryption } = sealed;
    return {
      protocolVersion: PROTOCOL_VERSION,
      encrypted: true,
      manifest,
      manifestSignature: signManifest(manifest),
      encryption: { ...encryption, cipherHash },
      payload,
      license,
      licenseSignature: signLicense(license),
    };
  }

  /** 正文外面补一层市场元数据头，与免费下载的 SKILL.md 形状一致。 */
  private renderSkillMarkdown(doc: any, bodyMd: string): string {
    const name = doc.displayName || doc.name || doc.slug || doc.skillId;
    const desc = doc.descriptionZh || doc.description || '';
    const lines: string[] = [`# ${name}`, ''];
    if (desc) lines.push(desc, '');
    const kv: [string, unknown][] = [
      ['skillId', doc.skillId],
      ['来源', doc.source],
      ['作者', doc.author],
      ['版本', doc.version],
      ['许可', doc.license],
      ['分类', doc.category],
    ];
    const meta = kv.filter(([, v]) => v).map(([k, v]) => `- **${k}**: ${v}`);
    if (meta.length) lines.push('## 元数据', ...meta, '');
    return `${lines.join('\n')}---\n\n${bodyMd}\n`;
  }

  // ── license ────────────────────────────────────────────────────────────

  private async issueLicense(doc: any, userId: string, deviceId: string) {
    const offlineDays = Math.max(0, parseInt(process.env.SKILL_LICENSE_OFFLINE_DAYS || '7', 10) || 0);
    const validDays = parseInt(process.env.SKILL_LICENSE_VALID_DAYS || '0', 10) || 0;
    const licenseId = randomBytes(16).toString('hex');
    const issuedAt = new Date();
    const expiresAt = validDays > 0 ? new Date(issuedAt.getTime() + validDays * 86400_000) : null;

    await this.licenses.create({
      licenseId,
      userId: new Types.ObjectId(String(userId)),
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
      protocolVersion: PROTOCOL_VERSION,
      licenseId,
      userId: String(userId),
      deviceId,
      itemId: String(doc.skillId),
      kind: doc.kind === 'role' ? 'role' : 'skill',
      version: String(doc.version || ''),
      issuedAt: rfc3339(issuedAt),
      expiresAt: expiresAt ? rfc3339(expiresAt) : null,
      allowedOfflineDays: offlineDays,
      revocationUrl: `${origin}/api/install/licenses/${licenseId}/status`,
    };
  }

  /**
   * 吊销状态同步（协议 §5.3）。`revoked` = 显式吊销 ‖ 设备被撤销 ‖ 权益已撤回。
   * licenseId 是 128 位随机值，本身就是凭证，所以不强制 JWT。
   */
  async licenseStatus(licenseId: string) {
    const lic = await this.licenses.findOne({ licenseId }).lean().exec();
    const checkedAt = rfc3339(new Date());
    if (!lic) {
      // 查不到的 license 一律按已吊销 —— 失败方向更保守。
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
      revokedAt: lic.revokedAt ? rfc3339(new Date(lic.revokedAt)) : revoked ? checkedAt : null,
      reason: lic.revokedReason || (deviceRevoked ? 'device revoked' : (!stillEntitled ? 'entitlement withdrawn' : null)),
      deviceRevoked,
      checkedAt,
    };
  }

  async revokeLicense(userId: string, licenseId: string, reason: string, isAdmin = false) {
    const filter: Record<string, unknown> = { licenseId };
    if (!isAdmin) filter.userId = new Types.ObjectId(String(userId));
    const lic = await this.licenses.findOne(filter).exec();
    if (!lic) throw new InstallError('E_ITEM_NOT_INSTALLABLE', 'license not found', 404);
    lic.revokedAt = lic.revokedAt || new Date();
    lic.revokedReason = reason || 'revoked by owner';
    await lic.save();
    return { ok: true, licenseId, revoked: true, revokedAt: rfc3339(lic.revokedAt) };
  }
}
