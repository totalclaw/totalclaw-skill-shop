import { Controller, Get, Param, UseGuards, Request, Res, ForbiddenException } from '@nestjs/common';
import { Response } from 'express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EntitlementsService } from './entitlements.service';
import { JwtAuthGuard } from '../auth/guards';
import { SkillsService } from '../skills/skills.service';
import { sendMarkdownAttachment } from '../common/download.util';
import { applyWatermark } from '../common/watermark.util';

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
    const id = await this.skills.resolveSkillId(decodeURIComponent(skillId));
    return { owned: await this.entitlements.has(req.user.userId, id) };
  }

  @Get('content/:skillId')
  @ApiOperation({ summary: '获取已购 skill 正文（站内只读查看）；收费正文按买家注入水印' })
  async content(@Request() req, @Param('skillId') skillId: string) {
    const id = await this.skills.resolveSkillId(decodeURIComponent(skillId));
    const skill = await this.skills.detail(id, true);
    const paid = skill.closedSource || skill.listingType === 'paid';
    if (paid) {
      const owned = await this.entitlements.has(req.user.userId, id);
      if (!owned) throw new ForbiddenException('skill not purchased');
    }
    const doc: any = await this.skills.getContent(id);
    // 收费正文：注入「买家专属水印」（可见授权声明 + 隐形指纹），泄露可溯源
    if (paid && doc?.contentMd) {
      doc.contentMd = applyWatermark(doc.contentMd, {
        userId: String(req.user.userId),
        username: req.user.username,
        skillId: id,
      });
      doc.watermarked = true;
    }
    return doc;
  }

  @Get('download/:skillId')
  @ApiOperation({ summary: '下载 SKILL.md（仅免费/非闭源；收费 skill 已改为站内只读查看，不提供文件下载）' })
  async download(@Request() req, @Param('skillId') skillId: string, @Res() res: Response) {
    // 路径段里的 skillId 把 `/` 编成了 `~`（见 common/skill-id.util.ts）。
    // 只做 decodeURIComponent 时，完整 skillId 会在 buildDownload 里 404 ——
    // 客户端据此以为"这条不存在"，而不是"需要购买"，于是走不进加密安装闭环。
    const id = await this.skills.resolveSkillId(decodeURIComponent(skillId));
    const dl = await this.skills.buildDownload(id);
    // 收费/闭源：不再提供裸文件下载（防转售/复刻），引导到站内只读查看
    if (dl.closedSource || dl.listingType === 'paid') {
      const owned = await this.entitlements.has(req.user.userId, id);
      if (!owned) throw new ForbiddenException('skill not purchased');
      throw new ForbiddenException('收费 skill 不提供文件下载，请在网页登录后查看正文使用');
    }
    await this.skills.incrementDownloads(id);
    sendMarkdownAttachment(res, dl.filename, dl.content);
  }
}
