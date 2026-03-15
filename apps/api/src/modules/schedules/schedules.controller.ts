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
import { AuthUser } from '../../common/types/auth-user.type';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { SchedulesService } from './schedules.service';

@Controller('regions/:regionId/devices/:deviceId/schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  // GET /regions/:regionId/devices/:deviceId/schedules
  @Get()
  findAll(
    @Param('regionId', ParseIntPipe) regionId: number,
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.schedulesService.findAll(regionId, deviceId, user);
  }

  // POST /regions/:regionId/devices/:deviceId/schedules
  @Post()
  create(
    @Param('regionId', ParseIntPipe) regionId: number,
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @Body() dto: CreateScheduleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.schedulesService.create(regionId, deviceId, dto, user);
  }

  // PATCH /regions/:regionId/devices/:deviceId/schedules/:id
  @Patch(':id')
  update(
    @Param('regionId', ParseIntPipe) regionId: number,
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @Param('id',       ParseIntPipe) id:       number,
    @Body() dto: UpdateScheduleDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.schedulesService.update(regionId, deviceId, id, dto, user);
  }

  // DELETE /regions/:regionId/devices/:deviceId/schedules/:id
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @Param('regionId', ParseIntPipe) regionId: number,
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @Param('id',       ParseIntPipe) id:       number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.schedulesService.remove(regionId, deviceId, id, user);
  }

  // PATCH /regions/:regionId/devices/:deviceId/schedules/:id/toggle
  @Patch(':id/toggle')
  @HttpCode(HttpStatus.OK)
  toggle(
    @Param('regionId', ParseIntPipe) regionId: number,
    @Param('deviceId', ParseIntPipe) deviceId: number,
    @Param('id',       ParseIntPipe) id:       number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.schedulesService.toggle(regionId, deviceId, id, user);
  }
}
