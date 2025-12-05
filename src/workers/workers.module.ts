import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Worker } from './worker.entity';
import { Department } from '../departments/department.entity';
import { WorkerDepartment } from '../workers-department/worker-department.entity';
import { HeadOfDepartment } from '../heads-of-departments/head-of-department.entity';
import { WorkersService } from './workers.service';
import { WorkersController } from './workers.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Worker, Department, WorkerDepartment, HeadOfDepartment])],
  providers: [WorkersService],
  controllers: [WorkersController],
  exports: [WorkersService],
})
export class WorkersModule {}
