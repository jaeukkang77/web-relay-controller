import { Global, Module } from '@nestjs/common';
import { RelayService } from './relay.service';

@Global()
@Module({
  providers: [RelayService],
  exports:   [RelayService],
})
export class RelayModule {}
