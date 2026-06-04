import { Model, Types } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { SkillDocument } from '../skills/schemas/skill.schema';
import { EntitlementsService } from '../entitlements/entitlements.service';
import { DeveloperService } from '../developer/developer.service';
export declare class OrdersService {
    private readonly orderModel;
    private readonly skillModel;
    private readonly entitlements;
    private readonly developer;
    constructor(orderModel: Model<OrderDocument>, skillModel: Model<SkillDocument>, entitlements: EntitlementsService, developer: DeveloperService);
    create(userId: string, skillId: string): Promise<{
        orderId: string;
        amountCny: number;
        skillId: string;
        payUrl: any;
        note: string;
    }>;
    findByOrderId(orderId: string): Promise<import("mongoose").Document<unknown, {}, import("mongoose").Document<unknown, {}, Order, {}, {}> & Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }, {}, {}> & import("mongoose").Document<unknown, {}, Order, {}, {}> & Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    } & Required<{
        _id: Types.ObjectId;
    }>>;
    simulatePay(userId: string, orderId: string): Promise<{
        ok: boolean;
        idempotent: boolean;
        orderId: string;
        skillId: string;
    }>;
    listByUser(userId: string): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, Order, {}, {}> & Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: Types.ObjectId;
    }>)[]>;
}
