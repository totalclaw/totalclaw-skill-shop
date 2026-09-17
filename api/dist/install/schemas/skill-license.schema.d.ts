import { HydratedDocument, Types } from 'mongoose';
export declare class SkillLicense {
    licenseId: string;
    userId: Types.ObjectId;
    deviceId: string;
    itemId: string;
    kind: string;
    version?: string;
    issuedAt: Date;
    expiresAt?: Date;
    allowedOfflineDays: number;
    revokedAt?: Date;
    revokedReason?: string;
}
export type SkillLicenseDocument = HydratedDocument<SkillLicense>;
export declare const SkillLicenseSchema: import("mongoose").Schema<SkillLicense, import("mongoose").Model<SkillLicense, any, any, any, import("mongoose").Document<unknown, any, SkillLicense, any, {}> & SkillLicense & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, SkillLicense, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<SkillLicense>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<SkillLicense> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
