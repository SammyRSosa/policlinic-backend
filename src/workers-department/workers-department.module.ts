import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkerDepartment } from './worker-department.entity';
import { Worker } from 'src/workers/worker.entity';
import { Department } from 'src/departments/department.entity';
import { WorkerDepartmentService } from './workers-department.service';
import { WorkerDepartmentController } from './workers-department.controller';

@Module({
  imports: [TypeOrmModule.forFeature([WorkerDepartment, Worker, Department])],
  providers: [WorkerDepartmentService],
  controllers: [WorkerDepartmentController],
  exports: [WorkerDepartmentService],
})
export class WorkerDepartmentModule {}
