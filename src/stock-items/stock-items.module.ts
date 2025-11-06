import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockItem } from './stock-item.entity';
import { Stock } from 'src/stocks/stock.entity';
import { StockItemsService } from './stocks-items.service';
import { StockItemsController } from './stock-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([StockItem, Stock])],
  providers: [StockItemsService],
  controllers: [StockItemsController],
  exports: [StockItemsService],
})
export class StockItemsModule {}
