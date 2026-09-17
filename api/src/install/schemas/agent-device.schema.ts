import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

/**
 * TotalClaw-agent 设备。协议 `tcpkg/1` §3。
 *
 * **只存公钥**。客户端私钥永不离开本机 —— 服务端没有任何字段能装它，
 * 注册接口也只接收本文件里列出的这些字段。
 */
@Schema({ timestamps: true, collection: 'agent_devices' })
export class AgentDevice {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  /** `sha256(raw X25519 公钥)`，服务端自己重算比对，客户端伪造不了。 */
  @Prop({ required: true, trim: true, unique: true, index: true })
  deviceId: string;

  @Prop({ trim: true })
  deviceName?: string;

  /** base64url 的 raw X25519 公钥（32 字节）。公开信息。 */
  @Prop({ required: true, trim: true })
  publicKey: string;

  @Prop({ trim: true, default: 'X25519' })
  publicKeyAlgorithm: string;

  /** 粗粒度主机指纹（平台+MAC+主机名的 SHA-256），用于运营排查，非密钥。 */
  @Prop({ trim: true })
  deviceFingerprint?: string;

  @Prop({ trim: true })
  agentVersion?: string;

  @Prop({ trim: true })
  platform?: string;

  @Prop({ default: Date.now })
  lastSeenAt: Date;

  /** 非空 = 已撤销：不再下发加密包，已发出的 license 下次联网同步即失效。 */
  @Prop()
  revokedAt?: Date;
}

export type AgentDeviceDocument = HydratedDocument<AgentDevice>;
export const AgentDeviceSchema = SchemaFactory.createForClass(AgentDevice);

AgentDeviceSchema.index({ userId: 1, deviceId: 1 });
