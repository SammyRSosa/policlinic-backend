import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Department } from './department.entity';
import { DepartmentsService } from './departments.service';
import { DepartmentsController } from './departments.controller';
import { Stock } from '../stocks/stock.entity';
import { HeadOfDepartment } from '../heads-of-departments/head-of-department.entity';
import { Worker } from '../workers/worker.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Department, Stock, HeadOfDepartment, Worker]),
  ],
  providers: [DepartmentsService],
  controllers: [DepartmentsController],
  exports: [DepartmentsService],
})
export class DepartmentsModule {}
