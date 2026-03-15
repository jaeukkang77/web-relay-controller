import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: '아이디를 입력하세요.' })
  id: string;

  @IsString()
  @IsNotEmpty({ message: '비밀번호를 입력하세요.' })
  password: string;
}
