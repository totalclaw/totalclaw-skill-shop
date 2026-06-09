import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryQiyeSkillsDto {
  @ApiPropertyOptional({ description: '技能名称模糊搜索（匹配 name / displayName / descriptionZh）' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({
    description: '来源过滤',
    enum: ['github', 'tencent', 'openclaw', 'hermes', 'totalclaw', 'clawskills', 'skilldb', 'totalclaw-community'],
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ enum: ['free', 'paid'], description: '收费类型' })
  @IsOptional()
  @IsIn(['free', 'paid'])
  listingType?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

export class QueryQiyeRolesDto {
  @ApiPropertyOptional({ description: '角色名称模糊搜索（匹配 name / displayName / descriptionZh）' })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}
