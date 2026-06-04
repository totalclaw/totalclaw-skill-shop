import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from '../orders/orders.service';
import { EntitlementsService } from '../entitlements/entitlements.service';
import { DeveloperService } from '../developer/developer.service';
import { PayWebhookDto } from './dto/pay-webhook.dto';

/**
 * 支付成功 webhook —— 收银台/支付渠道支付成功后回调（仿 totalclaw-web internal-vip）。
 *
 * 鉴权：
 *   - X-Internal-Token: HMAC-SHA256(secret=SKILL_PAY_INTERNAL_TOKEN, message=`${orderId}.${ts}`)
 *   - X-Internal-Ts: unix ms，5min 窗口防重放
 *   - 缺 secret 直接 401（防"空 secret 任意人调"）
 *
 * 幂等：
 *   - 订单 status=paid 即视为已处理，二次回调返回缓存结果
 *   - 权益发放 (entitlements) 与开发者分账 (earnings) 均按 (user,skill)/orderId 幂等
 */
@ApiTags('internal')
@Controller('internal')
export class InternalPayController {
  private readonly logger = new Logger(InternalPayController.name);
  private static readonly TS_WINDOW_MS = 5 * 60 * 1000;

  constructor(
    private readonly orders: OrdersService,
    private readonly entitlements: EntitlementsService,
    private readonly developer: DeveloperService,
  ) {}

  @Post('pay-webhook')
  @ApiOperation({
    summary: '支付回调（HMAC 验签）',
    description:
      '禁止前端调用。X-Internal-Token = HMAC-SHA256(env.SKILL_PAY_INTERNAL_TOKEN, `${orderId}.${ts}`)；X-Internal-Ts 必填(unix ms)，5min 窗口。',
  })
  async payWebhook(
    @Headers('x-internal-token') tokenHeader: string | undefined,
    @Headers('x-internal-ts') tsHeader: string | undefined,
    @Body() dto: PayWebhookDto,
  ) {
    const secret = (process.env.SKILL_PAY_INTERNAL_TOKEN ?? '').trim();
    if (!secret) {
      this.logger.error('[pay-webhook] SKILL_PAY_INTERNAL_TOKEN 未配置，拒绝所有回调');
      throw new UnauthorizedException('internal token secret not configured');
    }
    if (!tokenHeader) throw new UnauthorizedException('missing X-Internal-Token');
    if (!tsHeader) throw new UnauthorizedException('missing X-Internal-Ts');

    const tsTrim = tsHeader.trim();
    const tsMs = Number.parseInt(tsTrim, 10);
    if (!Number.isFinite(tsMs) || String(tsMs) !== tsTrim) {
      throw new UnauthorizedException('invalid X-Internal-Ts');
    }
    if (Math.abs(Date.now() - tsMs) > InternalPayController.TS_WINDOW_MS) {
      throw new UnauthorizedException('X-Internal-Ts out of window');
    }

    const message = `${String(dto.orderId)}.${tsTrim}`;
    const expected = crypto.createHmac('sha256', secret).update(message).digest('hex');
    const got = tokenHeader.trim().toLowerCase();
    const a = Buffer.from(got, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
      this.logger.warn(`[pay-webhook] HMAC mismatch orderId=${dto.orderId}`);
      throw new UnauthorizedException('invalid X-Internal-Token');
    }

    const order = await this.orders.findByOrderId(dto.orderId.trim());
    if (!order) throw new BadRequestException('order not found');

    // 幂等：已支付直接返回
    if (order.status === 'paid') {
      this.logger.log(`[pay-webhook] orderId=${dto.orderId} 已处理，返回缓存`);
      return { ok: true, idempotent: true, skillId: order.skillId };
    }

    // 1) 标记订单已支付
    order.status = 'paid';
    order.paidAt = dto.paidAt ? new Date(dto.paidAt) : new Date();
    await order.save();

    // 2) 发放权益（幂等）
    await this.entitlements.grant({
      userId: order.userId,
      skillId: order.skillId,
      orderId: order.orderId,
      source: 'purchase',
      metadata: { amountCny: order.amountCny },
    });

    // 3) 开发者 skill 分账（幂等）
    if (order.developerId) {
      await this.developer.settleEarning({
        orderId: order.orderId,
        developerId: order.developerId,
        skillId: order.skillId,
        gross: order.amountCny,
      });
    }

    this.logger.log(`[pay-webhook] ok orderId=${dto.orderId} skillId=${order.skillId}`);
    return { ok: true, idempotent: false, skillId: order.skillId };
  }
}
