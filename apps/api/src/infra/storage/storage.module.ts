import { Global, Module } from '@nestjs/common';
import { LocalStorageService } from './local-storage.service';

/**
 * 전역 스토리지 모듈.
 * @Global() 로 등록하므로 다른 모듈에서 imports 없이 LocalStorageService 주입 가능.
 */
@Global()
@Module({
  providers: [LocalStorageService],
  exports:   [LocalStorageService],
})
export class StorageModule {}
