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
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/types/auth-user.type';
import { CreateRegionDto } from './dto/create-region.dto';
import { RegionsQueryDto } from './dto/regions.query.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { RegionsService } from './regions.service';

@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  // GET /regions — admin: 전체, user: 자기 지역
  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: RegionsQueryDto,
  ) {
    return this.regionsService.findAll(user, query);
  }

  // GET /regions/:id
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: AuthUser,
  ) {
    return this.regionsService.findOne(id, user);
  }

  // POST /regions — admin only
  @Post()
  @Roles('admin')
  create(@Body() dto: CreateRegionDto) {
    return this.regionsService.create(dto);
  }

  // PATCH /regions/:id — admin only
  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRegionDto,
  ) {
    return this.regionsService.update(id, dto);
  }

  // POST /regions/:id/image — admin only (multer memory storage)
  @Post(':id/image')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  uploadImage(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.regionsService.uploadImage(id, file);
  }

  // DELETE /regions/:id — admin only
  @Delete(':id')
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.regionsService.remove(id);
  }
}
