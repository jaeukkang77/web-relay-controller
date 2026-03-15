import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateRegionDto {
  @IsString()
  @IsNotEmpty({ message: '지역 이름을 입력하세요.' })
  @MaxLength(150, { message: '지역 이름은 150자 이하로 입력하세요.' })
  name: string;
}
