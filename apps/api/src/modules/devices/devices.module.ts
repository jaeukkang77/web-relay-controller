import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesRepository } from './devices.repository';
import { DevicesService } from './devices.service';

@Module({
  // ModbusModule은 @Global()이므로 imports 생략
  controllers: [DevicesController],
  providers:   [DevicesService, DevicesRepository],
  exports:     [DevicesRepository], // DeviceOnlineJob에서 사용
})
export class DevicesModule {}
