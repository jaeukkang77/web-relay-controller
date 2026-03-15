import { IsEnum } from 'class-validator';

export class RelayDto {
  @IsEnum(['on', 'off'])
  action: 'on' | 'off';
}
