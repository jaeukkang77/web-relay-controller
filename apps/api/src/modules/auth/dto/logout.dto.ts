import { IsNotEmpty, IsString } from 'class-validator';

export class LogoutDto {
  @IsString()
  @IsNotEmpty({ message: 'refreshToken을 입력하세요.' })
  refreshToken: string;
}
