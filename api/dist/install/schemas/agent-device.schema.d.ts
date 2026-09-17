import { HydratedDocument, Types } from 'mongoose';
export declare class AgentDevice {
    userId: Types.ObjectId;
    deviceId: string;
    deviceName?: string;
    publicKey: string;
    publicKeyAlgorithm: string;
    deviceFingerprint?: string;
    agentVersion?: string;
    platform?: string;
    lastSeenAt: Date;
    revokedAt?: Date;
}
export type AgentDeviceDocument = HydratedDocument<AgentDevice>;
export declare const AgentDeviceSchema: import("mongoose").Schema<AgentDevice, import("mongoose").Model<AgentDevice, any, any, any, import("mongoose").Document<unknown, any, AgentDevice, any, {}> & AgentDevice & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, AgentDevice, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<AgentDevice>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<AgentDevice> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
