// 📁 reports.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsService } from './report.service';
import { ReportsController } from './report.controller';
import { Consultation } from '../consultations/consultation.entity';
import { Medication } from '../medications/medication.entity';
import { StockItem } from '../stock-items/stock-item.entity';
import { Remission } from '../remissions/remission.entity';
import { Patient } from '../patients/patient.entity';
import { Worker } from '../workers/worker.entity';
import { Department } from '../departments/department.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Consultation,
      Medication,
      StockItem,
      Remission,
      Patient,
      Worker,
      Department,
    ]),
  ],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}