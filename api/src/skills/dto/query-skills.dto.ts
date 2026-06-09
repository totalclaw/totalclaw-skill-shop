import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QuerySkillsDto {
  @ApiPropertyOptional({ description: '关键词搜索（name/description）' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ description: '分类' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: '多分类（逗号分隔，命中任一即匹配；用于按大类筛选）' })
  @IsOptional()
  @IsString()
  categories?: string;

  @ApiPropertyOptional({ description: '来源（totalclaw-community = TotalClaw 社区免费技能）', enum: ['github', 'tencent', 'openclaw', 'hermes', 'totalclaw', 'clawskills', 'skilldb', 'totalclaw-community'] })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: '标签（单个）' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: '类型', enum: ['skill', 'role'] })
  @IsOptional()
  @IsIn(['skill', 'role'])
  kind?: string;

  @ApiPropertyOptional({ enum: ['free', 'paid'] })
  @IsOptional()
  @IsIn(['free', 'paid'])
  listingType?: string;

  @ApiPropertyOptional({ enum: ['community', 'totalclaw-proprietary', 'developer'] })
  @IsOptional()
  @IsString()
  ownership?: string;

  @ApiPropertyOptional({ description: '排序', enum: ['latest', 'downloads', 'sales', 'rating'] })
  @IsOptional()
  @IsIn(['latest', 'downloads', 'sales', 'rating'])
  sort?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 24, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 24;
}
