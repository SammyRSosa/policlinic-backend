import { Controller, Post, Get, Param, Body, Delete } from '@nestjs/common';
import { ConsultationPrescriptionsService } from './consultations-prescriptions.service';
import { CreateConsultationPrescriptionDto } from './dto/create-consultation-prescription.dto';


@Controller('consultation-prescriptions')
export class ConsultationPrescriptionsController {
  constructor(private readonly service: ConsultationPrescriptionsService) { }

  @Post()
  create(@Body() dto: CreateConsultationPrescriptionDto) {
    return this.service.create(dto.consultationId, dto.medicationId, dto.quantity, dto.instructions);
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
