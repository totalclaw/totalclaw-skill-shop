import { OrdersService } from '../orders/orders.service';
import { EntitlementsService } from '../entitlements/entitlements.service';
import { DeveloperService } from '../developer/developer.service';
import { PayWebhookDto } from './dto/pay-webhook.dto';
export declare class InternalPayController {
    private readonly orders;
    private readonly entitlements;
    private readonly developer;
    private readonly logger;
    private static readonly TS_WINDOW_MS;
    constructor(orders: OrdersService, entitlements: EntitlementsService, developer: DeveloperService);
    payWebhook(tokenHeader: string | undefined, tsHeader: string | undefined, dto: PayWebhookDto): Promise<{
        ok: boolean;
        idempotent: boolean;
        skillId: string;
    }>;
}
