import { HydratedDocument, Types } from 'mongoose';
export declare class Order {
    orderId: string;
    userId: Types.ObjectId;
    skillId: string;
    amountCny: number;
    status: string;
    developerId?: Types.ObjectId;
    paidAt?: Date;
    metadata?: Record<string, unknown>;
}
export type OrderDocument = HydratedDocument<Order>;
export declare const OrderSchema: import("mongoose").Schema<Order, import("mongoose").Model<Order, any, any, any, import("mongoose").Document<unknown, any, Order, any, {}> & Order & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Order, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Order>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Order> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
