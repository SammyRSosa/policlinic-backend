import { Controller, Get, Post, Param, Body, Delete, Patch } from '@nestjs/common';
import { MedicationDeliveryItemsService } from './medication-delivery-items.service';
import { CreateMedicationDeliveryItemDto } from './dto/create-medication-delivery-item.dto';
import { UpdateMedicationDeliveryItemDto } from './dto/update-medication-delivery-item.dto';

@Controller('medication-delivery-items')
export class MedicationDeliveryItemsController {
  constructor(private readonly service: MedicationDeliveryItemsService) { }

  @Post()
  create(
    @Body()
    body: CreateMedicationDeliveryItemDto) {
    return this.service.create(body.deliveryId, body.medicationId, body.quantity);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('delivery/:deliveryId')
  findByDelivery(@Param('deliveryId') deliveryId: string) {
    return this.service.findByDelivery(deliveryId);
  }

  @Patch(':id')
  updateQuantity(@Param('id') id: string, @Body() body: UpdateMedicationDeliveryItemDto) {
    return this.service.updateQuantity(id, body.quantity);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
