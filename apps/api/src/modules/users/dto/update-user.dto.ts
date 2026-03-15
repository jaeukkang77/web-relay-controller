import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto {
  /** 빈 문자열 or 미전송 시 비밀번호 변경 없음 */
  @IsString()
  @IsOptional()
  password?: string;

  @IsEnum(['admin', 'user'])
  @IsOptional()
  role?: 'admin' | 'user';

  @IsInt()
  @IsOptional()
  regionId?: number | null;
}
