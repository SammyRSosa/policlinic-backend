import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationDelivery } from './medication-delivery.entity';
import { MedicationDeliveryItem } from '../medication-deliveries-items/medication-delivery-item.entity';
import { Medication } from '../medications/medication.entity';
import { Department } from '../departments/department.entity';
import { Worker } from '../workers/worker.entity';
import { MedicationDeliveryService } from './medication-deliveries.service';
import { MedicationDeliveryController } from './medication-deliveries.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicationDelivery,
      MedicationDeliveryItem,
      Medication,
      Department,
      Worker,
    ]),
  ],
  providers: [MedicationDeliveryService],
  controllers: [MedicationDeliveryController],
  exports: [MedicationDeliveryService],
})
export class MedicationDeliveryModule {}
