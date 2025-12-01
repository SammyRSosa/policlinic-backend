import { Controller, Get, Post, Delete, Param, Body, Put } from '@nestjs/common';
import { DepartmentsService } from './departments.service';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Post()
  create(@Body() dto: { name: string; headWorkerId: string }) {
    return this.departmentsService.create(dto.name, dto.headWorkerId);
  }

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: { name?: string; headWorkerId?: string }) {
    return this.departmentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}
