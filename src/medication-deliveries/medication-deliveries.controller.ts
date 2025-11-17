import { Controller, Get, Post, Param, Body, Patch, Delete } from '@nestjs/common';
import { MedicationDeliveryService } from './medication-deliveries.service';
import { DeliveryStatus } from './medication-delivery.entity';

@Controller('medication-deliveries')
export class MedicationDeliveryController {
  constructor(private readonly service: MedicationDeliveryService) {}

  @Post()
  create(
    @Body()
    body: {
      departmentId: string;
      requestedById?: string;
      items: { medicationId: string; quantity: number }[];
    },
  ) {
    return this.service.create(
      body.departmentId,
      body.requestedById,
      body.items,
    );
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
