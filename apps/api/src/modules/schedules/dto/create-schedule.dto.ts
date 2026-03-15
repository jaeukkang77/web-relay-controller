import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

/** "HH:MM" 포맷 검증 */
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
/** "YYYY-MM-DD" 포맷 검증 */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class CreateScheduleDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  /** 릴레이 ON 시각 "HH:MM" — onTime/offTime 중 하나 이상 필수 */
  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'onTime은 HH:MM 형식이어야 합니다.' })
  onTime?: string;

  /** 릴레이 OFF 시각 "HH:MM" */
  @IsOptional()
  @Matches(TIME_PATTERN, { message: 'offTime은 HH:MM 형식이어야 합니다.' })
  offTime?: string;

  /** 스케줄 시작일 "YYYY-MM-DD" */
  @Matches(DATE_PATTERN, { message: 'dateFrom은 YYYY-MM-DD 형식이어야 합니다.' })
  dateFrom!: string;

  /** 스케줄 종료일 "YYYY-MM-DD" */
  @Matches(DATE_PATTERN, { message: 'dateTo은 YYYY-MM-DD 형식이어야 합니다.' })
  dateTo!: string;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}
