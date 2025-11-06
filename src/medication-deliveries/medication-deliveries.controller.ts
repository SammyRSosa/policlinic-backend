import { Controller, Get, Post, Param, Body, Patch, Delete } from '@nestjs/common';
import { MedicationDeliveryService } from './medication-deliveries.service';
import { DeliveryStatus } from './medication-delivery.entity';

@Controller('medication-deliveries')
export class MedicationDeliveryController {
  constructor(private readonly service: MedicationDeliveryService) {}

  @Post()
  create(@Body() body: { medicationId: string; departmentId: string; quantity: number; requestedById?: string }) {
    return this.service.create(body.medicationId, body.departmentId, body.quantity, body.requestedById);
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
  updateStatus(@Param('id') id: string, @Body() body: { status: DeliveryStatus }) {
    return this.service.updateStatus(id, body.status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
