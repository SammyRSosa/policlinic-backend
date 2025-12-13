import { Controller, Get, Post, Param, Body, Delete, Patch } from '@nestjs/common';
import { MedicationOrderItemsService } from './medication-order-items.service';
import { CreateMedicationOrderItemDto } from './dto/create-medication-order-item.dto';
import { UpdateMedicationOrderItemDto } from './dto/update-medication-order-item.dto';


@Controller('medication-order-items')
export class MedicationOrderItemsController {
  constructor(private readonly service: MedicationOrderItemsService) {}

  @Post()
  create(@Body() body: CreateMedicationOrderItemDto) {
    return this.service.create(body.orderId, body.medicationId, body.quantity);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('order/:orderId')
  findByOrder(@Param('orderId') orderId: string) {
    return this.service.findByOrder(orderId);
  }

  @Patch(':id')
  updateQuantity(@Param('id') id: string, @Body() body: UpdateMedicationOrderItemDto) {
    return this.service.updateQuantity(id, body.quantity);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
