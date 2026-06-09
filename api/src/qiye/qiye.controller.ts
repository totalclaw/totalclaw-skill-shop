import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { QiyeService } from './qiye.service';
import { QueryQiyeSkillsDto, QueryQiyeRolesDto } from './dto/query-qiye.dto';

@ApiTags('qiye-app')
@Controller('qiye')
export class QiyeController {
  constructor(private readonly qiyeService: QiyeService) {}

  @Get('skills')
  @ApiOperation({
    summary: 'qiye-app：技能列表（分页 20 条，支持来源过滤 + 名称模糊查询）',
    description: [
      '返回 kind=skill 的技能列表。',
      '每条记录包含 skillId、isFree 标识、listingType、pricing、',
      '以及 roleId（若该技能绑定了某角色则为角色 skillId，否则为 null）。',
      '支持 source 来源过滤（含虚拟来源 totalclaw-community）、',
      'q 对 name/displayName/descriptionZh 模糊搜索、listingType 收费过滤。',
      '分页默认 20 条，最大 100 条。',
    ].join('\n'),
  })
  @ApiResponse({
    status: 200,
    description: '技能分页列表',
    schema: {
      example: {
        items: [
          {
            skillId: 'github:owner/slug',
            name: 'example-skill',
            displayName: '示例技能',
            source: 'github',
            kind: 'skill',
            category: '工程研发',
            description: '技能描述',
            isFree: true,
            listingType: 'free',
            pricing: { model: 'free', price: 0, currency: 'CNY' },
            roleId: null,
            stats: { downloads: 100 },
          },
        ],
        total: 252975,
        page: 1,
        pageSize: 20,
        totalPages: 12649,
      },
    },
  })
  listSkills(@Query() query: QueryQiyeSkillsDto) {
    return this.qiyeService.listSkills(query);
  }

  @Get('roles')
  @ApiOperation({
    summary: 'qiye-app：角色（AI 员工）列表（分页 20 条，支持名称模糊查询）',
    description: [
      '返回 kind=role 的 AI 员工角色列表。',
      '每条记录包含 roleId（= skillId）、isFree 标识、listingType、pricing、emoji、color。',
      'q 对 name/displayName/descriptionZh 做模糊搜索。',
      '分页默认 20 条，最大 100 条。',
    ].join('\n'),
  })
  @ApiQuery({ name: 'q', required: false, description: '角色名称模糊搜索' })
  @ApiQuery({ name: 'page', required: false, description: '页码（默认 1）' })
  @ApiQuery({ name: 'pageSize', required: false, description: '每页条数（默认 20，最大 100）' })
  @ApiResponse({
    status: 200,
    description: '角色分页列表',
    schema: {
      example: {
        items: [
          {
            roleId: 'role:totalclaw/product-manager',
            skillId: 'role:totalclaw/product-manager',
            name: '产品经理',
            displayName: '产品经理',
            source: 'totalclaw',
            kind: 'role',
            category: '互联网研发',
            description: '负责产品规划与迭代',
            emoji: '📊',
            color: '#4F46E5',
            isFree: true,
            listingType: 'free',
            pricing: { model: 'free', price: 0, currency: 'CNY' },
            stats: { downloads: 50 },
          },
        ],
        total: 27381,
        page: 1,
        pageSize: 20,
        totalPages: 1370,
      },
    },
  })
  listRoles(@Query() query: QueryQiyeRolesDto) {
    return this.qiyeService.listRoles(query);
  }
}
