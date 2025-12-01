import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { MedicationsService } from './medications.service';

@Controller('medications')
export class MedicationsController {
  constructor(private readonly medicationsService: MedicationsService) {}

  @Post()
  create(
    @Body()
    dto: {
      name: string;
      code?: string;
      description?: string;
      unit?: string;
    },
  ) {
    return this.medicationsService.create(dto);
  }

  @Get()
  findAll() {
    return this.medicationsService.findAll();
  }

  @Get('search')
  search(@Query('q') query: string) {
    if (!query || query.trim().length === 0) {
      return this.medicationsService.findAll();
    }
    return this.medicationsService.search(query);
  }

  @Get('by-department/:departmentId')
  getByDepartment(@Param('departmentId') departmentId: string) {
    return this.medicationsService.getByDepartment(departmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    dto: {
      name?: string;
      code?: string;
      description?: string;
      unit?: string;
    },
  ) {
    return this.medicationsService.update(id, dto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.medicationsService.delete(id);
  }
}