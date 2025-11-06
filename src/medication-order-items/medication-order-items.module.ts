import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationOrderItem } from './medication-order-item.entity';
import { MedicationOrder } from 'src/medication-orders/medication-order.entity';
import { StockItem } from 'src/stock-items/stock-item.entity';
import { MedicationOrderItemsService } from './medication-order-items.service';
import { MedicationOrderItemsController } from './medication-order-items.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicationOrderItem, MedicationOrder, StockItem])],
  providers: [MedicationOrderItemsService],
  controllers: [MedicationOrderItemsController],
  exports: [MedicationOrderItemsService],
})
export class MedicationOrderItemsModule {}
