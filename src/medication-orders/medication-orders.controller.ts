import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { MedicationOrdersService } from './medication-orders.service';

@Controller('medication-orders')
export class MedicationOrdersController {
  constructor(private readonly ordersService: MedicationOrdersService) {}

  @Post()
  create(
    @Body()
    body: {
      departmentId: string;
      headId: string;
      items: { medicationId: string; quantity: number }[];
    },
  ) {
    return this.ordersService.create(body.departmentId, body.headId, body.items);
  }

  @Get()
  findAll() {
    return this.ordersService.findAll();
  }

  @Post('respond/:id')
  respond(@Param('id') id: string, @Body() body: { accept: boolean }) {
    return this.ordersService.respond(id, body.accept);
  }
}