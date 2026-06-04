import { Controller, ForbiddenException, Get, Param, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { QuerySkillsDto } from './dto/query-skills.dto';
import { sendMarkdownAttachment } from '../common/download.util';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Get()
  @ApiOperation({ summary: '列表/检索（分页、分类、来源、标签、收费过滤）' })
  list(@Query() query: QuerySkillsDto) {
    return this.skillsService.list(query);
  }

  @Get('categories')
  @ApiOperation({ summary: '分类聚合（含计数）；kind=role 聚合角色分类' })
  categories(@Query('kind') kind?: string) {
    return this.skillsService.categories(kind);
  }

  @Get('sources-summary')
  @ApiOperation({ summary: '来源聚合（含计数）' })
  sourcesSummary() {
    return this.skillsService.sourcesSummary();
  }

  @Get(':skillId')
  @ApiOperation({ summary: '详情（闭源 skill 默认裁剪正文）' })
  detail(@Param('skillId') skillId: string) {
    return this.skillsService.detail(decodeURIComponent(skillId));
  }

  @Post(':skillId/download')
  @ApiOperation({ summary: '下载埋点（免费 skill）' })
  async download(@Param('skillId') skillId: string) {
    await this.skillsService.incrementDownloads(decodeURIComponent(skillId));
    return { ok: true };
  }

  @Get(':skillId/file')
  @ApiOperation({ summary: '下载免费 skill 的 SKILL.md（收费/闭源走 /entitlements/download）' })
  async file(@Param('skillId') skillId: string, @Res() res: Response) {
    const id = decodeURIComponent(skillId);
    const dl = await this.skillsService.buildDownload(id);
    if (dl.listingType === 'paid' || dl.closedSource) {
      throw new ForbiddenException('paid skill: purchase and download via /api/entitlements/download');
    }
    await this.skillsService.incrementDownloads(id);
    sendMarkdownAttachment(res, dl.filename, dl.content);
  }
}
