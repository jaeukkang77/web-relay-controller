import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UsersQueryDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  limit?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;
}
