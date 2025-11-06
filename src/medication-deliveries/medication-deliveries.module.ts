import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MedicationDelivery } from './medication-delivery.entity';
import { Medication } from 'src/medications/medication.entity';
import { Department } from 'src/departments/department.entity';
import { Worker } from 'src/workers/worker.entity';
import { MedicationDeliveryService } from './medication-deliveries.service';
import { MedicationDeliveryController } from './medication-deliveries.controller';

@Module({
  imports: [TypeOrmModule.forFeature([MedicationDelivery, Medication, Department, Worker])],
  providers: [MedicationDeliveryService],
  controllers: [MedicationDeliveryController],
  exports: [MedicationDeliveryService],
})
export class MedicationDeliveryModule {}
