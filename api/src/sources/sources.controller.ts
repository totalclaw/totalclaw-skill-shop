import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SourcesService } from './sources.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';

class TriggerDto {
  @IsOptional() @IsString() source?: string;
}

@ApiTags('sources')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('sources')
export class SourcesController {
  constructor(private readonly sources: SourcesService) {}

  @Get('runs')
  @ApiOperation({ summary: '最近同步记录' })
  runs() {
    return this.sources.recentRuns();
  }

  @Post('sync')
  @ApiOperation({ summary: '手动触发同步（管理员）' })
  sync(@Body() dto: TriggerDto) {
    return this.sources.triggerSync(dto.source);
  }
}
