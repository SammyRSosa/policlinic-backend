import { Controller, Get, Post, Param, Body, Delete, UseGuards, Req } from '@nestjs/common';
import { RemissionsService } from './remissions.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/users/user.entity';
import { Roles } from 'src/auth/roles.decorator';

@Controller('remissions')
export class RemissionsController {
  constructor(private readonly remissionsService: RemissionsService) { }

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
  @Get('my-remissions/own')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.HEAD_OF_DEPARTMENT)
  async getMyConsultations(@Req() req) {
    return this.remissionsService.findByWorkerDepartment(req.user.entityId);
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
