import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { AdminService } from './admin.service';
import { JwtAuthGuard, RolesGuard, Roles } from '../auth/guards';

class ReviewDto {
  @IsIn(['approve', 'reject']) action: 'approve' | 'reject';
  @IsOptional() @IsString() note?: string;
}

class FeaturedDto {
  @IsBoolean() featured: boolean;
}

@ApiTags('admin')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: '市场统计' })
  stats() {
    return this.admin.stats();
  }

  @Get('reviews/pending')
  @ApiOperation({ summary: '待审核 skill 列表' })
  pending() {
    return this.admin.pendingReviews();
  }

  @Post('reviews/:skillId')
  @ApiOperation({ summary: '审核 skill（通过/退回）' })
  review(@Param('skillId') skillId: string, @Body() dto: ReviewDto) {
    return this.admin.review(decodeURIComponent(skillId), dto.action, dto.note);
  }

  @Post('skills/:skillId/featured')
  @ApiOperation({ summary: '设置精选' })
  featured(@Param('skillId') skillId: string, @Body() dto: FeaturedDto) {
    return this.admin.setFeatured(decodeURIComponent(skillId), dto.featured);
  }
}
