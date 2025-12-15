import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Department } from './department.entity';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';

import { HeadOfDepartment } from '../heads-of-departments/head-of-department.entity';
import { WorkerDepartment } from 'src/workers-department/worker-department.entity';
import { Worker } from '../workers/worker.entity';
import { Medication } from '../medications/medication.entity';
import { StockItem } from '../stock-items/stock-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Department,
      HeadOfDepartment,
      Worker,
      WorkerDepartment,
      Medication,   // ✅ REQUIRED
      StockItem,    // ✅ REQUIRED
    ]),
  ],
  providers: [DepartmentsService],
  controllers: [DepartmentsController],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
