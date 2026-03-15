import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateDeviceDto {
  @IsString()
  name: string;

  @IsString()
  ip: string;

  @IsInt()
  @Min(1)
  @Max(65535)
  @IsOptional()
  port?: number;   // default 4001

  @IsInt()
  @Min(1)
  @Max(247)
  @IsOptional()
  slaveId?: number; // default 1

  @IsInt()
  @Min(1)
  address: number;   // 1=R1, 2=R2
}
