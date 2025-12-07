import { Controller, Get, Post, Delete, Param, Body, Put, Req, UseGuards, Query } from '@nestjs/common';
import { DepartmentsService } from './departments.service';
import { UserRole } from 'src/users/user.entity';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) { }

  @Post()
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto.name, dto.headWorkerId);
  }

  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

@Get('search')
search(@Query('q') q: string) {
  return this.departmentsService.searchByName(q);
}

  @Get('by-head')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.DOCTOR)
  findByHead(@Req() req) {
    return this.departmentsService.findByHead(req.user.entityId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }


  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}
