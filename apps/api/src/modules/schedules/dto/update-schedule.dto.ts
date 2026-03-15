import {
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'onTime은 HH:MM 형식이어야 합니다.' })
  onTime?: string | null;

  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'offTime은 HH:MM 형식이어야 합니다.' })
  offTime?: string | null;

  @IsOptional()
  @Matches(DATE_PATTERN, { message: 'dateFrom은 YYYY-MM-DD 형식이어야 합니다.' })
  dateFrom?: string;

  @IsOptional()
  @Matches(DATE_PATTERN, { message: 'dateTo은 YYYY-MM-DD 형식이어야 합니다.' })
  dateTo?: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
