import { Controller, Get, Post, Delete, Param, Body } from '@nestjs/common';
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}
