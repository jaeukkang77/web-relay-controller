import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class RegionsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number = 0;
}
