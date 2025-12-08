import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MedicationDeliveryItem } from './medication-delivery-item.entity';
import { MedicationDelivery } from 'src/medication-deliveries/medication-delivery.entity';
import { StockItem } from 'src/stock-items/stock-item.entity';
import { MedicationsModule } from 'src/medications/medications.module';

import { MedicationDeliveryItemsService } from './medication-delivery-items.service';
import { MedicationDeliveryItemsController } from './medication-delivery-items.controller';
import { Medication } from 'src/medications/medication.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicationDeliveryItem,
      MedicationDelivery,
      StockItem,
      Medication
    ]),
  ],
  providers: [MedicationDeliveryItemsService],
  controllers: [MedicationDeliveryItemsController],
  exports: [MedicationDeliveryItemsService],
})
export class MedicationDeliveryItemsModule {}
