import { OnModuleInit } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
export declare class UsersService implements OnModuleInit {
    private readonly userModel;
    private readonly logger;
    constructor(userModel: Model<UserDocument>);
    onModuleInit(): Promise<void>;
    create(username: string, password: string, roles?: string[]): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    findByUsername(username: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    findById(id: string | Types.ObjectId): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    validatePassword(plain: string, hash: string): Promise<boolean>;
    addRole(userId: string, role: string): Promise<import("mongoose").UpdateWriteOpResult>;
    addEarnings(userId: string | Types.ObjectId, amount: number): Promise<import("mongoose").UpdateWriteOpResult>;
}
