import { Controller, Post, Get, Param, Body, Patch, Req, UseGuards, Delete } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { ConsultationStatus } from './consultation.entity';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user.entity';
import { CreateProgrammedConsultationDto } from './dto/create-programmed.dto';
import { CreateEmergencyConsultationDto } from './dto/create-emergency.dto';
import { UpdateConsultationStatusDto } from './dto/update-status.dto';

@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly service: ConsultationsService) { }

  // 📋 Create programmed consultation (doctor creates from token)
  @Post('programmed')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.HEAD_OF_DEPARTMENT)
  createProgrammed(@Body() body: CreateProgrammedConsultationDto, @Req() req) {
    return this.service.createProgrammed(body.patientId, req.user.entityId, new Date(body.scheduledAt), body.remissionId, body.remissionType);
  }

  // 🚨 Create emergency consultation (doctor creates from token)
  @Post('emergency')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.HEAD_OF_DEPARTMENT)
  createEmergency(@Body() body: CreateEmergencyConsultationDto, @Req() req) {
    return this.service.createEmergency(body.patientId, req.user.entityId);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }
  // ConsultationsController
  @Get('all-for-doctor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  async getAllForDoctor() {
    return this.service.findAllForDoctor();
  }

  @Get('by-nurse')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.NURSE)
  findByNurse(@Req() req) {
    console.log(req.user);
    return this.service.findByNurse(req.user.entityId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Get('by-department/:departmentId')
  findByDepartment(@Param('departmentId') departmentId: string) {
    return this.service.findByDepartment(departmentId);
  }

  @Get('by-worker/:workerId')
  findByWorker(@Param('workerId') workerId: string) {
    return this.service.findByWorker(workerId);
  }


  // 👨‍⚕️ Get my consultations (doctor-specific)
  @Get('my-consultations/own')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR, UserRole.HEAD_OF_DEPARTMENT)
  async getMyConsultations(@Req() req) {
    return this.service.findByWorker(req.user.entityId);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: UpdateConsultationStatusDto) {
    return this.service.updateStatus(id, body.status, body.diagnosis);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
