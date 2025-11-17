import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MedicationDeliveryItem } from './medication-delivery-item.entity';
import { MedicationDelivery } from 'src/medication-deliveries/medication-delivery.entity';
import { StockItem } from 'src/stock-items/stock-item.entity';

import { MedicationDeliveryItemsService } from './medication-delivery-items.service';
import { MedicationDeliveryItemsController } from './medication-delivery-items.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicationDeliveryItem,
      MedicationDelivery,
      StockItem,
    ]),
  ],
  providers: [MedicationDeliveryItemsService],
  controllers: [MedicationDeliveryItemsController],
  exports: [MedicationDeliveryItemsService],
})
export class MedicationDeliveryItemsModule {}
