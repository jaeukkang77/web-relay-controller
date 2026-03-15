import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/types/auth-user.type';
import { CreateDeviceDto } from './dto/create-device.dto';
import { RelayDto } from './dto/relay.dto';
import { UpdateDeviceDto } from './dto/update-device.dto';
import { DevicesService } from './devices.service';

@Controller('regions/:regionId/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  // GET /regions/:regionId/devices
  @Get()
  findAll(
    @Param('regionId', ParseIntPipe) regionId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.devicesService.findAll(regionId, user);
  }

  // GET /regions/:regionId/devices/:id
  @Get(':id')
  findOne(
    @Param('regionId', ParseIntPipe) regionId: number,
    @Param('id',       ParseIntPipe) id:       number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.devicesService.findOne(regionId, id, user);
  }

  // POST /regions/:regionId/devices — admin only
  @Post()
  @Roles('admin')
  create(
    @Param('regionId', ParseIntPipe) regionId: number,
    @Body() dto: CreateDeviceDto,
  ) {
    return this.devicesService.create(regionId, dto);
  }

  // PATCH /regions/:regionId/devices/:id — admin only
  @Patch(':id')
  @Roles('admin')
  update(
    @Param('regionId', ParseIntPipe) regionId: number,
    @Param('id',       ParseIntPipe) id:       number,
    @Body() dto: UpdateDeviceDto,
  ) {
    return this.devicesService.update(regionId, id, dto);
  }

  // DELETE /regions/:regionId/devices/:id — admin only
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('regionId', ParseIntPipe) regionId: number,
    @Param('id',       ParseIntPipe) id:       number,
  ) {
    return this.devicesService.remove(regionId, id);
  }

  // POST /regions/:regionId/devices/:id/relay — admin + user
  @Post(':id/relay')
  @HttpCode(HttpStatus.OK)
  controlRelay(
    @Param('regionId', ParseIntPipe) regionId: number,
    @Param('id',       ParseIntPipe) id:       number,
    @Body() dto: RelayDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.devicesService.controlRelay(regionId, id, dto.action, user);
  }

  // POST /regions/:regionId/devices/:id/sync — admin + user
  @Post(':id/sync')
  @HttpCode(HttpStatus.OK)
  syncDeviceState(
    @Param('regionId', ParseIntPipe) regionId: number,
    @Param('id',       ParseIntPipe) id:       number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.devicesService.syncDeviceState(regionId, id, user);
  }
}
