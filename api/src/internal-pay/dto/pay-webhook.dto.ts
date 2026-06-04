import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class PayWebhookDto {
  @ApiProperty({ description: '订单号（幂等键）' })
  @IsString()
  orderId: string;

  @ApiProperty({ description: '支付时间戳(ms)', required: false })
  @IsOptional()
  @IsNumber()
  paidAt?: number;
}
