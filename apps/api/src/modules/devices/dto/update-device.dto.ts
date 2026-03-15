import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateDeviceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  ip?: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  port?: number;

  @IsInt()
  @Min(1)
  @Max(247)
  @IsOptional()
  slaveId?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  address?: number;
}
