import { Body, Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards';

class CreateOrderDto {
  @IsString() skillId: string;
}

@ApiTags('orders')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post()
  @ApiOperation({ summary: '下单（生成 pending 订单）' })
  create(@Request() req, @Body() dto: CreateOrderDto) {
    return this.orders.create(req.user.userId, dto.skillId);
  }

  @Get('mine')
  @ApiOperation({ summary: '我的订单' })
  mine(@Request() req) {
    return this.orders.listByUser(req.user.userId);
  }

  @Post(':orderId/simulate-pay')
  @ApiOperation({ summary: '模拟支付完成（开发演示用，生产默认禁用）' })
  simulatePay(@Request() req, @Param('orderId') orderId: string) {
    return this.orders.simulatePay(req.user.userId, orderId);
  }
}
