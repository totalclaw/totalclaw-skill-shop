import { Body, Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { DeveloperService } from './developer.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';

class UploadSkillDto {
  @IsString() slug: string;
  @IsString() name: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() descriptionZh?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsArray() tags?: string[];
  @IsString() contentMd: string;
  @IsNumber() @Min(0) price: number;
  @IsOptional() @IsString() license?: string;
  @IsOptional() @IsBoolean() closedSource?: boolean;
}

@ApiTags('developer')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('developer')
@Controller('developer')
export class DeveloperController {
  constructor(private readonly developer: DeveloperService) {}

  @Post('skills')
  @ApiOperation({ summary: '上传/更新 skill（进入待审核）' })
  upload(@Request() req, @Body() dto: UploadSkillDto) {
    return this.developer.uploadSkill(req.user.userId, dto);
  }

  @Get('skills')
  @ApiOperation({ summary: '我上传的 skill' })
  mySkills(@Request() req) {
    return this.developer.mySkills(req.user.userId);
  }

  @Get('earnings')
  @ApiOperation({ summary: '我的收益账本' })
  earnings(@Request() req) {
    return this.developer.earnings(req.user.userId);
  }
}
