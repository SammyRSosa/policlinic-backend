import { Controller, Get, Post, Param, Body, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { WorkerDepartmentService } from './workers-department.service';
import { CreateWorkerDepartmentDto } from './dto/create-worker-department.dto';

@Controller('worker-departments')
export class WorkerDepartmentController {
  constructor(private readonly service: WorkerDepartmentService) {}

  @Post()
  assign(@Body() body: CreateWorkerDepartmentDto) {
    return this.service.assign(body.workerId, body.departmentId);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('bydepartment/:departmentId')
  findByDepartment(@Param('departmentId') departmentId: string) {
    return this.service.findByDepartment(departmentId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  deactivate(@Param('id') id: string) {
    return this.service.deactivate(id);
  }
}