import { Controller, Get, Param, UseGuards, Request, Res, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EntitlementsService } from './entitlements.service';
import { JwtAuthGuard } from '../auth/guards';
import { SkillsService } from '../skills/skills.service';
import { sendMarkdownAttachment } from '../common/download.util';

@ApiTags('entitlements')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('entitlements')
export class EntitlementsController {
  constructor(
    private readonly entitlements: EntitlementsService,
    private readonly skills: SkillsService,
  ) {}

  @Get('mine')
  @ApiOperation({ summary: '我的已购 skill' })
  mine(@Request() req) {
    return this.entitlements.listByUser(req.user.userId);
  }

  @Get('check/:skillId')
  @ApiOperation({ summary: '检查是否已购买某 skill' })
  async check(@Request() req, @Param('skillId') skillId: string) {
    const id = decodeURIComponent(skillId);
    return { owned: await this.entitlements.has(req.user.userId, id) };
  }

  @Get('content/:skillId')
  @ApiOperation({ summary: '获取已购（含闭源）skill 正文，鉴权放行' })
  async content(@Request() req, @Param('skillId') skillId: string) {
    const id = decodeURIComponent(skillId);
    const skill = await this.skills.detail(id, true);
    // 免费/非闭源直接放行；闭源需校验权益
    if (skill.closedSource || skill.listingType === 'paid') {
      const owned = await this.entitlements.has(req.user.userId, id);
      if (!owned) throw new ForbiddenException('skill not purchased');
    }
    return this.skills.getContent(id);
  }

  @Get('download/:skillId')
  @ApiOperation({ summary: '下载已购（含收费/闭源）skill 的 SKILL.md，鉴权放行' })
  async download(@Request() req, @Param('skillId') skillId: string, @Res() res: Response) {
    const id = decodeURIComponent(skillId);
    const dl = await this.skills.buildDownload(id);
    if (dl.closedSource || dl.listingType === 'paid') {
      const owned = await this.entitlements.has(req.user.userId, id);
      if (!owned) throw new ForbiddenException('skill not purchased');
    }
    await this.skills.incrementDownloads(id);
    sendMarkdownAttachment(res, dl.filename, dl.content);
  }
}
