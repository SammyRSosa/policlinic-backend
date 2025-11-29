// src/clinic-histories/clinic-histories.controller.ts
import { Controller, Get, Post, Param, Body, Patch, Delete, Req, UseGuards } from '@nestjs/common';
import { ClinicHistoryService } from './clinic-histories.service';
import { JwtAuthGuard } from 'src/auth/jwt.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/users/user.entity';

@Controller('clinic-history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClinicHistoryController {
  constructor(private readonly service: ClinicHistoryService) {}

  // 🩺 Doctors or Heads can create
  @Post()
  @Roles(UserRole.DOCTOR, UserRole.HEAD_OF_DEPARTMENT)
  create(@Body() body: { patientId: string; notes?: string }) {
    return this.service.create(body.patientId, body.notes);
  }

  // 📋 Admins, Heads, and Doctors can list all
  @Get()
  @Roles(UserRole.ADMIN, UserRole.HEAD_OF_DEPARTMENT, UserRole.DOCTOR)
  findAll() {
    return this.service.findAll();
  }

  // 👁️ View one — only the patient or authorized roles
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.HEAD_OF_DEPARTMENT, UserRole.DOCTOR, UserRole.PATIENT)
  async findOne(@Param('id') id: string, @Req() req) {
    return this.service.findOneSecured(id, req.user);
  }

  // 👨‍⚕️ Get my own clinic histories (patient-specific)
  @Get('my-history/own')
  @Roles(UserRole.PATIENT)
  async getMyHistory(@Req() req) {
    return this.service.findByPatient(req.user.patient.id, req.user);
  }

  // 📋 Get all clinic histories by patient
  @Get('by-patient/:patientId')
  @Roles(UserRole.ADMIN, UserRole.HEAD_OF_DEPARTMENT, UserRole.DOCTOR, UserRole.PATIENT)
  async getByPatient(@Param('patientId') patientId: string, @Req() req) {
    return this.service.findByPatient(patientId, req.user);
  }

  // 🧾 Update only for authorized medical staff
  @Patch(':id')
  @Roles(UserRole.DOCTOR, UserRole.HEAD_OF_DEPARTMENT)
  update(@Param('id') id: string, @Body() body: { notes: string }) {
    return this.service.update(id, body.notes);
  }

  // ❌ Delete — probably admin-only or not allowed at all
  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
