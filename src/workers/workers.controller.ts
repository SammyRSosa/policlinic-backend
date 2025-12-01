import { Controller, Post, Body, Get, Req, UseGuards, Patch, Delete, Param, Put } from '@nestjs/common';
import { WorkersService } from './workers.service';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/user.entity';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@Controller('workers')
export class WorkersController {
  constructor(private readonly service: WorkersService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // <— important!
  @Roles(UserRole.ADMIN, UserRole.HEAD_OF_DEPARTMENT)
  create(@Body() dto: CreateWorkerDto, @Req() req) {
    console.log('Logged user:', req.user); // will show id & role from JWT
    return this.service.create(dto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard) // optional: if everyone must be logged in
  findAll(@Req() req) {
    console.log('User requesting all workers:', req.user);
    return this.service.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateWorkerDto) {
    return this.service.updateWorker(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Get('department/:departmentId')
  getByDepartment(
    @Param('departmentId') departmentId: string,
  ) {
    return this.service.getWorkersByDepartment(departmentId);
  }

  @Get('by-user')
  @UseGuards(JwtAuthGuard)
  findByUser(@Req() req) {
    return this.service.findByUserId(req.user.id);
  }
}
