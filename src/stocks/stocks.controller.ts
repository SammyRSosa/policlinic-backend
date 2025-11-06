import { Controller, Get, Post, Param, Body, Patch, Delete } from '@nestjs/common';
import { StocksService } from './stocks.service';

@Controller('stocks')
export class StocksController {
  constructor(private readonly service: StocksService) {}

  @Post()
  create(@Body() body: { departmentId?: string; medicationId: string; quantity?: number; minQuantity?: number; maxQuantity?: number }) {
    return this.service.create(body.departmentId || null, body.medicationId, body.quantity, body.minQuantity, body.maxQuantity);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id/quantity')
  updateQuantity(@Param('id') id: string, @Body() body: { quantity: number }) {
    return this.service.updateQuantity(id, body.quantity);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
