import { Module } from '@nestjs/common';
import { DevicesModule } from '../devices/devices.module';
import { SchedulesController } from './schedules.controller';
import { SchedulesRepository } from './schedules.repository';
import { SchedulesService } from './schedules.service';

@Module({
  imports:     [DevicesModule],           // DevicesRepository inject용
  controllers: [SchedulesController],
  providers:   [SchedulesService, SchedulesRepository],
  exports:     [SchedulesRepository],    // ScheduleRunnerJob에서 사용
})
export class SchedulesModule {}
