import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationOrderItemsService } from './medication-order-items.service';
import { MedicationOrderItem } from './medication-order-item.entity';
import { MedicationOrder } from '../medication-orders/medication-order.entity';
import { Medication } from '../medications/medication.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicationOrderItem,
      MedicationOrder,
      Medication,
    ]),
  ],
  providers: [MedicationOrderItemsService],
  exports: [MedicationOrderItemsService],
})
export class MedicationOrderItemsModule {}