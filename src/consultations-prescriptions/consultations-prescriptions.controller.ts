import { Controller, Post, Get, Param, Body, Delete } from '@nestjs/common';
import { ConsultationPrescriptionsService } from './consultations-prescriptions.service';

@Controller('consultation-prescriptions')
export class ConsultationPrescriptionsController {
  constructor(private readonly service: ConsultationPrescriptionsService) {}

  @Post()
  create(@Body() body: { consultationId: string; medicationId: string; quantity: number; instructions?: string }) {
    return this.service.create(body.consultationId, body.medicationId, body.quantity, body.instructions);
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
