import { OrdersService } from './orders.service';
declare class CreateOrderDto {
    skillId: string;
}
export declare class OrdersController {
    private readonly orders;
    constructor(orders: OrdersService);
    create(req: any, dto: CreateOrderDto): Promise<{
        orderId: string;
        amountCny: number;
        skillId: string;
        payUrl: any;
        note: string;
    }>;
    mine(req: any): Promise<(import("mongoose").FlattenMaps<import("mongoose").Document<unknown, {}, import("./schemas/order.schema").Order, {}, {}> & import("./schemas/order.schema").Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }> & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    simulatePay(req: any, orderId: string): Promise<{
        ok: boolean;
        idempotent: boolean;
        orderId: string;
        skillId: string;
    }>;
}
export {};
