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

  /**
   * Create a new department
   * @param dto - Contains name (required) and headWorkerId (optional)
   * 
   * Examples:
   * POST /departments
   * { "name": "Emergencias" }                           // Without head
   * { "name": "Pediatría", "headWorkerId": "uuid" }   // With head
   */
  @Post()
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto.name, dto.headWorkerId);
  }

  /**
   * Get all departments
   */
  @Get()
  findAll() {
    return this.departmentsService.findAll();
  }

  /**
   * Search departments by name
   */
  @Get('search')
  search(@Query('q') q: string) {
    return this.departmentsService.searchByName(q);
  }

  /**
   * Get department by current user (if they are a head or doctor)
   */
  @Get('by-head')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.HEAD_OF_DEPARTMENT, UserRole.DOCTOR)
  findByHead(@Req() req) {
    return this.departmentsService.findByHead(req.user.entityId);
  }

  /**
   * Get a specific department by ID
   */
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.departmentsService.findOne(id);
  }

  /**
   * Update a department
   * Can update name and/or assign a head worker
   */
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDepartmentDto) {
    return this.departmentsService.update(id, dto);
  }

  
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.departmentsService.remove(id);
  }
}