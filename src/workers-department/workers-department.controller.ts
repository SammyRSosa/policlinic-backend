import { Controller, Get, Post, Param, Body, Delete } from '@nestjs/common';
import { WorkerDepartmentService } from './workers-department.service';

@Controller('worker-departments')
export class WorkerDepartmentController {
  constructor(private readonly service: WorkerDepartmentService) {}

  @Post()
  assign(@Body() body: { workerId: string; departmentId: string }) {
    return this.service.assign(body.workerId, body.departmentId);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
