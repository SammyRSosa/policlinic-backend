import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { StockItemsService } from './stocks-items.service';

@Controller('stock-items')
export class StockItemsController {
  constructor(private readonly stockItemsService: StockItemsService) {}

  @Post('create/:stockId')
  create(
    @Param('stockId') stockId: string,
    @Body() body: { medicationName: string; quantity?: number },
  ) {
    return this.stockItemsService.create(stockId, body.medicationName, body.quantity);
  }

  @Get()
  findAll() {
    return this.stockItemsService.findAll();
  }

  @Get('stock/:stockId')
  findByStock(@Param('stockId') stockId: string) {
    return this.stockItemsService.findByStock(stockId);
  }
}
