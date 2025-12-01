// medication-deliveries.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationDeliveriesService } from './medication-deliveries.service';
import { MedicationDeliveriesController } from './medication-deliveries.controller';
import { MedicationDelivery } from './medication-delivery.entity';
import { MedicationDeliveryItem } from '../medication-deliveries-items/medication-delivery-item.entity';
import { Department } from '../departments/department.entity';
import { Medication } from '../medications/medication.entity';
import { Worker } from '../workers/worker.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MedicationDelivery,
      MedicationDeliveryItem,
      Department,
      Medication,
      Worker,
    ]),
  ],
  providers: [MedicationDeliveriesService],
  controllers: [MedicationDeliveriesController],
  exports: [MedicationDeliveriesService],
})
export class MedicationDeliveriesModule {}