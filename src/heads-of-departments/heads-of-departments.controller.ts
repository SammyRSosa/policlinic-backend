import { Controller, Get, Param } from '@nestjs/common';
import { HeadsOfDepartmentsService } from './heads-of-departments.service';

@Controller('heads-of-departments')
export class HeadsOfDepartmentsController {
  constructor(private service: HeadsOfDepartmentsService) {}

  @Get('current/department/:id')
  getCurrentByDepartment(@Param('id') id: string) {
    return this.service.getCurrentByDepartment(id);
  }

  @Get('current/worker/:id')
  getCurrentByWorker(@Param('id') id: string) {
    return this.service.getCurrentByWorker(id);
  }

  @Get('history/department/:id')
  getHistoryByDepartment(@Param('id') id: string) {
    return this.service.getHistoryByDepartment(id);
  }
}
