import { Controller, Get, Post, Param, Body, Delete } from '@nestjs/common';
import { RemissionsService } from './remissions.service';

@Controller('remissions')
export class RemissionsController {
  constructor(private readonly remissionsService: RemissionsService) {}

  @Post('internal')
  createInternal(
    @Body()
    body: {
      patientId: string;
      fromDepartmentId: string;
      toDepartmentId: string;
    },
  ) {
    return this.remissionsService.createInternal(
      body.patientId,
      body.fromDepartmentId,
      body.toDepartmentId,
    );
  }

  @Post('external')
  createExternal(@Body() body: { patientId: string; toDepartmentId: string; medicalPostId: number }) {
    return this.remissionsService.createExternal(body.patientId, body.toDepartmentId, body.medicalPostId);
  }

  @Get()
  findAll() {
    return this.remissionsService.findAll();
  }

  @Get('by-department/:departmentId')
  findByDepartment(@Param('departmentId') departmentId: string) {
    return this.remissionsService.findByDepartment(departmentId);
  }

  @Get('from-department/:departmentId')
  findFromDepartment(@Param('departmentId') departmentId: string) {
    return this.remissionsService.findFromDepartment(departmentId);
  }

  @Get('from-medical-post/:medicalPostId')
  findFromMedicalPost(@Param('medicalPostId') medicalPostId: string) {
    return this.remissionsService.findFromMedicalPost(medicalPostId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.remissionsService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.remissionsService.remove(id);
  }
}
