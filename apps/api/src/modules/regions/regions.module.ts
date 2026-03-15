import { Module } from '@nestjs/common';
import { RegionsController } from './regions.controller';
import { RegionsImageService } from './regions.image.service';
import { RegionsRepository } from './regions.repository';
import { RegionsService } from './regions.service';

@Module({
  // StorageModule은 @Global()이므로 imports 생략
  controllers: [RegionsController],
  providers:   [RegionsService, RegionsImageService, RegionsRepository],
})
export class RegionsModule {}
