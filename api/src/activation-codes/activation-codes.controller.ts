import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ActivationCodesService } from './activation-codes.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';

class RedeemDto {
  @IsString() code: string;
}

class CreateBatchDto {
  @IsString() skillId: string;
  @IsInt() @Min(1) count: number;
  @IsOptional() @IsInt() @Min(1) maxActivations?: number;
  @IsOptional() @IsString() batchId?: string;
  @IsOptional() @IsString() remark?: string;
}

@ApiTags('activation-codes')
@Controller()
export class ActivationCodesController {
  constructor(private readonly service: ActivationCodesService) {}

  @Post('activation-codes/redeem')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: '兑换激活码 → 发放权益' })
  redeem(@Request() req, @Body() dto: RedeemDto) {
    return this.service.redeem(dto.code, req.user.userId);
  }

  @Post('admin/activation-codes/batch')
  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiOperation({ summary: '管理员批量签发激活码' })
  createBatch(@Body() dto: CreateBatchDto) {
    return this.service.createBatch(dto);
  }
}
