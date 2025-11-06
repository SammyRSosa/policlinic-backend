import { Controller, Post, Get, Param, Body, Patch } from '@nestjs/common';
import { ConsultationsService } from './consultations.service';
import { ConsultationStatus } from './consultation.entity';

@Controller('consultations')
export class ConsultationsController {
  constructor(private readonly service: ConsultationsService) {}

  @Post('programmed')
  createProgrammed(@Body() body: { remissionId: string; mainDoctorId: string; departmentId: string; scheduledAt: Date;  remissionType?: 'internal' | 'external' }) {
    return this.service.createProgrammed(body.remissionId, body.mainDoctorId, body.departmentId, body.scheduledAt,  body.remissionType);
  }

  @Post('emergency')
  createEmergency(@Body() body: { patientId: string; mainDoctorId: string; departmentId: string; }) {
    return this.service.createEmergency(body.patientId, body.mainDoctorId, body.departmentId,);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: ConsultationStatus; diagnosis?: string }) {
    return this.service.updateStatus(id, body.status, body.diagnosis);
  }
}
