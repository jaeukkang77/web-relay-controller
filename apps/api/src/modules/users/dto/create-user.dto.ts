import { IsEnum, IsInt, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Matches(/^[a-zA-Z0-9_-]{3,30}$/, {
    message: '아이디는 3~30자의 영문자, 숫자, _, -만 사용할 수 있습니다.',
  })
  id: string;

  @IsString()
  password: string;

  @IsEnum(['admin', 'user'])
  role: 'admin' | 'user';

  @IsInt()
  @IsOptional()
  regionId?: number | null;
}
