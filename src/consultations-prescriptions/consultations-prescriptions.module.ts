import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConsultationPrescription } from './consultations-prescription.entity';
import { Consultation } from 'src/consultations/consultation.entity';
import { Medication } from 'src/medications/medication.entity';
import { ConsultationPrescriptionsService } from './consultations-prescriptions.service';
import { ConsultationPrescriptionsController } from './consultations-prescriptions.controller';
import { StockItem } from 'src/stock-items/stock-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConsultationPrescription, Consultation, Medication, StockItem])],
  providers: [ConsultationPrescriptionsService],
  controllers: [ConsultationPrescriptionsController],
  exports: [ConsultationPrescriptionsService],
})
export class ConsultationPrescriptionsModule {}
